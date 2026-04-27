// src/utils/secureState.js

import { secureStorage } from './secureStorage';
import { handleError, logError } from './errorHandling';

// Secure state management with encryption and validation
class SecureStateManager {
  constructor(namespace = 'app') {
    this.namespace = namespace;
    this.state = {};
    this.listeners = new Map();
    this.isInitialized = false;
  }

  // Initialize state from secure storage
  async initialize() {
    if (this.isInitialized) return;

    try {
      const stored = await secureStorage.getItem(`${this.namespace}_state`);
      if (stored) {
        this.state = JSON.parse(stored);
      }
      this.isInitialized = true;
    } catch (error) {
      logError(error, 'SecureStateManager.initialize');
      this.state = {};
      this.isInitialized = true;
    }
  }

  // Get state value with validation
  async get(key, defaultValue = null) {
    await this.ensureInitialized();

    try {
      const value = this.state[key];
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      logError(error, `SecureStateManager.get(${key})`);
      return defaultValue;
    }
  }

  // Set state value with validation and persistence
  async set(key, value) {
    await this.ensureInitialized();

    try {
      // Validate key
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key provided');
      }

      // Deep clone to prevent mutations
      const newState = { ...this.state };
      newState[key] = this.deepClone(value);

      // Validate state size (prevent excessive storage)
      const stateSize = JSON.stringify(newState).length;
      if (stateSize > 1024 * 1024) { // 1MB limit
        throw new Error('State size exceeds limit');
      }

      this.state = newState;

      // Persist to secure storage
      await secureStorage.setItem(`${this.namespace}_state`, JSON.stringify(this.state));

      // Notify listeners
      this.notifyListeners(key, value);

      return true;
    } catch (error) {
      logError(error, `SecureStateManager.set(${key})`);
      return false;
    }
  }

  // Remove state value
  async remove(key) {
    await this.ensureInitialized();

    try {
      if (!(key in this.state)) return true;

      const newState = { ...this.state };
      delete newState[key];

      this.state = newState;
      await secureStorage.setItem(`${this.namespace}_state`, JSON.stringify(this.state));

      // Notify listeners
      this.notifyListeners(key, undefined);

      return true;
    } catch (error) {
      logError(error, `SecureStateManager.remove(${key})`);
      return false;
    }
  }

  // Clear all state
  async clear() {
    await this.ensureInitialized();

    try {
      this.state = {};
      await secureStorage.removeItem(`${this.namespace}_state`);

      // Notify all listeners
      for (const [key] of this.listeners) {
        this.notifyListeners(key, undefined);
      }

      return true;
    } catch (error) {
      logError(error, 'SecureStateManager.clear');
      return false;
    }
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  // Get all state keys
  async getKeys() {
    await this.ensureInitialized();
    return Object.keys(this.state);
  }

  // Check if key exists
  async has(key) {
    await this.ensureInitialized();
    return key in this.state;
  }

  // Batch operations
  async batch(operations) {
    await this.ensureInitialized();

    const results = [];
    const originalState = { ...this.state };

    try {
      for (const operation of operations) {
        const { type, key, value } = operation;

        switch (type) {
          case 'set':
            results.push(await this.set(key, value));
            break;
          case 'remove':
            results.push(await this.remove(key));
            break;
          default:
            results.push(false);
        }
      }

      return results;
    } catch (error) {
      // Rollback on error
      this.state = originalState;
      await secureStorage.setItem(`${this.namespace}_state`, JSON.stringify(this.state));
      logError(error, 'SecureStateManager.batch');
      return operations.map(() => false);
    }
  }

  // Deep clone utility
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
  }

  // Ensure initialization
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // Notify listeners
  notifyListeners(key, value) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          logError(error, `SecureStateManager.notifyListeners(${key})`);
        }
      });
    }
  }

  // Get state snapshot (for debugging)
  async getSnapshot() {
    await this.ensureInitialized();
    return { ...this.state };
  }
}

// Create singleton instance
export const secureState = new SecureStateManager();

// React hook for secure state management
export const useSecureState = (key, defaultValue = null) => {
  const [value, setValue] = React.useState(defaultValue);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const loadValue = async () => {
      try {
        const storedValue = await secureState.get(key, defaultValue);
        if (mounted) {
          setValue(storedValue);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(handleError(err));
          setLoading(false);
        }
      }
    };

    loadValue();

    // Subscribe to changes
    const unsubscribe = secureState.subscribe(key, (newValue) => {
      if (mounted) {
        setValue(newValue);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [key, defaultValue]);

  const setSecureValue = React.useCallback(async (newValue) => {
    try {
      setError(null);
      const success = await secureState.set(key, newValue);
      if (!success) {
        setError('فشل في حفظ البيانات');
      }
      return success;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      return false;
    }
  }, [key]);

  const removeSecureValue = React.useCallback(async () => {
    try {
      setError(null);
      const success = await secureState.remove(key);
      if (!success) {
        setError('فشل في حذف البيانات');
      }
      return success;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      return false;
    }
  }, [key]);

  return {
    value,
    setValue: setSecureValue,
    removeValue: removeSecureValue,
    loading,
    error,
  };
};

// Secure session storage (temporary, cleared on tab close)
export class SecureSessionManager {
  constructor(namespace = 'session') {
    this.namespace = namespace;
    this.sessionData = {};
  }

  set(key, value, ttl = null) { // ttl in milliseconds
    try {
      const data = {
        value: this.deepClone(value),
        timestamp: Date.now(),
        ttl,
      };
      this.sessionData[key] = data;
      sessionStorage.setItem(`${this.namespace}_${key}`, JSON.stringify(data));
      return true;
    } catch (error) {
      logError(error, `SecureSessionManager.set(${key})`);
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      let data = this.sessionData[key];

      if (!data) {
        const stored = sessionStorage.getItem(`${this.namespace}_${key}`);
        if (stored) {
          data = JSON.parse(stored);
          this.sessionData[key] = data;
        }
      }

      if (!data) return defaultValue;

      // Check TTL
      if (data.ttl && Date.now() - data.timestamp > data.ttl) {
        this.remove(key);
        return defaultValue;
      }

      return data.value;
    } catch (error) {
      logError(error, `SecureSessionManager.get(${key})`);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      delete this.sessionData[key];
      sessionStorage.removeItem(`${this.namespace}_${key}`);
      return true;
    } catch (error) {
      logError(error, `SecureSessionManager.remove(${key})`);
      return false;
    }
  }

  clear() {
    try {
      this.sessionData = {};
      // Clear all session storage items with our namespace
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.namespace}_`)) {
          sessionStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      logError(error, 'SecureSessionManager.clear');
      return false;
    }
  }

  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
  }
}

// Create singleton instance
export const secureSession = new SecureSessionManager();