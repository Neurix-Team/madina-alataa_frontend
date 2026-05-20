import { axiosClient } from './axiosClient';

const AVAILABLE_MISSIONS_API_URL = '/api/mission';

export const availableMissionsService = {
  // Get missions for the available missions page with pagination.
  getAvailableMissions: async (pageNumber = 1, pageSize = 1) => {
    try {
      const params = new URLSearchParams();
      params.append('PageNumber', pageNumber);
      params.append('PageSize', pageSize);

      const response = await axiosClient.get(`${AVAILABLE_MISSIONS_API_URL}?${params.toString()}`);
      console.log('Available Missions API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching available missions:', error);
      throw error;
    }
  },

  // Search available missions
  searchAvailableMissions: async (searchTerm, pageNumber = 1, pageSize = 1) => {
    try {
      const params = new URLSearchParams();
      params.append('search', searchTerm);
      params.append('PageNumber', pageNumber);
      params.append('PageSize', pageSize);

      const response = await axiosClient.get(`${AVAILABLE_MISSIONS_API_URL}?${params.toString()}`);
      console.log('Search Available Missions API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error searching available missions:', error);
      throw error;
    }
  }
};
