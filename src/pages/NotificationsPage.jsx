// src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaTrash,
  FaCheckDouble,
  FaHome,
} from 'react-icons/fa';
import {
  formatNotificationTime,
  getNotificationConfig,
} from '../data/notificationsData';
import { notificationsService } from '../services/notificationsService';
import AudioManager from '../services/AudioManager';
import AnimatedBackground from '../components/common/AnimatedBackground';

const normalizeNotification = (notification, index = 0) => ({
  ...notification,
  id:
    notification?.id ||
    notification?.notificationId ||
    notification?.Id ||
    notification?.NotificationId ||
    `notification-${index}`,
  type: notification?.type || notification?.notificationType || 'case_update',
  title: notification?.title || notification?.subject || notification?.name || 'إشعار',
  description: notification?.message || notification?.description || notification?.body || '',
  timestamp: notification?.createdAt
    ? new Date(notification.createdAt)
    : notification?.timestamp
      ? new Date(notification.timestamp)
      : new Date(),
  isRead: Boolean(notification?.isRead ?? notification?.read ?? notification?.is_read ?? false),
  actionLabel: notification?.actionLabel || 'عرض التفاصيل',
  actionRoute: notification?.actionRoute || null,
});

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let isMounted = true;

    notificationsService.getNotifications(false)
      .then((data) => {
        if (!isMounted) return;
        const normalized = (Array.isArray(data) ? data : []).map(normalizeNotification);
        console.log('Notifications API response:', normalized);
        setNotifications(normalized);
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
        if (isMounted) setError(err.message || 'فشل في تحميل الإشعارات');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleActionClick = (notification) => {
    AudioManager.getInstance().play('click');

    if (notification.actionRoute) {
      setTimeout(() => {
        navigate(notification.actionRoute);
      }, 300);
    }
  };

  const handleNotificationClick = (notification) => {
    handleActionClick(notification);
  };

  const handleMarkAsRead = async (e, notification) => {
    e.stopPropagation();
    AudioManager.getInstance().play('click');

    if (notification.isRead || !notification.id) return;

    setMarkingId(notification.id);
    setError(null);
    try {
      await notificationsService.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError(err.message || 'فشل في تعليم الإشعار كمقروء');
    } finally {
      setMarkingId(null);
    }
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    AudioManager.getInstance().play('click');

    setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
  };

  const handleMarkAllAsRead = async () => {
    AudioManager.getInstance().play('click');

    setMarkingAll(true);
    setError(null);
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setError(err.message || 'فشل في تعليم كل الإشعارات كمقروءة');
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === 'unread') return !notification.isRead;
    if (selectedFilter === 'read') return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}>جاري تحميل الإشعارات...</div>;
  }

  if (error && notifications.length === 0) {
    return <div style={{ textAlign: 'center', padding: 50, color: '#f87171' }}>خطأ في التحميل: {error}</div>;
  }

  return (
    <div
      style={{
        direction: 'rtl',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        paddingBottom: 60,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .notifications-header { animation: slideInDown 0.5s ease-out; }
        .notifications-list { animation: slideInUp 0.6s ease-out; }
        .notification-card { animation: fadeIn 0.4s ease-out; }
        .notification-card:nth-child(1) { animation-delay: 0s; }
        .notification-card:nth-child(2) { animation-delay: 0.1s; }
        .notification-card:nth-child(3) { animation-delay: 0.2s; }
        .notification-card:nth-child(4) { animation-delay: 0.3s; }
        .notification-card:nth-child(5) { animation-delay: 0.4s; }
        .notification-card:nth-child(6) { animation-delay: 0.5s; }
      `}</style>

      <AnimatedBackground />

      <div
        className="notifications-header"
        style={{
          background: 'linear-gradient(135deg, rgba(29,110,216,0.1), rgba(59,130,246,0.05))',
          borderBottom: '1px solid rgba(59,130,246,0.2)',
          padding: '24px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button
            onClick={() => {
              AudioManager.getInstance().play('click');
              navigate('/map');
            }}
            title="الرئيسية"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(29,110,216,0.55) 0%, rgba(14,165,233,0.35) 100%)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
              marginBottom: 12,
              border: '1px solid rgba(14,165,233,0.4)',
            }}
          >
            <FaHome size={14} />
            الرئيسية
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32, filter: 'drop-shadow(0 2px 8px rgba(59,130,246,0.3))' }}>
                🔔
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 28,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  إشعاراتي
                </h1>
                <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                  {unreadCount > 0 ? `${unreadCount} إشعارات جديدة` : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 8,
                  background: 'rgba(59,130,246,0.2)',
                  color: '#3b82f6',
                  cursor: markingAll ? 'not-allowed' : 'pointer',
                  opacity: markingAll ? 0.7 : 1,
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <FaCheckDouble size={14} />
                {markingAll ? 'جاري...' : 'Mark all as read'}
              </button>
            )}
          </div>

          {error && (
            <div style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'الكل', count: notifications.length },
              { id: 'unread', label: 'غير مقروء', count: unreadCount },
              { id: 'read', label: 'مقروء', count: notifications.filter((notification) => notification.isRead).length },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: selectedFilter === filter.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                  color: selectedFilter === filter.id ? '#3b82f6' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  border: selectedFilter === filter.id ? '1px solid rgba(59,130,246,0.5)' : '1px solid transparent',
                }}
              >
                {filter.label}
                <span style={{ marginRight: 6, opacity: 0.7, fontSize: 12 }}>
                  ({filter.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>🔔</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
              {selectedFilter === 'all'
                ? 'لا توجد إشعارات حالياً'
                : selectedFilter === 'unread'
                  ? 'جميع الإشعارات مقروءة'
                  : 'لا توجد إشعارات مقروءة'}
            </h3>
            <p style={{ margin: 0, fontSize: 13 }}>
              {selectedFilter === 'all' ? 'ستظهر هنا آخر التحديثات' : 'لا يوجد عناصر في هذا الفلتر'}
            </p>
          </div>
        ) : (
          <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredNotifications.map((notification) => {
              const config = getNotificationConfig(notification.type);
              const timeText = formatNotificationTime(notification.timestamp);

              return (
                <div
                  key={notification.id}
                  className="notification-card"
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 12,
                    padding: 16,
                    border: `1px solid ${notification.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.3)'}`,
                    borderRadius: 12,
                    background: notification.isRead
                      ? 'rgba(255,255,255,0.02)'
                      : `linear-gradient(135deg, ${config.bgColor}, rgba(59,130,246,0.05))`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {!notification.isRead && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 4,
                        height: '100%',
                        background: config.color,
                        boxShadow: `0 0 12px ${config.color}`,
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ fontSize: 24, flexShrink: 0 }}>
                      {config.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: '#fff' }}>
                        {notification.title}
                      </h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                        {notification.description}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                        {timeText}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notification)}
                          title="Mark as read"
                          disabled={markingId === notification.id}
                          style={{
                            minWidth: 36,
                            height: 36,
                            border: 'none',
                            borderRadius: 8,
                            background: 'rgba(59,130,246,0.2)',
                            color: '#3b82f6',
                            cursor: markingId === notification.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            fontSize: 13,
                            padding: '0 10px',
                            opacity: markingId === notification.id ? 0.7 : 1,
                          }}
                        >
                          {markingId === notification.id ? '...' : 'Mark as read'}
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        title="حذف"
                        style={{
                          width: 36,
                          height: 36,
                          border: 'none',
                          borderRadius: 8,
                          background: 'rgba(239,68,68,0.1)',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          fontSize: 14,
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {notification.actionRoute && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(notification);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${config.color}33, ${config.color}22)`,
                        color: config.color,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                        border: `1px solid ${config.color}44`,
                      }}
                    >
                      {notification.actionLabel}
                      <FaArrowRight size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
