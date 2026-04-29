import { axiosClient } from './axiosClient';

const GEOQUESTS_API_URL = '/api/GeoQuests';

export const geoQuestsService = {
  // Get all GeoQuests with pagination
  getGeoQuests: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(`${GEOQUESTS_API_URL}?PageNumber=${pageNumber}&PageSize=${pageSize}`);
      console.log('📦 GeoQuests API Full Response:', response.data);
      
      const raw = response.data;
      
      // Normalize response data to handle different API response formats
      const geoQuests = Array.isArray(raw) ? raw :
                        Array.isArray(raw?.data) ? raw.data :
                        Array.isArray(raw?.items) ? raw.items :
                        Array.isArray(raw?.value) ? raw.value :
                        Array.isArray(raw?.result) ? raw.result :
                        [];

      const pagination = raw?.pagination || raw?.data?.pagination || {};
      
      console.log('✅ Normalized GeoQuests:', geoQuests);
      console.log('📄 Pagination Info:', pagination);
      
      return {
        data: geoQuests,
        pagination: {
          currentPage: pagination.currentPage || pageNumber,
          totalPages: pagination.totalPages || 1,
          totalItems: pagination.totalItems || geoQuests.length,
          pageSize: pagination.pageSize || pageSize
        }
      };
    } catch (error) {
      console.error('❌ Error fetching GeoQuests:', error);
      
      if (error.response) {
        console.error('❌ Get GeoQuests API Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },

  // Get GeoQuest by ID
  getGeoQuestById: async (id) => {
    try {
      console.log('🔍 Fetching GeoQuest with ID:', id);
      
      const response = await axiosClient.get(`${GEOQUESTS_API_URL}/${id}`);
      console.log('✅ Get GeoQuest by ID API Full Response:', response.data);
      
      const raw = response.data;
      
      // Handle different response formats
      const geoQuest = raw?.value || raw?.data || raw?.result || raw;
      
      console.log('✅ Normalized GeoQuest Details:', geoQuest);
      
      return geoQuest;
    } catch (error) {
      console.error('❌ Error fetching GeoQuest details:', error);
      
      if (error.response) {
        console.error('❌ Get GeoQuest by ID API Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },

  // Create new GeoQuest (Admin only)
  createGeoQuest: async (geoQuestData) => {
    try {
      console.log('📤 Creating GeoQuest with data:', JSON.stringify(geoQuestData, null, 2));
      
      // Sanitize and validate the data
      const sanitizedData = {
        title: String(geoQuestData.title || '').trim(),
        locationId: String(geoQuestData.locationId || '').trim()
      };

      // Validate required fields
      if (!sanitizedData.title) {
        throw new Error('عنوان المهمة الجغرافية مطلوب');
      }
      
      if (!sanitizedData.locationId) {
        throw new Error('معرف الموقع مطلوب');
      }

      console.log('📤 Sanitized GeoQuest data for API:', JSON.stringify(sanitizedData, null, 2));
      
      const response = await axiosClient.post(GEOQUESTS_API_URL, sanitizedData);
      console.log('✅ Create GeoQuest API Success:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating GeoQuest:', error);
      
      if (error.response) {
        console.error('❌ Create GeoQuest API Error:', {
          status: error.response.status,
          data: error.response.data
        });
        
        // Log detailed validation errors if available
        if (error.response.data?.errors) {
          console.error('❌ Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
      }
      
      throw error;
    }
  },

  // Update GeoQuest (Admin only)
  updateGeoQuest: async (id, geoQuestData) => {
    try {
      console.log('📤 Updating GeoQuest with ID:', id, 'data:', JSON.stringify(geoQuestData, null, 2));
      
      // Sanitize the data
      const sanitizedData = {
        id: String(id).trim(),
        title: String(geoQuestData.title || '').trim(),
        locationId: String(geoQuestData.locationId || '').trim()
      };

      // Validate required fields
      if (!sanitizedData.title) {
        throw new Error('عنوان المهمة الجغرافية مطلوب');
      }
      
      if (!sanitizedData.locationId) {
        throw new Error('معرف الموقع مطلوب');
      }

      console.log('📤 Sanitized update data for API:', JSON.stringify(sanitizedData, null, 2));
      
      const response = await axiosClient.put(`${GEOQUESTS_API_URL}/${id}`, sanitizedData);
      console.log('✅ Update GeoQuest API Success:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating GeoQuest:', error);
      
      if (error.response) {
        console.error('❌ Update GeoQuest API Error:', {
          status: error.response.status,
          data: error.response.data
        });
        
        if (error.response.data?.errors) {
          console.error('❌ Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));
        }
      }
      
      throw error;
    }
  },

  // Delete GeoQuest (Admin only)
  deleteGeoQuest: async (id) => {
    try {
      console.log('🗑️ Deleting GeoQuest with ID:', id);
      
      const response = await axiosClient.delete(`${GEOQUESTS_API_URL}/${id}`);
      console.log('✅ Delete GeoQuest API Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting GeoQuest:', error);
      
      if (error.response) {
        console.error('❌ Delete GeoQuest API Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },

  // Search GeoQuests
  searchGeoQuests: async (searchTerm, pageNumber = 1, pageSize = 10) => {
    try {
      console.log('🔍 Searching GeoQuests with term:', searchTerm);
      
      const response = await axiosClient.get(`${GEOQUESTS_API_URL}?search=${encodeURIComponent(searchTerm)}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
      console.log('✅ Search GeoQuests API Response:', response.data);
      
      const raw = response.data;
      
      const geoQuests = Array.isArray(raw) ? raw :
                        Array.isArray(raw?.data) ? raw.data :
                        Array.isArray(raw?.items) ? raw.items :
                        Array.isArray(raw?.value) ? raw.value :
                        Array.isArray(raw?.result) ? raw.result :
                        [];

      const pagination = raw?.pagination || raw?.data?.pagination || {};
      
      return {
        data: geoQuests,
        pagination: {
          currentPage: pagination.currentPage || pageNumber,
          totalPages: pagination.totalPages || 1,
          totalItems: pagination.totalItems || geoQuests.length,
          pageSize: pagination.pageSize || pageSize
        }
      };
    } catch (error) {
      console.error('❌ Error searching GeoQuests:', error);
      
      if (error.response) {
        console.error('❌ Search GeoQuests API Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  }
};
