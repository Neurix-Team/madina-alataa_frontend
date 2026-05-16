import { axiosClient } from './axiosClient';

const AVATARS_API_URL = '/api/Avatars';

const unwrapAvatarResponse = (data) => {
  if (!data || typeof data !== 'object') {
    return data ?? null;
  }

  if (data.value && typeof data.value === 'object') {
    return data.value;
  }

  if (data.avatar && typeof data.avatar === 'object') {
    return data.avatar;
  }

  return data;
};

export const avatarService = {
  /**
   * Get avatar by ID
   * GET /api/Avatars/{id}
   */
  getAvatarById: async (avatarId) => {
    try {
      console.log(`Fetching avatar ${avatarId}...`);
      // Check for presence of auth token in known storage keys to give clearer diagnostics
      let token = null;
      try {
        const raw =
          localStorage.getItem('madeena_login_user_response') ||
          localStorage.getItem('user_data') ||
          localStorage.getItem('madina_access_token') ||
          localStorage.getItem('auth_token') ||
          localStorage.getItem('accessToken') ||
          localStorage.getItem('token') ||
          null;

        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            token = parsed?.token || parsed?.accessToken || parsed?.AccessToken || parsed?.data?.token || parsed?.data?.accessToken || null;
          } catch (e) {
            // raw may be a plain token string
            token = raw;
          }
        }
      } catch (e) {
        // ignore
      }

      if (!token) {
        console.warn('avatarService.getAvatarById: no auth token found in localStorage — request may be rejected with 403');
      }

      const response = await axiosClient.get(`${AVATARS_API_URL}/${avatarId}`);
      console.log('Avatar Response:', response.data);
      return unwrapAvatarResponse(response.data);
    } catch (error) {
      console.error('Error fetching avatar:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(error.response.data?.message || 'فشل في جلب بيانات الأفاتار');
      }
      throw error;
    }
  },

  /**
   * Update avatar by ID
   * PUT /api/Avatars/{id}
   */
  updateAvatar: async (avatarId, avatarData) => {
    try {
      console.log('Updating avatar:', avatarId, avatarData);
      const payload = {
        gender: Number(avatarData.gender) || 1,
        skinColor: avatarData.skinColor || '',
        hairColor: avatarData.hairColor || '',
        hairStyle: avatarData.hairStyle || '',
        clothesColor: avatarData.clothesColor || '',
        characterName: avatarData.characterName || ''
      };
      console.log('Update payload:', JSON.stringify(payload, null, 2));

      const response = await axiosClient.put(`${AVATARS_API_URL}/${avatarId}`, payload);
      console.log('Update Avatar Response:', response.data);
      return unwrapAvatarResponse(response.data);
    } catch (error) {
      console.error('Error updating avatar:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(error.response.data?.message || 'فشل في تحديث الأفاتار');
      }
      throw error;
    }
  },

  /**
   * Save avatar data to localStorage
   */
  saveAvatarToStorage: (avatarData) => {
    try {
      const normalizedAvatar = unwrapAvatarResponse(avatarData);
      localStorage.setItem('user_avatar', JSON.stringify(normalizedAvatar));
      console.log('Avatar saved to localStorage:', normalizedAvatar);
    } catch (error) {
      console.error('Failed to save avatar to localStorage:', error);
    }
  },

  /**
   * Get avatar data from localStorage
   */
  getAvatarFromStorage: () => {
    try {
      const avatarData = localStorage.getItem('user_avatar');
      return avatarData ? JSON.parse(avatarData) : null;
    } catch (error) {
      console.error('Failed to get avatar from localStorage:', error);
      return null;
    }
  },

  /**
   * Get stored avatar ID
   */
  getStoredAvatarId: () => {
    try {
      const profileData = localStorage.getItem('user_profile');
      if (profileData) {
        const parsed = JSON.parse(profileData);
        return parsed.avatarId || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get stored avatar ID:', error);
      return null;
    }
  },

  /**
   * Clear avatar storage
   */
  clearAvatarStorage: () => {
    try {
      localStorage.removeItem('user_avatar');
      console.log('Avatar storage cleared');
    } catch (error) {
      console.error('Failed to clear avatar storage:', error);
    }
  }
};
