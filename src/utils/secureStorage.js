// src/utils/secureStorage.js

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const isLocalStorageAvailable = () => {
  try {
    const key = '__secure_storage_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const safeStorage = {
  isSupported: isLocalStorageAvailable(),

  getItem: (key, fallback = null) => {
    if (!safeStorage.isSupported) return fallback;
    try {
      const value = localStorage.getItem(key);
      if (value === null) return fallback;
      return safeParse(value);
    } catch {
      return fallback;
    }
  },

  setItem: (key, value) => {
    if (!safeStorage.isSupported) return false;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key) => {
    if (!safeStorage.isSupported) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

export default safeStorage;
