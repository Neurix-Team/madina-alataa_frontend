// src/app/providers/AuthProvider.jsx

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockLogin, mockRegister, mockGuestLogin } from '../../services/mockAuth';
import secureStorage from '../../utils/secureStorage';
import { handleError, logError } from '../../utils/errorHandling';
import { validateEmail, validatePassword, validateName, validateRole } from '../../utils/validations';

const AuthContext = createContext();

const STORAGE_KEY = 'madina_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load user from secure storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await secureStorage.getItem(STORAGE_KEY, null);
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        logError(error, 'AuthProvider.loadUser');
        setAuthError('فشل في تحميل بيانات المستخدم');
      } finally {
        setBootstrapping(false);
      }
    };

    loadUser();
  }, []);

  // Login function with validation
  const login = async (payload) => {
    try {
      setAuthError(null);

      // Validate input
      const emailError = validateEmail(payload.email);
      if (emailError) {
        setAuthError(emailError);
        return null;
      }

      const passwordError = validatePassword(payload.password);
      if (passwordError) {
        setAuthError(passwordError);
        return null;
      }

      const loggedInUser = await mockLogin(payload);
      setUser(loggedInUser);
      await secureStorage.setItem(STORAGE_KEY, loggedInUser);
      return loggedInUser;
    } catch (error) {
      const errorMsg = handleError(error);
      setAuthError(errorMsg);
      logError(error, 'AuthProvider.login');
      return null;
    }
  };

  // Register function with validation
  const register = async (payload) => {
    try {
      setAuthError(null);

      // Validate input
      const nameError = validateName(payload.name);
      if (nameError) {
        setAuthError(nameError);
        return null;
      }

      const emailError = validateEmail(payload.email);
      if (emailError) {
        setAuthError(emailError);
        return null;
      }

      const passwordError = validatePassword(payload.password);
      if (passwordError) {
        setAuthError(passwordError);
        return null;
      }

      const roleError = validateRole(payload.role);
      if (roleError) {
        setAuthError(roleError);
        return null;
      }

      const registeredUser = await mockRegister(payload);
      setUser(registeredUser);
      await secureStorage.setItem(STORAGE_KEY, registeredUser);
      return registeredUser;
    } catch (error) {
      const errorMsg = handleError(error);
      setAuthError(errorMsg);
      logError(error, 'AuthProvider.register');
      return null;
    }
  };

  const guestLogin = async () => {
    try {
      setAuthError(null);
      const guestUser = await mockGuestLogin();
      setUser(guestUser);
      await secureStorage.setItem(STORAGE_KEY, guestUser);
      return guestUser;
    } catch (error) {
      const errorMsg = handleError(error);
      setAuthError(errorMsg);
      logError(error, 'AuthProvider.guestLogin');
      return null;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthError(null);
      setUser(null);
      await secureStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logError(error, 'AuthProvider.logout');
      setAuthError('فشل في تسجيل الخروج');
    }
  };

  // Computed values
  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes('admin') || false;
  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isAdmin,
    hasRole,
    bootstrapping,
    authError,
    login,
    register,
    guestLogin,
    logout,
  }), [user, isAuthenticated, isAdmin, bootstrapping, authError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};