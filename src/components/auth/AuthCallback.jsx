import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import secureStorage from '../../utils/secureStorage';
import {
  FaGoogle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaLock,
} from 'react-icons/fa';

const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || 'https://champapi.neurix.uk';
const LOGIN_STORAGE_KEY = 'madeena_login_user_response';

const getAuthApiUrl = (path) => `${AUTH_API_BASE_URL.replace(/\/$/, '')}${path}`;

const getCallbackParams = () => {
  const params = new URLSearchParams(window.location.search);
  const hashQueryIndex = window.location.hash.indexOf('?');

  if (hashQueryIndex !== -1) {
    const hashParams = new URLSearchParams(window.location.hash.slice(hashQueryIndex + 1));
    hashParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });
  }

  return params;
};

const parseBool = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return ['true', '1', 'yes'].includes(value.trim().toLowerCase());
  }
  return false;
};

const normalizeRoles = (roles) => {
  if (!roles) return [];
  return Array.isArray(roles)
    ? roles.map((role) => String(role).toLowerCase())
    : [String(roles).toLowerCase()];
};

const pickToken = (source) => {
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
    pickToken(source.data) ||
    pickToken(source.value) ||
    pickToken(source.result) ||
    pickToken(source.item) ||
    pickToken(source.user) ||
    null
  );
};

const normalizeExchangeResponse = (rawData, code, urlNeedsRegistration) => {
  const data = rawData || {};
  const nestedData = data?.data || data?.value || data?.result || data?.item || {};
  const user = data?.user || nestedData?.user || {};
  const token = pickToken(data);

  const apiNeedsRegistration = parseBool(
    data?.needsRegistration ??
    data?.needsregistration ??
    data?.needs_registration ??
    nestedData?.needsRegistration ??
    nestedData?.needsregistration ??
    user?.needsRegistration ??
    user?.needsregistration
  );

  const needsRegistration = parseBool(urlNeedsRegistration) || apiNeedsRegistration;

  return {
    ...data,
    code,
    exchangeToken: token,
    googleExchangeToken: token,
    token,
    accessToken: data?.accessToken || data?.access_token || nestedData?.accessToken || nestedData?.access_token || token,
    tempToken: data?.tempToken || nestedData?.tempToken || token,
    needsRegistration,
    needsregistration: needsRegistration,
    userId: data?.userId || data?.UserId || nestedData?.userId || user?.id || user?.userId,
    email: data?.email || data?.Email || nestedData?.email || user?.email,
    fullname: data?.fullname || data?.fullName || data?.name || user?.fullname || user?.fullName || user?.name,
    roles: normalizeRoles(data?.roles || data?.Roles || nestedData?.roles || user?.roles || user?.role),
  };
};

const persistToken = (token) => {
  if (!token) return;
  localStorage.setItem('madina_access_token', token);
  localStorage.setItem('auth_token', token);
  localStorage.setItem('accessToken', token);
  localStorage.setItem('google_temp_token', token);
};

