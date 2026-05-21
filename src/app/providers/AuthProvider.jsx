// src/app/providers/AuthProvider.jsx
import { authService } from '../../services/authService';
import { axiosClient } from '../../services/axiosClient';
import { profilesService } from '../../services/profilesService';
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { mockLogin, mockRegister, mockGuestLogin } from '../../services/mockAuth';
import secureStorage from '../../utils/secureStorage';
import { handleError, logError } from '../../utils/errorHandling';
import { validateEmail, validatePassword, validateName, validateRole } from '../../utils/validations';
import axios from 'axios';


const STORAGE_KEY = 'madeena_login_user_response';
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || 'https://champapi.neurix.uk';
const getAuthApiUrl = (path) => `${AUTH_API_BASE_URL.replace(/\/$/, '')}${path}`;

const getTokenFromResponse = (source) => {
  if (!source) return null;
  if (typeof source === 'string') return source;

  return (
    source.token ||
    source.accessToken ||
    source.tempToken ||
    source.AccessToken ||
    source.TempToken ||
    source.exchangeToken ||
    source.googleExchangeToken ||
    source.access_token ||
    source.jwt ||
    source.jwtToken ||
    source.bearerToken ||
    getTokenFromResponse(source.data) ||
    getTokenFromResponse(source.value) ||
    getTokenFromResponse(source.result) ||
    getTokenFromResponse(source.item) ||
    getTokenFromResponse(source.user) ||
    null
  );
};

const getStoredGoogleExchangeToken = () => {
  const token =
    localStorage.getItem('google_temp_token') ||
    localStorage.getItem('madina_access_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('accessToken');

  if (token) return token;

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const pending = window.sessionStorage.getItem('pending_google_registration');
      const parsed = pending ? JSON.parse(pending) : null;
      return getTokenFromResponse(parsed);
    } catch (error) {
      console.warn('Failed to parse pending_google_registration from sessionStorage', error);
    }
  }

  return null;
};

const getTokenPreview = (token) => {
  if (!token) return null;
  return `${String(token).slice(0, 8)}...${String(token).slice(-8)} (${String(token).length})`;
};

