// src/app/providers/AuthProvider.jsx
import { authService } from '../../services/authService';
import { axiosClient } from '../../services/axiosClient';
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockLogin, mockRegister, mockGuestLogin } from '../../services/mockAuth';
import secureStorage from '../../utils/secureStorage';
import { handleError, logError } from '../../utils/errorHandling';
import { validateEmail, validatePassword, validateName, validateRole } from '../../utils/validations';
import axios from 'axios';


const STORAGE_KEY = 'madeena_login_user_response';

// Create AuthContext so it can be used by `useAuthContext` and consumers
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadCalled = useRef(false);
  const navigate = useNavigate();

  const fetchMe = async () => {
    try {
      // Try to extract token from `user_data` (stored registration response)
      let headerToken = null;
      try {
        const raw = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('user_data') : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          headerToken = parsed?.token || parsed?.accessToken || parsed?.tempToken || parsed?.AccessToken || null;
          console.log('fetchMe: found token in user_data:', !!headerToken);
        }
      } catch (e) {
        console.warn('fetchMe: failed to parse user_data from localStorage', e);
      }

      const response = await axiosClient.get('/api/auth/me', headerToken ? { headers: { Authorization: `Bearer ${headerToken}` } } : undefined);
      const userData = response.data;
      
      if (userData) {
        const normalizedUser = {
          id: userData.id,
          name: userData.userName || userData.fullname || userData.name || '',
          email: userData.email || '',
          // roles: userData.roles || [],
roles: normalizeRoles(userData.roles || userData.role || userData.user?.roles),
          token: localStorage.getItem('madina_access_token') || 
                 localStorage.getItem('auth_token') || 
                 localStorage.getItem('accessToken'),
        };

        setUser(normalizedUser);
        await secureStorage.setItem(STORAGE_KEY, normalizedUser);

        // if admin, redirect to admin area when appropriate
        try {
          const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
          const defaultPaths = ['/', '/profile-v2', '/login', '/auth'];
          // if (normalizedUser?.roles?.includes('admin') && defaultPaths.includes(pathname)) {
          //   navigate('/admin', { replace: true });
          // }
          if (
  normalizedUser?.roles?.some(role => String(role).toLowerCase() === 'admin') &&
  defaultPaths.includes(pathname)
) {
  navigate('/admin', { replace: true });
}
        } catch (e) {
          // ignore navigation errors in non-browser envs
        }

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

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (loadCalled.current) return;
        loadCalled.current = true;

        // محاولة التحميل من المفتاح الجديد أولاً
        const rawData = localStorage.getItem(STORAGE_KEY);
        let storedUser = null;
        
        if (rawData) {
          try {
            const parsed = JSON.parse(rawData);
            // تحويل البيانات من الهيكل الجديد إلى الهيكل الذي يحتاجه التطبيق (Normalized)
            storedUser = {
              id: parsed.userId || parsed.id,
              name: parsed.userName || parsed.fullname || parsed.name || 'User',
              email: parsed.email,
              // roles: parsed.roles || [],
roles: normalizeRoles(parsed.roles || parsed.role || parsed.user?.roles),
              token: parsed.accessToken || parsed.token
            };
          } catch (e) {
            console.error('Error parsing stored user data:', e);
          }
        }

        const token = localStorage.getItem('madina_access_token') || 
                     localStorage.getItem('auth_token') || 
                     localStorage.getItem('accessToken');

        if (token) {
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

      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128';
      const loginUrl = `${apiBase.replace(/\/$/, '')}/api/auth/login`;
      
      const response = await axios.post(loginUrl, payload);
      console.log('LOGIN RESPONSE:', response.data);

      const responseData = response.data;

      if (responseData) {
        // تخزين الاستجابة كاملة كما هي في localStorage تحت المفتاح الجديد
        localStorage.setItem(STORAGE_KEY, JSON.stringify(responseData));
        
        // تخزين التوكن في المفاتيح المعروفة لـ axiosClient
        const token = responseData.accessToken || responseData.token;
        if (token) {
          localStorage.setItem('madina_access_token', token);
          localStorage.setItem('auth_token', token);
          localStorage.setItem('accessToken', token);
        }

        const normalizedUser = {
          id: responseData.userId || responseData.id || `user-${Date.now()}`,
          name: responseData.userName || responseData.fullname || responseData.name || 'Admin',
          email: responseData.email || payload.email,
          // roles: responseData.roles || ['User'],
roles: normalizeRoles(responseData.roles || responseData.role || responseData.user?.roles || ['user']),
          token: token,
        };

        console.log('NORMALIZED LOGIN USER:', normalizedUser);
        setUser(normalizedUser);

        // perform an admin-dashboard check by calling the admin API with the stored token
        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128';
          const adminApi = `${apiBase.replace(/\/$/, '')}/api/admin/dashboard`;
          const headerToken = token || localStorage.getItem('auth_token') || localStorage.getItem('madina_access_token');
          const adminResp = await axios.get(adminApi, {
            headers: {
              Authorization: `Bearer ${headerToken}`,
            },
          });

          // log admin API response for debugging as requested
          console.log('ADMIN API RESPONSE (status):', adminResp.status);
          console.log('ADMIN API RESPONSE (data):', adminResp.data);

          if (adminResp && adminResp.status === 200) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/profile-v2', { replace: true });
          }
        } catch (err) {
          // if request fails (401/403/etc) treat user as non-admin and go to profile
          console.warn('Admin check failed or not authorized:', err?.response?.status || err.message);
          navigate('/profile-v2', { replace: true });
        }

        return normalizedUser;
      }
    } catch (error) {
      console.error('LOGIN API ERROR:', error.response?.data || error.message || error);
      const errorMsg = error?.response?.data?.message || error?.response?.data?.title || 'فشل تسجيل الدخول';
      setAuthError(errorMsg);
      logError(error, 'AuthProvider.login');
      return null;
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
          // store under a stable key `user_data` as requested
          window.localStorage.setItem('user_data', JSON.stringify(registeredUserResponse));
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

const normalizeRoles = (roles) => {
  if (!roles) return [];

  if (Array.isArray(roles)) {
    return roles.map(role => String(role).toLowerCase());
  }

  return [String(roles).toLowerCase()];
};

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
      // backend expects lowercase keys
      userid: userId,
      newpassword: newPassword,
      // Request backend to convert external/social user to a local account
      // so the new password will be accepted. Backend must handle this flag.
      convertExternal: true,
      provider: 'Local',
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

// const continueRegistration = async (userId, newPassword) => {
//   try {
//     setAuthError(null);

//     if (!userId) {
//       setAuthError('UserId غير موجود، ارجعي اعملي تسجيل بجوجل مرة تانية');
//       return null;
//     }

//     if (!newPassword) {
//       setAuthError('New password مطلوب');
//       return null;
//     }

//     const apiBase =
//       import.meta.env.VITE_API_BASE_URL ||
//       'http://api-givingchampion.dev.localhost:5128';

//     const url = `${apiBase.replace(/\/$/, '')}/api/auth/continue-registration`;

//     const payload = {
//       userid: userId,
//       newpassword: newPassword,
//     };

//     console.log('Continue Registration URL:', url);
//     console.log('Continue Registration PAYLOAD:', payload);

//     const response = await axios.post(url, payload, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     console.log('Continue Registration Successful:', response.data);

//     const userData = response.data?.user ?? response.data;

//     const finalToken =
//       response.data?.token ||
//       response.data?.accessToken ||
//       userData?.token ||
//       null;

//     if (finalToken) {
//       localStorage.setItem('madina_access_token', finalToken);
//       localStorage.setItem('auth_token', finalToken);
//       localStorage.setItem('accessToken', finalToken);
//     }

//     const normalizedUser = {
//       id: userData?.id || userData?.userId || userId,
//       name: userData?.fullname || userData?.fullName || userData?.name || 'Unknown',
//       email: userData?.email || 'No Email',
//       roles: userData?.roles || ['User'],
//       token: finalToken,
//     };

//     setUser(normalizedUser);
//     await secureStorage.setItem(STORAGE_KEY, normalizedUser);

//     return normalizedUser;
//   } catch (error) {
//     console.error('Continue Registration Error:', error);
//     console.error('Status:', error?.response?.status);
//     console.error('Data:', error?.response?.data);

//     const errorMsg =
//       error?.response?.data?.message ||
//       error?.response?.data?.title ||
//       'Failed to complete registration';

//     setAuthError(errorMsg);
//     return null;
//   }
// };

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
  // const isAuthenticated = !!user;
  // const isAdmin = user?.roles?.includes('admin') || false;
  // const hasRole = (role) => {
  //   return user?.roles?.includes(role) || false;
  // };

  const isAuthenticated = !!user;

const isAdmin = user?.roles?.some(
  role => String(role).toLowerCase() === 'admin'
) || false;

const hasRole = (role) => {
  return user?.roles?.some(
    userRole => String(userRole).toLowerCase() === String(role).toLowerCase()
  ) || false;
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