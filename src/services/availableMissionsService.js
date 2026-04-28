import { axiosClient } from './axiosClient';

const AVAILABLE_MISSIONS_API_URL = '/api/mission/available';

export const availableMissionsService = {
  // Get available missions for user with pagination
  getAvailableMissions: async (userLevel = '', pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(`${AVAILABLE_MISSIONS_API_URL}?userLevel=${userLevel}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
      console.log('Available Missions API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching available missions:', error);
      throw error;
    }
  },

  // Search available missions
  searchAvailableMissions: async (searchTerm, userLevel = '', pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(`${AVAILABLE_MISSIONS_API_URL}?search=${searchTerm}&userLevel=${userLevel}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
      console.log('Search Available Missions API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error searching available missions:', error);
      throw error;
    }
  }
};
