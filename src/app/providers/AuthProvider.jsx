// src/app/providers/AuthProvider.jsx

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockLogin, mockRegister } from '../../services/mockAuth';

const AuthContext = createContext();

const STORAGE_KEY = 'madina_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setBootstrapping(false);
  }, []);

  // Login function
  const login = async (payload) => {
    const loggedInUser = await mockLogin(payload);
    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  // Register function
  const register = async (payload) => {
    const registeredUser = await mockRegister(payload);
    setUser(registeredUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registeredUser));
    return registeredUser;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
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
    login,
    register,
    logout,
  }), [user, isAuthenticated, isAdmin, bootstrapping]);

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