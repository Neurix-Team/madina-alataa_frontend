// src/app/providers/AuthProvider.jsx
import { authService } from '../../services/authService';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockLogin, mockRegister, mockGuestLogin } from '../../services/mockAuth';
import secureStorage from '../../utils/secureStorage';
import { handleError, logError } from '../../utils/errorHandling';
import { validateEmail, validatePassword, validateName, validateRole } from '../../utils/validations';
import axios from 'axios';


const STORAGE_KEY = 'madina_auth_user';

// Create AuthContext at module level so it's accessible to useAuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

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

      // Send login request to API
      const response = await axios.post('http://api-givingchampion.dev.localhost:5128/api/auth/login', payload);

      // Print response in console
      console.log('LOGIN RESPONSE:', response);

      // Verify user data exists in response
      const userData = response.data?.user ?? response.data;

      // If response is valid:
      if (userData) {
        const normalizedUser = {
          id: userData?.id || `user-${Date.now()}`,
          name: userData?.fullname || userData?.name || 'Unknown',
          email: userData?.email || payload.email,
          roles: userData?.roles || ['User'],
          token: response.data?.token || null,
        };

        console.log('NORMALIZED LOGIN USER:', normalizedUser);

        setUser(normalizedUser); // Store user in state
        await secureStorage.setItem(STORAGE_KEY, normalizedUser); // Store in secureStorage

        return normalizedUser; // Return user
      }
    } catch (error) {
      // If error occurs, show error message in console
      console.error('LOGIN API ERROR:', error.response?.data || error.message || error);

      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        'فشل تسجيل الدخول';

      setAuthError(errorMsg); // Set error message if error occurs
      logError(error, 'AuthProvider.login'); // Log error

      return null; // Return null if error occurs
    }
  };

  // Register function with validation
  const register = async (payload) => {
    try {
      setAuthError(null);

      const registeredUserResponse = await authService.register(payload);
      console.log('REGISTER RESPONSE INSIDE PROVIDER:', registeredUserResponse);

      const userData = registeredUserResponse?.user ?? registeredUserResponse?.data ?? registeredUserResponse;

      const normalizedUser = {
        id: userData?.id || userData?.userId || `user-${Date.now()}`,
        name: userData?.fullname || userData?.fullName || userData?.name || payload.fullname,
        email: userData?.email || payload.email,
        birthDate: userData?.birthDate || payload.birthDate,
        roles: userData?.roles || ['donor'],
        token: registeredUserResponse?.token || registeredUserResponse?.accessToken || userData?.token || null,
      };

      console.log('NORMALIZED REGISTER USER:', normalizedUser);

      setUser(normalizedUser);
      await secureStorage.setItem(STORAGE_KEY, normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error('REGISTER API ERROR:', error?.response?.data || error?.message || error);
      console.error('FULL ERROR RESPONSE:', error?.response);
      console.error('ERROR STATUS:', error?.response?.status);
      console.error('ERROR DATA:', JSON.stringify(error?.response?.data, null, 2));

      // Handle validation errors specifically
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.message || err).join(', ');
        setAuthError(`Validation errors: ${errorMessages}`);
      } else {
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.title ||
          'فشل إنشاء الحساب';

        setAuthError(errorMsg);
      }
      
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

  //google login fetching
const googleLogin = async () => {
    try {
      setLoading(true);
      setAuthError(null);

      // Redirect to Google OAuth login endpoint
      window.location.href = 'http://api-givingchampion.dev.localhost:5128/api/auth/google/login';
      
      // This function will not complete as the page will redirect
      return null;
    } catch (error) {
      console.error('Google Login Error:', error);
      setAuthError('Failed to initiate Google login');
      setLoading(false);
      return null;
    }
  };

  //continue registration fetching
const continueRegistration = async (userId, newPassword) => {
  try {
    setAuthError(null);
    
    // Send POST request to continue-registration API
    const response = await axios.post('http://api-givingchampion.dev.localhost:5128/api/auth/continue-registration', {
      userid: userId,
      newpassword: newPassword,
    });

    console.log('Continue Registration Successful:', response.data);

    // Verify returned data
    if (response.data) {
      const userData = response.data?.user ?? response.data;
      const normalizedUser = {
        id: userData?.id || `user-${Date.now()}`,
        name: userData?.fullname || userData?.name || 'Unknown',
        email: userData?.email || 'No Email',
        roles: userData?.roles || ['User'],
        token: response.data?.token || null,
      };

      // Store data in user state
      setUser(normalizedUser);
      await secureStorage.setItem(STORAGE_KEY, normalizedUser); // Save data

      return normalizedUser;
    }
  } catch (error) {
    console.error('Continue Registration Error:', error);
    const errorMsg =
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      'Failed to complete registration';

    setAuthError(errorMsg); // Set error message
    return null;
  }
};

  // Logout function
  const logout = async () => {
    try {
      setAuthError(null);
      setUser(null);
      // Keep user data in localStorage for future sessions
      // await secureStorage.removeItem(STORAGE_KEY);
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
    setAuthError,
    loading,
    login,
    register,
    guestLogin,
    googleLogin,
    continueRegistration,
    logout,
  }), [user, isAuthenticated, isAdmin, bootstrapping, authError, loading]);

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