// src/mocks/data/notifications.js

export const notifications = [
  {
    id: 'not1',
    userId: 'user1',
    type: 'donation_success',
    title: 'تم التبرع بنجاح',
    message: 'شكراً لتبرعك في دعم دار الأجداد',
    isRead: false,
    createdAt: '2024-03-01T12:05:00Z',
    data: { donationId: 'don1' },
  },
  {
    id: 'not2',
    userId: 'user2',
    type: 'case_update',
    title: 'تحديث في الحالة',
    message: 'تم تحديث حالة المشروع التعليمي',
    isRead: true,
    createdAt: '2024-03-05T15:00:00Z',
    data: { caseId: 'case3' },
  },
  {
    id: 'not3',
    userId: 'user3',
    type: 'badge_earned',
    title: 'شارة جديدة!',
    message: 'لقد حصلت على شارة المتبرع',
    isRead: false,
    createdAt: '2024-03-10T17:00:00Z',
    data: { badge: 'donor' },
  },
];