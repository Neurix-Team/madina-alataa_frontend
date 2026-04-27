// src/pages/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaCheck,
  FaTrash,
  FaBell,
  FaCheckDouble,
  FaArrowLeft,
  FaHome,
} from 'react-icons/fa';
import {
  formatNotificationTime,
  getNotificationConfig,
} from '../data/notificationsData';
import { api } from '../services/api.js';
import AudioManager from '../services/AudioManager';
import AnimatedBackground from '../components/common/AnimatedBackground';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    api.getNotifications()
      .then((data) => {
        if (!isMounted) return;
        const normalized = data.map((notification) => ({
          ...notification,
          timestamp: notification.createdAt ? new Date(notification.createdAt) : notification.timestamp ? new Date(notification.timestamp) : new Date(),
          description: notification.message || notification.description || '',
        }));
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

  // Handle notification action button click
  const handleActionClick = (notification) => {
    AudioManager.getInstance().play('click');
    
    // Mark as read locally if not already
    if (!notification.isRead) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }

    // Navigate to action route
    if (notification.actionRoute) {
      setTimeout(() => {
        navigate(notification.actionRoute);
      }, 300);
    }
  };

  const handleNotificationClick = (notification) => {
    handleActionClick(notification);
  };

  // Handle mark as read
  const handleMarkAsRead = (e, notification) => {
    e.stopPropagation();
    AudioManager.getInstance().play('click');
    
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
  };

  // Handle delete notification
  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    AudioManager.getInstance().play('click');
    
    setNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    AudioManager.getInstance().play('click');
    
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (selectedFilter === 'unread') return !n.isRead;
    if (selectedFilter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}>جاري تحميل الإشعارات...</div>;
  }

  if (error) {
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
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .notifications-header {
          animation: slideInDown 0.5s ease-out;
        }

        .notifications-list {
          animation: slideInUp 0.6s ease-out;
        }

        .notification-card {
          animation: fadeIn 0.4s ease-out;
        }

        .notification-card:nth-child(1) { animation-delay: 0s; }
        .notification-card:nth-child(2) { animation-delay: 0.1s; }
        .notification-card:nth-child(3) { animation-delay: 0.2s; }
        .notification-card:nth-child(4) { animation-delay: 0.3s; }
        .notification-card:nth-child(5) { animation-delay: 0.4s; }
        .notification-card:nth-child(6) { animation-delay: 0.5s; }
      `}</style>

      <AnimatedBackground />

      {/* Header */}
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
          {/* Back Button - Go to Home */}
          <button
            onClick={() => {
              AudioManager.getInstance().play('click');
              navigate('/map');
            }}
            title="الرجوع للرئيسية"
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(29,110,216,0.75) 0%, rgba(14,165,233,0.55) 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(29,110,216,0.55) 0%, rgba(14,165,233,0.35) 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FaHome size={14} />
            الرئيسية
          </button>

          {/* Title and Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  fontSize: 32,
                  filter: 'drop-shadow(0 2px 8px rgba(59,130,246,0.3))',
                }}
              >
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
                <p
                  style={{
                    margin: '4px 0 0 0',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 13,
                  }}
                >
                  {unreadCount > 0
                    ? `${unreadCount} إشعارات جديدة`
                    : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 8,
                  background: 'rgba(59,130,246,0.2)',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.2)';
                }}
              >
                <FaCheckDouble size={14} />
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'الكل', count: notifications.length },
              { id: 'unread', label: 'غير مقروء', count: unreadCount },
              { id: 'read', label: 'مقروء', count: notifications.filter(n => n.isRead).length },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: selectedFilter === filter.id
                    ? 'rgba(59,130,246,0.3)'
                    : 'rgba(255,255,255,0.05)',
                  color: selectedFilter === filter.id ? '#3b82f6' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  border: selectedFilter === filter.id
                    ? '1px solid rgba(59,130,246,0.5)'
                    : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = selectedFilter === filter.id
                    ? 'rgba(59,130,246,0.3)'
                    : 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selectedFilter === filter.id
                    ? 'rgba(59,130,246,0.3)'
                    : 'rgba(255,255,255,0.05)';
                }}
              >
                {filter.label}
                <span
                  style={{
                    marginRight: 6,
                    opacity: 0.7,
                    fontSize: 12,
                  }}
                >
                  ({filter.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {filteredNotifications.length === 0 ? (
          // Empty state
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <div
              style={{
                fontSize: 64,
                marginBottom: 16,
                opacity: 0.3,
              }}
            >
              🔔
            </div>
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: 18,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {selectedFilter === 'all'
                ? 'لا توجد إشعارات حالياً'
                : selectedFilter === 'unread'
                ? 'جميع الإشعارات مقروءة! 🎉'
                : 'لا توجد إشعارات مقروءة'}
            </h3>
            <p style={{ margin: 0, fontSize: 13 }}>
              {selectedFilter === 'all'
                ? 'سيظهر هنا آخر أخبارك وتحديثاتك'
                : 'عودة قريباً للحصول على نشاطات جديدة'}
            </p>
          </div>
        ) : (
          // Notifications Grid
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredNotifications.map((notification, idx) => {
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
                    border: `1px solid ${notification.isRead
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(59,130,246,0.3)'}`,
                    borderRadius: 12,
                    background: notification.isRead
                      ? 'rgba(255,255,255,0.02)'
                      : `linear-gradient(135deg, ${config.bgColor}, rgba(59,130,246,0.05))`,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = notification.isRead
                      ? 'rgba(255,255,255,0.04)'
                      : `linear-gradient(135deg, ${config.bgColor}, rgba(59,130,246,0.1))`;
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                    e.currentTarget.style.transform = 'translateX(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.isRead
                      ? 'rgba(255,255,255,0.02)'
                      : `linear-gradient(135deg, ${config.bgColor}, rgba(59,130,246,0.05))`;
                    e.currentTarget.style.borderColor = notification.isRead
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(59,130,246,0.3)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {/* Unread Indicator */}
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

                  {/* Main Content */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    {/* Icon */}
                    <div
                      style={{
                        fontSize: 24,
                        flexShrink: 0,
                        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))',
                      }}
                    >
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          margin: '0 0 6px 0',
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        {notification.title}
                      </h4>
                      <p
                        style={{
                          margin: '0 0 8px 0',
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.7)',
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.description}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.5)',
                        }}
                      >
                        {timeText}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      {/* Mark as Read Button */}
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notification)}
                          title="تعليم كمقروء"
                          style={{
                            width: 36,
                            height: 36,
                            border: 'none',
                            borderRadius: 8,
                            background: 'rgba(59,130,246,0.2)',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            fontSize: 16,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59,130,246,0.3)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(59,130,246,0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <FaCheck />
                        </button>
                      )}

                      {/* Delete Button */}
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Action Button */}
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${config.color}44, ${config.color}33)`;
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${config.color}33, ${config.color}22)`;
                        e.currentTarget.style.transform = 'scale(1)';
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
