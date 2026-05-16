import { axiosClient } from './axiosClient';

const USER_LEVELS_API_URL = '/api/UserLevels';

const unwrapUserLevelResponse = (payload) => {
  if (!payload) return null;
  return payload.value ?? payload.data ?? payload.result ?? payload;
};

export const userLevelsService = {
  getMyLevel: async () => {
    try {
      const response = await axiosClient.get(`${USER_LEVELS_API_URL}/my`);
      const raw = response.data;
      const item = unwrapUserLevelResponse(raw);
      return { raw, item };
    } catch (error) {
      console.error('Error fetching my level:', error);
      throw error;
    }
  },

  getUserLevelAdminResponse: async (userId) => {
    try {
      const response = await axiosClient.get(`${USER_LEVELS_API_URL}/admin/user/${userId}`);
      const raw = response.data;
      const item = unwrapUserLevelResponse(raw);
      return { raw, item };
    } catch (error) {
      console.error(`Error fetching user level response for ${userId}:`, error);
      throw error;
    }
  },

  getUserLevelAdmin: async (userId) => {
    const res = await userLevelsService.getUserLevelAdminResponse(userId);
    return res.item;
  },

  updateUserLevelAdminResponse: async (userId, data) => {
    try {
      const response = await axiosClient.put(`${USER_LEVELS_API_URL}/admin/${userId}`, data);
      const raw = response.data;
      const item = unwrapUserLevelResponse(raw);
      return { raw, item };
    } catch (error) {
      console.error(`Error updating user level response for ${userId}:`, error);
      throw error;
    }
  },

  updateUserLevelAdmin: async (userId, data) => {
    const res = await userLevelsService.updateUserLevelAdminResponse(userId, data);
    return res.item;
  },

  deleteUserLevelAdmin: async (userId) => {
    try {
      const response = await axiosClient.delete(`${USER_LEVELS_API_URL}/admin/${userId}`);
      return unwrapUserLevelResponse(response.data);
    } catch (error) {
      console.error(`Error deleting user level for ${userId}:`, error);
      throw error;
    }
  },
};

export default userLevelsService;
