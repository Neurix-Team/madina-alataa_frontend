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
        // Get current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const remoteError = urlParams.get('remoteError');

        console.log('CALLBACK URL PARAMS:', { code, remoteError });

        if (remoteError) {
          setError(`Authentication error: ${remoteError}`);
          setLoading(false);
          return;
        }

        if (!code) {
          setError('Missing authorization code');
          setLoading(false);
          return;
        }

        // Call the callback API endpoint
        const response = await axios.get(
          `http://api-givingchampion.dev.localhost:5128/api/auth/google/callback?remoteError=${remoteError || ''}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('CALLBACK API RESPONSE:', response.data);

        const responseData = response.data;
        setResponseData(responseData);

        // Extract user data and needsRegistration flag
        const userData = responseData?.user || responseData;
        const needsRegistration = responseData?.needsRegistration || false;

        if (userData) {
          // Normalize user data
          const normalizedUser = {
            id: userData?.id || `user-${Date.now()}`,
            name: userData?.fullname || userData?.name || 'Unknown',
            email: userData?.email || 'No Email',
            roles: userData?.roles || ['User'],
            token: responseData?.token || null,
            needsRegistration: needsRegistration,
          };

          console.log('NORMALIZED CALLBACK USER:', normalizedUser);

          // Store user in auth context and secure storage
          setUser(normalizedUser);
          await secureStorage.setItem('madina_auth_user', normalizedUser);

          // Store token in localStorage if available
          if (responseData?.token) {
            localStorage.setItem('auth_token', responseData.token);
          }

          // Redirect based on needsRegistration flag
          if (needsRegistration) {
            console.log('Redirecting to continue registration...');
            navigate('/continue-registration', { 
              state: { 
                userId: normalizedUser.id, 
                email: normalizedUser.email 
              } 
            });
          } else {
            console.log('Redirecting to profile...');
            // Navigate based on user role
            if (normalizedUser.roles.includes('admin')) {
              navigate('/admin');
            } else if (normalizedUser.roles.includes('parent')) {
              navigate('/parents');
            } else {
              navigate('/profile-v2');
            }
          }
        } else {
          setError('No user data received from server');
        }
      } catch (err) {
        console.error('CALLBACK ERROR:', err);
        setError(err.response?.data?.message || err.message || 'Authentication failed');
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