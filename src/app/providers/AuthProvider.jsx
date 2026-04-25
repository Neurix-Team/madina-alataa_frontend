// src/app/providers/AuthProvider.jsx
import { authService } from '../../services/authService';
import { axiosClient } from '../../services/axiosClient';
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

  const fetchMe = async () => {
    try {
      const response = await axiosClient.get('/api/auth/me');
      const userData = response.data;
      
      if (userData) {
        const normalizedUser = {
          id: userData.id,
          name: userData.userName || userData.fullname || userData.name || '',
          email: userData.email || '',
          roles: userData.roles || [],
          token: localStorage.getItem('madina_access_token') || 
                 localStorage.getItem('auth_token') || 
                 localStorage.getItem('accessToken'),
        };

        setUser(normalizedUser);
        await secureStorage.setItem(STORAGE_KEY, normalizedUser);
        return normalizedUser;
      }
    } catch (error) {
      console.error('Fetch Me Error:', error);
      // If 401, we might want to logout
      if (error.response?.status === 401) {
        logout();
      }
      return null;
    }
  };

  // Load user from secure storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await secureStorage.getItem(STORAGE_KEY, null);
        const token = localStorage.getItem('madina_access_token') || 
                     localStorage.getItem('auth_token') || 
                     localStorage.getItem('accessToken');

        if (token) {
          // If we have a token, try to refresh user data from server
          const freshUser = await fetchMe();
          if (!freshUser && storedUser) {
            setUser(storedUser);
          }
        } else if (storedUser) {
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

      // Use environment variable for API base URL
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128';
      const loginUrl = `${apiBase.replace(/\/$/, '')}/api/auth/login`;
      
      // Send login request to API
      const response = await axios.post(loginUrl, payload);

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

        // Log normalized user for debugging
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
      // Save the raw API response to localStorage for debugging/inspection
      try {
        if (typeof window !== 'undefined' && window.localStorage && registeredUserResponse) {
          window.localStorage.setItem('madina_register_response_raw', JSON.stringify(registeredUserResponse));
        }
      } catch (e) {
        console.warn('Failed to save register response to localStorage', e);
      }

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
// const googleLogin = async () => {
//     try {
//       setLoading(true);
//       setAuthError(null);

//       // Redirect to Google OAuth login endpoint. Use VITE_API_BASE_URL when available
//       const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128';
//       const callbackUrl = `${window.location.origin}/signin-google`;
//       const loginUrl = `${apiBase.replace(/\/$/, '')}/api/auth/google/login?callbackUrl=${callbackUrl}`;
//       // If apiBase is empty this becomes '/api/auth/google/login' (relative)
//       window.location.href = loginUrl;
      
//       // This function will not complete as the page will redirect
//       return null;
//     } catch (error) {
//       console.error('Google Login Error:', error);
//       setAuthError('Failed to initiate Google login');
//       setLoading(false);
//       return null;
//     }
//   };

const googleLogin = async () => {
  try {
    setLoading(true);
    setAuthError(null);

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128';
    const callbackUrl = `${window.location.origin}/auth/callback`; // بدل /signin-google
    const loginUrl = `${apiBase.replace(/\/$/, '')}/api/auth/google/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    window.location.href = loginUrl;
    return null;
  } catch (error) {
    console.error('Google Login Error:', error);
    setAuthError('Failed to initiate Google login');
    setLoading(false);
    return null;
  }
};

  //continue registration fetching
// const continueRegistration = async (userId, newPassword, extra = null) => {
//   try {
//     setAuthError(null);
    
//     // Send POST request to continue-registration API using axiosClient
//     const payload = { userid: userId, newpassword: newPassword };
//     if (extra) payload.extra = extra;

//     console.log('Continue Registration - REQUEST:', payload);

//     const response = await axiosClient.post('/api/auth/continue-registration', payload);
    
//     console.log('Continue Registration Successful:', response.data);

//     // Verify returned data
//     if (response.data) {
//       const userData = response.data?.user ?? response.data;
//       const token = response.data?.token || response.data?.accessToken || userData?.token;
      
//       // Save token to localStorage if returned
//       if (token) {
//         localStorage.setItem('madina_access_token', token);
//         localStorage.setItem('auth_token', token);
//         localStorage.setItem('accessToken', token);
//       }

//       const normalizedUser = {
//         id: userData?.id || userData?.userId || `user-${Date.now()}`,
//         name: userData?.fullname || userData?.fullName || userData?.name || 'Unknown',
//         email: userData?.email || 'No Email',
//         roles: userData?.roles || ['User'],
//         token: token,
//       };

//       // Store data in user state
//       setUser(normalizedUser);
//       await secureStorage.setItem(STORAGE_KEY, normalizedUser); // Save data

//       return normalizedUser;
//     }
//   } catch (error) {
//     console.error('Continue Registration Error:', error);
//     const errorMsg =
//       error?.response?.data?.message ||
//       error?.response?.data?.title ||
//       'Failed to complete registration';

//     setAuthError(errorMsg); // Set error message
//     return null;
//   }
// };

const continueRegistration = async (userId, newPassword, extra = null) => {
  try {
    setAuthError(null);

    if (!userId) {
      setAuthError('UserId غير موجود، ارجعي اعملي تسجيل بجوجل مرة تانية');
      return null;
    }

    const token =
      localStorage.getItem('madina_access_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('google_temp_token') ||
      extra?.token ||
      extra?.accessToken ||
      extra?.tempToken;

    if (!token) {
      setAuthError('التوكن غير موجود، لازم تعملي تسجيل بجوجل مرة تانية');
      return null;
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128';
    const url = `${apiBase.replace(/\/$/, '')}/api/auth/continue-registration`;

    const payload = {
      userId: userId,
      newPassword: newPassword,
    };

    console.log('Continue Registration URL:', url);
    console.log('Continue Registration PAYLOAD:', payload);
    console.log('Continue Registration TOKEN:', token);

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Continue Registration Successful:', response.data);

    const userData = response.data?.user ?? response.data;

    const finalToken =
      response.data?.token ||
      response.data?.accessToken ||
      userData?.token ||
      token;

    localStorage.setItem('madina_access_token', finalToken);
    localStorage.setItem('auth_token', finalToken);
    localStorage.setItem('accessToken', finalToken);

    const normalizedUser = {
      id: userData?.id || userData?.userId || userId,
      name: userData?.fullname || userData?.fullName || userData?.name || 'Unknown',
      email: userData?.email || extra?.email || extra?.Email || 'No Email',
      roles: userData?.roles || ['User'],
      token: finalToken,
    };

    setUser(normalizedUser);
    await secureStorage.setItem(STORAGE_KEY, normalizedUser);

    return normalizedUser;
  } catch (error) {
    console.error('Continue Registration Error:', error);
    console.error('Status:', error?.response?.status);
    console.error('Data:', error?.response?.data);

    const errorMsg =
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      'Failed to complete registration';

    setAuthError(errorMsg);
    return null;
  }
};

  // Logout function
  const logout = async () => {
    try {
      setAuthError(null);
      setUser(null);
      // Clear all possible token keys
      localStorage.removeItem('madina_access_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('madina_auth_user');
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

  // const value = useMemo(() => ({
  //   user,
  //   isAuthenticated,
  //   isAdmin,
  //   hasRole,
  //   bootstrapping,
  //   authError,
  //   setAuthError,
  //   loading,
  //   login,
  //   register,
  //   guestLogin,
  //   googleLogin,
  //   continueRegistration,
  //   logout,
  // }), [user, isAuthenticated, isAdmin, bootstrapping, authError, loading]);
  const value = useMemo(() => ({
  user,
  setUser,
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
  fetchMe,
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