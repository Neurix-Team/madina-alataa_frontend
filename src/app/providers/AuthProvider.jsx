// src/app/providers/AuthProvider.jsx
import { authService } from '../../services/authService';
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
  // const login = async (payload) => {
  //   try {
  //     setAuthError(null);

  //     // Validate input
  //     const emailError = validateEmail(payload.email);
  //     if (emailError) {
  //       setAuthError(emailError);
  //       return null;
  //     }

  //     const passwordError = validatePassword(payload.password);
  //     if (passwordError) {
  //       setAuthError(passwordError);
  //       return null;
  //     }

  //     const loggedInUser = await mockLogin(payload);
  //     setUser(loggedInUser);
  //     await secureStorage.setItem(STORAGE_KEY, loggedInUser);
  //     return loggedInUser;
  //   } catch (error) {
  //     const errorMsg = handleError(error);
  //     setAuthError(errorMsg);
  //     logError(error, 'AuthProvider.login');
  //     return null;
  //   }
  // };

const login = async (payload) => {
  try {
    setAuthError(null);

    // إرسال طلب لوجين إلى الـ API
    const response = await axios.post('http://api-givingchampion.dev.localhost:5128/api/auth/login', payload);

    // طباعة الريسبونس في الكونسول
    console.log('LOGIN RESPONSE:', response);

    // التأكد من وجود بيانات المستخدم في الريسبونس
    const userData = response.data?.user ?? response.data;

    // إذا كانت الاستجابة صحيحة:
    if (userData) {
      const normalizedUser = {
        id: userData?.id || `user-${Date.now()}`,
        name: userData?.fullname || userData?.name || 'Unknown',
        email: userData?.email || payload.email,
        roles: userData?.roles || ['User'],
        token: response.data?.token || null,
      };

      console.log('NORMALIZED LOGIN USER:', normalizedUser);

      setUser(normalizedUser); // تخزين المستخدم في الحالة
      await secureStorage.setItem(STORAGE_KEY, normalizedUser); // تخزينه في secureStorage

      return normalizedUser; // إرجاع المستخدم
    }
  } catch (error) {
    // في حالة حدوث خطأ، عرض رسالة الخطأ في الكونسول
    console.error('LOGIN API ERROR:', error.response?.data || error.message || error);

    const errorMsg =
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      'فشل تسجيل الدخول';

    setAuthError(errorMsg); // تعيين رسالة الخطأ في حالة حدوث خطأ
    logError(error, 'AuthProvider.login'); // تسجيل الخطأ

    return null; // إرجاع null في حال حدوث خطأ
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

      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        'فشل إنشاء الحساب';

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