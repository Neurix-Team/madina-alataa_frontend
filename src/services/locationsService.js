import { axiosClient } from './axiosClient';

const LOCATIONS_API_URL = '/api/location';

export const locationsService = {

getLocations: async () => {
  try {
    const response = await axiosClient.get(LOCATIONS_API_URL);

    console.log('Get Locations API Full Response:', response.data);

    const raw = response.data;

    const locations =
      Array.isArray(raw) ? raw :
      Array.isArray(raw?.data) ? raw.data :
      Array.isArray(raw?.data?.items) ? raw.data.items :
      Array.isArray(raw?.items) ? raw.items :
      Array.isArray(raw?.value) ? raw.value :
      Array.isArray(raw?.value?.items) ? raw.value.items :
      Array.isArray(raw?.result) ? raw.result :
      Array.isArray(raw?.result?.items) ? raw.result.items :
      [];

    console.log('✅ Normalized Locations:', locations);

    return locations;
  } catch (error) {
    console.error('❌ Error fetching locations:', error);

    if (error.response) {
      console.error('❌ Get Locations API Error:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    throw error;
  }
},

getAllLocations: async (pageNumber = 1, pageSize = 1000) => {
  try {
    const response = await axiosClient.get(
      `${LOCATIONS_API_URL}?PageNumber=${pageNumber}&PageSize=${pageSize}`
    );

    console.log('Get All Locations API Full Response:', response.data);

    const raw = response.data;

    const items =
      Array.isArray(raw) ? raw :
      Array.isArray(raw?.data) ? raw.data :
      Array.isArray(raw?.data?.items) ? raw.data.items :
      Array.isArray(raw?.items) ? raw.items :
      Array.isArray(raw?.value) ? raw.value :
      Array.isArray(raw?.value?.items) ? raw.value.items :
      Array.isArray(raw?.result) ? raw.result :
      Array.isArray(raw?.result?.items) ? raw.result.items :
      [];

    return {
      raw,
      items,
      totalCount:
        raw?.totalCount ??
        raw?.TotalCount ??
        raw?.data?.totalCount ??
        raw?.value?.totalCount ??
        items.length,
    };
  } catch (error) {
    console.error('❌ Error fetching all locations:', error);
    throw error;
  }
},

  // Get location by ID
  
  getLocationById: async (locationId) => {
  try {
    console.log('🔍 Fetching location with ID:', locationId);

    const response = await axiosClient.get(`${LOCATIONS_API_URL}/${locationId}`);

    console.log('✅ Get Location by ID API Full Response:', response.data);

    const raw = response.data;

    const location =
      raw?.value ??
      raw?.data ??
      raw?.result ??
      raw;

    console.log('✅ Normalized Location Details:', location);

    return location;
  } catch (error) {
    console.error('❌ Error fetching location details:', error);
    throw error;
  }
},

  // Create new location
  createLocation: async (locationData) => {
    try {
      console.log('📤 Creating location with data:', JSON.stringify(locationData, null, 2));
      
     
const sanitizedData = {
  name: String(locationData.name ?? '').trim(),
  requiredLevel: Number(locationData.requiredLevel) || 1,
  longitude: String(locationData.longitude ?? '').trim(),
  latitude: String(locationData.latitude ?? '').trim()
};
      console.log('📤 Sanitized location data for API:', JSON.stringify(sanitizedData, null, 2));
      
      const response = await axiosClient.post(LOCATIONS_API_URL, sanitizedData);
      console.log('✅ Create Location API Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating location:', error);

      if (error.response) {
        // Log the full validation error details from the server
        console.error('❌ API Validation Errors:', error.response.data);
        if (error.response.data.errors) {
          console.error('❌ Specific Field Errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
      }
      throw error;
    }
  },

  // Update location
  updateLocation: async (locationId, locationData) => {
    try {
      console.log('📤 Updating location with ID:', locationId, 'data:', JSON.stringify(locationData, null, 2));
      
   
      const sanitizedData = {
  name: String(locationData.name ?? '').trim(),
  requiredLevel: Number(locationData.requiredLevel) || 1,
  longitude: String(locationData.longitude ?? '').trim(),
  latitude: String(locationData.latitude ?? '').trim()
};

      console.log('📤 Sanitized update data for API:', JSON.stringify(sanitizedData, null, 2));
      
      const response = await axiosClient.put(`${LOCATIONS_API_URL}/${locationId}`, sanitizedData);
      console.log('✅ Update Location API Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating location:', error);
      
      if (error.response) {
        console.error('❌ API Validation Errors:', error.response.data);
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
 

  // Get available locations for user
getAvailableLocations: async (userLevel = '') => {
  try {
    const queryValue =
      userLevel === '' || userLevel === null || typeof userLevel === 'undefined'
        ? ''
        : String(userLevel).trim();

    console.log('🔍 Fetching available locations for user level:', queryValue);

    const response = await axiosClient.get(
      `${LOCATIONS_API_URL}/available?userLevel=${encodeURIComponent(queryValue)}`
    );

    console.log('✅ Available Locations API Response:', response.data);

    const raw = response.data;

    const locations =
      Array.isArray(raw) ? raw :
      Array.isArray(raw?.data) ? raw.data :
      Array.isArray(raw?.value) ? raw.value :
      Array.isArray(raw?.values) ? raw.values :
      Array.isArray(raw?.items) ? raw.items :
      Array.isArray(raw?.data?.items) ? raw.data.items :
      Array.isArray(raw?.value?.items) ? raw.value.items :
      Array.isArray(raw?.values?.items) ? raw.values.items :
      [];

    console.log('✅ Normalized Available Locations:', locations);

    return locations;
  } catch (error) {
    console.error('❌ Error fetching available locations:', error);

    if (error.response) {
      console.error('❌ API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }

    throw error;
  }
}
};
