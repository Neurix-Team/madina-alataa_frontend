import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBuilding, FaInfoCircle, FaCalendar, FaUserShield, FaPhone, FaEnvelope, FaIndustry, FaIdCard } from 'react-icons/fa';

const formatDate = (dateString) => {
  if (!dateString) return 'غير متوفر';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'غير متوفر';

  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const PartnerDetailModal = ({ isOpen, onClose, partner }) => {
  const getOrgTypeLabel = (type) => {
    const types = {
      1: 'مؤسسة تجارية',
      2: 'مؤسسة خيرية',
      3: 'مؤسسة حكومية',
      4: 'مؤسسة تعليمية'
    };
    return types[type] || 'مؤسسة';
  };

  return (
    <AnimatePresence>
      {isOpen && partner && (
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
                  <FaBuilding className="text-lg" />
                </div>
                <div>
                  <h3 className="app-modal-title">
                    {partner.orgName || 'مؤسسة غير معروفة'}
                  </h3>
                  <p className="app-modal-subtitle">
                    بيانات الشريك وتفاصيل التواصل المسجلة
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
            <div className="flex-1 overflow-y-auto py-4 px-8">
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}>
                  <DetailItem label="اسم المؤسسة" value={partner.orgName || '-'} />
                  <DetailItem label="النوع" value={getOrgTypeLabel(partner.orgType)} />
                  <DetailItem label="رقم الهاتف" value={partner.phoneNumber || '-'} />
                  <DetailItem label="البريد الإلكتروني" value={partner.email || '-'} />
                  <DetailItem label="تاريخ الإنشاء" value={formatDate(partner.createdAt)} />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0' }}>ملاحظات</h4>
                  <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.8', fontSize: '14px', fontWeight: '500' }}>
                    {partner.description || 'هذا الشريك مسجل كجهة رسمية داخل النظام، ويمكنه استقبال طلبات التبرع والمشاركة في المهام التطوعية.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="app-form-actions mt-6 border-t border-slate-100 pt-4 px-8 pb-6">
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

export default PartnerDetailModal;
