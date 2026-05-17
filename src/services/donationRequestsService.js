import { axiosClient } from './axiosClient';

const DONATION_REQUESTS_API_URL = '/api/donation-requests';

export const normalizeDonationRequestsListResponse = (responseData) => {
  const raw = responseData ?? null;
  const root = raw?.value && typeof raw.value === 'object' ? raw.value : raw;
  const items =
    root?.items ||
    root?.data ||
    root?.result ||
    root?.requests ||
    (Array.isArray(root) ? root : []);
  const totalCount =
    root?.totalCount ??
    root?.total ??
    root?.count ??
    (Array.isArray(items) ? items.length : 0);
  const pageNumber =
    root?.pageNumber ??
    root?.currentPage ??
    root?.page ??
    1;
  const pageSize =
    root?.pageSize ??
    root?.pageSizeValue ??
    (Array.isArray(items) ? items.length : 0);
  const totalPages =
    root?.totalPages ??
    (pageSize ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1);

  return {
    raw,
    items: Array.isArray(items) ? items : [],
    totalCount: Number(totalCount) || 0,
    pageNumber: Number(pageNumber) || 1,
    pageSize: Number(pageSize) || 0,
    totalPages: Number(totalPages) || 1,
  };
};

const buildEmptyDonationRequestsListResponse = (pageNumber = 1, pageSize = 10) => ({
  items: [],
  totalCount: 0,
  pageNumber,
  pageSize,
  totalPages: 1,
});

