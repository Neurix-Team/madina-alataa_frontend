import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaAward,
  FaCheck,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaMedal,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaStar,
  FaTimes,
  FaTrash,
  FaTrophy,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { badgesService } from '../../services/badgesService';

const initialFormState = {
  name: '',
  description: '',
  requirement: '',
  category: '',
};

const getCategoryOptions = (t) => [
  { value: 'trophy', label: t('badges.categories.trophy') },
  { value: 'award', label: t('badges.categories.award') },
  { value: 'medal', label: t('badges.categories.medal') },
  { value: 'star', label: t('badges.categories.star') },
];

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
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-lg)',
  padding: '24px',
};

function extractBadgesPayload(payload) {
  const root =
    payload?.value && typeof payload.value === 'object' && !Array.isArray(payload.value)
      ? payload.value
      : payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
        ? payload.data
        : payload?.result && typeof payload.result === 'object' && !Array.isArray(payload.result)
          ? payload.result
          : payload;

  const total =
    root?.totalCount ??
    root?.TotalCount ??
    root?.total ??
    root?.Total ??
    root?.count ??
    root?.Count ??
    root?.totalItems ??
    root?.TotalItems ??
    0;

  const items = Array.isArray(root?.items)
    ? root.items
    : Array.isArray(root?.Items)
      ? root.Items
      : Array.isArray(root?.data)
        ? root.data
        : Array.isArray(root?.Data)
          ? root.Data
          : Array.isArray(root?.result)
            ? root.result
            : Array.isArray(root?.Result)
              ? root.Result
              : Array.isArray(root)
                ? root
                : [];

  return {
    items: items.map(normalizeBadgeRecord),
    totalCount: Number(total) || items.length,
  };
}

function normalizeBadgeRecord(badge) {
  if (!badge || typeof badge !== 'object') return badge;

  return {
    ...badge,
    id: badge.id ?? badge.Id ?? badge.badgeId ?? badge.BadgeId ?? badge.guid ?? badge.Guid ?? badge.badgeGuid ?? badge.BadgeGuid ?? '',
    badgeId: badge.badgeId ?? badge.BadgeId ?? badge.id ?? badge.Id ?? '',
    guid: badge.guid ?? badge.Guid ?? badge.badgeGuid ?? badge.BadgeGuid ?? '',
    name: badge.name ?? badge.Name ?? '',
    description: badge.description ?? badge.Description ?? '',
    requirement: badge.requirement ?? badge.Requirement ?? '',
    category: badge.category ?? badge.Category ?? '',
  };
}

function getBadgeId(badge) {
  return badge?.id || badge?.badgeId || badge?.guid || badge?.badgeGuid || '';
}

function getBadgeIcon(category) {
  switch (String(category || '').toLowerCase()) {
    case 'trophy':
    case 'كأس':
      return <FaTrophy />;
    case 'award':
    case 'جائزة':
      return <FaAward />;
    case 'star':
    case 'نجمة':
      return <FaStar />;
    case 'medal':
    case 'ميدالية':
    default:
      return <FaMedal />;
  }
}

function normalizeBadgeDetails(payload) {
  if (!payload) return null;

  const root =
    payload?.value && typeof payload.value === 'object' && !Array.isArray(payload.value)
      ? payload.value
      : payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
        ? payload.data
        : payload?.result && typeof payload.result === 'object' && !Array.isArray(payload.result)
          ? payload.result
          : payload;

  return normalizeBadgeRecord(root);
}

