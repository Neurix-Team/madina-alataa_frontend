import { axiosClient } from './axiosClient';

const VOLUNTEER_ORDERS_API_URL = '/api/VolunteerOrders';

const unwrapRoot = (data) => {
  if (!data || typeof data !== 'object') {
    return data ?? null;
  }

  if (data.value && typeof data.value === 'object') {
    return data.value;
  }

  return data;
};

const normalizeListResponse = (responseData) => {
  const raw = responseData ?? null;
  const root = unwrapRoot(raw);
  const items =
    root?.items ||
    root?.data ||
    root?.result ||
    root?.orders ||
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

const extractErrorMessage = (error, fallbackMessage) => {
  const responseData = error.response?.data;
  if (responseData) {
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

export const volunteerOrdersService = {
  createVolunteerOrder: async (serviceRequestId) => {
    try {
      const payload = { serviceRequestId: String(serviceRequestId || '').trim() };
      console.log('VOLUNTEER ORDERS CREATE PAYLOAD:', payload);
      const response = await axiosClient.post(VOLUNTEER_ORDERS_API_URL, payload);
      console.log('VOLUNTEER ORDERS CREATE RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('VOLUNTEER ORDERS CREATE ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في حفظ طلب التطوع'));
    }
  },

  getVolunteerOrders: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(VOLUNTEER_ORDERS_API_URL, {
        params: { PageNumber: pageNumber, PageSize: pageSize }
      });
      const normalized = normalizeListResponse(response.data);
      console.log('VOLUNTEER ORDERS LIST RAW RESPONSE:', normalized.raw);
      console.log('VOLUNTEER ORDERS LIST ITEMS:', normalized.items);
      return normalized;
    } catch (error) {
      console.error('VOLUNTEER ORDERS LIST ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في جلب تطوعاتي'));
    }
  },

  getPendingVolunteerOrders: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(`${VOLUNTEER_ORDERS_API_URL}/pending`, {
        params: { PageNumber: pageNumber, PageSize: pageSize }
      });
      const normalized = normalizeListResponse(response.data);
      console.log('VOLUNTEER ORDERS PENDING RAW RESPONSE:', normalized.raw);
      console.log('VOLUNTEER ORDERS PENDING ITEMS:', normalized.items);
      return normalized;
    } catch (error) {
      console.error('VOLUNTEER ORDERS PENDING ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في جلب الطلبات المعلقة'));
    }
  },

  getPendingVolunteerOrdersCount: async () => {
    try {
      const response = await axiosClient.get(`${VOLUNTEER_ORDERS_API_URL}/pending/count`);
      const count =
        response.data?.value?.count ??
        response.data?.count ??
        response.data?.value ??
        response.data ??
        0;
      console.log('VOLUNTEER ORDERS PENDING COUNT RESPONSE:', response.data);
      return Number(count) || 0;
    } catch (error) {
      console.error('VOLUNTEER ORDERS PENDING COUNT ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في جلب عدد الطلبات المعلقة'));
    }
  },

  getVolunteerOrderById: async (id) => {
    try {
      const response = await axiosClient.get(`${VOLUNTEER_ORDERS_API_URL}/${id}`);
      const details = unwrapRoot(response.data);
      console.log('VOLUNTEER ORDER DETAILS RESPONSE:', details);
      return details;
    } catch (error) {
      console.error('VOLUNTEER ORDER DETAILS ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في جلب تفاصيل طلب التطوع'));
    }
  },

  deleteVolunteerOrder: async (id) => {
    try {
      console.log('VOLUNTEER ORDER DELETE CALL:', id);
      const response = await axiosClient.delete(`${VOLUNTEER_ORDERS_API_URL}/${id}`);
      console.log('VOLUNTEER ORDER DELETE RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('VOLUNTEER ORDER DELETE ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في حذف طلب التطوع'));
    }
  },

  approveVolunteerOrder: async (id) => {
    try {
      console.log('VOLUNTEER ORDER APPROVE CALL:', id);
      const response = await axiosClient.patch(`${VOLUNTEER_ORDERS_API_URL}/${id}/approve`);
      console.log('VOLUNTEER ORDER APPROVE RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('VOLUNTEER ORDER APPROVE ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في اعتماد طلب التطوع'));
    }
  },

  rejectVolunteerOrder: async (id, rejectionReason) => {
    try {
      const payload = { rejectionReason: String(rejectionReason || '').trim() };
      console.log('VOLUNTEER ORDER REJECT PAYLOAD:', { id, payload });
      const response = await axiosClient.patch(`${VOLUNTEER_ORDERS_API_URL}/${id}/reject`, payload);
      console.log('VOLUNTEER ORDER REJECT RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('VOLUNTEER ORDER REJECT ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في رفض طلب التطوع'));
    }
  },

  updateVolunteerOrderProgress: async (id, progress) => {
    try {
      const payload = { progress: Number(progress) || 0 };
      console.log('VOLUNTEER ORDER PROGRESS PAYLOAD:', { id, payload });
      const response = await axiosClient.put(`${VOLUNTEER_ORDERS_API_URL}/${id}/progress`, payload);
      console.log('VOLUNTEER ORDER PROGRESS RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('VOLUNTEER ORDER PROGRESS ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في تحديث التقدم'));
    }
  },
};

export default volunteerOrdersService;