export const donationRequestsService = {
  /**
   * Create a new donation request (User)
   * POST /api/donation-requests
   */
  createDonationRequest: async (requestData) => {
    try {
      console.log('📤 Creating donation request:', JSON.stringify(requestData, null, 2));

      const payload = {
        title: String(requestData.title || ''),
        locationId: String(requestData.locationId || ''),
        donateAmount: Number(requestData.donateAmount) || 1,
        urgencyLevel: Number(requestData.urgencyLevel) || 1,
        briefDescription: requestData.briefDescription || null,
        partnerId: String(requestData.partnerId || ''),
      };

      console.log('📤 Final donation request payload:', JSON.stringify(payload, null, 2));

      // AxiosClient automatically adds the Bearer token from localStorage
      const response = await axiosClient.post(DONATION_REQUESTS_API_URL, payload);

      console.log('✅ Create Donation Request Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating donation request:', error);
      if (error.response?.status === 401) {
        throw new Error('غير مصرح لك بالقيام بهذا الإجراء. يرجى تسجيل الدخول مجدداً.');
      }
      if (error.response?.status === 403) {
        throw new Error('ليس لديك صلاحيات كافية لإنشاء طلب تبرع.');
      }
      if (error.response) {
        const responseData = error.response.data;
        console.error('❌ RAW_API_ERROR:', JSON.stringify(responseData, null, 2));
        // Provide a more actionable message when the backend reports activity service misconfiguration
        const detail = String(responseData?.detail || '').toLowerCase();
        if (detail.includes('activity service') || detail.includes('activity service is not configured')) {
          throw new Error('الخادم غير مُهيأ لمعالجة الطلبات (Activity service غير مفعّل). تواصل مع الفريق المسؤول عن الـ API.');
        }

        if (detail.includes("cannot be tracked because another instance with the same key value")) {
          throw new Error('حدث خطأ في النظام عند معالجة الطلب (تضارب في بيانات طلب التبرع). يرجى التواصل مع الدعم الفني لحل هذه المشكلة في قاعدة البيانات.');
        }

        throw new Error(
          responseData?.title ||
          responseData?.message ||
          responseData?.detail ||
          'فشل في إنشاء طلب التبرع'
        );
      }
      throw error;
    }
  },

  /**
   * Get all donation requests (Admin)
   * GET /api/donation-requests?PageNumber=1&PageSize=1
   */
  getAllDonationRequests: async (pageNumber = 1, pageSize = 10) => {
    try {
      console.log('🔍 Fetching all donation requests...', { pageNumber, pageSize });

      const response = await axiosClient.get(`${DONATION_REQUESTS_API_URL}`, {
        params: { PageNumber: pageNumber, PageSize: pageSize }
      });

      console.log('✅ All Donation Requests Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching donation requests:', error);
      if (error.response) {
        console.error('❌ API Error:', error.response.data);
        if (error.response.status === 403) {
          console.warn('⚠️ Returning an empty donation requests list for forbidden access.');
          return buildEmptyDonationRequestsListResponse(pageNumber, pageSize);
        }
        throw new Error(error.response.data?.message || 'فشل في جلب طلبات التبرع');
      }

      throw error;
    }
  },

  /**
   * Get approved donation requests (User)
   * GET /api/donation-requests/approved?PageNumber=1&PageSize=1
   */
  getApprovedDonationRequests: async (pageNumber = 1, pageSize = 10) => {
    try {
      console.log('🔍 Fetching approved donation requests...', { pageNumber, pageSize });

      const response = await axiosClient.get(`${DONATION_REQUESTS_API_URL}/approved`, {
        params: { PageNumber: pageNumber, PageSize: pageSize }
      });

      console.log('✅ Approved Donation Requests Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching approved donation requests:', error);
      if (error.response) {
        console.error('❌ API Error:', error.response.data);
        if (error.response.status === 403) {
          console.warn('⚠️ Returning an empty approved donation requests list for forbidden access.');
          return buildEmptyDonationRequestsListResponse(pageNumber, pageSize);
        }
        throw new Error(error.response.data?.message || 'فشل في جلب الطلبات المقبولة');
      }

      throw error;
    }
  },

  /**
   * Get my donation requests (User)
   * GET /api/donation-requests/my?PageNumber=1&PageSize=1
   */
  getMyDonationRequests: async (pageNumber = 1, pageSize = 10) => {
    try {
      console.log('🔍 Fetching my donation requests...', { pageNumber, pageSize });

      const response = await axiosClient.get(`${DONATION_REQUESTS_API_URL}/my`, {
        params: { PageNumber: pageNumber, PageSize: pageSize }
      });

      console.log('✅ My Donation Requests Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching my donation requests:', error);
      if (error.response) {
        console.error('❌ API Error:', error.response.data);
        if (error.response.status === 403) {
          console.warn('⚠️ Returning an empty personal donation requests list for forbidden access.');
          return buildEmptyDonationRequestsListResponse(pageNumber, pageSize);
        }
        throw new Error(error.response.data?.message || 'فشل في جلب طلباتي');
      }

      throw error;
    }
  },

  /**
   * Get donation request details
   * GET /api/donation-requests/{id}
   */
  getDonationRequestDetails: async (id) => {
    try {
      console.log('🔍 Fetching donation request details:', id);

      const response = await axiosClient.get(`${DONATION_REQUESTS_API_URL}/${id}`);

      console.log('✅ Donation Request Details:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching donation request details:', error);

      if (error.response) {
        console.error('❌ API Error:', error.response.data);
        throw new Error(error.response.data?.message || 'فشل في جلب تفاصيل الطلب');
      }

      throw error;
    }
  },

  /**
   * Update donation request (User)
   * PUT /api/donation-requests/{id}
   */
  updateDonationRequest: async (id, requestData) => {
    try {
      console.log('📤 Updating donation request:', id, JSON.stringify(requestData, null, 2));

      const payload = {
        title: requestData.title || null,
        location: requestData.location || null,
        donateAmount: Number(requestData.donateAmount) || 1,
        urgencyLevel: Number(requestData.urgencyLevel) || 1,
        briefDescription: requestData.briefDescription || null,
      };

      console.log('📤 Final update payload:', JSON.stringify(payload, null, 2));

      const response = await axiosClient.put(`${DONATION_REQUESTS_API_URL}/${id}`, payload);

      console.log('✅ Update Donation Request Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating donation request:', error);

      if (error.response) {
        const responseData = error.response.data;
        console.error('❌ RAW_API_ERROR:', JSON.stringify(responseData, null, 2));

        throw new Error(
          responseData?.title ||
          responseData?.message ||
          responseData?.detail ||
          'فشل في تحديث طلب التبرع'
        );
      }

      throw error;
    }
  },

  /**
   * Delete donation request (User)
   * DELETE /api/donation-requests/{id}
   */
  deleteDonationRequest: async (id) => {
    try {
      console.log('🗑️ Deleting donation request:', id);

      const response = await axiosClient.delete(`${DONATION_REQUESTS_API_URL}/${id}`);

      console.log('✅ Delete Donation Request Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting donation request:', error);

      if (error.response) {
        const responseData = error.response.data;
        console.error('❌ RAW_API_ERROR:', JSON.stringify(responseData, null, 2));

        throw new Error(
          responseData?.title ||
          responseData?.message ||
          responseData?.detail ||
          'فشل في حذف طلب التبرع'
        );
      }

      throw error;
    }
  },

  /**
   * Approve donation request (Admin)
   * PATCH /api/donation-requests/{id}/approve
   */
  approveDonationRequest: async (id) => {
    try {
      console.log('✅ Approving donation request:', id);

      const response = await axiosClient.patch(`${DONATION_REQUESTS_API_URL}/${id}/approve`, {});

      console.log('✅ Approve Donation Request Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error approving donation request:', error);

      if (error.response) {
        const responseData = error.response.data;
        console.error('❌ RAW_API_ERROR:', JSON.stringify(responseData, null, 2));

        const detail = String(responseData?.detail || '');
        if (detail.includes("cannot be tracked because another instance with the same key value")) {
          throw new Error('حدث خطأ في النظام عند معالجة الطلب (تضارب في بيانات طلب التبرع). يرجى التواصل مع الدعم الفني لحل هذه المشكلة في قاعدة البيانات.');
        }

        throw new Error(
          responseData?.title ||
          responseData?.message ||
          responseData?.detail ||
          'فشل في قبول طلب التبرع'
        );
      }

      throw error;
    }
  },

  /**
   * Reject donation request (Admin)
   * PATCH /api/donation-requests/{id}/reject
   */
  rejectDonationRequest: async (id) => {
    try {
      console.log('❌ Rejecting donation request:', id);

      const response = await axiosClient.patch(`${DONATION_REQUESTS_API_URL}/${id}/reject`, {});

      console.log('✅ Reject Donation Request Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error rejecting donation request:', error);

      if (error.response) {
        const responseData = error.response.data;
        console.error('❌ RAW_API_ERROR:', JSON.stringify(responseData, null, 2));

        const detail = String(responseData?.detail || '');
        if (detail.includes("cannot be tracked because another instance with the same key value")) {
          throw new Error('حدث خطأ في النظام عند معالجة الطلب (تضارب في بيانات طلب التبرع). يرجى التواصل مع الدعم الفني لحل هذه المشكلة في قاعدة البيانات.');
        }

        throw new Error(
          responseData?.title ||
          responseData?.message ||
          responseData?.detail ||
          'فشل في رفض طلب التبرع'
        );
      }

      throw error;
    }
  },
};
