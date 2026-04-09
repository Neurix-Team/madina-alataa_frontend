
// Notification types and their configurations
export const NOTIFICATION_TYPES = {
  DONATION_SUCCESS: 'donation_success',
  CASE_UPDATE: 'case_update',
  NEW_CASE: 'new_case',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_REJECTED: 'request_rejected',
  BADGE_EARNED: 'badge_earned',
  REWARD_POINTS: 'reward_points',
  ORDER_STATUS: 'order_status',
};

export const NOTIFICATION_TYPE_CONFIG = {
  donation_success: {
    icon: '❤️',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  case_update: {
    icon: '📋',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  new_case: {
    icon: '✨',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  request_accepted: {
    icon: '✅',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  request_rejected: {
    icon: '❌',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
  },
  badge_earned: {
    icon: '🏆',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.1)',
  },
  reward_points: {
    icon: '⭐',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
  },
  order_status: {
    icon: '📦',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
  },
};

// Sample notifications data
export const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    type: NOTIFICATION_TYPES.DONATION_SUCCESS,
    title: 'تبرع تم بنجاح! 🎉',
    description: 'شكرا على تبرعك بمبلغ 100 ريال للحالة "محمد احتاج دعم تعليمي"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    actionLabel: 'عرض التفاصيل',
    actionRoute: '/my-donations',
  },
  {
    id: '2',
    type: NOTIFICATION_TYPES.CASE_UPDATE,
    title: 'تحديث على حالة دعمك',
    description: 'تمت مساعدة 5 أطفال من الحالة "رشاد لعلاج صحي" بنجاح في هذا الأسبوع',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: false,
    actionLabel: 'شاهد التقدم',
    actionRoute: '/cases',
  },
  {
    id: '3',
    type: NOTIFICATION_TYPES.NEW_CASE,
    title: 'حالة جديدة مناسبة لاهتماماتك ✨',
    description: 'حالة جديدة في مجال التعليم: "بيان تحتاج مصروف دراسي" - تطابق اهتماماتك بنسبة 95%',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    actionLabel: 'عرض الحالة',
    actionRoute: '/cases',
  },
  {
    id: '4',
    type: NOTIFICATION_TYPES.REQUEST_ACCEPTED,
    title: 'قبول طلبك ✅',
    description: 'تمت الموافقة على طلبك لدعم "علاج عينة لأحمد". سيتم التواصل معك قريبا',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    actionLabel: 'عرض الطلب',
    actionRoute: '/parents',
  },
  {
    id: '5',
    type: NOTIFICATION_TYPES.REQUEST_REJECTED,
    title: 'عدم القبول ⚠️',
    description: 'للأسف، لم يتم قبول الطلب "دراجة لعلي". يمكنك محاولة مرة أخرى بمعايير مختلفة',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: true,
    actionLabel: 'عرض التفاصيل',
    actionRoute: '/parents',
  },
  {
    id: '6',
    type: NOTIFICATION_TYPES.BADGE_EARNED,
    title: 'وسام جديد: المحسن 🏆',
    description: 'لقد حصلت على وسام "المحسن" لإكمال 10 تبرعات ناجحة',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isRead: true,
    actionLabel: 'عرض أوسمتي',
    actionRoute: '/profile-v2',
  },
  {
    id: '7',
    type: NOTIFICATION_TYPES.REWARD_POINTS,
    title: 'نقاط جديدة! ⭐',
    description: 'حصلت على 500 نقطة من مكافأة المهام اليومية. رصيدك الحالي: 2500 نقطة',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    isRead: true,
    actionLabel: 'عرض المكافآت',
    actionRoute: '/badges',
  },
  {
    id: '8',
    type: NOTIFICATION_TYPES.ORDER_STATUS,
    title: 'تحديث حالة الطلب 📦',
    description: 'تم شحن طلبك رقم #12345 - سيصل خلال 3-5 أيام عمل',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    isRead: true,
    actionLabel: 'تابع الطلب',
    actionRoute: '/orders',
  },
];

// Helper function to format time
export const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'الآن للتو';
  if (minutes < 60) return `قبل ${minutes} دقيقة`;
  if (hours < 24) return `قبل ${hours} ساعة`;
  if (days < 7) return `قبل ${days} يوم`;
  if (weeks < 4) return `قبل ${weeks} أسبوع`;
  if (months < 12) return `قبل ${months} شهر`;
  
  return timestamp.toLocaleDateString('ar-SA');
};

// Helper function to get notification by type
export const getNotificationConfig = (type) => {
  return NOTIFICATION_TYPE_CONFIG[type] || NOTIFICATION_TYPE_CONFIG.case_update;
};

// Helper function to load notifications from localStorage
export const loadNotifications = () => {
  try {
    const stored = localStorage.getItem('user_notifications');
    if (!stored) return SAMPLE_NOTIFICATIONS;
    
    const parsed = JSON.parse(stored);
    // Convert timestamp strings back to Date objects
    return parsed.map(notification => ({
      ...notification,
      timestamp: new Date(notification.timestamp)
    }));
  } catch (e) {
    console.error('Error loading notifications:', e);
    return SAMPLE_NOTIFICATIONS;
  }
};

// Helper function to save notifications to localStorage
export const saveNotifications = (notifications) => {
  try {
    localStorage.setItem('user_notifications', JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
};

// Helper function to mark notification as read
export const markNotificationAsRead = (notificationId) => {
  const notifications = loadNotifications();
  const updated = notifications.map(n =>
    n.id === notificationId ? { ...n, isRead: true } : n
  );
  saveNotifications(updated);
  return updated;
};

// Helper function to mark all notifications as read
export const markAllNotificationsAsRead = () => {
  const notifications = loadNotifications();
  const updated = notifications.map(n => ({ ...n, isRead: true }));
  saveNotifications(updated);
  return updated;
};

// Helper function to delete notification
export const deleteNotification = (notificationId) => {
  const notifications = loadNotifications();
  const updated = notifications.filter(n => n.id !== notificationId);
  saveNotifications(updated);
  return updated;
};

// Helper function to get unread count
export const getUnreadCount = () => {
  const notifications = loadNotifications();
  return notifications.filter(n => !n.isRead).length;
};
