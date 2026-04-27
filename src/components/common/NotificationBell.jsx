// src/components/common/NotificationBell.jsx
import React, { useState, useEffect, useRef, memo } from 'react';

// ── Sub-components ────────────────────────────────────────────────────────

const NotificationBadge = ({ count }) => {
  if (!count) return null;
  return (
    <span style={{
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      background: '#ef4444',
      color: '#fff',
      borderRadius: '99px',
      minWidth: '20px',
      height: '20px',
      fontSize: '11px',
      fontWeight: '800',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 6px',
      boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
      animation: 'nbPulse 2s infinite',
      fontFamily: "'Cairo', sans-serif",
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

const DropdownHeader = ({ notificationsCount, onClearAll, onClose }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '2px solid #f3f4f6',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  }}>
    <span style={{
      fontSize: '18px',
      fontWeight: '800',
      color: '#78350f',
      fontFamily: "'Cairo', sans-serif",
    }}>
      🔔 الإشعارات {notificationsCount > 0 && `(${notificationsCount})`}
    </span>
    <div style={{ display: 'flex', gap: 8 }}>
      {notificationsCount > 0 && (
        <button
          onClick={onClearAll}
          style={{
            background: 'none',
            border: 'none',
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            fontFamily: "'Cairo', sans-serif",
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          مسح الكل
        </button>
      )}
      <button
        onClick={onClose}
        style={{
          background: 'rgba(0,0,0,0.08)',
          border: 'none',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; }}
      >
        ✕
      </button>
    </div>
  </div>
);

const NotificationItem = ({ notification }) => {
  const typeConfig = {
    quest:   { bg: '#eff6ff', border: '#bfdbfe', icon: '🗺️' },
    reward:  { bg: '#fef9c3', border: '#fde68a', icon: '🎁' },
    level:   { bg: '#f5f3ff', border: '#ddd6fe', icon: '⭐' },
    badge:   { bg: '#f0fdf4', border: '#bbf7d0', icon: '🏆' },
    system:  { bg: '#f8fafc', border: '#e2e8f0', icon: '📢' },
  };
  const cfg = typeConfig[notification.type] || typeConfig.system;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '14px 18px',
      background: notification.read ? '#fff' : cfg.bg,
      borderBottom: '1px solid #f3f4f6',
      borderRight: notification.read ? 'none' : `3px solid ${cfg.border.replace('fe','c4')}`,
      transition: 'background 0.2s',
      direction: 'rtl',
    }}>
      <span style={{ fontSize: '22px', flexShrink: 0 }}>
        {notification.icon || cfg.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '13px',
          fontWeight: notification.read ? '600' : '800',
          color: '#1e293b',
          margin: 0,
          marginBottom: '3px',
          lineHeight: 1.4,
          fontFamily: "'Cairo', sans-serif",
        }}>
          {notification.message}
        </p>
        {notification.time && (
          <span style={{
            fontSize: '11px',
            color: '#94a3b8',
            fontWeight: '600',
            fontFamily: "'Cairo', sans-serif",
          }}>
            {notification.time}
          </span>
        )}
      </div>
      {!notification.read && (
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#3b82f6',
          flexShrink: 0,
          marginTop: '4px',
        }} />
      )}
    </div>
  );
};

const NotificationList = ({ notifications }) => {
  if (!notifications.length) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#94a3b8',
        fontFamily: "'Cairo', sans-serif",
      }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔕</div>
        <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
          لا توجد إشعارات
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────

const NotificationBell = ({
  notifications = [],
  onMarkAllRead,
}) => {
  const [isOpen, setIsOpen]       = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const previousLength            = useRef(notifications.length);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Shake animation when new notification arrives
  useEffect(() => {
    if (notifications.length > previousLength.current) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 600);
      return () => clearTimeout(timer);
    }
    previousLength.current = notifications.length;
  }, [notifications.length]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount > 0) {
      onMarkAllRead?.();
    }
  };

  const handleClose = () => setIsOpen(false);

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        aria-label="الإشعارات"
        title="الإشعارات"
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          fontSize: '22px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
          transition: 'all 0.3s ease',
          animation: isShaking ? 'nbShake 0.6s ease' : 'none',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(245,158,11,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.3)';
        }}
      >
        🔔
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.2)',
              zIndex: 999,
            }}
          />
          {/* Panel */}
          <div style={{
            position: 'absolute',
            top: '58px',
            right: '0',
            width: '360px',
            maxHeight: '500px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            zIndex: 1001,
            animation: 'nbSlideDown 0.25s ease-out',
            direction: 'rtl',
          }}>
            <DropdownHeader
              notificationsCount={notifications.length}
              onClearAll={onMarkAllRead}
              onClose={handleClose}
            />
            <NotificationList notifications={notifications} />
          </div>
        </>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes nbShake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-12deg); }
          20%, 40%, 60%, 80% { transform: rotate(12deg); }
        }
        @keyframes nbPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        @keyframes nbSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default memo(NotificationBell);
