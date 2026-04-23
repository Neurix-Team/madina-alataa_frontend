import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import secureStorage from '../../utils/secureStorage';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  

  useEffect(() => {
  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const remoteError = urlParams.get('remoteError');

      if (remoteError) {
        setError(`Authentication error: ${remoteError}`);
        return;
      }

      if (!code) {
        setError('Missing authorization code');
        return;
      }

      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128';
      const exchangeUrl = `${apiBase.replace(/\/$/, '')}/api/auth/google/exchange`;

        const state = urlParams.get('state');
        const redirectUri = `${window.location.origin}/auth/callback`;
        const payload = { code, state, redirectUri };
        console.log('CALLBACK EXCHANGE REQUEST:', exchangeUrl, payload);
      
        const response = await axios.post(exchangeUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      console.log('CALLBACK API RESPONSE (full):', response.data);

      // Try to extract token immediately from the exchange response and persist it
      const immediateToken = response?.data?.token
        || response?.data?.accessToken
        || response?.data?.access_token
        || response?.data?.data?.token
        || response?.data?.data?.access_token
        || response?.data?.tokens?.access
        || response?.data?.user?.token
        || null;
      if (immediateToken) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('madina_access_token', immediateToken);
            window.localStorage.setItem('auth_token', immediateToken);
            console.log('Saved immediate access token to localStorage');
          }
        } catch (e) {
          console.warn('Failed to save immediate access token', e);
        }
      }

      const responseData = response.data;
      const needsRegistration = Boolean(
        responseData?.needsregistration ?? responseData?.needsRegistration
      );

      // الحالة دي ليست login مكتمل
      if (needsRegistration) {
        sessionStorage.setItem(
          'pending_google_registration',
          JSON.stringify(responseData)
        );

        navigate('/continue-registration', {
          replace: true,
          state: responseData,
        });
        return;
      }

      const userData = responseData?.user;
      const token = responseData?.token ?? userData?.token;

      if (!userData || !token) {
        setError('Google exchange did not return a completed authenticated user.');
        return;
      }

      const normalizedUser = {
        id: userData.id,
        name: userData.fullname || userData.name || '',
        email: userData.email || '',
        roles: userData.roles || [],
        token,
      };

      setUser(normalizedUser);
      await secureStorage.setItem('madina_auth_user', normalizedUser);
      // Log and persist access token for inspection
      console.log('CALLBACK ACCESS TOKEN:', token);
      try {
        if (typeof window !== 'undefined' && window.localStorage && token) {
          window.localStorage.setItem('madina_access_token', token);
          // keep legacy key as well
          window.localStorage.setItem('auth_token', token);
        }
      } catch (e) {
        console.warn('Failed to save access token to localStorage', e);
      }

      if (normalizedUser.roles.includes('admin')) {
        navigate('/admin', { replace: true });
      } else if (normalizedUser.roles.includes('parent')) {
        navigate('/parents', { replace: true });
      } else {
        navigate('/profile-v2', { replace: true });
      }
    } catch (err) {
      // Detailed error logging for easier debugging of 400/500 responses from exchange API
      console.error('CALLBACK ERROR (full):', err);
      const resp = err?.response;
      console.error('CALLBACK ERROR RESPONSE DATA:', resp?.data);
      console.error('CALLBACK ERROR STATUS:', resp?.status);
      console.error('CALLBACK ERROR HEADERS:', resp?.headers);

      // Persist error details to localStorage for inspection
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('madina_google_exchange_error', JSON.stringify({
            message: err?.message,
            status: resp?.status,
            data: resp?.data,
            headers: resp?.headers,
          }));
        }
      } catch (e) {
        console.warn('Failed to save exchange error to localStorage', e);
      }

      setError(resp?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // handleCallback();
}, [navigate, setUser]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontFamily: "'Cairo', sans-serif"
      }}>
        <div>Processing authentication...</div>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Please wait while we verify your identity
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      fontFamily: "'Cairo', sans-serif",
      padding: '20px'
    }}>
      {error ? (
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '20px' }}>Authentication Error</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <button 
            onClick={() => navigate('/auth')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#27ae60', marginBottom: '20px' }}>Authentication Successful!</h3>
          {responseData && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <h4>Response Data:</h4>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
          )}
          <p>Redirecting you to your dashboard...</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;