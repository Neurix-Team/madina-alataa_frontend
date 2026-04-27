import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128';

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
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('madina_access_token') || 
                  localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        // keep a light console trace for debugging
        console.warn('axiosClient: cleared tokens due to 401 response');
      } catch (e) {
        console.warn('axiosClient: failed to clear tokens after 401', e);
      }
    }
    return Promise.reject(error);
  }
);


