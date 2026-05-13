import { axiosClient } from './axiosClient';

const PROFILES_API_URL = '/api/Profiles';

const unwrapProfileResponse = (data) => {
  if (!data || typeof data !== 'object') {
    return data ?? null;
  }

  if (data.value && typeof data.value === 'object') {
    return data.value;
  }

  if (data.profile && typeof data.profile === 'object') {
    return data.profile;
  }

  return data;
};

export const profilesService = {
  /**
   * Fetch current user's profile
   * GET /api/Profiles/my
   */
  fetchMyProfile: async () => {
    try {
      console.log('Fetching my profile...');
      const response = await axiosClient.get(`${PROFILES_API_URL}/my`);
      console.log('My Profile Response:', response.data);
      const profile = unwrapProfileResponse(response.data);
      console.log('MY PROFILE RESPONSE ITEMS:', profile);
      return profile;
    } catch (error) {
      console.error('Error fetching my profile:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(error.response.data?.message || 'فشل في جلب بيانات الملف الشخصي');
      }
      throw error;
    }
  },

  /**
   * Get profile by ID
   * GET /api/Profiles/{id}
   */
  getProfileById: async (profileId) => {
    try {
      console.log(`Fetching profile ${profileId}...`);
      const response = await axiosClient.get(`${PROFILES_API_URL}/${profileId}`);
      console.log('Profile Response:', response.data);
      const profile = unwrapProfileResponse(response.data);
      console.log('PROFILE BY ID RESPONSE ITEMS:', profile);
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(error.response.data?.message || 'فشل في جلب بيانات الملف الشخصي');
      }
      throw error;
    }
  },

  /**
   * Update profile by ID
   * PUT /api/Profiles/{id}
   */
  updateProfile: async (profileId, profileData) => {
    try {
      const resolvedProfileId =
        profileId ||
        profileData?.id ||
        profileData?.profileId ||
        localStorage.getItem('profile_id');

      if (!resolvedProfileId) {
        throw new Error('معرف الملف الشخصي غير متوفر. يرجى إعادة تحميل الصفحة.');
      }

      console.log('Updating profile:', resolvedProfileId, profileData);
      const payload = {
        rating: Number(profileData.rating) || 0,
        impact: Number(profileData.impact) || 0,
        avatarId: profileData.avatarId || '',
        levelId: profileData.levelId || '',
      };
      console.log('Update payload:', JSON.stringify(payload, null, 2));

      const response = await axiosClient.put(`${PROFILES_API_URL}/${resolvedProfileId}`, payload);
      console.log('Update Profile Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(error.response.data?.message || 'فشل في تحديث الملف الشخصي');
      }
      throw error;
    }
  },

  /**
   * Save profile data to localStorage
   */
  saveProfileToStorage: (profileData) => {
    try {
      const normalizedProfile = unwrapProfileResponse(profileData);

      if (!normalizedProfile) {
        return;
      }

      if (normalizedProfile.avatarId) {
        localStorage.setItem('profile_avatar_id', normalizedProfile.avatarId);
        console.log('Saved avatarId to localStorage:', normalizedProfile.avatarId);
      }
      if (normalizedProfile.id || normalizedProfile.profileId) {
        localStorage.setItem('profile_id', normalizedProfile.id || normalizedProfile.profileId);
        console.log('Saved profileId to localStorage:', normalizedProfile.id || normalizedProfile.profileId);
      }
      localStorage.setItem('user_profile', JSON.stringify(normalizedProfile));
      console.log('Saved full profile to localStorage');
    } catch (e) {
      console.error('Error saving profile to localStorage:', e);
    }
  },

  /**
   * Get profile data from localStorage
   */
  getProfileFromStorage: () => {
    try {
      const profileData = localStorage.getItem('user_profile');
      return profileData ? unwrapProfileResponse(JSON.parse(profileData)) : null;
    } catch (e) {
      console.error('Error parsing profile from localStorage:', e);
      return null;
    }
  },

  /**
   * Get stored profile ID
   */
  getStoredProfileId: () => {
    return localStorage.getItem('profile_id');
  },

  /**
   * Get stored avatar ID
   */
  getStoredAvatarId: () => {
    return localStorage.getItem('profile_avatar_id');
  },

  /**
   * Clear profile data from localStorage
   */
  clearProfileStorage: () => {
    localStorage.removeItem('profile_avatar_id');
    localStorage.removeItem('profile_id');
    localStorage.removeItem('user_profile');
    console.log('Cleared profile data from localStorage');
  },
};
