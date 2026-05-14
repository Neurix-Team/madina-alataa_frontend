import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaInfoCircle, FaCalendar, FaUserShield } from 'react-icons/fa';

const GeoQuestDetailModal = ({ isOpen, onClose, geoQuest }) => {
  if (!isOpen || !geoQuest) return null;

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="p-4 rounded-2xl bg-slate-50/95 border border-slate-200/90 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-slate-500">
        {Icon && <Icon className="text-sm" />}
        <span className="text-[12px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <strong className="text-slate-900 text-[14px] font-extrabold break-words">
        {value || 'غير محدد'}
      </strong>
    </div>
  );

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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <div>
                  <h3 className="app-modal-title">
                    تفاصيل المهمة الجغرافية
                  </h3>
                  <p className="app-modal-subtitle">
                    بيانات المهمة والموقع الجغرافي المسجلة
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
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)' }}>
                    {geoQuest.title || 'بدون عنوان'}
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}>
                  <DetailItem label="اسم الموقع" value={geoQuest.locationName || '-'} />
                  <DetailItem label="تاريخ الإضافة" value={geoQuest.createdAt ? new Date(geoQuest.createdAt).toLocaleDateString('ar-EG') : '-'} />
                </div>

                {geoQuest.description && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0' }}>الوصف</h4>
                    <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.8', fontSize: '14px', fontWeight: '500' }}>
                      {geoQuest.description}
                    </p>
                  </div>
                )}
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

export default GeoQuestDetailModal;
