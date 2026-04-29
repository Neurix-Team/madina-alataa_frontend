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

 
  getMissionById: async (id) => {
  try {
    const response = await axiosClient.get(`${MISSIONS_API_URL}/${id}`);
    console.log('Mission Detail API Response:', response.data);

    // لأن الباك بيرجع الداتا أحيانًا داخل value
    return response.data?.value || response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching mission details:', error);
    throw error;
  }
},

  // Create new mission
  createMission: async (missionData) => {
    try {
      console.log('📤 Creating mission with data:', JSON.stringify(missionData, null, 2));

      const payload = {
        title: String(missionData.title || '').trim(),
        difficulty: Number(missionData.difficulty) || 0,
        requiredLevel: Number(missionData.requiredLevel) || 1,
        kpReward: Number(missionData.kpReward) || 0,
        xpReward: Number(missionData.xpReward) || 0,
        impactReward: Number(missionData.impactReward) || 0,
        locationId: String(missionData.locationId || '').trim()
      };

      console.log('📤 Sanitized mission payload:', JSON.stringify(payload, null, 2));

      const response = await axiosClient.post(MISSIONS_API_URL, payload);
      console.log('✅ Create Mission API Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating mission:', error);

      if (error.response) {
        console.error('❌ API Response Error:', {
          status: error.response.status,
          data: error.response.data
        });
        throw error;
      } else if (error.request) {
        console.error('❌ Network Error (No Response):', error.request);
        throw new Error('لا يوجد استجابة من السيرفر. تحقق من الاتصال بالإنترنت.');
      } else {
        console.error('❌ Request Setup Error:', error.message);
        throw error;
      }
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
      
      // Ensure numeric fields are numbers
      const sanitizedData = {
        title: String(missionData.title || '').trim(),
        difficulty: Number(missionData.difficulty) || 0,
        requiredLevel: Number(missionData.requiredLevel) || 1,
        kpReward: Number(missionData.kpReward) || 0,
        xpReward: Number(missionData.xpReward) || 0,
        impactReward: Number(missionData.impactReward) || 0,
        locationId: String(missionData.locationId || '').trim(),
        status: missionData.status !== undefined ? Number(missionData.status) : 1
      };

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

