import { axiosClient } from './axiosClient';

const MISSIONS_API_URL = '/api/mission';

export const missionsService = {
  // Get missions with pagination
  getMissions: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(`${MISSIONS_API_URL}?PageNumber=${pageNumber}&PageSize=${pageSize}`);
      console.log('Missions API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching missions:', error);
      throw error;
    }
  },

  // Get mission by ID
  getMissionById: async (id) => {
    try {
      const response = await axiosClient.get(`${MISSIONS_API_URL}/${id}`);
      console.log('Mission Detail API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching mission details:', error);
      throw error;
    }
  },

  // Create new mission
  createMission: async (missionData) => {
    try {
      const response = await axiosClient.post(MISSIONS_API_URL, missionData);
      console.log('Create Mission API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating mission:', error);
      throw error;
    }
  },

  // Search missions
  searchMissions: async (searchTerm, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(`${MISSIONS_API_URL}?search=${searchTerm}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
      console.log('Search Missions API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error searching missions:', error);
      throw error;
    }
  },

  // Update mission
  updateMission: async (missionId, missionData) => {
    try {
      // Log the data being sent for debugging
      console.log('📤 Updating mission with ID:', missionId, 'data:', JSON.stringify(missionData, null, 2));
      
      // Ensure numeric fields are numbers and handle GUID validation
      const sanitizedData = {
        title: missionData.title?.trim(),
        difficulty: parseInt(missionData.difficulty) || 1,
        requiredLevel: missionData.requiredLevel ? parseInt(missionData.requiredLevel) : null,
        kpReward: missionData.kpReward ? parseInt(missionData.kpReward) : null,
        xpReward: missionData.xpReward ? parseInt(missionData.xpReward) : null,
        impactReward: missionData.impactReward ? parseInt(missionData.impactReward) : null,
        locationId: missionData.locationId || null,
        status: missionData.status !== undefined ? parseInt(missionData.status) : 1
      };

      // Validate locationId as GUID - if not valid GUID, set to null
      if (sanitizedData.locationId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sanitizedData.locationId)) {
        console.log('🔧 Invalid GUID format for locationId, setting to null:', sanitizedData.locationId);
        sanitizedData.locationId = null;
      }

      console.log('📤 Sanitized update data:', JSON.stringify(sanitizedData, null, 2));
      
      const response = await axiosClient.put(`${MISSIONS_API_URL}/${missionId}`, sanitizedData);
      console.log('✅ Update Mission API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating mission:', error);
      
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

  // Delete mission
  deleteMission: async (missionId) => {
    try {
      console.log('🗑️ Deleting mission with ID:', missionId);
      
      const response = await axiosClient.delete(`${MISSIONS_API_URL}/${missionId}`);
      console.log('✅ Delete Mission API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting mission:', error);
      
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

