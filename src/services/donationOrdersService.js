import { axiosClient } from './axiosClient';

const DONATION_ORDERS_API_URL = '/api/donation-orders';

const getDonationOrdersErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (responseData?.errors && typeof responseData.errors === 'object') {
    const firstErrorEntry = Object.values(responseData.errors).find(
      (value) => Array.isArray(value) && value.length > 0
    );

    if (firstErrorEntry?.[0]) return firstErrorEntry[0];
  }

  if (responseData?.detail) {
    // Handle specific EF Core tracking error with a more user-friendly message
    if (responseData.detail.includes("cannot be tracked because another instance with the same key value")) {
      return 'حدث خطأ في النظام عند معالجة الطلب (تضارب في بيانات طلب التبرع المرتبط). يرجى التواصل مع الدعم الفني لحل هذه المشكلة في قاعدة البيانات.';
    }
    return responseData.detail;
  }
  if (responseData?.message) return responseData.message;
  if (responseData?.title) return responseData.title;

  return fallbackMessage;
};

export const normalizeDonationOrdersListResponse = (responseData) => {
  const raw = responseData ?? null;
  const root = raw?.value && typeof raw.value === 'object' ? raw.value : raw;
  const items =
    root?.items ||
    root?.data ||
    root?.orders ||
    root?.result ||
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

export const normalizeDonationOrderDetailsResponse = (responseData) => {
  if (!responseData || typeof responseData !== 'object') {
    return responseData ?? null;
  }

  if (responseData.value && typeof responseData.value === 'object') {
    return responseData.value;
  }

  if (responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
    return responseData.data;
  }

  return responseData;
};

export const donationOrdersService = {
  getAllDonationOrders: async (pageNumber = 1, pageSize = 10) => {
    try {
      console.log(`Fetching all donation orders - Page: ${pageNumber}, Size: ${pageSize}`);
      const response = await axiosClient.get(`${DONATION_ORDERS_API_URL}?PageNumber=${pageNumber}&PageSize=${pageSize}`);
      console.log('All Donation Orders Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all donation orders:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(getDonationOrdersErrorMessage(error, 'فشل في جلب طلبات التبرع'));
      }
      throw error;
    }
  },

  getMyDonationOrders: async (pageNumber = 1, pageSize = 10) => {
    try {
      console.log(`Fetching my donation orders - Page: ${pageNumber}, Size: ${pageSize}`);
      const response = await axiosClient.get(`${DONATION_ORDERS_API_URL}/my?PageNumber=${pageNumber}&PageSize=${pageSize}`);
      console.log('My Donation Orders Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching my donation orders:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(getDonationOrdersErrorMessage(error, 'فشل في جلب تبرعاتي'));
      }
      throw error;
    }
  },

  getDonationOrderById: async (orderId) => {
    try {
      console.log(`Fetching donation order details: ${orderId}`);
      const response = await axiosClient.get(`${DONATION_ORDERS_API_URL}/${orderId}`);
      console.log('Donation Order Details Response:', response.data);
      return normalizeDonationOrderDetailsResponse(response.data);
    } catch (error) {
      console.error('Error fetching donation order details:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(getDonationOrdersErrorMessage(error, 'فشل في جلب تفاصيل التبرع'));
      }
      throw error;
    }
  },

  createDonationOrder: async (orderData) => {
    try {
      console.log('Creating donation order:', orderData);
      // const payload = {
      //   amount: Number(orderData.amount) || 0,
      //   paymentMethod: orderData.paymentMethod || '',
      //   category: orderData.category || '',
      //   targetLocation: orderData.targetLocation || '',
      //   receipt: orderData.receipt || null,
      //   impactReport: orderData.impactReport || null,
      // };
      const payload = {
  amount: Number(orderData.amount) || 0,
  paymentMethod: String(orderData.paymentMethod || '').trim(),
  category: String(orderData.category || '').trim(),
  targetLocation: String(orderData.targetLocation || '').trim(),
  receipt: orderData.receipt ? String(orderData.receipt).trim() : null,
  impactReport: orderData.impactReport ? String(orderData.impactReport).trim() : null,
  donationRequestId: String(orderData.donationRequestId || '').trim(),
};

if (!payload.donationRequestId) {
  throw new Error('معرف طلب التبرع غير موجود');
}

if (!payload.amount || payload.amount <= 0) {
  throw new Error('المبلغ مطلوب ويجب أن يكون أكبر من صفر');
}
      console.log('Create donation order payload:', JSON.stringify(payload, null, 2));

      const response = await axiosClient.post(DONATION_ORDERS_API_URL, payload);
      console.log('Create Donation Order Response:', response.data);
      return normalizeDonationOrderDetailsResponse(response.data);
    } catch (error) {
      console.error('Error creating donation order:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(getDonationOrdersErrorMessage(error, 'فشل في إنشاء طلب التبرع'));
      }
      throw error;
    }
  },

  updateDonationOrder: async (orderId, orderData) => {
    try {
      console.log('Updating donation order:', orderId, orderData);
      const payload = {
        amount: Number(orderData.amount) || 0,
        paymentMethod: orderData.paymentMethod || '',
        category: orderData.category || '',
        targetLocation: orderData.targetLocation || '',
        receipt: orderData.receipt || null,
        impactReport: orderData.impactReport || null,
      };
      console.log('Update donation order payload:', JSON.stringify(payload, null, 2));

      const response = await axiosClient.put(`${DONATION_ORDERS_API_URL}/${orderId}`, payload);
      console.log('Update Donation Order Response:', response.data);
      return normalizeDonationOrderDetailsResponse(response.data);
    } catch (error) {
      console.error('Error updating donation order:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(getDonationOrdersErrorMessage(error, 'فشل في تحديث طلب التبرع'));
      }
      throw error;
    }
  },

  approveDonationOrder: async (orderId) => {
    try {
      console.log(`Approving donation order: ${orderId}`);
      console.log(`Full API URL: ${DONATION_ORDERS_API_URL}/${orderId}/approve`);
      
      const response = await axiosClient.patch(`${DONATION_ORDERS_API_URL}/${orderId}/approve`, {});
      console.log('Approve Donation Order Response:', response.data);
      return normalizeDonationOrderDetailsResponse(response.data);
    } catch (error) {
      console.error('Error approving donation order:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        console.error('Request URL:', `${DONATION_ORDERS_API_URL}/${orderId}/approve`);
        console.error('Order ID being approved:', orderId);
      }
      throw new Error(getDonationOrdersErrorMessage(error, 'فشل في الموافقة على طلب التبرع'));
    }
  },

  rejectDonationOrder: async (orderId) => {
    try {
      console.log(`Rejecting donation order: ${orderId}`);
      console.log(`Full API URL: ${DONATION_ORDERS_API_URL}/${orderId}/reject`);
      
      const response = await axiosClient.patch(`${DONATION_ORDERS_API_URL}/${orderId}/reject`, {});
      console.log('Reject Donation Order Response:', response.data);
      return normalizeDonationOrderDetailsResponse(response.data);
    } catch (error) {
      console.error('Error rejecting donation order:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        console.error('Request URL:', `${DONATION_ORDERS_API_URL}/${orderId}/reject`);
        console.error('Order ID being rejected:', orderId);
      }
      throw new Error(getDonationOrdersErrorMessage(error, 'فشل في رفض طلب التبرع'));
    }
  },

  deleteDonationOrder: async (orderId) => {
    try {
      console.log(`Deleting donation order: ${orderId}`);
      const response = await axiosClient.delete(`${DONATION_ORDERS_API_URL}/${orderId}`);
      console.log('Delete Donation Order Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting donation order:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(getDonationOrdersErrorMessage(error, 'فشل في حذف طلب التبرع'));
      }
      throw error;
    }
  },

  getDonationOrderStatistics: async () => {
    try {
      console.log('Fetching donation order statistics');
      const response = await axiosClient.get(`${DONATION_ORDERS_API_URL}/statistics`);
      console.log('Donation Order Statistics Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation order statistics:', error);
      if (error.response) {
        console.error('API Error:', error.response.data);
        throw new Error(getDonationOrdersErrorMessage(error, 'فشل في جلب إحصائيات التبرع'));
      }
      throw error;
    }
  },
};
