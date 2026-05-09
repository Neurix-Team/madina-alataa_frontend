import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBolt,
  FaCheck,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import {
  activitiesService,
  normalizeActivityDetailsResponse,
} from '../../services/activitiesService';

const initialFormState = {
  name: '',
  description: '',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 1000,
};

const modalStyle = {
  width: '100%',
  maxWidth: '680px',
  maxHeight: '88vh',
  overflowY: 'auto',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '24px',
  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.18)',
  padding: '24px',
};

const inputStyle = {
  width: '100%',
  borderRadius: '14px',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text)',
  padding: '12px 14px',
  fontFamily: "'Cairo', sans-serif",
  fontSize: '14px',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
};

const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: 'none',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #ea580c, #fb923c)',
  color: '#fff',
  padding: '12px 18px',
  cursor: 'pointer',
  fontFamily: "'Cairo', sans-serif",
  fontWeight: 800,
};

const secondaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--background)',
  color: 'var(--text)',
  padding: '12px 18px',
  cursor: 'pointer',
  fontFamily: "'Cairo', sans-serif",
  fontWeight: 800,
};

const iconButtonStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const errorBoxStyle = {
  marginTop: '16px',
  borderRadius: '14px',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  background: 'rgba(239, 68, 68, 0.08)',
  color: '#dc2626',
  padding: '12px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const successBoxStyle = {
  marginTop: '16px',
  borderRadius: '14px',
  border: '1px solid rgba(16, 185, 129, 0.25)',
  background: 'rgba(16, 185, 129, 0.08)',
  color: '#059669',
  padding: '12px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

function getActivityId(activity) {
  return activity?.id || activity?.Id || activity?.activityId || activity?.ActivityId || activity?.guid || activity?.Guid || '';
}

function normalizeActivity(activity) {
  if (!activity || typeof activity !== 'object') return activity;

  return {
    ...activity,
    id: getActivityId(activity),
    name: activity?.name ?? activity?.Name ?? '',
    description: activity?.description ?? activity?.Description ?? '',
  };
}

function ActivityModal({ title, onClose, children, maxWidth = '680px' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={overlayStyle}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        style={{ ...modalStyle, maxWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '22px', fontWeight: 800 }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            <FaTimes />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ActivityForm({
  formData,
  onChange,
  onSubmit,
  submitting,
  submitError,
  submitSuccess,
  submitLabel,
  successMessage,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <label style={{ display: 'grid', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
          <span>اسم النشاط</span>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => onChange('name', event.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
          <span>الوصف</span>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(event) => onChange('description', event.target.value)}
            required
            style={textareaStyle}
          />
        </label>
      </div>

      {submitError ? (
        <div style={errorBoxStyle}>
          <FaExclamationTriangle />
          <span>{submitError}</span>
        </div>
      ) : null}

      {submitSuccess ? (
        <div style={successBoxStyle}>
          <FaCheck />
          <span>{successMessage}</span>
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button type="button" onClick={onCancel} disabled={submitting} style={secondaryButtonStyle}>
          إلغاء
        </button>
        <button type="submit" disabled={submitting} style={primaryButtonStyle}>
          {submitting ? <FaSpinner className="animate-spin" /> : null}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}

export default function ActivitiesTab() {
  const { user } = useAuth();
  const isAdmin = useMemo(
    () => (user?.roles || []).some((role) => String(role).toLowerCase() === 'admin'),
    [user]
  );

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadActivities = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await activitiesService.getActivities();
      const normalizedItems = payload.items.map(normalizeActivity);
      console.log('ACTIVITIES LIST ITEMS:', normalizedItems);
      setActivities(normalizedItems);
    } catch (requestError) {
      console.error('ACTIVITIES LIST ERROR:', requestError);
      setError('فشل في تحميل الأنشطة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const resetSubmitState = () => {
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleFormChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const buildPayload = () => ({
    name: String(formData.name || '').trim(),
    description: String(formData.description || '').trim(),
  });

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    resetSubmitState();
    setCreateOpen(true);
  };

  const handleOpenEdit = (activity) => {
    const normalized = normalizeActivity(activity);
    setSelectedActivity(normalized);
    setFormData({
      name: normalized.name || '',
      description: normalized.description || '',
    });
    resetSubmitState();
    setEditOpen(true);
  };

  const handleOpenDelete = (activity) => {
    setSelectedActivity(normalizeActivity(activity));
    setDeleteError('');
    setDeleteOpen(true);
  };

  const handleViewDetails = async (activity) => {
    const activityId = getActivityId(activity);
    if (!activityId) return;

    setSelectedActivity(normalizeActivity(activity));
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError('');

    try {
      const payload = await activitiesService.getActivityById(activityId);
      const normalized = normalizeActivity(normalizeActivityDetailsResponse(payload));
      console.log('ACTIVITY DETAILS ITEM:', normalized);
      setSelectedActivity(normalized);
    } catch (requestError) {
      console.error('ACTIVITY DETAILS ERROR:', requestError);
      setDetailsError('فشل في تحميل تفاصيل النشاط.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateActivity = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    resetSubmitState();

    try {
      const payload = buildPayload();
      console.log('CREATE ACTIVITY REQUEST:', payload);
      await activitiesService.createActivity(payload);
      setSubmitSuccess('تمت إضافة النشاط وحفظه في قاعدة البيانات.');
      await loadActivities();
      setFormData(initialFormState);
      setTimeout(() => {
        setCreateOpen(false);
        resetSubmitState();
      }, 700);
    } catch (requestError) {
      console.error('CREATE ACTIVITY ERROR:', requestError);
      setSubmitError('فشل في إضافة النشاط.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateActivity = async (event) => {
    event.preventDefault();
    const activityId = getActivityId(selectedActivity);
    if (!activityId) return;

    setSubmitting(true);
    resetSubmitState();

    try {
      const payload = buildPayload();
      console.log('UPDATE ACTIVITY REQUEST:', { activityId, ...payload });
      await activitiesService.updateActivity(activityId, payload);
      setSubmitSuccess('تم حفظ تعديلات النشاط في قاعدة البيانات.');
      await loadActivities();
      setTimeout(() => {
        setEditOpen(false);
        resetSubmitState();
      }, 700);
    } catch (requestError) {
      console.error('UPDATE ACTIVITY ERROR:', requestError);
      setSubmitError('فشل في تعديل النشاط.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async () => {
    const activityId = getActivityId(selectedActivity);
    if (!activityId) return;

    setDeleting(true);
    setDeleteError('');

    try {
      console.log('DELETE ACTIVITY REQUEST:', activityId);
      await activitiesService.deleteActivity(activityId);
      setDeleteOpen(false);
      setSelectedActivity(null);
      await loadActivities();
    } catch (requestError) {
      console.error('DELETE ACTIVITY ERROR:', requestError);
      setDeleteError('فشل في حذف النشاط.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto', background: 'transparent' }}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '24px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98))',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          boxShadow: '0 18px 42px rgba(15, 23, 42, 0.08)',
          padding: '28px',
          display: 'flex',
          gap: '18px',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ea580c, #fb923c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: '#fff',
            }}
          >
            <FaBolt />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>الأنشطة</h2>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontWeight: 700 }}>
              عرض الأنشطة والتفاصيل لكل المستخدمين، مع إدارة كاملة للأدمن فقط.
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button type="button" onClick={handleOpenCreate} style={primaryButtonStyle}>
            <FaPlus />
            <span>إضافة نشاط</span>
          </button>
        ) : null}
      </motion.div>

      {error ? (
        <div style={{ ...errorBoxStyle, marginTop: 0, marginBottom: '20px' }}>
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div
          style={{
            borderRadius: '24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            minHeight: '260px',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FaSpinner className="animate-spin" size={28} color="#ea580c" />
            <p style={{ margin: '14px 0 0 0' }}>جاري تحميل الأنشطة...</p>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div
          style={{
            borderRadius: '24px',
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            minHeight: '260px',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            color: 'var(--text-muted)',
            padding: '24px',
          }}
        >
          <div>
            <FaBolt size={42} />
            <h3 style={{ color: 'var(--text)', marginBottom: '8px' }}>لا توجد أنشطة حالياً</h3>
            <p style={{ margin: 0 }}>
              {isAdmin ? 'ابدأ بإضافة نشاط جديد.' : 'سيتم عرض الأنشطة هنا بعد إضافتها.'}
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px',
          }}
        >
          {activities.map((activity, index) => (
            <motion.div
              key={getActivityId(activity) || index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              style={{
                borderRadius: '24px',
                background: 'linear-gradient(180deg, var(--surface), rgba(255,255,255,0.96))',
                border: '1px solid var(--border)',
                padding: '20px',
                boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      flexShrink: 0,
                    }}
                  >
                    <FaBolt />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '18px', fontWeight: 800 }}>
                      {activity.name || 'نشاط بدون اسم'}
                    </h3>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleViewDetails(activity)}
                    style={iconButtonStyle}
                    title="تفاصيل"
                  >
                    <FaEye />
                  </button>
                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(activity)}
                        style={iconButtonStyle}
                        title="تعديل"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(activity)}
                        style={{
                          ...iconButtonStyle,
                          border: '1px solid rgba(239, 68, 68, 0.22)',
                          color: '#dc2626',
                          background: 'rgba(239, 68, 68, 0.08)',
                        }}
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              <p style={{ margin: '16px 0 0 0', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {activity.description || 'لا يوجد وصف لهذا النشاط.'}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {createOpen ? (
          <ActivityModal title="إضافة نشاط" onClose={() => !submitting && setCreateOpen(false)}>
            <ActivityForm
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleCreateActivity}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={Boolean(submitSuccess)}
              submitLabel={submitting ? 'جاري الإضافة...' : 'حفظ النشاط'}
              successMessage={submitSuccess}
              onCancel={() => setCreateOpen(false)}
            />
          </ActivityModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editOpen ? (
          <ActivityModal title="تعديل النشاط" onClose={() => !submitting && setEditOpen(false)}>
            <ActivityForm
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleUpdateActivity}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={Boolean(submitSuccess)}
              submitLabel={submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              successMessage={submitSuccess}
              onCancel={() => setEditOpen(false)}
            />
          </ActivityModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {detailsOpen ? (
          <ActivityModal title="تفاصيل النشاط" onClose={() => setDetailsOpen(false)} maxWidth="760px">
            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                <FaSpinner className="animate-spin" size={28} color="#ea580c" />
                <p style={{ margin: '14px 0 0 0' }}>جاري تحميل التفاصيل...</p>
              </div>
            ) : detailsError ? (
              <div style={{ ...errorBoxStyle, marginTop: 0 }}>
                <FaExclamationTriangle />
                <span>{detailsError}</span>
              </div>
            ) : selectedActivity ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    paddingBottom: '18px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '22px',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                    }}
                  >
                    <FaBolt />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '24px', fontWeight: 900 }}>
                      {selectedActivity.name || 'نشاط'}
                    </h2>
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>معرف النشاط</div>
                  <div
                    style={{
                      marginTop: '8px',
                      color: 'var(--text)',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {getActivityId(selectedActivity) || 'غير متوفر'}
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>الاسم</div>
                  <div style={{ marginTop: '8px', color: 'var(--text)', lineHeight: 1.8 }}>
                    {selectedActivity.name || 'غير متوفر'}
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>الوصف</div>
                  <div style={{ marginTop: '8px', color: 'var(--text)', lineHeight: 1.8 }}>
                    {selectedActivity.description || 'لا يوجد وصف.'}
                  </div>
                </div>
              </div>
            ) : null}
          </ActivityModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteOpen ? (
          <ActivityModal title="تأكيد حذف النشاط" onClose={() => !deleting && setDeleteOpen(false)} maxWidth="480px">
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  margin: '0 auto 18px',
                  borderRadius: '24px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                <FaTrash />
              </div>
              <p style={{ color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
                هل أنت متأكد من حذف النشاط
                {' "'}
                {selectedActivity?.name || 'هذا النشاط'}
                {'"؟'}
              </p>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                سيتم حذف النشاط من قاعدة البيانات.
              </p>
            </div>

            {deleteError ? (
              <div style={{ ...errorBoxStyle, marginBottom: '0' }}>
                <FaExclamationTriangle />
                <span>{deleteError}</span>
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                style={secondaryButtonStyle}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteActivity}
                disabled={deleting}
                style={{
                  ...primaryButtonStyle,
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                }}
              >
                {deleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                <span>{deleting ? 'جاري الحذف...' : 'تأكيد الحذف'}</span>
              </button>
            </div>
          </ActivityModal>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
