import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import secureStorage from '../../utils/secureStorage';

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

const pickToken = (data) => (
  data?.token ||
  data?.accessToken ||
  data?.tempToken ||
  data?.AccessToken ||
  data?.TempToken ||
  data?.data?.token ||
  data?.data?.accessToken ||
  data?.data?.tempToken ||
  null
);

const normalizeExchangeResponse = (rawData, code, urlNeedsRegistration) => {
  const data = rawData || {};
  const nestedData = data?.data || {};
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
    token,
    accessToken: data?.accessToken || nestedData?.accessToken || token,
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

        const exchangeData = normalizeExchangeResponse(response.data, code, urlNeedsRegistration);
        localStorage.setItem('madina_needs_registration', exchangeData.needsRegistration ? 'true' : 'false');

        if (exchangeData.needsRegistration) {
          persistToken(exchangeData.token || exchangeData.accessToken || exchangeData.tempToken);
          sessionStorage.setItem('pending_google_registration', JSON.stringify(exchangeData));

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
      <div style={styles.centered}>
        <div>Processing Google login...</div>
        <div style={styles.subText}>Please wait while we verify your account.</div>
      </div>
    );
  }

  return (
    <div style={styles.centered}>
      {error ? (
        <div style={styles.card}>
          <h3 style={styles.errorTitle}>Authentication Error</h3>
          <p style={styles.message}>{error}</p>
          <button onClick={() => navigate('/login')} style={styles.button}>
            Back to Login
          </button>
        </div>
      ) : (
        <div style={styles.card}>
          <h3 style={styles.successTitle}>Authentication Successful</h3>
          <p style={styles.message}>Redirecting you now...</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  centered: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 12,
    padding: 24,
    fontFamily: "'Cairo', sans-serif",
  },
  subText: {
    color: '#64748b',
    fontSize: 14,
  },
  card: {
    maxWidth: 420,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#dc2626',
    marginBottom: 16,
  },
  successTitle: {
    color: '#16a34a',
    marginBottom: 16,
  },
  message: {
    color: '#475569',
    marginBottom: 20,
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 700,
  },
};

export default AuthCallback;
