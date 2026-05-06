import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHistory, FaSpinner, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { activitiesService } from '../../services/activitiesService';

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
  item?.name ||
  item?.title ||
  item?.actionType ||
  item?.activityType ||
  item?.eventType ||
  `Activity #${index + 1}`;

const getActivityDescription = (item) =>
  item?.description ||
  item?.details ||
  item?.note ||
  item?.message ||
  item?.summary ||
  '';

const getActivityStatus = (item) => String(item?.status || item?.state || 'logged');

const getActivityMeta = (item) => {
  const pairs = [
    ['نوع العملية', item?.actionType || item?.activityType || item?.eventType],
    ['المستخدم', item?.userName || item?.actorName || item?.createdBy || item?.userId],
    ['الكيان', item?.entityType || item?.targetType],
    ['المعرّف', item?.id || item?.activityId],
  ];

  return pairs.filter(([, value]) => value !== undefined && value !== null && value !== '');
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
        setError(requestError.message || 'فشل في جلب سجل النشاط');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isOpen, entityId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={overlayStyle}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
          style={modalStyle}
        >
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconWrapStyle}>
                <FaHistory />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: 22, fontWeight: 900 }}>{title}</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                  سجل زمني منظم لكل العمليات المرتبطة بهذا العنصر
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} style={closeBtnStyle}>
              <FaTimes />
            </button>
          </div>

          {loading ? (
            <div style={stateBoxStyle}>
              <FaSpinner className="animate-spin" />
              <span>جاري تحميل السجل...</span>
            </div>
          ) : error ? (
            <div style={{ ...stateBoxStyle, color: '#dc2626', borderColor: 'rgba(239,68,68,.2)', background: 'rgba(254,242,242,.9)' }}>
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          ) : items.length === 0 ? (
            <div style={stateBoxStyle}>
              <span>لا يوجد سجل نشاط لهذا العنصر.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {items.map((item, index) => (
                <div key={item.id || index} style={itemCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div>
                      <div style={itemTitleStyle}>{getActivityTitle(item, index)}</div>
                      <div style={itemMetaStyle}>
                        {formatActivityDate(item.createdAt || item.timestamp || item.date || item.updatedAt)}
                      </div>
                    </div>
                    <span style={chipStyle}>{getActivityStatus(item)}</span>
                  </div>

                  {getActivityDescription(item) && (
                    <p style={itemDescriptionStyle}>{getActivityDescription(item)}</p>
                  )}

                  <div style={metaListStyle}>
                    {getActivityMeta(item).map(([label, value]) => (
                      <div key={`${item.id || index}-${label}`} style={metaRowStyle}>
                        <span style={metaLabelStyle}>{label}</span>
                        <strong style={metaValueStyle}>{String(value)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
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

export default EntityHistoryModal;