function BadgeModal({ title, onClose, children, maxWidth = '680px' }) {
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

function BadgeForm({
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
  const { t } = useTranslation();
  const categoryOptions = getCategoryOptions(t);

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <label style={{ display: 'grid', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
          <span>{t('badges.form.name')}</span>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => onChange('name', event.target.value)}
            required
            placeholder={t('badges.form.name_placeholder')}
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
          <span>{t('badges.form.description')}</span>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(event) => onChange('description', event.target.value)}
            required
            placeholder={t('badges.form.description_placeholder')}
            style={textareaStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
          <span>{t('badges.form.requirement')}</span>
          <textarea
            rows={3}
            value={formData.requirement}
            onChange={(event) => onChange('requirement', event.target.value)}
            required
            placeholder={t('badges.form.requirement_placeholder')}
            style={textareaStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
          <span>{t('badges.form.category')}</span>
          <select
            value={formData.category}
            onChange={(event) => onChange('category', event.target.value)}
            required
            style={inputStyle}
          >
            <option value="">{t('badges.form.category_select')}</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
          {t('common.cancel')}
        </button>
        <button type="submit" disabled={submitting} style={primaryButtonStyle}>
          {submitting ? <FaSpinner className="animate-spin" /> : null}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}

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

export default function BadgesTab() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = useMemo(
    () => (user?.roles || []).some((role) => String(role).toLowerCase() === 'admin'),
    [user]
  );

  const [badges, setBadges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadBadges = async (targetPage = pageNumber) => {
    setLoading(true);
    setError('');

    try {
      const payload = await badgesService.getBadges({
        pageNumber: targetPage,
        pageSize,
      });
      console.log('BADGES LIST RESPONSE:', payload);

      const normalized = extractBadgesPayload(payload);
      setBadges(normalized.items);
      setTotalCount(normalized.totalCount);
    } catch (requestError) {
      console.error('BADGES LIST ERROR:', requestError);
      setError(t('badges.error_loading', { defaultValue: 'فشل في تحميل الأوسمة. حاول مرة أخرى.' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges(pageNumber);
  }, [pageNumber]);

  const resetSubmitState = () => {
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleFormChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    resetSubmitState();
    setCreateOpen(true);
  };

  const handleOpenEdit = (badge) => {
    setSelectedBadge(badge);
    setFormData({
      name: badge?.name || '',
      description: badge?.description || '',
      requirement: badge?.requirement || '',
      category: badge?.category || '',
    });
    resetSubmitState();
    setEditOpen(true);
  };

  const handleOpenDelete = (badge) => {
    setSelectedBadge(badge);
    setDeleteError('');
    setDeleteOpen(true);
  };

  const handleViewDetails = async (badge) => {
    const badgeId = getBadgeId(badge);
    if (!badgeId) return;

    setSelectedBadge(badge);
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError('');

    try {
      const payload = await badgesService.getBadgeById(badgeId);
      console.log('BADGE DETAILS RESPONSE:', payload);
      setSelectedBadge(normalizeBadgeDetails(payload));
    } catch (requestError) {
      console.error('BADGE DETAILS ERROR:', requestError);
      setDetailsError('فشل في تحميل تفاصيل الوسام.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateBadge = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    resetSubmitState();

    try {
      const payload = { ...formData };
      console.log('CREATE BADGE REQUEST:', payload);
      const response = await badgesService.createBadge(payload);
      console.log('CREATE BADGE RESPONSE:', response);
      setSubmitSuccess('تمت إضافة الوسام وحفظه في قاعدة البيانات.');
      await loadBadges(1);
      setPageNumber(1);
      setFormData(initialFormState);
      setTimeout(() => {
        setCreateOpen(false);
        resetSubmitState();
      }, 700);
    } catch (requestError) {
      console.error('CREATE BADGE ERROR:', requestError);
      setSubmitError('فشل في إضافة الوسام.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBadge = async (event) => {
    event.preventDefault();
    const badgeId = getBadgeId(selectedBadge);
    if (!badgeId) return;

    setSubmitting(true);
    resetSubmitState();

    try {
      const payload = { ...formData };
      console.log('UPDATE BADGE REQUEST:', { badgeId, ...payload });
      const response = await badgesService.updateBadge(badgeId, payload);
      console.log('UPDATE BADGE RESPONSE:', response);
      setSubmitSuccess('تم حفظ تعديلات الوسام في قاعدة البيانات.');
      await loadBadges(pageNumber);
      setTimeout(() => {
        setEditOpen(false);
        resetSubmitState();
      }, 700);
    } catch (requestError) {
      console.error('UPDATE BADGE ERROR:', requestError);
      setSubmitError('فشل في تعديل الوسام.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBadge = async () => {
    const badgeId = getBadgeId(selectedBadge);
    if (!badgeId) return;

    setDeleting(true);
    setDeleteError('');

    try {
      console.log('DELETE BADGE REQUEST:', badgeId);
      const response = await badgesService.deleteBadge(badgeId);
      console.log('DELETE BADGE RESPONSE:', response);
      setDeleteOpen(false);
      setSelectedBadge(null);

      const hasOneItemOnPage = badges.length === 1 && pageNumber > 1;
      const nextPage = hasOneItemOnPage ? pageNumber - 1 : pageNumber;
      if (nextPage !== pageNumber) {
        setPageNumber(nextPage);
      } else {
        await loadBadges(nextPage);
      }
    } catch (requestError) {
      console.error('DELETE BADGE ERROR:', requestError);
      setDeleteError('فشل في حذف الوسام.');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const filteredBadges = badges.filter(badge => 
    badge.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.requirement?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="badges-tab" style={{ background: 'transparent' }}>
      <div className="badges-tab__container" style={{ padding: isMobile ? '12px' : '24px', maxWidth: '1240px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: isMobile ? '16px' : '24px',
            borderRadius: '28px',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            padding: isMobile ? '20px' : '28px',
            display: 'flex',
            gap: isMobile ? '12px' : '18px',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '16px', 
            alignItems: 'center',
            textAlign: isMobile ? 'center' : 'right',
            width: isMobile ? '100%' : 'auto'
          }}>
            <div
              style={{
                width: isMobile ? '52px' : '64px',
                height: isMobile ? '52px' : '64px',
                borderRadius: isMobile ? '14px' : '20px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '22px' : '28px',
              }}
            >
              <FaTrophy />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '28px', fontWeight: 900, color: 'var(--text-primary)' }}>الأوسمة والشارات</h2>
              <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontWeight: 700, fontSize: isMobile ? '12px' : '14px' }}>
                إدارة الأوسمة والجوائز التي يحصل عليها المتطوعون بناءً على نشاطهم.
              </p>
            </div>
          </div>

          {isAdmin ? (
            <button type="button" onClick={handleOpenCreate} className="app-btn-primary" style={{ width: isMobile ? '100%' : 'auto' }}>
              <FaPlus />
              <span>إضافة وسام جديد</span>
            </button>
          ) : null}
        </motion.div>

        {/* Search Section */}
        <div className="pro-section" style={{ marginBottom: 0 }}>
          <div className="pro-input-group" style={{ maxWidth: isMobile ? '100%' : '500px' }}>
            <FaSearch className="pro-input-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث باسم الوسام أو المتطلبات..."
              className="pro-input with-icon"
              style={{ fontSize: isMobile ? '13px' : '14px' }}
            />
          </div>
        </div>

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
            minHeight: isMobile ? '200px' : '260px',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FaSpinner className="animate-spin" size={isMobile ? 24 : 28} color="#0f766e" />
            <p style={{ margin: '14px 0 0 0', fontSize: isMobile ? '12px' : '14px' }}>جاري تحميل الأوسمة...</p>
          </div>
        </div>
      ) : badges.length === 0 ? (
        <div
          style={{
            borderRadius: '24px',
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            minHeight: isMobile ? '200px' : '260px',
            display: 'grid', 
            placeItems: 'center',
            textAlign: 'center',
            color: 'var(--text-muted)',
            padding: isMobile ? '20px' : '24px',
          }}
        >
          <div>
            <FaTrophy size={isMobile ? 36 : 42} />
            <h3 style={{ color: 'var(--text)', marginBottom: '8px', fontSize: isMobile ? 16 : 18 }}>لا توجد أوسمة حالياً</h3>
            <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px' }}>
              {isAdmin ? 'ابدأ بإضافة وسام جديد.' : 'سيتم عرض الأوسمة هنا بعد إضافتها.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: isMobile ? '16px' : '18px',
            }}
          >
            {filteredBadges.map((badge, index) => (
              <motion.div
                key={getBadgeId(badge) || index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                style={{
                  borderRadius: isMobile ? '20px' : '24px',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur)',
                  border: '1px solid var(--glass-border)',
                  padding: isMobile ? '16px' : '20px',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        flexShrink: 0,
                      }}
                    >
                      {getBadgeIcon(badge.category)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '18px', fontWeight: 800 }}>
                        {badge.name || 'وسام بدون اسم'}
                      </h3>
                      {badge.category ? (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            borderRadius: '999px',
                            padding: '6px 10px',
                            background: 'var(--bg-card-2)',
                            color: 'var(--success)',
                            fontSize: '12px',
                            fontWeight: 800,
                          }}
                        >
                          {badge.category}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => handleViewDetails(badge)}
                        style={iconButtonStyle}
                        title="تفاصيل"
                      >
                        <FaEye />
                      </button>
                    ) : null}
                    {isAdmin ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(badge)}
                          style={iconButtonStyle}
                          title="تعديل"
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(badge)}
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
                  {badge.description || 'لا يوجد وصف لهذا الوسام.'}
                </p>

                {badge.requirement ? (
                  <div
                    style={{
                      marginTop: '16px',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      background: 'var(--bg-card-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 800 }}>
                      المتطلبات
                    </div>
                    <div style={{ color: 'var(--text)', marginTop: '6px', lineHeight: 1.7 }}>
                      {badge.requirement}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>

          {totalPages > 1 ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
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
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
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
          <BadgeModal title="إضافة شارة" onClose={() => !submitting && setCreateOpen(false)} maxWidth={isMobile ? '100%' : '680px'}>
            <BadgeForm
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleCreateBadge}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={Boolean(submitSuccess)}
              submitLabel={submitting ? 'جاري الإضافة...' : 'حفظ الشارة'}
              successMessage={submitSuccess}
              onCancel={() => setCreateOpen(false)}
            />
          </BadgeModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editOpen ? (
          <BadgeModal title="تعديل الوسام" onClose={() => !submitting && setEditOpen(false)} maxWidth={isMobile ? '100%' : '680px'}>
            <BadgeForm
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleUpdateBadge}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={Boolean(submitSuccess)}
              submitLabel={submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              successMessage={submitSuccess}
              onCancel={() => setEditOpen(false)}
            />
          </BadgeModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {detailsOpen ? (
          <BadgeModal title="تفاصيل الوسام" onClose={() => setDetailsOpen(false)} maxWidth={isMobile ? '100%' : '760px'}>
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
            ) : selectedBadge ? (
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
                      background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                    }}
                  >
                    {getBadgeIcon(selectedBadge.category)}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '24px', fontWeight: 900 }}>
                      {selectedBadge.name || 'وسام'}
                    </h2>
                    <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {selectedBadge.category || 'بدون فئة'}
                    </div>
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>الوصف</div>
                  <div style={{ marginTop: '8px', color: 'var(--text)', lineHeight: 1.8 }}>
                    {selectedBadge.description || 'لا يوجد وصف.'}
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>
                    المتطلبات
                  </div>
                  <div style={{ marginTop: '8px', color: 'var(--text)', lineHeight: 1.8 }}>
                    {selectedBadge.requirement || 'لا توجد متطلبات.'}
                  </div>
                </div>
              </div>
            ) : null}
          </BadgeModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteOpen ? (
          <BadgeModal title="تأكيد حذف الوسام" onClose={() => !deleting && setDeleteOpen(false)} maxWidth={isMobile ? '100%' : '480px'}>
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
                هل أنت متأكد من حذف الوسام
                {' "'}
                {selectedBadge?.name || 'هذا الوسام'}
                {'"؟'}
              </p>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                سيتم حذف الوسام من قاعدة البيانات.
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
                onClick={handleDeleteBadge}
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
          </BadgeModal>
        ) : null}
      </AnimatePresence>
    </div>
    </div>
  );
}
