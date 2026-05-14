import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaHistory, FaSpinner, FaTimes } from 'react-icons/fa';
import { activitiesService } from '../../services/activitiesService';

const ACTIVITY_STATUS_LABELS = {
  logged: 'تم تسجيله',
  created: 'تم الإنشاء',
  create: 'تم الإنشاء',
  updated: 'تم التحديث',
  update: 'تم التحديث',
  edited: 'تم التعديل',
  edit: 'تم التعديل',
  approved: 'تمت الموافقة',
  rejected: 'تم الرفض',
  pending: 'قيد المراجعة',
  completed: 'مكتمل',
  deleted: 'تم الحذف',
  archived: 'مؤرشف',
  in_progress: 'قيد التنفيذ',
  progress: 'قيد التنفيذ',
};

const prettifyValue = (value) =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatActivityText = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  return prettifyValue(value);
};

const formatActivityDate = (value) => {
  if (!value) return 'غير محدد';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getActivityTitle = (item, index) =>
  formatActivityText(
    item?.name || item?.title || item?.actionType || item?.activityType || item?.eventType,
    `عملية رقم ${index + 1}`
  );

const getActivityDescription = (item) =>
  item?.description ||
  item?.details ||
  item?.note ||
  item?.message ||
  item?.summary ||
  '';

const getActivityStatus = (item) => {
  const rawStatus = String(item?.status || item?.state || 'logged').toLowerCase();
  return ACTIVITY_STATUS_LABELS[rawStatus] || formatActivityText(rawStatus, 'تم تسجيل النشاط');
};

const getActivityMeta = (item) => {
  const pairs = [
    ['نوع العملية', formatActivityText(item?.actionType || item?.activityType || item?.eventType, '')],
    ['نفذها', item?.userName || item?.actorName || item?.createdBy || item?.createdByName || 'مستخدم النظام'],
    ['مرتبطة بـ', formatActivityText(item?.entityType || item?.targetType, '')],
  ];

  return pairs.filter(([, value]) => value !== undefined && value !== null && value !== '');
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,.6)',
  display: 'grid',
  placeItems: 'center',
  padding: 20,
  zIndex: 1200,
};

const modalStyle = {
  width: 'min(900px, 100%)',
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: 24,
  background: '#fff',
  boxShadow: '0 30px 80px rgba(15,23,42,.28)',
  padding: 22,
  display: 'grid',
  gap: 18,
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
};

const iconWrapStyle = {
  width: 50,
  height: 50,
  borderRadius: 16,
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
  color: '#fff',
  fontSize: 20,
};

const closeBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: 12,
  border: '1px solid rgba(148,163,184,.2)',
  background: '#fff',
  color: '#334155',
  cursor: 'pointer',
};

const stateBoxStyle = {
  minHeight: 180,
  borderRadius: 18,
  border: '1px dashed rgba(148,163,184,.35)',
  background: 'rgba(248,250,252,.95)',
  display: 'grid',
  placeItems: 'center',
  textAlign: 'center',
  color: '#64748b',
  gap: 10,
  padding: 24,
};

const itemCardStyle = {
  padding: 16,
  borderRadius: 18,
  border: '1px solid rgba(226,232,240,.9)',
  background: 'linear-gradient(180deg, #fff, #f8fbff)',
  display: 'grid',
  gap: 12,
};

const itemTitleStyle = {
  color: '#0f172a',
  fontSize: 16,
  fontWeight: 800,
};

const itemMetaStyle = {
  color: '#64748b',
  fontSize: 12,
  marginTop: 4,
};

const itemDescriptionStyle = {
  margin: 0,
  color: '#334155',
  lineHeight: 1.7,
};

const chipStyle = {
  padding: '6px 10px',
  borderRadius: 999,
  background: 'rgba(37,99,235,.1)',
  color: '#2563eb',
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: 'nowrap',
};

const metaListStyle = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
};

const metaRowStyle = {
  padding: '10px 12px',
  borderRadius: 14,
  background: 'rgba(248,250,252,.95)',
  border: '1px solid rgba(226,232,240,.9)',
  display: 'grid',
  gap: 4,
};

const metaLabelStyle = {
  color: '#64748b',
  fontSize: 12,
  fontWeight: 700,
};

const metaValueStyle = {
  color: '#0f172a',
  fontSize: 13,
  fontWeight: 800,
  wordBreak: 'break-word',
};

const EntityHistoryModal = ({ isOpen, entityId, title = 'سجل النشاط', onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !entityId) return;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await activitiesService.getActivitiesByEntityId(entityId, 1, 20);
        setItems(response.items);
      } catch (requestError) {
        console.error('ENTITY HISTORY MODAL ERROR:', requestError);
        setError(requestError.message || 'فشل في تحميل سجل النشاط');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isOpen, entityId]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="app-modal-overlay"
      style={{ zIndex: 1200 }}
    >
      <div 
        className="app-modal-card"
        style={{ maxWidth: '900px' }}
        dir="rtl"
      >
        {/* Header */}
        <div className="app-modal-header">
          <div className="flex items-center gap-4">
            <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <FaHistory className="text-xl" />
            </div>
            <div>
              <h3 className="app-modal-title">{title}</h3>
              <p className="app-modal-subtitle">عرض التسلسل الزمني لجميع العمليات التي تمت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-modal-close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-2">
          {loading ? (
            <div style={stateBoxStyle}>
              <FaSpinner className="animate-spin text-3xl" />
              <p className="font-bold">جاري تحميل سجل النشاط...</p>
            </div>
          ) : error ? (
            <div style={{ ...stateBoxStyle, background: 'var(--error-light)', border: '1px solid var(--error)', color: 'var(--error)' }}>
              <FaExclamationTriangle className="text-3xl" />
              <p className="font-bold">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div style={stateBoxStyle}>
              <FaHistory className="text-3xl opacity-30" />
              <p className="font-bold">لا يوجد نشاط مسجل بعد لهذه الجهة.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item, index) => (
                <div key={item.id || index} style={itemCardStyle}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 style={itemTitleStyle}>{getActivityTitle(item, index)}</h4>
                      <div style={itemMetaStyle}>
                        <span>{formatActivityDate(item?.createdAt || item?.timestamp)}</span>
                      </div>
                    </div>
                    <span style={chipStyle}>{getActivityStatus(item)}</span>
                  </div>

                  {getActivityDescription(item) && (
                    <p style={itemDescriptionStyle}>{getActivityDescription(item)}</p>
                  )}

                  <div style={metaListStyle}>
                    {getActivityMeta(item).map(([label, value]) => (
                      <div key={label} style={metaRowStyle}>
                        <span style={metaLabelStyle}>{label}</span>
                        <span style={metaValueStyle}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntityHistoryModal;
