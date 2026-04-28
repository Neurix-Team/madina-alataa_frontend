import { axiosClient } from './axiosClient';

const LOCATIONS_API_URL = '/api/location';

export const locationsService = {
  // Get all locations
  getLocations: async () => {
    try {
      const response = await axiosClient.get(LOCATIONS_API_URL);
      console.log('Get Locations API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  // Get location by ID
  getLocationById: async (locationId) => {
    try {
      console.log('🔍 Fetching location with ID:', locationId);
      const response = await axiosClient.get(`${LOCATIONS_API_URL}/${locationId}`);
      console.log('✅ Get Location by ID API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching location details:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ API Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('❌ Network Error:', error.request);
      } else {
        console.error('❌ Request Error:', error.message);
      }
      
      throw error;
    }
  },

  // Create new location
  createLocation: async (locationData) => {
    try {
      console.log('📤 Creating location with data:', JSON.stringify(locationData, null, 2));
      
      // Ensure numeric fields are numbers
      const sanitizedData = {
        name: locationData.name?.trim(),
        requiredLevel: parseInt(locationData.requiredLevel) || 1,
        longitude: parseFloat(locationData.longitude) || null,
        latitude: parseFloat(locationData.latitude) || null
      };

      console.log('📤 Sanitized location data:', JSON.stringify(sanitizedData, null, 2));
      
      const response = await axiosClient.post(LOCATIONS_API_URL, sanitizedData);
      console.log('✅ Create Location API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating location:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ API Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('❌ Network Error:', error.request);
      } else {
        console.error('❌ Request Error:', error.message);
      }
      
      throw error;
    }
  },

  // Update location
  updateLocation: async (locationId, locationData) => {
    try {
      console.log('📤 Updating location with ID:', locationId, 'data:', JSON.stringify(locationData, null, 2));
      
      // Ensure numeric fields are numbers
      const sanitizedData = {
        name: locationData.name?.trim() || null,
        requiredLevel: locationData.requiredLevel ? parseInt(locationData.requiredLevel) : null,
        longitude: locationData.longitude ? parseFloat(locationData.longitude) : null,
        latitude: locationData.latitude ? parseFloat(locationData.latitude) : null
      };

      console.log('📤 Sanitized update data:', JSON.stringify(sanitizedData, null, 2));
      
      const response = await axiosClient.put(`${LOCATIONS_API_URL}/${locationId}`, sanitizedData);
      console.log('✅ Update Location API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating location:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ API Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('❌ Network Error:', error.request);
      } else {
        console.error('❌ Request Error:', error.message);
      }
      
      throw error;
    }
  },

  // Delete location
  deleteLocation: async (locationId) => {
    try {
      console.log('🗑️ Deleting location with ID:', locationId);
      
      const response = await axiosClient.delete(`${LOCATIONS_API_URL}/${locationId}`);
      console.log('✅ Delete Location API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting location:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ API Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('❌ Network Error:', error.request);
      } else {
        console.error('❌ Request Error:', error.message);
      }
      
      throw error;
    }
  },

  // Get available locations for user
  getAvailableLocations: async (userLevel = '') => {
    try {
      console.log('🔍 Fetching available locations for user level:', userLevel);
      const response = await axiosClient.get(`${LOCATIONS_API_URL}/available?userLevel=${userLevel}`);
      console.log('✅ Available Locations API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching available locations:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ API Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('❌ Network Error:', error.request);
      } else {
        console.error('❌ Request Error:', error.message);
      }
      
      throw error;
    }
  }
};
