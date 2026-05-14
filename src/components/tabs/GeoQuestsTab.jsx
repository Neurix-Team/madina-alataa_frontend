import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheck,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPlay,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { locationsService } from '../../services/locationsService';
import {
  geoQuestsService,
  getGeoQuestId,
  normalizeGeoQuest,
} from '../../services/geoQuestsService';
import UserGeoQuestsPanel from '../userGeoQuests/UserGeoQuestsPanel';

const initialFormState = {
  title: '',
  locationId: '',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 1000,
};

const modalStyle = {
  width: '100%',
  maxWidth: '860px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '28px',
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
  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
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
  borderRadius: '14px',
  border: '1px solid rgba(16, 185, 129, 0.25)',
  background: 'rgba(16, 185, 129, 0.08)',
  color: '#059669',
  padding: '12px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

function normalizeLocation(location) {
  if (!location || typeof location !== 'object') return location;

  const latitude = Number(
    location?.latitude ?? location?.Latitude ?? location?.lat ?? location?.Lat ?? 0
  );
  const longitude = Number(
    location?.longitude ?? location?.Longitude ?? location?.lng ?? location?.Lng ?? 0
  );

  return {
    ...location,
    id: location?.id || location?.Id || location?.locationId || location?.LocationId || '',
    name: location?.name ?? location?.Name ?? 'موقع بدون اسم',
    latitude,
    longitude,
  };
}

function formatApiError(error, fallbackMessage) {
  const apiData = error?.response?.data;

  if (apiData?.errors && typeof apiData.errors === 'object') {
    const messages = Object.values(apiData.errors).flat().filter(Boolean);
    if (messages.length > 0) {
      return messages.join(' | ');
    }
  }

  return (
    apiData?.message ||
    apiData?.title ||
    apiData?.detail ||
    apiData?.error ||
    error?.message ||
    fallbackMessage
  );
}

function GeoQuestModal({ title, onClose, children, maxWidth = '860px' }) {
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

function LocationMapSelector({
  locations,
  selectedLocationId,
  onSelect,
}) {
  const normalizedLocations = useMemo(
    () => locations.map(normalizeLocation).filter((location) => location?.id),
    [locations]
  );

  const validMapLocations = normalizedLocations.filter(
    (location) =>
      Number.isFinite(location.latitude) &&
      Number.isFinite(location.longitude) &&
      location.latitude !== 0 &&
      location.longitude !== 0
  );

  const selectedLocation =
    normalizedLocations.find((location) => String(location.id) === String(selectedLocationId)) || null;

  const latValues = validMapLocations.map((location) => location.latitude);
  const lngValues = validMapLocations.map((location) => location.longitude);

  const minLat = latValues.length ? Math.min(...latValues) : 0;
  const maxLat = latValues.length ? Math.max(...latValues) : 1;
  const minLng = lngValues.length ? Math.min(...lngValues) : 0;
  const maxLng = lngValues.length ? Math.max(...lngValues) : 1;

  const xFor = (lng) => {
    if (maxLng === minLng) return 180;
    return 28 + ((lng - minLng) / (maxLng - minLng)) * 304;
  };

  const yFor = (lat) => {
    if (maxLat === minLat) return 100;
    return 24 + ((maxLat - lat) / (maxLat - minLat)) * 152;
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div
        style={{
          borderRadius: '22px',
          border: '1px solid var(--border)',
          background:
            'radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 30%), linear-gradient(180deg, #eff6ff, #dbeafe)',
          padding: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#1d4ed8', fontWeight: 900 }}>اختيار الموقع من الخريطة</div>
            <div style={{ color: '#1e3a8a', fontSize: '13px', marginTop: '4px' }}>
              اضغط على أي نقطة لربط المهمة الجغرافية بموقع واضح.
            </div>
          </div>
          <div
            style={{
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.8)',
              padding: '8px 12px',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '13px',
            }}
          >
            {selectedLocation ? `المحدد: ${selectedLocation.name}` : 'اختر موقع المهمة'}
          </div>
        </div>

        <div
          style={{
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1px solid rgba(29, 78, 216, 0.12)',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          {validMapLocations.length > 0 ? (
            <svg viewBox="0 0 360 200" style={{ width: '100%', display: 'block' }}>
              <defs>
                <linearGradient id="geoQuestMapBg" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8fbff" />
                  <stop offset="100%" stopColor="#dbeafe" />
                </linearGradient>
              </defs>
              <rect width="360" height="200" fill="url(#geoQuestMapBg)" />
              <path
                d="M18 154 C74 128, 110 164, 166 136 S278 118, 342 148"
                fill="none"
                stroke="rgba(59,130,246,0.24)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M34 42 C94 84, 126 24, 186 66 S276 96, 326 48"
                fill="none"
                stroke="rgba(14,165,233,0.2)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {validMapLocations.map((location) => {
                const isSelected = String(location.id) === String(selectedLocationId);
                const x = xFor(location.longitude);
                const y = yFor(location.latitude);

                return (
                  <g
                    key={location.id}
                    onClick={() => onSelect(location)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 16 : 11}
                      fill={isSelected ? 'rgba(37,99,235,0.18)' : 'rgba(37,99,235,0.1)'}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 8 : 6}
                      fill={isSelected ? '#1d4ed8' : '#2563eb'}
                    />
                    <text
                      x={x}
                      y={y - 14}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {location.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div style={{ padding: '26px', textAlign: 'center', color: 'var(--text-muted)' }}>
              لا توجد إحداثيات صالحة لعرضها على الخريطة حالياً.
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
        }}
      >
        {normalizedLocations.map((location) => {
          const isSelected = String(location.id) === String(selectedLocationId);

          return (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelect(location)}
              style={{
                textAlign: 'right',
                borderRadius: '16px',
                border: isSelected ? '1px solid #2563eb' : '1px solid var(--border)',
                background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--background)',
                color: 'var(--text)',
                padding: '12px 14px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 800 }}>{location.name}</div>
              <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                {location.name || 'موقع غير مسمى'}
              </div>
              <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                lat: {location.latitude || 0}, lng: {location.longitude || 0}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GeoQuestForm({
  formData,
  onChange,
  onSelectLocation,
  locations,
  onSubmit,
  submitting,
  submitError,
  submitSuccess,
  submitLabel,
  successMessage,
  onCancel,
  locationsLoading,
}) {
  const selectedLocationName =
    locations
      .map(normalizeLocation)
      .find((location) => String(location.id) === String(formData.locationId))?.name ||
    (formData.locationId ? formData.title || 'موقع المهمة' : '');

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <label style={{ display: 'grid', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
          <span>عنوان المهمة</span>
          <input
            type="text"
            value={formData.title}
            onChange={(event) => onChange('title', event.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
          <span>الموقع المرتبط</span>
          <input
            type="text"
            value={selectedLocationName}
            readOnly
            required
            style={{ ...inputStyle, background: 'rgba(37,99,235,0.06)', color: 'var(--text)' }}
          />
        </label>

        {locationsLoading ? (
          <div style={{ ...successBoxStyle, color: '#1d4ed8', borderColor: 'rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.08)' }}>
            <FaSpinner className="animate-spin" />
            <span>جاري تحميل المواقع للخريطة...</span>
          </div>
        ) : (
          <LocationMapSelector
            locations={locations}
            selectedLocationId={formData.locationId}
            onSelect={onSelectLocation}
          />
        )}
      </div>

      {submitError ? (
        <div style={{ ...errorBoxStyle, marginTop: '16px' }}>
          <FaExclamationTriangle />
          <span>{submitError}</span>
        </div>
      ) : null}

      {submitSuccess ? (
        <div style={{ ...successBoxStyle, marginTop: '16px' }}>
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

export default function GeoQuestsTab() {
  const { user } = useAuth();
  const isAdmin = useMemo(
    () => (user?.roles || []).some((role) => String(role).toLowerCase() === 'admin'),
    [user]
  );

  const [geoQuests, setGeoQuests] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const locationNameById = useMemo(
    () =>
      locations.reduce((acc, location) => {
        if (location?.id) acc[String(location.id)] = location.name || 'موقع المهمة';
        return acc;
      }, {}),
    [locations]
  );

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [selectedGeoQuest, setSelectedGeoQuest] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [startingId, setStartingId] = useState('');
  const [startedQuestIds, setStartedQuestIds] = useState(() => new Set());
  const [refreshPanelKey, setRefreshPanelKey] = useState(0);

  const loadLocations = async () => {
    setLocationsLoading(true);

    try {
      const payload = await locationsService.getLocations();
      const normalized = payload.map(normalizeLocation);
      console.log('GEOQUEST LOCATIONS ITEMS:', normalized);
      setLocations(normalized);
    } catch (requestError) {
      console.error('GEOQUEST LOCATIONS ERROR:', requestError);
    } finally {
      setLocationsLoading(false);
    }
  };

  const loadGeoQuests = async (targetPage = pageNumber, targetSearch = searchTerm) => {
    setLoading(true);
    setError('');

    try {
      const payload = targetSearch.trim()
        ? await geoQuestsService.searchGeoQuests(targetSearch.trim(), targetPage, pageSize)
        : await geoQuestsService.getGeoQuests(targetPage, pageSize);

      console.log('GEOQUESTS PAGE ITEMS:', payload.items);
      setGeoQuests(payload.items.map(normalizeGeoQuest));
      setPageNumber(payload.pagination.currentPage || targetPage);
      setTotalPages(payload.pagination.totalPages || 1);
    } catch (requestError) {
      console.error('GEOQUESTS PAGE ERROR:', requestError);
      setError(formatApiError(requestError, 'فشل في تحميل المهام الجغرافية.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    loadGeoQuests(pageNumber, searchTerm);
  }, [pageNumber, searchTerm]);

  const resetSubmitState = () => {
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleFormChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSelectLocation = (location) => {
    setFormData((current) => ({ ...current, locationId: String(location?.id || '') }));
  };

  const getLocationDisplayName = (locationId) =>
    locationNameById[String(locationId || '')] || 'موقع المهمة';

  const handleOpenCreate = async () => {
    setFormData(initialFormState);
    resetSubmitState();
    setCreateOpen(true);

    if (locations.length === 0) {
      await loadLocations();
    }
  };

  const handleOpenEdit = async (geoQuest) => {
    const normalized = normalizeGeoQuest(geoQuest);
    setSelectedGeoQuest(normalized);
    setFormData({
      title: normalized.title || '',
      locationId: normalized.locationId || '',
    });
    resetSubmitState();
    setEditOpen(true);

    if (locations.length === 0) {
      await loadLocations();
    }
  };

  const handleOpenDelete = (geoQuest) => {
    setSelectedGeoQuest(normalizeGeoQuest(geoQuest));
    setDeleteError('');
    setDeleteOpen(true);
  };

  const handleViewDetails = async (geoQuest) => {
    const geoQuestId = getGeoQuestId(geoQuest);
    if (!geoQuestId) return;

    setSelectedGeoQuest(normalizeGeoQuest(geoQuest));
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError('');

    try {
      const payload = await geoQuestsService.getGeoQuestById(geoQuestId);
      console.log('GEOQUEST DETAILS PAGE ITEM:', payload);
      setSelectedGeoQuest(normalizeGeoQuest(payload));
    } catch (requestError) {
      console.error('GEOQUEST DETAILS PAGE ERROR:', requestError);
      setDetailsError(formatApiError(requestError, 'فشل في تحميل تفاصيل المهمة الجغرافية.'));
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateGeoQuest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    resetSubmitState();

    try {
      await geoQuestsService.createGeoQuest(formData);
      setSubmitSuccess('تمت إضافة المهمة الجغرافية وحفظها في قاعدة البيانات.');
      await loadGeoQuests(1, searchTerm);
      setPageNumber(1);
      setFormData(initialFormState);
      setTimeout(() => {
        setCreateOpen(false);
        resetSubmitState();
      }, 700);
    } catch (requestError) {
      console.error('CREATE GEOQUEST PAGE ERROR:', requestError);
      setSubmitError(formatApiError(requestError, 'فشل في إضافة المهمة الجغرافية.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGeoQuest = async (event) => {
    event.preventDefault();
    const geoQuestId = getGeoQuestId(selectedGeoQuest);
    if (!geoQuestId) return;

    setSubmitting(true);
    resetSubmitState();

    try {
      await geoQuestsService.updateGeoQuest(geoQuestId, formData);
      setSubmitSuccess('تم حفظ تعديلات المهمة الجغرافية في قاعدة البيانات.');
      await loadGeoQuests(pageNumber, searchTerm);
      setTimeout(() => {
        setEditOpen(false);
        resetSubmitState();
      }, 700);
    } catch (requestError) {
      console.error('UPDATE GEOQUEST PAGE ERROR:', requestError);
      setSubmitError(formatApiError(requestError, 'فشل في تعديل المهمة الجغرافية.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGeoQuest = async () => {
    const geoQuestId = getGeoQuestId(selectedGeoQuest);
    if (!geoQuestId) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await geoQuestsService.deleteGeoQuest(geoQuestId);
      setGeoQuests((current) =>
        current.filter((geoQuest) => String(getGeoQuestId(geoQuest)) !== String(geoQuestId))
      );
      setDeleteOpen(false);
      setSelectedGeoQuest(null);

      const hasOneItemOnPage = geoQuests.length === 1 && pageNumber > 1;
      const nextPage = hasOneItemOnPage ? pageNumber - 1 : pageNumber;

      if (nextPage !== pageNumber) {
        setPageNumber(nextPage);
      } else {
        await loadGeoQuests(nextPage, searchTerm);
      }
    } catch (requestError) {
      console.error('DELETE GEOQUEST PAGE ERROR:', requestError);
      setDeleteError(formatApiError(requestError, 'فشل في حذف المهمة الجغرافية.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleStartGeoQuest = async (geoQuest) => {
    const geoQuestId = getGeoQuestId(geoQuest);
    if (!geoQuestId) return;

    setStartingId(geoQuestId);

    try {
      const response = await geoQuestsService.startGeoQuest(geoQuestId);
      console.log('GEOQUEST START RESPONSE IN PAGE:', response);
      setStartedQuestIds((current) => new Set([...current, String(geoQuestId)]));
      setRefreshPanelKey((prev) => prev + 1);
      window.alert('Started successfully');
    } catch (requestError) {
      if (requestError?.response?.status === 409) {
        console.warn('GEOQUEST ALREADY STARTED:', requestError?.response?.data);
        setStartedQuestIds((current) => new Set([...current, String(geoQuestId)]));
        window.alert('Started successfully');
        return;
      }
      console.error('GEOQUEST START PAGE ERROR:', requestError);
      setError(formatApiError(requestError, 'فشل في بدء المهمة الجغرافية.'));
    } finally {
      setStartingId('');
    }
  };

  return (
    <div className="geo-quests-tab" style={{ background: 'transparent' }}>
      <div className="geo-quests-tab__container" style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '24px',
            borderRadius: '28px',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)',
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
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
            >
              <FaMapMarkedAlt />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>المهام الجغرافية</h2>
              <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontWeight: 700 }}>
                عرض المهام المرتبطة بمواقع جغرافية محددة وإدارتها بشكل كامل.
              </p>
            </div>
          </div>

          {isAdmin ? (
            <button type="button" onClick={handleOpenCreate} className="app-btn-primary">
              <FaPlus />
              <span>إضافة مهمة جغرافية</span>
            </button>
          ) : null}
        </motion.div>

        {/* Search Section */}
        <div className="pro-section" style={{ marginBottom: 0 }}>
          <div className="pro-input-group" style={{ maxWidth: '500px' }}>
            <FaSearch className="pro-input-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث باسم المهمة أو الموقع..."
              className="pro-input with-icon"
            />
          </div>
        </div>

      {error ? (
        <div style={{ ...errorBoxStyle, marginBottom: '20px' }}>
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
            <FaSpinner className="animate-spin" size={28} color="#2563eb" />
            <p style={{ margin: '14px 0 0 0' }}>جاري تحميل المهام الجغرافية...</p>
          </div>
        </div>
      ) : geoQuests.length === 0 ? (
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
            <FaMapMarkedAlt size={42} />
            <h3 style={{ color: 'var(--text)', marginBottom: '8px' }}>لا توجد مهام جغرافية حالياً</h3>
            <p style={{ margin: 0 }}>
              {isAdmin ? 'ابدأ بإضافة مهمة جديدة.' : 'سيتم عرض المهام هنا عند توفرها.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '18px',
            }}
          >
            {geoQuests.map((geoQuest, index) => (
              <motion.div
                key={getGeoQuestId(geoQuest) || index}
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
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        flexShrink: 0,
                      }}
                    >
                      <FaMapMarkerAlt />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '18px', fontWeight: 800 }}>
                        {geoQuest.title || 'مهمة بدون عنوان'}
                      </h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleViewDetails(geoQuest)}
                      style={iconButtonStyle}
                      title="تفاصيل"
                    >
                      <FaEye />
                    </button>
                    {isAdmin ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(geoQuest)}
                          style={iconButtonStyle}
                          title="تعديل"
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(geoQuest)}
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
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>العنوان</span>
                    <span style={{ color: 'var(--text)', fontWeight: 800 }}>{geoQuest.title || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>الموقع</span>
                    <span style={{ color: 'var(--text)', fontWeight: 800 }}>{getLocationDisplayName(geoQuest.locationId)}</span>
                  </div>
                </div>

                {!isAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleStartGeoQuest(geoQuest)}
                    disabled={
                      startingId === getGeoQuestId(geoQuest) ||
                      startedQuestIds.has(String(getGeoQuestId(geoQuest)))
                    }
                    style={{
                      ...primaryButtonStyle,
                      marginTop: '16px',
                      width: '100%',
                      background: startedQuestIds.has(String(getGeoQuestId(geoQuest)))
                        ? 'linear-gradient(135deg, #64748b, #475569)'
                        : 'linear-gradient(135deg, #059669, #10b981)',
                    }}
                  >
                    {startingId === getGeoQuestId(geoQuest) ? (
                      <FaSpinner className="animate-spin" />
                    ) : startedQuestIds.has(String(getGeoQuestId(geoQuest))) ? (
                      <FaCheck />
                    ) : (
                      <FaPlay />
                    )}
                    <span>
                      {startingId === getGeoQuestId(geoQuest)
                        ? 'جاري البدء...'
                        : startedQuestIds.has(String(getGeoQuestId(geoQuest)))
                          ? 'Started'
                          : 'بدء المهمة'}
                    </span>
                  </button>
                ) : null}
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

       {!isAdmin && (
      <div style={{ marginTop: '40px' }}>
        <UserGeoQuestsPanel
          key={refreshPanelKey}
          mode={isAdmin ? 'admin' : 'profile'}
          isAdmin={isAdmin}
          targetUser={user}
          title={isAdmin ? 'كل المهام الجغرافية للمستخدمين' : 'مهامي الجغرافية النشطة'}
          light={true}
          disableFilter={isAdmin}
        />
      </div> )}

      <AnimatePresence>
        {createOpen ? (
          <GeoQuestModal title="إضافة مهمة جغرافية" onClose={() => !submitting && setCreateOpen(false)}>
            <GeoQuestForm
              formData={formData}
              onChange={handleFormChange}
              onSelectLocation={handleSelectLocation}
              locations={locations}
              onSubmit={handleCreateGeoQuest}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={Boolean(submitSuccess)}
              submitLabel={submitting ? 'جاري الإضافة...' : 'حفظ المهمة'}
              successMessage={submitSuccess}
              onCancel={() => setCreateOpen(false)}
              locationsLoading={locationsLoading}
            />
          </GeoQuestModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editOpen ? (
          <GeoQuestModal title="تعديل مهمة جغرافية" onClose={() => !submitting && setEditOpen(false)}>
            <GeoQuestForm
              formData={formData}
              onChange={handleFormChange}
              onSelectLocation={handleSelectLocation}
              locations={locations}
              onSubmit={handleUpdateGeoQuest}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={Boolean(submitSuccess)}
              submitLabel={submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              successMessage={submitSuccess}
              onCancel={() => setEditOpen(false)}
              locationsLoading={locationsLoading}
            />
          </GeoQuestModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {detailsOpen ? (
          <GeoQuestModal title="تفاصيل المهمة الجغرافية" onClose={() => setDetailsOpen(false)} maxWidth="760px">
            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                <FaSpinner className="animate-spin" size={28} color="#2563eb" />
                <p style={{ margin: '14px 0 0 0' }}>جاري تحميل التفاصيل...</p>
              </div>
            ) : detailsError ? (
              <div style={errorBoxStyle}>
                <FaExclamationTriangle />
                <span>{detailsError}</span>
              </div>
            ) : selectedGeoQuest ? (
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
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                    }}
                  >
                    <FaMapMarkedAlt />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '24px', fontWeight: 900 }}>
                      {selectedGeoQuest.title || 'مهمة جغرافية'}
                    </h2>
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>العنوان</div>
                  <div style={{ marginTop: '8px', color: 'var(--text)', lineHeight: 1.8 }}>
                    {selectedGeoQuest.title || 'مهمة جغرافية'}
                  </div>
                </div>

                <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>الموقع</div>
                  <div style={{ marginTop: '8px', color: 'var(--text)', lineHeight: 1.8 }}>
                    {getLocationDisplayName(selectedGeoQuest.locationId)}
                  </div>
                </div>

                {selectedGeoQuest.createdAt ? (
                  <div style={{ borderRadius: '18px', background: 'var(--background)', padding: '16px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 800 }}>تاريخ الإنشاء</div>
                    <div style={{ marginTop: '8px', color: 'var(--text)', lineHeight: 1.8 }}>
                      {new Date(selectedGeoQuest.createdAt).toLocaleString('ar-EG')}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </GeoQuestModal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteOpen ? (
          <GeoQuestModal title="تأكيد حذف المهمة" onClose={() => !deleting && setDeleteOpen(false)} maxWidth="480px">
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
                هل أنت متأكد من حذف المهمة
                {' "'}
                {selectedGeoQuest?.title || 'هذه المهمة'}
                {'"؟'}
              </p>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                سيتم حذف المهمة من قاعدة البيانات بعد التأكيد.
              </p>
            </div>

            {deleteError ? (
              <div style={{ ...errorBoxStyle, marginTop: '16px' }}>
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
                onClick={handleDeleteGeoQuest}
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
          </GeoQuestModal>
        ) : null}
      </AnimatePresence>
      </div>
    </div>
  );
}
