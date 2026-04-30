import { axiosClient } from './axiosClient';

const PARTNERS_API_URL = '/api/Partners';

export const partnersService = {
  /**
   * Get all partners with pagination
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
  getPartners: async (pageNumber = 1, pageSize = 10) => {
    try {
      console.log('🔍 Fetching partners from API...', {
        url: PARTNERS_API_URL,
        pageNumber,
        pageSize
      });

      const response = await axiosClient.get(PARTNERS_API_URL, {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize
        }
      });

      console.log('✅ Get Partners API Response:', response.data);

      const raw = response.data;
      const partners =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.data?.items) ? raw.data.items :
        Array.isArray(raw?.items) ? raw.items :
        Array.isArray(raw?.value) ? raw.value :
        Array.isArray(raw?.value?.items) ? raw.value.items :
        Array.isArray(raw?.result) ? raw.result :
        Array.isArray(raw?.result?.items) ? raw.result.items :
        [];

      const pagination = {
        currentPage: raw?.data?.pageNumber || raw?.pageNumber || pageNumber,
        pageSize: raw?.data?.pageSize || raw?.pageSize || pageSize,
        totalCount: raw?.data?.totalCount || raw?.totalCount || partners.length,
        totalPages: raw?.data?.totalPages || raw?.totalPages || 1
      };

      return {
        data: partners,
        pagination
      };
    } catch (error) {
      console.error('❌ Error fetching partners:', error);

      if (error.response) {
        console.error('❌ Get Partners API Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      throw error;
    }
  },

  /**
   * Get a single partner by ID
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
  getPartnerById: async (partnerId) => {
    try {
      console.log('🔍 Fetching partner details...', {
        url: `${PARTNERS_API_URL}/${partnerId}`,
        partnerId
      });

      const response = await axiosClient.get(`${PARTNERS_API_URL}/${partnerId}`);

      console.log('✅ Get Partner By ID API Response:', response.data);

      const partner = response.data?.data || response.data?.value || response.data;

      return partner;
    } catch (error) {
      console.error('❌ Error fetching partner details:', error);

      if (error.response) {
        console.error('❌ Get Partner By ID API Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      throw error;
    }
  },

  /**
   * Create a new partner (Admin only)
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
  createPartner: async (partnerData) => {
    try {
      console.log('📤 Creating partner with data:', JSON.stringify(partnerData, null, 2));

      const payload = {
        orgName: String(partnerData.orgName || '').trim(),
        orgType: Number(partnerData.orgType) || 1,
        phoneNumber: partnerData.phoneNumber ? String(partnerData.phoneNumber).trim() : null,
        email: partnerData.email ? String(partnerData.email).trim() : null
      };

      console.log('📤 Sanitized partner payload:', JSON.stringify(payload, null, 2));

      const response = await axiosClient.post(PARTNERS_API_URL, payload);

      console.log('✅ Create Partner API Success:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Error creating partner:', error);

      if (error.response) {
        console.error('❌ Create Partner API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }

      throw error;
    }
  },

  /**
   * Update an existing partner (Admin only)
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
  updatePartner: async (partnerId, partnerData) => {
    try {
      console.log('📤 Updating partner...', {
        url: `${PARTNERS_API_URL}/${partnerId}`,
        partnerId,
        data: JSON.stringify(partnerData, null, 2)
      });

      const payload = {
        orgName: String(partnerData.orgName || '').trim(),
        orgType: Number(partnerData.orgType) || 1,
        phoneNumber: partnerData.phoneNumber ? String(partnerData.phoneNumber).trim() : null,
        email: partnerData.email ? String(partnerData.email).trim() : null
      };

      console.log('📤 Sanitized update payload:', JSON.stringify(payload, null, 2));

      const response = await axiosClient.put(`${PARTNERS_API_URL}/${partnerId}`, payload);

      console.log('✅ Update Partner API Success:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Error updating partner:', error);

      if (error.response) {
        console.error('❌ Update Partner API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }

      throw error;
    }
  },

  /**
   * Delete a partner (Admin only)
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
  deletePartner: async (partnerId) => {
    try {
      console.log('🗑️ Deleting partner...', {
        url: `${PARTNERS_API_URL}/${partnerId}`,
        partnerId
      });

      const response = await axiosClient.delete(`${PARTNERS_API_URL}/${partnerId}`);

      console.log('✅ Delete Partner API Success:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Error deleting partner:', error);

      if (error.response) {
        console.error('❌ Delete Partner API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }

      throw error;
    }
  },

  /**
   * Search partners by name
   * Sends auth token automatically via axios interceptor
   */
  searchPartners: async (searchTerm, pageNumber = 1, pageSize = 10) => {
    try {
      console.log('🔍 Searching partners...', {
        searchTerm,
        pageNumber,
        pageSize
      });

      const response = await axiosClient.get(PARTNERS_API_URL, {
        params: {
          SearchTerm: searchTerm,
          PageNumber: pageNumber,
          PageSize: pageSize
        }
      });

      console.log('✅ Search Partners API Response:', response.data);

      const raw = response.data;
      const partners =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.data?.items) ? raw.data.items :
        Array.isArray(raw?.items) ? raw.items :
        Array.isArray(raw?.value) ? raw.value :
        Array.isArray(raw?.value?.items) ? raw.value.items :
        Array.isArray(raw?.result) ? raw.result :
        Array.isArray(raw?.result?.items) ? raw.result.items :
        [];

      const pagination = {
        currentPage: raw?.data?.pageNumber || raw?.pageNumber || pageNumber,
        pageSize: raw?.data?.pageSize || raw?.pageSize || pageSize,
        totalCount: raw?.data?.totalCount || raw?.totalCount || partners.length,
        totalPages: raw?.data?.totalPages || raw?.totalPages || 1
      };

      return {
        data: partners,
        pagination
      };
    } catch (error) {
      console.error('❌ Error searching partners:', error);

      if (error.response) {
        console.error('❌ Search Partners API Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      throw error;
    }
  }
};

export default partnersService;
