import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaTrashAlt,
} from 'react-icons/fa';
import { APP_ALERT_EVENT, installBrowserAlertBridge } from '../../utils/appAlerts';

const TYPE_STYLES = {
  success: {
    icon: FaCheckCircle,
    bg: 'linear-gradient(135deg, rgba(220,252,231,0.98), rgba(240,253,244,0.98))',
    border: 'rgba(34,197,94,0.26)',
    iconColor: '#15803d',
    titleColor: '#14532d',
    messageColor: '#166534',
    buttonBg: '#16a34a',
    softButtonBg: 'rgba(22,163,74,0.12)',
  },
  danger: {
    icon: FaExclamationTriangle,
    bg: 'linear-gradient(135deg, rgba(254,242,242,0.98), rgba(255,247,237,0.98))',
    border: 'rgba(239,68,68,0.24)',
    iconColor: '#dc2626',
    titleColor: '#7f1d1d',
    messageColor: '#991b1b',
    buttonBg: '#dc2626',
    softButtonBg: 'rgba(220,38,38,0.12)',
  },
  warning: {
    icon: FaExclamationTriangle,
    bg: 'linear-gradient(135deg, rgba(255,251,235,0.98), rgba(255,247,237,0.98))',
    border: 'rgba(245,158,11,0.24)',
    iconColor: '#d97706',
    titleColor: '#78350f',
    messageColor: '#92400e',
    buttonBg: '#d97706',
    softButtonBg: 'rgba(217,119,6,0.12)',
  },
  info: {
    icon: FaInfoCircle,
    bg: 'linear-gradient(135deg, rgba(239,246,255,0.98), rgba(248,250,252,0.98))',
    border: 'rgba(59,130,246,0.2)',
    iconColor: '#2563eb',
    titleColor: '#1e3a8a',
    messageColor: '#1d4ed8',
    buttonBg: '#2563eb',
    softButtonBg: 'rgba(37,99,235,0.12)',
  },
};

function AppAlertToast({ alert, onClose }) {
  const styles = TYPE_STYLES[alert.type] || TYPE_STYLES.info;
  const Icon = styles.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        direction: 'rtl',
        width: 'min(92vw, 380px)',
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: 18,
        padding: 16,
        boxShadow: '0 24px 60px rgba(15,23,42,0.16)',
        backdropFilter: 'blur(10px)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 12,
        alignItems: 'start',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          background: styles.softButtonBg,
          color: styles.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontSize: 15,
            fontWeight: 900,
            color: styles.titleColor,
            marginBottom: 4,
            lineHeight: 1.35,
          }}
        >
          {alert.title}
        </div>
        <div
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: styles.messageColor,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {alert.message}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onClose(alert.id)}
        style={{
          border: 'none',
          background: 'transparent',
          color: styles.messageColor,
          cursor: 'pointer',
          width: 32,
          height: 32,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label="إغلاق التنبيه"
      >
        <FaTimes size={14} />
      </button>
    </motion.div>
  );
}

function AppConfirmDialog({ alert, onConfirm, onCancel }) {
  if (!alert) {
    return <AnimatePresence />;
  }

  const styles = TYPE_STYLES[alert.type] || TYPE_STYLES.warning;
  const Icon = alert.type === 'danger' ? FaTrashAlt : styles.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.44)',
          backdropFilter: 'blur(5px)',
          zIndex: 1400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{
            width: 'min(92vw, 420px)',
            background: '#f8fafc',
            border: `1px solid ${styles.border}`,
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 30px 80px rgba(15,23,42,0.22)',
            direction: 'rtl',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: styles.softButtonBg,
              color: styles.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <Icon size={22} />
          </div>

          <div
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize: 22,
              fontWeight: 900,
              color: styles.titleColor,
              marginBottom: 8,
              lineHeight: 1.35,
            }}
          >
            {alert.title}
          </div>

          <div
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: '#334155',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {alert.message}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginTop: 24,
            }}
          >
            <button
              type="button"
              onClick={onConfirm}
              style={{
                border: 'none',
                borderRadius: 16,
                background: styles.buttonBg,
                color: '#f8fafc',
                minHeight: 48,
                fontFamily: "'Cairo', sans-serif",
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 18px 30px rgba(15,23,42,0.12)',
              }}
            >
              {alert.confirmText}
            </button>

            <button
              type="button"
              onClick={onCancel}
              style={{
                border: `1px solid ${styles.border}`,
                borderRadius: 16,
                background: '#ffffff',
                color: '#334155',
                minHeight: 48,
                fontFamily: "'Cairo', sans-serif",
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {alert.cancelText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppAlertHost() {
  const [toasts, setToasts] = useState([]);
  const [confirmQueue, setConfirmQueue] = useState([]);
  const [activeConfirm, setActiveConfirm] = useState(null);

  useLayoutEffect(() => {
    installBrowserAlertBridge();
  }, []);

  useLayoutEffect(() => {
    const handleAlertEvent = (event) => {
      const alert = event.detail;
      if (!alert) return;

      if (alert.isConfirm) {
        setConfirmQueue((current) => [...current, alert]);
        return;
      }

      setToasts((current) => [...current, alert]);
    };

    window.addEventListener(APP_ALERT_EVENT, handleAlertEvent);
    return () => window.removeEventListener(APP_ALERT_EVENT, handleAlertEvent);
  }, []);

  useEffect(() => {
    if (activeConfirm || confirmQueue.length === 0) return;

    setActiveConfirm(confirmQueue[0]);
    setConfirmQueue((current) => current.slice(1));
  }, [activeConfirm, confirmQueue]);

  useEffect(() => {
    if (!toasts.length) return undefined;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, toast.duration)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts]);

  useEffect(() => {
    if (!activeConfirm) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        activeConfirm.resolve?.(false);
        activeConfirm.onCancel?.();
        setActiveConfirm(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeConfirm]);

  const toastCount = useMemo(() => toasts.length, [toasts]);

  const dismissToast = (id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  const handleConfirm = async () => {
    if (!activeConfirm) return;
    const pending = activeConfirm;
    setActiveConfirm(null);
    pending.resolve?.(true);
    await pending.onConfirm?.();
  };

  const handleCancel = async () => {
    if (!activeConfirm) return;
    const pending = activeConfirm;
    setActiveConfirm(null);
    pending.resolve?.(false);
    await pending.onCancel?.();
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          display: 'grid',
          gap: 10,
          justifyItems: 'center',
          pointerEvents: toastCount ? 'auto' : 'none',
        }}
      >
        <AnimatePresence>
          {toasts.map((alert) => (
            <AppAlertToast key={alert.id} alert={alert} onClose={dismissToast} />
          ))}
        </AnimatePresence>
      </div>

      <AppConfirmDialog
        alert={activeConfirm}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
