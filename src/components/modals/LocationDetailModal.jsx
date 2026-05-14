import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaMapMarkerAlt,
  FaGlobe,
  FaCompass,
  FaStar,
  FaSatellite,
  FaFingerprint,
  FaLayerGroup,
  FaInfoCircle,
  FaCalendarAlt,
  FaHistory,
  FaCheckCircle,
} from 'react-icons/fa';

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm';

const formatDate = (dateString) => {
  if (!dateString) return 'غير متوفر';
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LocationDetailModal = ({ isOpen, onClose, location }) => {
  if (!isOpen || !location) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="app-modal-overlay"
          dir="rtl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="app-modal-card"
            style={{ maxWidth: '800px' }}
          >
            {/* Header */}
            <div className="app-modal-header">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <div>
                  <h3 className="app-modal-title">
                    {location.name || 'عنوان مجهول'}
                  </h3>
                  <p className="app-modal-subtitle">
                    بيانات الموقع الجغرافي والإحداثيات المسجلة
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="app-modal-close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto py-4">
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}>
                  <DetailItem label="اسم العنوان" value={location.name || '-'} />
                  <DetailItem label="خط الطول" value={location.longitude || '0.00'} />
                  <DetailItem label="خط العرض" value={location.latitude || '0.00'} />
                  <DetailItem label="المستوى المطلوب" value={location.requiredLevel ?? '1'} />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0' }}>نظرة سريعة</h4>
                  <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.8', fontSize: '14px', fontWeight: '500' }}>
                    هذا العنوان مسجل داخل النظام مع إحداثيات واضحة، ويمكن استخدامه مباشرة في المهام والطلبات المرتبطة بالموقع.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="app-form-actions mt-6 border-t border-slate-100 pt-4">
              <button
                onClick={onClose}
                className="app-btn-secondary w-full"
              >
                إغلاق النافذة
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const DetailItem = ({ label, value }) => (
  <div style={{
    padding: '14px',
    borderRadius: '16px',
    background: 'var(--bg-card-2)',
    border: '1px solid var(--border-light)',
    display: 'grid',
    gap: '6px'
  }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}>{label}</span>
    <strong style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '800', wordBreak: 'break-word' }}>{value}</strong>
  </div>
);


export default LocationDetailModal;
