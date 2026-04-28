// Utility to set auth token for mission APIs

export const setAuthToken = (token) => {
  if (!token) {
    console.error('Token is required');
    return false;
  }
  
  // Set the auth_token in localStorage
  localStorage.setItem('auth_token', token);
  console.log('✅ auth_token set successfully:', token.substring(0, 20) + '...');
  
  // Verify it was set
  const storedToken = localStorage.getItem('auth_token');
  if (storedToken === token) {
    console.log('✅ Token verification successful');
    return true;
  } else {
    console.error('❌ Token verification failed');
    return false;
  }
};

// Function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('madina_access_token');
  localStorage.removeItem('accessToken');
  console.log('🗑️ All auth tokens cleared');
};

// Function to check current auth token
export const checkAuthToken = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('🔑 Current auth_token:', token.substring(0, 20) + '...');
    return token;
  } else {
    console.log('❌ No auth_token found');
    return null;
  }
};

// Auto-set token from URL parameter
export const setTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    setAuthToken(token);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }
  
  return false;
};
