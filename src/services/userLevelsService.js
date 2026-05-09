import { axiosClient } from './axiosClient';

const USER_LEVELS_API_URL = '/api/UserLevels';

const unwrapUserLevelResponse = (payload) => {
  if (!payload) return null;
  return payload.value ?? payload.data ?? payload.result ?? payload;
};

export const userLevelsService = {
  /**
   * جلب بيانات المستوى والـ XP للمستخدم الحالي
   */
  getMyLevel: async () => {
    try {
      const response = await axiosClient.get(`${USER_LEVELS_API_URL}/my`);
      return unwrapUserLevelResponse(response.data);
    } catch (error) {
      console.error('Error fetching my level:', error);
      throw error;
    }
  },

  /**
   * جلب تفاصيل المستوى لمستخدم معين (للأدمن)
   * @param {string} userId - معرف المستخدم
   */
  getUserLevelAdmin: async (userId) => {
    try {
      const response = await axiosClient.get(`${USER_LEVELS_API_URL}/admin/profile/${userId}`);
      return unwrapUserLevelResponse(response.data);
    } catch (error) {
      console.error(`Error fetching user level for ${userId}:`, error);
      throw error;
    }
  },

  /**
   * تحديث بيانات المستوى لمستخدم معين (للأدمن)
   * @param {string} userId - معرف المستخدم
   * @param {Object} data - البيانات الجديدة (xp, kp, levelId)
   */
  updateUserLevelAdmin: async (userId, data) => {
    try {
      const response = await axiosClient.put(`${USER_LEVELS_API_URL}/admin/${userId}`, data);
      return unwrapUserLevelResponse(response.data);
    } catch (error) {
      console.error(`Error updating user level for ${userId}:`, error);
      throw error;
    }
  },

  /**
   * حذف بيانات المستوى لمستخدم معين (للأدمن)
   * @param {string} userId - معرف المستخدم
   */
  deleteUserLevelAdmin: async (userId) => {
    try {
      const response = await axiosClient.delete(`${USER_LEVELS_API_URL}/admin/${userId}`);
      return unwrapUserLevelResponse(response.data);
    } catch (error) {
      console.error(`Error deleting user level for ${userId}:`, error);
      throw error;
    }
  }
};

export default userLevelsService;