const getDefaultRoute = (user) => {
  if (user.roles.includes('admin')) return '/admin';
  if (user.roles.includes('parent')) return '/parents';
  if (user.roles.includes('volunteer')) return '/map';
  return '/profile-v2';
};

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasCalled = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        const urlParams = getCallbackParams();
        const code = urlParams.get('code');
        const remoteError = urlParams.get('remoteError');
        const urlNeedsRegistration =
          urlParams.get('needsregistration') ??
          urlParams.get('needsRegistration') ??
          urlParams.get('needs_registration');

        if (remoteError) {
          setError(`Authentication error: ${remoteError}`);
          return;
        }

        if (!code) {
          setError('Missing authorization code');
          return;
        }

        const response = await axios.post(
          getAuthApiUrl('/api/auth/google/exchange'),
          { code },
          { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('Google exchange response:', response.data);
        const exchangeData = normalizeExchangeResponse(response.data, code, urlNeedsRegistration);
        const exchangeToken =
          exchangeData.accessToken ||
          exchangeData.token ||
          exchangeData.tempToken ||
          exchangeData.jwt ||
          exchangeData.bearerToken ||
          exchangeData.googleExchangeToken ||
          null;

        console.log('Google exchange token:', exchangeToken);
        if (exchangeToken) {
          localStorage.setItem('google_temp_token', exchangeToken);
          sessionStorage.setItem('pending_google_exchange_token', exchangeToken);
        }

        localStorage.setItem('madina_needs_registration', exchangeData.needsRegistration ? 'true' : 'false');
        const pendingRegistrationData = {
          ...exchangeData,
          exchangeToken,
        };
        sessionStorage.setItem('pending_google_registration', JSON.stringify(pendingRegistrationData));

        if (exchangeData.needsRegistration) {
          persistToken(exchangeToken || exchangeData.token || exchangeData.accessToken || exchangeData.tempToken);

          const nextUrl = new URL('/continue-registration', window.location.origin);
          if (exchangeData.userId) nextUrl.searchParams.set('userId', exchangeData.userId);
          if (exchangeData.email) nextUrl.searchParams.set('email', exchangeData.email);
          nextUrl.searchParams.set('code', code);

          navigate(`${nextUrl.pathname}${nextUrl.search}`, {
            replace: true,
            state: exchangeData,
          });
          return;
        }

        const token = exchangeData.token || exchangeData.accessToken || exchangeData.tempToken;
        if (!token) {
          setError('Google exchange did not return an access token.');
          return;
        }

        persistToken(token);

        const normalizedUser = {
          id: exchangeData.userId,
          name: exchangeData.fullname || exchangeData.email || 'User',
          email: exchangeData.email || '',
          roles: exchangeData.roles,
          token,
        };

        setUser(normalizedUser);
        localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(normalizedUser));
        await secureStorage.setItem(LOGIN_STORAGE_KEY, normalizedUser);

        navigate(getDefaultRoute(normalizedUser), { replace: true });
      } catch (err) {
        console.error('Google callback error:', err);
        console.error('Google callback response:', err?.response?.data);

        const responseData = err?.response?.data;
        const message =
          responseData?.message ||
          responseData?.title ||
          err?.message ||
          'Authentication failed';

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  if (loading) {
    return (
      <div style={styles.pageShell}>
        <div style={styles.glowOne} />
        <div style={styles.glowTwo} />

        <div style={styles.card}>
          <div style={styles.badge}>
            <FaGoogle size={20} />
          </div>

          <div style={styles.iconRing}>
            <FaSpinner style={styles.spinnerIcon} />
          </div>

          <h1 style={styles.title}>جاري الاتصال بحسابك على Google</h1>
          <p style={styles.message}>
            نتحقق من كود التفويض وتحضير الجلسة الخاصة بك
          </p>

          <div style={styles.steps}>
            <div style={styles.stepItem}>
              <FaCheckCircle color="#16a34a" size={18} />
              <span>تم الرد من Google بنجاح</span>
            </div>
            <div style={styles.stepItem}>
              <FaSpinner style={styles.inlineSpinner} size={18} />
              <span>جاري مبادلة الكود مع الخادم</span>
            </div>
            <div style={styles.stepItem}>
              <FaLock color="#64748b" size={18} />
              <span>تأمين الجلسة الخاصة بك</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageShell}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      {error ? (
        <div style={styles.card}>
          <div style={{ ...styles.badge, background: 'rgba(239, 68, 68, 0.14)', color: '#dc2626' }}>
            <FaExclamationTriangle size={18} />
          </div>
          <h1 style={styles.title}>فشل المصادقة</h1>
          <p style={styles.message}>{error}</p>
          <div style={styles.actions}>
            <button onClick={() => navigate('/login')} style={styles.primaryButton}>
              العودة لصفحة تسجيل الدخول
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={{ ...styles.badge, background: 'rgba(22, 163, 74, 0.14)', color: '#16a34a' }}>
            <FaCheckCircle size={18} />
          </div>
          <h1 style={styles.title}>المصادقة نجحت بنجاح</h1>
          <p style={styles.message}>جاري إعادة التوجيه...</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageShell: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    background:
      'radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.10), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
    fontFamily: "'Cairo', sans-serif",
  },
  glowOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.14)',
    filter: 'blur(24px)',
    top: '-80px',
    left: '-60px',
  },
  glowTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: '50%',
    background: 'rgba(34, 197, 94, 0.10)',
    filter: 'blur(24px)',
    bottom: '-60px',
    right: '-40px',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 560,
    padding: '32px 28px',
    borderRadius: 28,
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
    textAlign: 'center',
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(37, 99, 235, 0.10)',
    color: '#2563eb',
    marginBottom: 18,
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 18px',
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(16, 185, 129, 0.12))',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
  },
  spinnerIcon: {
    fontSize: 28,
    color: '#2563eb',
    animation: 'spin 0.9s linear infinite',
  },
  inlineSpinner: {
    animation: 'spin 0.9s linear infinite',
    color: '#2563eb',
  },
  title: {
    margin: 0,
    color: '#0f172a',
    fontSize: '1.75rem',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  message: {
    color: '#475569',
    margin: '12px auto 0',
    lineHeight: 1.8,
    maxWidth: 420,
    fontSize: '0.98rem',
  },
  steps: {
    display: 'grid',
    gap: 12,
    marginTop: 24,
    padding: 18,
    borderRadius: 18,
    background: 'rgba(248, 250, 252, 0.9)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    textAlign: 'right',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#334155',
    fontSize: '0.95rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginTop: 22,
  },
  primaryButton: {
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 700,
    boxShadow: '0 10px 24px rgba(37, 99, 235, 0.24)',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('auth-callback-spin-keyframes')) {
  const style = document.createElement('style');
  style.id = 'auth-callback-spin-keyframes';
  style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

export default AuthCallback;
