import { axiosClient } from './axiosClient';

const SERVICE_REQUESTS_API_URL = '/api/ServiceRequests';

const unwrapRoot = (responseData) => {
  if (!responseData || typeof responseData !== 'object') {
    return responseData ?? null;
  }

  if (responseData.value && typeof responseData.value === 'object') {
    return responseData.value;
  }

  return responseData;
};

export const normalizeServiceRequestsListResponse = (responseData) => {
  const raw = responseData ?? null;
  const root = unwrapRoot(raw);
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

const buildCreatePayload = (requestData) => ({
  title: String(requestData.title || '').trim(),
  serviceType: String(requestData.serviceType || '').trim(),
  requiredSkill: String(requestData.requiredSkill || '').trim(),
  urgencyLevel: Number(requestData.urgencyLevel) || 1,
  scheduleDate: requestData.scheduleDate || '',
  duration: Number(requestData.duration) || 1,
  briefDescription: String(requestData.briefDescription || '').trim(),
  partnerId: String(requestData.partnerId || '').trim(),
  locationId: String(requestData.locationId || '').trim(),
});

const buildUpdatePayload = (requestData) => ({
  title: String(requestData.title || '').trim(),
  requiredSkill: String(requestData.requiredSkill || '').trim(),
  urgencyLevel: Number(requestData.urgencyLevel) || 1,
  scheduleDate: requestData.scheduleDate || '',
  duration: Number(requestData.duration) || 1,
  briefDescription: String(requestData.briefDescription || '').trim(),
  locationId: String(requestData.locationId || '').trim(),
});

const extractErrorMessage = (error, fallbackMessage) => {
  if (error.response?.data) {
    const responseData = error.response.data;
    if (responseData.errors) {
      const messages = Object.values(responseData.errors).flat().filter(Boolean);
      if (messages.length > 0) {
        return messages.join(', ');
      }
    }

    return (
      responseData?.title ||
      responseData?.message ||
      responseData?.detail ||
      responseData?.error ||
      fallbackMessage
    );
  }

  return error.message || fallbackMessage;
};

export const serviceRequestsService = {
  createServiceRequest: async (requestData) => {
    try {
      const payload = buildCreatePayload(requestData);
      console.log('SERVICE REQUESTS CREATE PAYLOAD:', payload);
      const response = await axiosClient.post(SERVICE_REQUESTS_API_URL, payload);
      console.log('SERVICE REQUESTS CREATE RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('SERVICE REQUESTS CREATE ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في إنشاء طلب التطوع'));
    }
  },

  getServiceRequests: async (pageNumber = 1, pageSize = 10, status = 1) => {
    try {
      const response = await axiosClient.get(SERVICE_REQUESTS_API_URL, {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          status,
        }
      });

      const normalized = normalizeServiceRequestsListResponse(response.data);
      console.log('SERVICE REQUESTS LIST RAW RESPONSE:', normalized.raw);
      console.log('SERVICE REQUESTS LIST ITEMS:', normalized.items);
      return normalized;
    } catch (error) {
      console.error('SERVICE REQUESTS LIST ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في جلب طلبات التطوع'));
    }
  },

  getApprovedServiceRequests: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(`${SERVICE_REQUESTS_API_URL}/approved`, {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        }
      });

      const normalized = normalizeServiceRequestsListResponse(response.data);
      const approvedItems = normalized.items.map((item) => ({
        ...item,
        status: 'approved',
      }));

      console.log('SERVICE REQUESTS APPROVED RAW RESPONSE:', normalized.raw);
      console.log('SERVICE REQUESTS APPROVED ITEMS:', approvedItems);

      return {
        ...normalized,
        items: approvedItems,
      };
    } catch (error) {
      console.error('SERVICE REQUESTS APPROVED ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في جلب طلبات التطوع المعتمدة'));
    }
  },

  getServiceRequestById: async (id) => {
    try {
      const response = await axiosClient.get(`${SERVICE_REQUESTS_API_URL}/${id}`);
      const details = unwrapRoot(response.data);
      console.log('SERVICE REQUEST DETAILS RESPONSE:', details);
      return details;
    } catch (error) {
      console.error('SERVICE REQUEST DETAILS ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في جلب تفاصيل طلب التطوع'));
    }
  },

  updateServiceRequest: async (id, requestData) => {
    try {
      const payload = buildUpdatePayload(requestData);
      console.log('SERVICE REQUEST UPDATE PAYLOAD:', { id, payload });
      const response = await axiosClient.put(`${SERVICE_REQUESTS_API_URL}/${id}`, payload);
      console.log('SERVICE REQUEST UPDATE RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('SERVICE REQUEST UPDATE ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في تحديث طلب التطوع'));
    }
  },

  deleteServiceRequest: async (id) => {
    try {
      console.log('SERVICE REQUEST DELETE CALL:', id);
      const response = await axiosClient.delete(`${SERVICE_REQUESTS_API_URL}/${id}`);
      console.log('SERVICE REQUEST DELETE RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('SERVICE REQUEST DELETE ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في حذف طلب التطوع'));
    }
  },
};

export default serviceRequestsService;
