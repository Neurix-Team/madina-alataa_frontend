import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheck,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaLayerGroup,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import {
  levelsService,
  normalizeLevelDetailsResponse,
} from '../../services/levelsService';

const initialFormState = {
  number: '',
  maxXp: '',
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
  maxWidth: '640px',
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

const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: 'none',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
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

const DELETED_LEVEL_IDS_STORAGE_KEY = 'deleted_level_ids';

function getLevelId(level) {
  return level?.id || level?.Id || level?.levelId || level?.LevelId || level?.guid || level?.Guid || '';
}

function normalizeLevel(level) {
  if (!level || typeof level !== 'object') return level;

  return {
    ...level,
    id: getLevelId(level),
    number: level?.number ?? level?.Number ?? 0,
    maxXp: level?.maxXp ?? level?.MaxXp ?? 0,
    createdAt: level?.createdAt ?? level?.CreatedAt ?? null,
    updatedAt: level?.updatedAt ?? level?.UpdatedAt ?? null,
  };
}

function getDeletedLevelIds() {
  try {
    const raw = localStorage.getItem(DELETED_LEVEL_IDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to read deleted level ids from localStorage', error);
    return [];
  }
}

function storeDeletedLevelId(levelId) {
  if (!levelId) return;

  try {
    const nextIds = Array.from(new Set([...getDeletedLevelIds(), String(levelId)]));
    localStorage.setItem(DELETED_LEVEL_IDS_STORAGE_KEY, JSON.stringify(nextIds));
  } catch (error) {
    console.warn('Failed to store deleted level id in localStorage', error);
  }
}

function LevelModal({ title, onClose, children, maxWidth = '640px' }) {
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

function LevelForm({
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
          <span>رقم المستوى</span>
          <input
            type="number"
            min="1"
            value={formData.number}
            onChange={(event) => onChange('number', event.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
          <span>الحد الأقصى XP</span>
          <input
            type="number"
            min="0"
            value={formData.maxXp}
            onChange={(event) => onChange('maxXp', event.target.value)}
            required
            style={inputStyle}
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

export default function LevelsTab() {
  const { user } = useAuth();
  const isAdmin = useMemo(
    () => (user?.roles || []).some((role) => String(role).toLowerCase() === 'admin'),
    [user]
  );

  const [levels, setLevels] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadLevels = async (targetPage = pageNumber) => {
    setLoading(true);
    setError('');

    try {
      const payload = await levelsService.getLevels({
        pageNumber: targetPage,
        pageSize,
      });
      const deletedLevelIds = new Set(getDeletedLevelIds());
      const filteredItems = payload.items
        .map(normalizeLevel)
        .filter((level) => !deletedLevelIds.has(String(getLevelId(level))));

      console.log('LEVELS LIST ITEMS:', filteredItems);
      setLevels(filteredItems);
      setTotalCount(
        Math.max(0, Number(payload.totalCount || 0) - (payload.items.length - filteredItems.length))
      );
    } catch (requestError) {
      console.error('LEVELS LIST ERROR:', requestError);
      setError('فشل في تحميل المستويات. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevels(pageNumber);
  }, [pageNumber]);

  const resetSubmitState = () => {
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleFormChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const buildPayload = () => ({
    number: Number(formData.number) || 0,
    maxXp: Number(formData.maxXp) || 0,
  });

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    resetSubmitState();
    setCreateOpen(true);
  };

  const handleOpenEdit = (level) => {
    const normalized = normalizeLevel(level);
    setSelectedLevel(normalized);
    setFormData({
      number: String(normalized.number ?? ''),
      maxXp: String(normalized.maxXp ?? ''),
    });
    resetSubmitState();
    setEditOpen(true);
  };

  const handleOpenDelete = (level) => {
    setSelectedLevel(normalizeLevel(level));
    setDeleteError('');
    setDeleteOpen(true);
  };

  const handleViewDetails = async (level) => {
    const levelId = getLevelId(level);
    if (!levelId) return;

    setSelectedLevel(normalizeLevel(level));
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError('');

    try {
      const payload = await levelsService.getLevelById(levelId);
      const normalized = normalizeLevel(normalizeLevelDetailsResponse(payload));
      console.log('LEVEL DETAILS ITEM:', normalized);
      setSelectedLevel(normalized);
    } catch (requestError) {
      console.error('LEVEL DETAILS ERROR:', requestError);
      setDetailsError('فشل في تحميل تفاصيل المستوى.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateLevel = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    resetSubmitState();

    try {
      const payload = buildPayload();
      console.log('CREATE LEVEL REQUEST:', payload);
      await levelsService.createLevel(payload);
      setSubmitSuccess('تمت إضافة المستوى وحفظه في قاعدة البيانات.');
      await loadLevels(1);
      setPageNumber(1);
      setFormData(initialFormState);
      setTimeout(() => {
        setCreateOpen(false);
        resetSubmitState();
      }, 700);
    } catch (requestError) {
      console.error('CREATE LEVEL ERROR:', requestError);
      setSubmitError('فشل في إضافة المستوى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLevel = async (event) => {
    event.preventDefault();
    const levelId = getLevelId(selectedLevel);
    if (!levelId) return;

    setSubmitting(true);
    resetSubmitState();

    try {
      const payload = buildPayload();
      console.log('UPDATE LEVEL REQUEST:', { levelId, ...payload });
      await levelsService.updateLevel(levelId, payload);
      setSubmitSuccess('تم حفظ تعديلات المستوى في قاعدة البيانات.');
      await loadLevels(pageNumber);
      setTimeout(() => {
        setEditOpen(false);
        resetSubmitState();
      }, 700);
    } catch (requestError) {
      console.error('UPDATE LEVEL ERROR:', requestError);
      setSubmitError('فشل في تعديل المستوى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLevel = async () => {
    const levelId = getLevelId(selectedLevel);
    if (!levelId) return;

    setDeleting(true);
    setDeleteError('');

    try {
      console.log('DELETE LEVEL REQUEST:', levelId);
      await levelsService.deleteLevel(levelId);
      storeDeletedLevelId(levelId);
      setDeleteOpen(false);
      setSelectedLevel(null);

      const hasOneItemOnPage = levels.length === 1 && pageNumber > 1;
      const nextPage = hasOneItemOnPage ? pageNumber - 1 : pageNumber;
      if (nextPage !== pageNumber) {
        setPageNumber(nextPage);
      } else {
        await loadLevels(nextPage);
      }
    } catch (requestError) {
      console.error('DELETE LEVEL ERROR:', requestError);
      setDeleteError('فشل في حذف المستوى.');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '24px',
          borderRadius: '28px',
          background:
            'radial-gradient(circle at top right, rgba(45, 212, 191, 0.28), transparent 30%), linear-gradient(135deg, #0f172a, #1f2937)',
          color: '#fff',
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
              background: 'rgba(255,255,255,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            <FaLayerGroup />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>المستويات</h2>
            <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.78)', fontWeight: 700 }}>
              عرض مستويات النظام لكل المستخدمين، مع إدارة كاملة للأدمن فقط.
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button type="button" onClick={handleOpenCreate} style={primaryButtonStyle}>
            <FaPlus />
            <span>إضافة مستوى</span>
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
            <FaSpinner className="animate-spin" size={28} color="#0f766e" />
            <p style={{ margin: '14px 0 0 0' }}>جاري تحميل المستويات...</p>
          </div>
        </div>
      ) : levels.length === 0 ? (
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
            <FaLayerGroup size={42} />
            <h3 style={{ color: 'var(--text)', marginBottom: '8px' }}>لا توجد مستويات حالياً</h3>
            <p style={{ margin: 0 }}>
              {isAdmin ? 'ابدأ بإضافة مستوى جديد.' : 'سيتم عرض المستويات هنا بعد إضافتها.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
            }}
          >
            {levels.map((level, index) => (
              <motion.div
                key={getLevelId(level) || `${level.number}-${index}`}
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
                        background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        flexShrink: 0,
                      }}
                    >
                      <FaLayerGroup />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '18px', fontWeight: 800 }}>
                        المستوى {level.number || 0}
                      </h3>
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '8px',
                          borderRadius: '999px',
                          padding: '6px 10px',
                          background: 'rgba(15, 118, 110, 0.08)',
                          color: '#0f766e',
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        {Number(level.maxXp || 0).toLocaleString('en-US')} XP
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleViewDetails(level)}
                      style={iconButtonStyle}
                      title="تفاصيل"
                    >
                      <FaEye />
                    </button>
                    {isAdmin ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(level)}
                          style={iconButtonStyle}
                          title="تعديل"
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(level)}
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

                <div
                  style={{
                    marginTop: '16px',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    background: 'var(--background)',
                    display: 'grid',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>رقم المستوى</span>
                    <span style={{ color: 'var(--text)', fontWeight: 800 }}>{level.number || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>الحد الأقصى XP</span>
                    <span style={{ color: 'var(--text)', fontWeight: 800 }}>
                      {Number(level.maxXp || 0).toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
                disabled={pageNumber === 1}
                style={secondaryButtonStyle}
              >
                السابق
              </button>
              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontWeight: 800,
                }}
              >
                صفحة {pageNumber} من {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setPageNumber((current) => Math.min(totalPages, current + 1))}
                disabled={pageNumber === totalPages}
                style={secondaryButtonStyle}
              >
                التالي
              </button>
            </div>
          ) : null}
        </>
      )}

      <AnimatePresence>
        {createOpen ? (
          <LevelModal title="إضافة مستوى" onClose={() => !submitting && setCreateOpen(false)}>
            <LevelForm
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleCreateLevel}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={Boolean(submitSuccess)}
              submitLabel={submitting ? 'جاري الإضافة...' : 'حفظ المستوى'}
              successMessage={submitSuccess}
              onCancel={() => setCreateOpen(false)}
            />
          </LevelModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editOpen ? (
          <LevelModal title="تعديل المستوى" onClose={() => !submitting && setEditOpen(false)}>
            <LevelForm
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleUpdateLevel}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={Boolean(submitSuccess)}
              submitLabel={submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              successMessage={submitSuccess}
              onCancel={() => setEditOpen(false)}
            />
          </LevelModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {detailsOpen ? (
          <LevelModal title="تفاصيل المستوى" onClose={() => setDetailsOpen(false)} maxWidth="760px">
            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                <FaSpinner className="animate-spin" size={28} color="#0f766e" />
                <p style={{ margin: '14px 0 0 0' }}>جاري تحميل التفاصيل...</p>
              </div>
            ) : detailsError ? (
              <div style={{ ...errorBoxStyle, marginTop: 0 }}>
                <FaExclamationTriangle />
                <span>{detailsError}</span>
              </div>
            ) : selectedLevel ? (
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
                      background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                    }}
                  >
                    <FaLayerGroup />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '24px', fontWeight: 900 }}>
                      المستوى {selectedLevel.number || 0}
                    </h2>
                    <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {Number(selectedLevel.maxXp || 0).toLocaleString('en-US')} XP
                    </div>
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>معرف المستوى</div>
                  <div
                    style={{
                      marginTop: '8px',
                      color: 'var(--text)',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {getLevelId(selectedLevel) || 'غير متوفر'}
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>رقم المستوى</div>
                  <div style={{ marginTop: '8px', color: 'var(--text)', lineHeight: 1.8 }}>
                    {selectedLevel.number || 0}
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>الحد الأقصى XP</div>
                  <div style={{ marginTop: '8px', color: 'var(--text)', lineHeight: 1.8 }}>
                    {Number(selectedLevel.maxXp || 0).toLocaleString('en-US')}
                  </div>
                </div>
              </div>
            ) : null}
          </LevelModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteOpen ? (
          <LevelModal title="تأكيد حذف المستوى" onClose={() => !deleting && setDeleteOpen(false)} maxWidth="480px">
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
                هل أنت متأكد من حذف المستوى
                {' "'}
                {selectedLevel?.number || 0}
                {'"؟'}
              </p>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                سيتم حذف المستوى من قاعدة البيانات.
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
                onClick={handleDeleteLevel}
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
          </LevelModal>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
