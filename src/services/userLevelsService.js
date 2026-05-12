import { axiosClient } from './axiosClient';

const USER_LEVELS_API_URL = '/api/UserLevels';

const unwrapUserLevelResponse = (payload) => {
  if (!payload) return null;
  return payload.value ?? payload.data ?? payload.result ?? payload;
};

const normalizeUserLevelItem = (payload) => {
  const item = unwrapUserLevelResponse(payload);
  
  // Provide defaults if item is null or not an object (e.g. 404 case)
  if (!item || typeof item !== 'object') {
    return {
      id: '',
      levelId: '',
      xp: 0,
      kp: 0,
      level: {
        name: 'مبتدئ',
        levelNumber: 1,
        xpRequired: 100,
      }
    };
  }

  return {
    ...item,
    id: item.id ?? item.Id ?? item.userLevelId ?? item.UserLevelId ?? '',
    levelId: item.levelId ?? item.LevelId ?? item.level?.id ?? item.level?.levelId ?? '',
    xp: Number(item.xp ?? item.Xp ?? 0) || 0,
    kp: Number(item.kp ?? item.Kp ?? 0) || 0,
    level: item.level || {
      name: 'مبتدئ',
      levelNumber: 1,
      xpRequired: 100,
    }
  };
};

const buildUserLevelResponse = (payload) => ({
  raw: payload,
  item: normalizeUserLevelItem(payload),
});

export const userLevelsService = {
  /**
   * جلب بيانات المستوى والـ XP للمستخدم الحالي
   */
  getMyLevel: async () => {
    try {
      const response = await axiosClient.get(`${USER_LEVELS_API_URL}/my`);
      return unwrapUserLevelResponse(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('My level not found (404), returning default.');
        return null;
      }
      console.error('Error fetching my level:', error);
      throw error;
    }
  },

  getMyLevelResponse: async () => {
    try {
      const response = await axiosClient.get(`${USER_LEVELS_API_URL}/my`);
      return buildUserLevelResponse(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('My level response not found (404), returning default item.');
        return buildUserLevelResponse(null);
      }
      console.error('Error fetching my level response:', error);
      throw error;
    }
  },

  /**
   * جلب تفاصيل المستوى لمستخدم معين (للأدمن)
   * @param {string} userId - معرف المستخدم
   */
  getUserLevelAdmin: async (userId) => {
    try {
      const response = await axiosClient.get(`${USER_LEVELS_API_URL}/admin/user/${userId}`);
      return unwrapUserLevelResponse(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`User level not found for ${userId} (404), returning null.`);
        return null;
      }
      console.error(`Error fetching user level for ${userId}:`, error);
      throw error;
    }
  },

  getUserLevelAdminResponse: async (userId) => {
    try {
      const response = await axiosClient.get(`${USER_LEVELS_API_URL}/admin/user/${userId}`);
      return buildUserLevelResponse(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`User level response not found for ${userId} (404), returning default item.`);
        return buildUserLevelResponse(null);
      }
      console.error(`Error fetching user level response for ${userId}:`, error);
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

  updateUserLevelAdminResponse: async (userId, data) => {
    try {
      const response = await axiosClient.put(`${USER_LEVELS_API_URL}/admin/${userId}`, data);
      return buildUserLevelResponse(response.data);
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
