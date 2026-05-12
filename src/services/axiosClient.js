import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://champapi.neurix.uk:5001';

const getStoredAuthToken = () => {
  let token = null;

  try {
    const userData =
      localStorage.getItem('madeena_login_user_response') ||
      localStorage.getItem('user_data');

    if (userData) {
      const parsed = JSON.parse(userData);

      token =
        parsed.token ||
        parsed.accessToken ||
        parsed.AccessToken ||
        parsed.data?.token ||
        parsed.data?.accessToken ||
        null;
    }
  } catch (e) {
    console.warn('axiosClient: Failed to parse token from JSON storage', e);
  }

  if (!token) {
    token =
      localStorage.getItem('madina_access_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('google_temp_token') ||
      null;
  }

  return token;
};

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
    const token = getStoredAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log when token is being sent to mission, location, and partners APIs specifically
      if (
        config.url?.includes('/api/mission') ||
        config.url?.includes('/api/location') ||
        config.url?.includes('/api/Partners') ||
        config.url?.includes('/api/Child') ||
        config.url?.includes('/api/admin') ||
        config.url?.includes('/api/donation-requests') ||
        config.url?.includes('/api/Volunteer') ||
        config.url?.includes('/api/Badges') ||
        config.url?.includes('/api/Certificate') ||
        config.url?.includes('/api/UserBadges') ||
        config.url?.includes('/api/Levels') ||
        config.url?.includes('/api/UserLevels') ||
        config.url?.includes('/api/Activities') ||
        config.url?.includes('/api/GeoQuests') ||
        config.url?.includes('/api/UserGeoQuests')
      ) {
        // console.log('🔐 Sending auth_token to API:', {
        //   url: config.url,
        //   method: config.method,
        //   hasToken: !!token,
        //   tokenPreview: token?.substring(0, 20) + '...',
        //   fullToken: token // Temporary for debugging
        // });
        console.log('🔐 Sending auth_token to API:', {
  url: config.url,
  method: config.method,
  hasToken: !!token,
  tokenPreview: token?.substring(0, 20) + '...'
});
      }
    } else {
      // Warn when no token is found for important APIs
      if (
        config.url?.includes('/api/mission') ||
        config.url?.includes('/api/location') ||
        config.url?.includes('/api/Partners') ||
        config.url?.includes('/api/Child') ||
        config.url?.includes('/api/admin') ||
        config.url?.includes('/api/donation-requests') ||
        config.url?.includes('/api/Volunteer') ||
        config.url?.includes('/api/Badges') ||
        config.url?.includes('/api/Certificate') ||
        config.url?.includes('/api/UserBadges') ||
        config.url?.includes('/api/Levels') ||
        config.url?.includes('/api/UserLevels') ||
        config.url?.includes('/api/Activities') ||
        config.url?.includes('/api/GeoQuests') ||
        config.url?.includes('/api/UserGeoQuests')
      ) {
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
    // Debug 403 errors
    if (error?.response?.status === 403) {
      console.error('🚫 403 Forbidden Error:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        responseData: error.response?.data,
        responseStatus: error.response?.status,
        responseStatusText: error.response?.statusText
      });
    }
    return Promise.reject(error);
  }
);