// Create AuthContext so it can be used by `useAuthContext` and consumers
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadCalled = useRef(false);

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

        const currentRoute = `${window.location.pathname}${window.location.hash}`;
        const isOAuthFlow =
          currentRoute.includes('/auth/callback') ||
          currentRoute.includes('/continue-registration');

        if (!isOAuthFlow) {
          localStorage.removeItem('madina_access_token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('google_temp_token');
          localStorage.removeItem('madina_auth_user');
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('user_data');
          await secureStorage.removeItem(STORAGE_KEY);
          setUser(null);
          return;
        }

        const rawData = localStorage.getItem(STORAGE_KEY);
        let storedUser = null;

        if (rawData) {
          try {
            const parsed = JSON.parse(rawData);
            storedUser = {
              id: parsed.userId || parsed.id,
              name: parsed.userName || parsed.fullname || parsed.name || 'User',
              email: parsed.email,
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
          try {
            const freshUser = await fetchMe();
            if (freshUser) {
              setUser(freshUser);
            } else {
              await logout();
            }
          } catch (fetchError) {
            console.error('Error fetching fresh user data:', fetchError);
            await logout();
          }
        } else if (storedUser) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('user_data');
          await secureStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('AuthProvider loadUser error:', error);
        setAuthError('فشل في تحميل بيانات المستخدم');
      } finally {
        setBootstrapping(false);
        setIsInitialized(true);
      }
    };

    loadUser();
  }, []);

  // Login function with validation
  const login = async (payload) => {
    try {
      setAuthError(null);

      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://champapi.neurix.uk';
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
          name: responseData.userName || responseData.fullname || responseData.name || 'User',
          email: responseData.email || payload.email,
          // roles: responseData.roles || ['User'],
          roles: normalizeRoles(responseData.roles || responseData.role || responseData.user?.roles || ['user']),
          token: token,
        };

        console.log('NORMALIZED LOGIN USER:', normalizedUser);
        setUser(normalizedUser);

        // Fetch fresh user data immediately to get correct roles and profile
        try {
          console.log('Fetching fresh user data after login...');
          const freshUser = await fetchMe();
          if (freshUser) {
            console.log('Fresh user data fetched successfully:', freshUser);
          }
        } catch (fetchError) {
          console.warn('Failed to fetch fresh user data after login:', fetchError.message);
        }

        // Fetch and save user profile after login
        try {
          console.log('Fetching user profile after login...');
          const profileData = await profilesService.fetchMyProfile();
          console.log('Profile data fetched:', profileData);

          // Save profile data to localStorage
          profilesService.saveProfileToStorage(profileData);
          console.log('Profile saved to localStorage - avatarId:', profileData.avatarId, 'profileId:', profileData.id || profileData.profileId);
        } catch (profileError) {
          console.warn('Failed to fetch profile after login:', profileError.message);
          // Don't block login flow if profile fetch fails
        }

        return normalizedUser;
      }
    } catch (error) {
      console.error('LOGIN API ERROR:', error.response?.data || error.message || error);

      let errorMsg = 'خطأ في البريد الإلكتروني أو كلمة السر';

      if (error?.response?.data) {
        const errorData = error.response.data;

        // Handle ASP.NET Core Identity validation errors
        if (errorData.errors && typeof errorData.errors === 'object') {
          const messages = [];
          Object.values(errorData.errors).forEach(errArray => {
            if (Array.isArray(errArray)) {
              messages.push(...errArray);
            } else if (typeof errArray === 'string') {
              messages.push(errArray);
            }
          });
          if (messages.length > 0) {
            errorMsg = messages.join(' | ');
          }
        } else {
          // If the error status is 401 or 400 with a generic failure, provide the helpful message
          if (error.response.status === 401 || errorData.title === 'One or more validation errors occurred.') {
            errorMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          } else {
            errorMsg = errorData.message || errorData.title || errorMsg;
          }
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

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

      // Removed setUser and fetchMe to prevent automatic login after registration
      // The user will be redirected to login page to enter credentials manually

      return normalizedUser;
    } catch (error) {
      console.error('REGISTER API ERROR:', error?.response?.data || error?.message || error);
      console.error('FULL ERROR RESPONSE:', error?.response);
      console.error('ERROR STATUS:', error?.response?.status);
      console.error('ERROR DATA:', JSON.stringify(error?.response?.data, null, 2));

      let errorMsg = 'فشل إنشاء الحساب';

      if (error?.response?.data) {
        const errorData = error.response.data;

        // 1. If errorData is an array of errors (like ASP.NET Identity raw errors)
        if (Array.isArray(errorData)) {
          const messages = errorData
            .map(err => err.description || err.message)
            .filter(Boolean);
          if (messages.length > 0) {
            errorMsg = messages.join(' | ');
          }
        }
        // 2. If errorData is an object with errors dictionary or array
        else if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            const messages = errorData.errors
              .map(err => err.description || err.message)
              .filter(Boolean);
            if (messages.length > 0) {
              errorMsg = messages.join(' | ');
            }
          } else if (typeof errorData.errors === 'object') {
            const messages = [];
            Object.values(errorData.errors).forEach(errArray => {
              if (Array.isArray(errArray)) {
                messages.push(...errArray);
              } else if (typeof errArray === 'string') {
                messages.push(errArray);
              } else if (errArray && typeof errArray === 'object') {
                messages.push(errArray.description || errArray.message || JSON.stringify(errArray));
              }
            });
            if (messages.length > 0) {
              errorMsg = messages.join(' | ');
            }
          }
        }
        // 3. Fallback to standard message/title
        else {
          errorMsg = errorData.message || errorData.description || errorData.title || errorMsg;
        }

        // Translate common English validation/identity errors to Arabic
        if (typeof errorMsg === 'string') {
          errorMsg = errorMsg.replace(/Email '.*' is already taken\./gi, 'البريد الإلكتروني مسجل بالفعل.');
          errorMsg = errorMsg.replace(/Username '.*' is already taken\./gi, 'اسم المستخدم مسجل بالفعل.');
          errorMsg = errorMsg.replace(/DuplicateEmail/gi, 'البريد الإلكتروني مسجل بالفعل.');
          errorMsg = errorMsg.replace(/DuplicateUserName/gi, 'اسم المستخدم مسجل بالفعل.');
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

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

      window.location.assign(getAuthApiUrl('/api/auth/google/login'));
      return null;
    } catch (error) {
      console.error('Google Login Error:', error);
      setAuthError('Failed to initiate Google login');
      setLoading(false);
      return null;
    }
  };

  //continue registration fetching

  const continueRegistration = async (userId, newPassword, birthDate, extra = null) => {
    try {
      setAuthError(null);

      if (!userId) {
        setAuthError('UserId غير موجود، ارجعي اعملي تسجيل بجوجل مرة تانية');
        return null;
      }

      const url = getAuthApiUrl('/api/auth/continue-registration');
      const exchangeToken =
        typeof extra === 'string'
          ? extra
          : getTokenFromResponse(extra) || getStoredGoogleExchangeToken();

      const payload = {
        userid: userId,
        newpassword: newPassword,
        birthDate,
      };

      console.log('Continue Registration EXTRA:', extra);
      console.log('Continue Registration URL:', url);
      console.log('Continue Registration PAYLOAD:', payload);
      console.log('Continue Registration EXCHANGE TOKEN EXISTS:', Boolean(exchangeToken));
      console.log('Continue Registration EXCHANGE TOKEN PREVIEW:', getTokenPreview(exchangeToken));

      if (!exchangeToken) {
        setAuthError('Google exchange token is missing. Please sign in with Google again.');
        return null;
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${exchangeToken}`,
        },
      });

      console.log('Continue Registration Successful:', response.data);

      await logout();

      return response.data || { success: true };
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
  //       'https://champapi.neurix.uk';

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
      localStorage.removeItem('google_temp_token');
      localStorage.removeItem('madina_auth_user');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('user_data');
      sessionStorage.removeItem('pending_google_registration');
      sessionStorage.removeItem('pending_google_exchange_token');
      await secureStorage.removeItem(STORAGE_KEY);

      // Clear game state if necessary (handled by components listening to user=null)
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
    isInitialized,
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
  }), [user, isAuthenticated, isAdmin, bootstrapping, isInitialized, authError, loading]);

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
