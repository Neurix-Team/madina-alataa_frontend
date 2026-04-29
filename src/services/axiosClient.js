import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://api-givingchampion.dev.localhost:5128';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
axiosClient.interceptors.request.use(
  (config) => {
    // Try to get token from multiple common keys
    let token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('madina_access_token') || 
                  localStorage.getItem('accessToken');
    
    // Fallback: Check if it's stored inside a JSON object (common in some auth implementations)
    if (!token) {
      try {
        const userData = localStorage.getItem('user_data') || localStorage.getItem('madeena_login_user_response');
        if (userData) {
          const parsed = JSON.parse(userData);
          token = parsed.token || parsed.accessToken || parsed.AccessToken;
        }
      } catch (e) {
        console.warn('axiosClient: Failed to parse token from JSON storage', e);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log when token is being sent to mission and location APIs specifically
      if (config.url?.includes('/api/mission') || config.url?.includes('/api/location')) {
        console.log('🔐 Sending auth_token to API:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenPreview: token.substring(0, 10) + '...'
        });
      }
    } else {
      // Warn when no token is found for mission and location APIs
      if (config.url?.includes('/api/mission') || config.url?.includes('/api/location')) {
        console.warn('⚠️ No auth_token found for API request:', {
          url: config.url,
          method: config.method
        });
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Clear stored tokens on 401 responses to avoid repeated unauthorized requests
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('madina_access_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user_data');
        localStorage.removeItem('madeena_login_user_response');
        // keep a light console trace for debugging
        console.warn('axiosClient: cleared all tokens due to 401 response');
      } catch (e) {
        console.warn('axiosClient: failed to clear tokens after 401', e);
      }
    }
    return Promise.reject(error);
  }
);


