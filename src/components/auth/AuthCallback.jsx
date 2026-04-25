import React, { useEffect, useState, useRef } from 'react';
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
  const hasCalled = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log('AUTHORIZATION CODE (from URL):', code);

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

        const redirectUri = `${window.location.origin}/auth/callback`;
        const payload = { code };
        console.log('CALLBACK EXCHANGE REQUEST:', exchangeUrl, payload);
      
        const response = await axios.post(exchangeUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Log full axios response and the response data for debugging
        console.log('CALLBACK API RESPONSE (axios):', response);
        console.log('CALLBACK API RESPONSE DATA:', response.data);

        // Store the raw API response in a local variable for processing
        const responseData = response.data || {};
        // Ensure the original authorization code is preserved in the response view
        responseData.code = responseData.code ?? code;

        // Check if needsregistration is present in the URL or response
        const needsRegistration = urlParams.get('needsregistration') === 'true'
          || Boolean(responseData?.needsRegistration ?? responseData?.needsregistration);

        // Expose a normalized `needsregistration` flag on the response data and log it
        responseData.needsregistration = responseData.needsregistration ?? responseData.needsRegistration ?? needsRegistration;
        console.log('NEEDS REGISTRATION:', needsRegistration, 'responseData.needsregistration:', responseData.needsregistration);
        // Update component state with the enriched response data
        setResponseData(responseData);

        if (needsRegistration) {
          // include the original code when saving pending registration
          const pending = { ...responseData, code };
          sessionStorage.setItem(
            'pending_google_registration',
            JSON.stringify(pending)
          );

          navigate('/continue-registration', {
            replace: true,
            state: responseData,
          });
          return;
        }

        // Backend returns TokenResponse: { accessToken, expiresAtUtc, userId, email, roles }
        const token = responseData?.accessToken || responseData?.token;
        const userId = responseData?.userId;
        const email = responseData?.email;
        const roles = responseData?.roles || [];

        if (!token) {
          setError('Google exchange did not return an access token.');
          return;
        }

        const normalizedUser = {
          id: userId,
          name: responseData?.fullname || responseData?.name || email || '',
          email: email || '',
          roles: roles,
          token,
        };

        setUser(normalizedUser);
        await secureStorage.setItem('madina_auth_user', normalizedUser);
        
        // Log and persist access token for inspection
        console.log('CALLBACK ACCESS TOKEN:', token);
        try {
          if (typeof window !== 'undefined' && window.localStorage && token) {
            // store using several keys for compatibility
            window.localStorage.setItem('madina_access_token', token);
            window.localStorage.setItem('auth_token', token);
            window.localStorage.setItem('accessToken', token);
          }
        } catch (e) {
          console.warn('Failed to save access token to localStorage', e);
        }

        // if (normalizedUser.roles.includes('admin')) {
        //   navigate('/admin', { replace: true });
        // } else if (normalizedUser.roles.includes('parent')) {
        //   navigate('/parents', { replace: true });
        // } else {
        //   navigate('/profile-v2', { replace: true });
        // }
        // Stay on callback page after successful authentication


// console.log('Authentication completed. Staying on /auth/callback page.');


return;
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

        // Try to get a more descriptive error message from the backend response
        let backendErrorMessage = '';
        if (resp?.data?.errors && Array.isArray(resp.data.errors)) {
          backendErrorMessage = resp.data.errors.map(e => e.description || e.message || e).join(', ');
        } else if (resp?.data?.message) {
          backendErrorMessage = resp.data.message;
        }

        setError(backendErrorMessage || err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
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