import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaFingerprint,
  FaFire,
  FaGem,
  FaLayerGroup,
  FaLeaf,
  FaLock,
  FaMapMarkerAlt,
  FaPlus,
  FaShieldAlt,
  FaStar,
  FaTags,
  FaTasks,
  FaTimes,
  FaTrophy,
} from 'react-icons/fa';

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm';

const getDifficultyInfo = (level) => {
  const normalized = typeof level === 'string' ? level.toLowerCase() : Number(level);
  if (normalized === 0 || normalized === 'easy' || normalized === 'سهل') {
    return {
      text: 'سهل',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      icon: FaLeaf,
    };
  }
  if (normalized === 1 || normalized === 'normal' || normalized === 'medium' || normalized === 'متوسط') {
    return {
      text: 'متوسط',
      badge: 'border-blue-200 bg-blue-50 text-blue-700',
      icon: FaShieldAlt,
    };
  }
  if (normalized === 2 || normalized === 'hard' || normalized === 'صعب') {
    return {
      text: 'صعب',
      badge: 'border-orange-200 bg-orange-50 text-orange-700',
      icon: FaFire,
    };
  }
  if (
    normalized === 3 ||
    normalized === 'veryhard' ||
    normalized === 'very hard' ||
    normalized === 'أسطوري'
  ) {
    return {
      text: 'أسطوري',
      badge: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
      icon: FaGem,
    };
  }
  return {
    text: 'حالة المهمة',
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
    icon: FaTasks,
  };
};

const formatDate = (dateString) => {
  if (!dateString) return 'تاريخ المهمة';
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function MissionDetailModal({ isOpen, onClose, mission }) {
  if (!isOpen) return null;

  const missionData = mission?.value ?? mission?.data ?? mission?.result ?? mission;
  if (!missionData) return null;

  const statusText = String(missionData.status ?? '').toLowerCase();
  const isActive =
    missionData.isActive !== undefined && missionData.isActive !== null
      ? missionData.isActive === true || missionData.isActive === 'true'
      : statusText === 'open' || statusText === 'active' || statusText === '';
  const isHidden =
    missionData.isHidden !== undefined && missionData.isHidden !== null
      ? missionData.isHidden === true || missionData.isHidden === 'true'
      : false;

  const difficulty = getDifficultyInfo(missionData.difficulty);
  const DifficultyIcon = difficulty.icon;

  const timeline = [
    { label: 'تاريخ الإنشاء', value: missionData.createdAt, icon: FaPlus },
    { label: 'آخر تحديث', value: missionData.updatedAt, icon: FaClock },
    { label: 'تاريخ البدء', value: missionData.startDate, icon: FaCheckCircle },
    { label: 'تاريخ الانتهاء', value: missionData.endDate, icon: FaCalendarAlt },
  ].filter((item) => item.value);

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
            style={{ maxWidth: '900px' }}
          >
            {/* Header */}
            <div className="app-modal-header">
              <div className="flex flex-1 items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{ background: 'var(--bg-card-2)', color: 'var(--primary)', border: '1px solid var(--border)' }}
                >
                  <FaTasks className="text-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="app-modal-title">
                    {missionData.title || 'بدون عنوان'}
                  </h3>
                  <p className="app-modal-subtitle">
                    بيانات المهمة والوصف والحالة الحالية
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
                  <DetailItem label="درجة الصعوبة" value={difficulty.text} />
                  <DetailItem label="الحالة" value={isActive ? 'نشطة' : 'مغلقة'} />
                  <DetailItem label="المستوى المطلوب" value={missionData.requiredLevel ?? '1'} />
                  <DetailItem label="الموقع المرتبط" value={missionData.locationName || missionData.location?.name || missionData.location?.Name || missionData.title || 'موقع المهمة'} />
                  <DetailItem label="الرؤية" value={isHidden ? 'مخفية' : 'عامة'} />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0' }}>المكافآت</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <RewardItem icon={FaTrophy} label="نقاط الخير" value={missionData.kpReward} color="#f59e0b" />
                    <RewardItem icon={FaStar} label="الخبرة" value={missionData.xpReward} color="#c026d3" />
                    <RewardItem icon={FaLeaf} label="التأثير" value={missionData.impactReward} color="#059669" />
                  </div>
                </div>

                {missionData.description && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0' }}>الوصف</h4>
                    <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.8', fontSize: '14px', fontWeight: '500' }}>
                      {missionData.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="app-form-actions mt-6 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
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
}

const DetailItem = ({ label, value }) => (
  <div style={{
    padding: '14px',
    borderRadius: '16px',
    background: 'var(--bg-card-2)',
    border: '1px solid var(--border)',
    display: 'grid',
    gap: '6px'
  }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}>{label}</span>
    <strong style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '800', wordBreak: 'break-word' }}>{value}</strong>
  </div>
);

const RewardItem = ({ icon: Icon, label, value, color }) => (
  <div style={{
    padding: '14px',
    borderRadius: '16px',
    background: 'var(--bg-card-2)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: `${color}15`,
      color: color,
      display: 'grid',
      placeItems: 'center',
      fontSize: '18px'
    }}>
      <Icon />
    </div>
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>{label}</div>
      <div style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '900' }}>{value || 0}</div>
    </div>
  </div>
);
