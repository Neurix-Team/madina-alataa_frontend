import { axiosClient } from './axiosClient';

const NOTIFICATIONS_API_URL = '/api/notification';

const unwrapRoot = (data) => {
  if (!data || typeof data !== 'object') return data ?? null;
  if (data.value !== undefined) return data.value;
  return data;
};

const normalizeNotificationsList = (data) => {
  const raw = data ?? null;
  const root = unwrapRoot(raw);
  const items =
    root?.items ||
    root?.data ||
    root?.result ||
    root?.notifications ||
    (Array.isArray(root) ? root : []);

  return Array.isArray(items) ? items : [];
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

export const notificationsService = {
  getNotifications: async (unreadOnly = false) => {
    try {
      const response = await axiosClient.get(NOTIFICATIONS_API_URL, {
        params: { unreadOnly }
      });
      console.log('NOTIFICATIONS LIST RESPONSE:', response.data);
      return normalizeNotificationsList(response.data);
    } catch (error) {
      console.error('NOTIFICATIONS LIST ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في تحميل الإشعارات'));
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const payload = { notificationId: String(notificationId || '').trim() };
      const response = await axiosClient.post(`${NOTIFICATIONS_API_URL}/mark-read`, payload);
      console.log('NOTIFICATION MARK READ RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('NOTIFICATION MARK READ ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في تعليم الإشعار كمقروء'));
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await axiosClient.post(`${NOTIFICATIONS_API_URL}/mark-all-read`);
      console.log('NOTIFICATION MARK ALL READ RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('NOTIFICATION MARK ALL READ ERROR:', error.response?.data || error.message);
      throw new Error(extractErrorMessage(error, 'فشل في تعليم كل الإشعارات كمقروءة'));
    }
  },
};

export default notificationsService;
