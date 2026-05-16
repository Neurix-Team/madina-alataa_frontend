import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHandsHelping,
  FaPlus,
  FaEye,
  FaHistory,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaBuilding,
  FaClock,
  FaTools,
  FaCalendarAlt,
  FaTimes,
  FaSearch,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { locationsService } from '../services/locationsService';
import partnersService from '../services/partnersService';
import { serviceRequestsService } from '../services/serviceRequestsService';
import { volunteerOrdersService } from '../services/volunteerOrdersService';
import { levelsService } from '../services/levelsService';
import EntityHistoryModal from '../components/modals/EntityHistoryModal';

const EMPTY_FORM = {
  title: '',
  serviceType: '',
  requiredSkill: '',
  urgencyLevel: 1,
  scheduleDate: '',
  duration: 1,
  briefDescription: '',
  partnerId: '',
  locationId: '',
  maxOrders: 1,
  requiredLevelId: '',
};

const parseRoles = (user) => {
  const rawRoles = user?.roles || user?.role || [];
  if (Array.isArray(rawRoles)) {
    return rawRoles.map((role) => String(role).toLowerCase());
  }

  return String(rawRoles || '')
    .split(',')
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
};

const buildEditForm = (request) => ({
  title: request?.title || '',
  serviceType: request?.serviceType || '',
  requiredSkill: request?.requiredSkill || '',
  urgencyLevel: Number(request?.urgencyLevel) || 1,
  scheduleDate: request?.scheduleDate ? String(request.scheduleDate).slice(0, 16) : '',
  duration: Number(request?.duration) || 1,
  briefDescription: request?.briefDescription || '',
  partnerId: request?.partnerId || '',
  locationId: request?.locationId || '',
  maxOrders: Number(request?.maxOrders) || 1,
  requiredLevelId: request?.requiredLevelId || '',
});

const getRequestId = (request) =>
  request?.id || request?.serviceRequestId || request?.requestId || null;

const getLocationId = (location) => location?.id || location?.locationId || '';

const getLocationLabel = (location) => location?.name || location?.title || getLocationId(location) || 'خريطة بدون اسم';

const normalizeVolunteerOrderStatus = (status) => {
  if (typeof status === 'number') {
    if (status === 2) return 'approved';
    if (status === 3) return 'rejected';
    if (status === 4) return 'in_progress';
    return 'pending';
  }

  const normalized = String(status || '').trim().toLowerCase();
  if (['approved', 'approve', 'accepted', '2'].includes(normalized)) return 'approved';
  if (['in_progress', 'in progress', 'processing', 'running', 'active', '4'].includes(normalized)) return 'in_progress';
  if (['rejected', 'reject', 'declined', '3'].includes(normalized)) return 'rejected';
  return 'pending';
};

const getVolunteerOrderProgress = (order) =>
  order?.progress ?? order?.currentProgress ?? order?.completionProgress ?? 0;

const deriveVolunteerRequestStatus = (order) => {
  const normalized = normalizeVolunteerOrderStatus(
    order?.status ?? order?.orderStatus ?? order?.state ?? order?.requestStatus
  );

  if (normalized === 'approved' && Number(getVolunteerOrderProgress(order)) > 0) {
    return 'in_progress';
  }

  return normalized;
};

const getVolunteerRequestChip = (status) => {
  if (status === 'approved') {
    return { label: 'approved', color: '#16a34a', bg: 'rgba(34,197,94,.14)' };
  }
  if (status === 'in_progress') {
    return { label: 'in progress', color: '#2563eb', bg: 'rgba(59,130,246,.14)' };
  }
  if (status === 'rejected') {
    return { label: 'rejected', color: '#dc2626', bg: 'rgba(239,68,68,.14)' };
  }
  if (status === 'pending') {
    return { label: 'pending', color: '#ca8a04', bg: 'rgba(234,179,8,.18)' };
  }
  return null;
};

const VolunteerRequestsPage = () => {
  const { user } = useAuth();
  const roles = parseRoles(user);
  const isAdmin = roles.includes('admin');
  const isVolunteerRole = roles.includes('volunteer');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [locations, setLocations] = useState([]);
  const [partners, setPartners] = useState([]);
  const [levels, setLevels] = useState([]);
  const [volunteerActionLoading, setVolunteerActionLoading] = useState({});
  const [volunteerOrdersByRequestId, setVolunteerOrdersByRequestId] = useState({});
  const [historyEntityId, setHistoryEntityId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const locationNameById = useMemo(() => {
    return locations.reduce((accumulator, location) => {
      const locationId = getLocationId(location);
      if (locationId) {
        accumulator[locationId] = getLocationLabel(location);
      }
      return accumulator;
    }, {});
  }, [locations]);

  const partnerNameById = useMemo(() => {
    return partners.reduce((accumulator, partner) => {
      const partnerId = partner?.id || partner?.partnerId;
      if (partnerId) {
        accumulator[partnerId] = partner.orgName || partner.name || partner.email || 'شريك غير مسمى';
      }
      return accumulator;
    }, {});
  }, [partners]);

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return requests;

    return requests.filter((request) =>
      [
        request.title,
        request.serviceType,
        request.requiredSkill,
        request.briefDescription,
        getUrgencyLabel(request.urgencyLevel).label,
        partnerNameById[request.partnerId],
        locationNameById[request.locationId],
      ]
        .map((value) => String(value || '').toLowerCase())
        .some((value) => value.includes(term))
    );
  }, [requests, searchTerm, partnerNameById, locationNameById]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [pageSize, totalCount]
  );
  const selectedRequestVolunteerOrder = selectedRequest
    ? volunteerOrdersByRequestId[getRequestId(selectedRequest)]
    : null;
  const selectedRequestVolunteerChip = selectedRequestVolunteerOrder
    ? getVolunteerRequestChip(selectedRequestVolunteerOrder.status)
    : null;

  const fetchRequests = async (targetPage = pageNumber, targetSize = pageSize) => {
    setLoading(true);
    setError(null);

    try {
      // Do not force a status filter here — allow the API default so items return on first open
      const response = isVolunteerRole && !isAdmin
        ? await serviceRequestsService.getApprovedServiceRequests(targetPage, targetSize)
        : await serviceRequestsService.getServiceRequests(targetPage, targetSize);
      setRequests(response.items);
      setTotalCount(response.totalCount);
      console.log('SERVICE REQUESTS PAGE ITEMS RESPONSE:', response.items);
    } catch (requestError) {
      console.error('VOLUNTEER REQUESTS PAGE FETCH ERROR:', requestError);
      setError(requestError.message || 'فشل في جلب طلبات التطوع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [pageNumber, pageSize, isAdmin, isVolunteerRole]);

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [loadedLocations, loadedPartners, loadedLevels] = await Promise.all([
          locationsService.getLocations(),
          partnersService.getPartners(1, 100),
          levelsService.getLevels({ pageNumber: 1, pageSize: 50 }),
        ]);

        setLocations(Array.isArray(loadedLocations) ? loadedLocations : []);
        setPartners(Array.isArray(loadedPartners?.data) ? loadedPartners.data : []);
        setLevels(Array.isArray(loadedLevels?.items) ? loadedLevels.items : []);
      } catch (loadError) {
        console.error('VOLUNTEER REQUESTS LOOKUPS ERROR:', loadError);
      }
    };

    loadFiltersData();
  }, []);

  useEffect(() => {
    const loadVolunteerOrders = async () => {
      if (!isVolunteerRole) {
        setVolunteerOrdersByRequestId({});
        return;
      }

      try {
        const response = await volunteerOrdersService.getVolunteerOrders(1, 200);
        const nextMap = {};

        (response.items || []).forEach((order) => {
          const serviceRequestId = order?.serviceRequestId || order?.requestId || null;
          if (!serviceRequestId) return;

          nextMap[serviceRequestId] = {
            status: deriveVolunteerRequestStatus(order),
            progress: Number(getVolunteerOrderProgress(order)) || 0,
            raw: order,
          };
        });

        setVolunteerOrdersByRequestId(nextMap);
      } catch (loadError) {
        console.error('VOLUNTEER REQUESTS USER ORDERS ERROR:', loadError);
      }
    };

    loadVolunteerOrders();
  }, [isVolunteerRole]);

  const openCreateModal = () => {
    setFormMode('create');
    setFormData(EMPTY_FORM);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (request) => {
    setFormMode('edit');
    setFormData(buildEditForm(request));
    setFormError(null);
    setSelectedRequest(request);
    setIsEditModalOpen(true);
  };

  const closeFormModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setFormError(null);
    setFormSubmitting(false);
    setFormData(EMPTY_FORM);
  };

  const handleViewDetails = async (requestId) => {
    setSelectedRequest(null);
    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const response = await serviceRequestsService.getServiceRequestById(requestId);
      setSelectedRequest({
        ...response,
        id: getRequestId(response) || requestId,
        serviceRequestId: response?.serviceRequestId || requestId,
      });
    } catch (requestError) {
      setDetailsError(requestError.message || 'فشل في جلب التفاصيل');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleVolunteer = async (requestId) => {
    if (!requestId || isAdmin) return;

    setVolunteerActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await volunteerOrdersService.createVolunteerOrder(requestId);
      setVolunteerOrdersByRequestId((prev) => ({
        ...prev,
        [requestId]: {
          status: 'pending',
        },
      }));
      alert('تم حفظ التطوع في قاعدة البيانات.');
    } catch (requestError) {
      alert(requestError.message || 'فشل في حفظ التطوع');
    } finally {
      setVolunteerActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDelete = async (requestId) => {
    if (!isAdmin) return;
    if (!requestId) {
      alert('بيانات طلب التطوع غير مكتملة، لا يمكن الحذف.');
      return;
    }
    if (!confirm('هل أنت متأكد من حذف طلب التطوع؟')) return;

    setActionLoading((prev) => ({ ...prev, [requestId]: 'delete' }));
    try {
      console.log('VOLUNTEER REQUEST DELETE UI CALL:', { requestId });
      await serviceRequestsService.deleteServiceRequest(requestId);
      setRequests((prev) => prev.filter((request) => getRequestId(request) !== requestId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (getRequestId(selectedRequest) === requestId) {
        setSelectedRequest(null);
      }
      try {
        await fetchRequests();
      } catch (refreshError) {
        console.warn('VOLUNTEER REQUESTS REFRESH AFTER DELETE FAILED:', refreshError);
      }
    } catch (requestError) {
      alert(requestError.message || 'فشل في حذف طلب التطوع');
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  const canVolunteerForRequest = (requestId) => {
    if (!isVolunteerRole || !requestId) return false;

    const currentOrder = volunteerOrdersByRequestId[requestId];
    if (!currentOrder) return true;

    return normalizeVolunteerOrderStatus(currentOrder.status) === 'rejected';
  };

  const validateForm = () => {
    if (!String(formData.requiredSkill || '').trim()) {
      return 'المهارة المطلوبة مطلوبة.';
    }
    if (!String(formData.scheduleDate || '').trim()) {
      return 'تاريخ التنفيذ مطلوب.';
    }
    if (!String(formData.locationId || '').trim()) {
      return 'الخريطة مطلوبة.';
    }
    if (Number(formData.maxOrders || 0) <= 0) {
      return 'عدد الطلبات الأقصى يجب أن يكون أكبر من صفر.';
    }
    if (formMode === 'create') {
      if (!String(formData.serviceType || '').trim()) {
        return 'نوع الخدمة مطلوب.';
      }
      if (!String(formData.partnerId || '').trim()) {
        return 'الشريك مطلوب.';
      }
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormSubmitting(true);
    try {
      const derivedTitle =
        locationNameById[formData.locationId] ||
        formData.title ||
        'خريطة بدون اسم';
      const submissionData = {
        title: derivedTitle,
        serviceType: formData.serviceType,
        requiredSkill: formData.requiredSkill,
        urgencyLevel: Number(formData.urgencyLevel) || 1,
        scheduleDate: formData.scheduleDate,
        duration: Math.max(1, Number(formData.duration) || 1),
        briefDescription: formData.briefDescription,
        partnerId: formData.partnerId,
        locationId: formData.locationId,
        maxOrders: Math.max(1, Number(formData.maxOrders) || 1),
        requiredLevelId: formData.requiredLevelId !== undefined && formData.requiredLevelId !== null && formData.requiredLevelId !== '' 
          ? String(formData.requiredLevelId) 
          : "",
      };

      console.log('📤 SUBMISSION DATA:', submissionData);

      if (formMode === 'create') {
        await serviceRequestsService.createServiceRequest(submissionData);
      } else if (getRequestId(selectedRequest)) {
        const currentRequestId = getRequestId(selectedRequest);
        await serviceRequestsService.updateServiceRequest(currentRequestId, submissionData);
        await handleViewDetails(currentRequestId);
      }

      closeFormModal();
      await fetchRequests(1, pageSize);
      setPageNumber(1);
    } catch (requestError) {
      setFormError(requestError.message || 'فشل في حفظ طلب التطوع');
    } finally {
      setFormSubmitting(false);
    }
  };

  function getUrgencyLabel(level) {
    const levels = {
      1: { label: 'منخفض', color: '#16a34a', bg: 'rgba(34,197,94,.14)' },
      2: { label: 'متوسط', color: '#ca8a04', bg: 'rgba(234,179,8,.16)' },
      3: { label: 'عالٍ', color: '#ea580c', bg: 'rgba(249,115,22,.15)' },
      4: { label: 'حرج', color: '#dc2626', bg: 'rgba(239,68,68,.16)' },
      5: { label: 'طارئ', color: '#7c3aed', bg: 'rgba(168,85,247,.16)' },
    };
    return levels[level] || { label: 'درجة الاستعجال', color: '#64748b', bg: 'rgba(148,163,184,.16)' };
  }

  const renderRequestModal = () => {
    const isOpen = isCreateModalOpen || isEditModalOpen;
    if (!isOpen) return null;

    return (
      <div className="app-modal-overlay" onClick={closeFormModal}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="app-modal-card"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="app-modal-header">
            <div>
              <h2 className="app-modal-title">
                {formMode === 'create' ? 'إضافة طلب تطوع' : 'تعديل طلب تطوع'}
              </h2>
              <p className="app-modal-subtitle">
                {formMode === 'create'
                  ? 'أدخل بيانات الطلب ثم احفظه مباشرة في قاعدة البيانات.'
                  : 'عدّل البيانات المطلوبة ثم احفظ التغييرات.'}
              </p>
            </div>
            <button type="button" onClick={closeFormModal} className="app-modal-close">
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="app-form">
            {formError && (
              <div style={{
                padding: '14px 20px',
                borderRadius: 16,
                background: 'var(--error-light)',
                border: '1px solid var(--error)',
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 700
              }}>
                <FaExclamationTriangle />
                <span>{formError}</span>
              </div>
            )}

            <div className="app-form-grid">
              <label className="app-form-group">
                <span className="app-form-label">الخريطة</span>
                <select
                  value={formData.locationId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, locationId: event.target.value }))}
                  className="app-form-select"
                >
                  <option value="">اختر الخريطة</option>
                  {locations.map((location) => (
                    <option key={getLocationId(location)} value={getLocationId(location)}>
                      {getLocationLabel(location)}
                    </option>
                  ))}
                </select>
              </label>

              {formMode === 'create' && (
                <label className="app-form-group">
                  <span className="app-form-label">نوع الخدمة</span>
                  <input
                    value={formData.serviceType}
                    onChange={(event) => setFormData((prev) => ({ ...prev, serviceType: event.target.value }))}
                    className="app-form-input"
                  />
                </label>
              )}

              <label className="app-form-group">
                <span className="app-form-label">المهارة المطلوبة</span>
                <input
                  value={formData.requiredSkill}
                  onChange={(event) => setFormData((prev) => ({ ...prev, requiredSkill: event.target.value }))}
                  className="app-form-input"
                />
              </label>

              <label className="app-form-group">
                <span className="app-form-label">مستوى الاستعجال</span>
                <select
                  value={formData.urgencyLevel}
                  onChange={(event) => setFormData((prev) => ({ ...prev, urgencyLevel: Number(event.target.value) }))}
                  className="app-form-select"
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className="app-form-group">
                <span className="app-form-label">تاريخ التنفيذ</span>
                <input
                  type="datetime-local"
                  value={formData.scheduleDate}
                  onChange={(event) => setFormData((prev) => ({ ...prev, scheduleDate: event.target.value }))}
                  className="app-form-input"
                />
              </label>

              <label className="app-form-group">
                <span className="app-form-label">المدة (ساعات)</span>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(event) => setFormData((prev) => ({ ...prev, duration: Number(event.target.value) }))}
                  className="app-form-input"
                />
              </label>

              <label className="app-form-group">
                <span className="app-form-label">عدد الطلبات الأقصى</span>
                <input
                  type="number"
                  min="1"
                  value={formData.maxOrders}
                  onChange={(event) => setFormData((prev) => ({ ...prev, maxOrders: Number(event.target.value) }))}
                  className="app-form-input"
                />
              </label>

              <label className="app-form-group">
                <span className="app-form-label">مستوى المتطلب</span>
                <select
                  value={formData.requiredLevelId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, requiredLevelId: event.target.value }))}
                  className="app-form-select"
                >
                  <option value="">لا يوجد مستوى محدد</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      المستوى {level.number} - {level.maxXp} XP
                    </option>
                  ))}
                </select>
              </label>

              {formMode === 'create' && (
                <label className="app-form-group">
                  <span className="app-form-label">الشريك</span>
                  <select
                    value={formData.partnerId}
                    onChange={(event) => setFormData((prev) => ({ ...prev, partnerId: event.target.value }))}
                    className="app-form-select"
                  >
                    <option value="">اختر الشريك</option>
                    {partners.map((partner) => (
                      <option key={partner.id || partner.partnerId} value={partner.id || partner.partnerId}>
                        {partner.orgName || partner.name || partner.email || partner.id}
                      </option>
                    ))}
                  </select>
                </label>
              )}

            </div>

            <label className="app-form-group">
              <span className="app-form-label">الوصف المختصر</span>
              <textarea
                value={formData.briefDescription}
                onChange={(event) => setFormData((prev) => ({ ...prev, briefDescription: event.target.value }))}
                rows={4}
                className="app-form-textarea"
              />
            </label>

            <div className="app-form-actions">
              <button type="button" onClick={closeFormModal} className="app-btn-secondary">
                إلغاء
              </button>
              <button type="submit" disabled={formSubmitting} className="app-btn-primary" style={{ opacity: formSubmitting ? 0.7 : 1 }}>
                {formSubmitting ? 'جاري الحفظ...' : formMode === 'create' ? 'حفظ الطلب' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} 
          style={{
            padding: '24px 32px',
            borderRadius: 24,
            background: '#fff',
            border: '1px solid rgba(148,163,184,0.15)',
            boxShadow: '0 20px 50px rgba(15,23,42,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              display: 'grid',
              placeItems: 'center',
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: 24,
              border: '1px solid #bfdbfe'
            }}>
              <FaHandsHelping />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>طلبات التطوع</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14, fontWeight: 500 }}>
                عرض الطلبات مع التوكن، بيدجيشن، تفاصيل كل عنصر، وإدارة كاملة للأدمن.
              </p>
            </div>
          </div>

          {isAdmin && (
            <button type="button" onClick={openCreateModal} style={primaryButtonStyle}>
              <FaPlus />
              <span>إضافة طلب</span>
            </button>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={statsGridStyle}>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>إجمالي الطلبات</span>
            <strong style={statValueStyle}>{totalCount}</strong>
          </div>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>الصفحة الحالية</span>
            <strong style={statValueStyle}>{pageNumber}</strong>
          </div>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>حجم الصفحة</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPageNumber(1);
                }}
                style={{ ...inputStyle, minWidth: 110 }}
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {error && (
          <div style={errorAlertStyle}>
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        <div style={{ ...panelStyle, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaSearch style={{ color: '#2563eb' }} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="بحث بالعنوان أو نوع الخدمة أو المهارة أو المكان"
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <div style={contentGridStyle}>
          <style>{`
            @media (max-width: 640px) {
              .vol-requests-panel { background: transparent !important; border: none !important; box-shadow: none !important; padding: 12px !important; }
              .pro-card { padding: 16px !important; }
              .pro-card .pro-card-actions { gap: 8px !important; }
            }
          `}</style>
          <div className="vol-requests-panel" style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>قائمة الطلبات</h2>
              </div>
            </div>

            {loading ? (
              <div style={loadingBoxStyle}>
                <FaSpinner className="animate-spin" />
                <span>جاري تحميل الطلبات...</span>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div style={emptyBoxStyle}>لا توجد طلبات تطوع متاحة حاليًا.</div>
            ) : (
              <div style={{ display: 'grid', gap: 20 }}>
                <AnimatePresence mode="wait">
                  {filteredRequests.map((request, index) => {
                    const urgency = getUrgencyLabel(request.urgencyLevel);
                    const requestId = getRequestId(request);
                    const currentVolunteerOrder = volunteerOrdersByRequestId[requestId];
                    const volunteerStatusChip = currentVolunteerOrder
                      ? getVolunteerRequestChip(currentVolunteerOrder.status)
                      : null;

                    return (
                      <motion.div
                        key={requestId || index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ delay: index * 0.05 }}
                        className="pro-card"
                        style={{ padding: 22 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 260 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <h3 style={{ margin: 0, fontSize: 19, color: '#0f172a', fontWeight: 800 }}>
                                {request.title || request.name || request.requestName || request.serviceRequestTitle || 'بدون عنوان'}
                              </h3>
                            </div>
                              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
                                {request.serviceType || request.title || 'خدمة الطلب'}
                              </p>
                              {volunteerStatusChip && (
                                <div style={{ marginTop: 8 }}>
                                  <span style={{ ...chipStyle, color: volunteerStatusChip.color, background: volunteerStatusChip.bg }}>
                                    {volunteerStatusChip.label}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span style={{ ...chipStyle, color: urgency.color, background: urgency.bg }}>
                              {urgency.label}
                            </span>

                          <div style={metaGridStyle}>
                            <span style={metaItemStyle}><FaTools /> {request.requiredSkill || request.serviceType || request.title || 'مهارة الطلب'}</span>
                            <span style={metaItemStyle}><FaCalendarAlt /> {request.scheduleDate || 'موعد الطلب'}</span>
                            <span style={metaItemStyle}><FaClock /> {request.duration || 0} ساعة</span>
                            <span style={metaItemStyle}><FaBuilding /> {partnerNameById[request.partnerId] || request.title || 'الشريك المرتبط بالطلب'}</span>
                            <span style={metaItemStyle}><FaMapMarkerAlt /> {locationNameById[request.locationId] || request.title || 'موقع الطلب'}</span>
                          </div>

                          {request.briefDescription && (
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.7 }}>
                              {request.briefDescription}
                            </p>
                          )}
                        </div>

                        <div style={actionsRowStyle}>
                          <button type="button" onClick={() => handleViewDetails(requestId)} style={iconButtonStyle} title="التفاصيل">
                            <FaEye />
                          </button>
                          <button type="button" onClick={() => setHistoryEntityId(requestId)} style={{ ...iconButtonStyle, color: '#0f172a' }} title="عرض السجل">
                            <FaHistory />
                          </button>
                          {isAdmin && (
                            <>
                              <button type="button" onClick={() => openEditModal(request)} style={iconButtonStyle} title="تعديل">
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(requestId)}
                                disabled={actionLoading[requestId] === 'delete'}
                                style={{ ...iconButtonStyle, color: '#dc2626', borderColor: 'rgba(239,68,68,.2)' }}
                                title="حذف"
                              >
                                {actionLoading[requestId] === 'delete' ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            <div style={paginationStyle}>
              <button
                type="button"
                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                disabled={pageNumber === 1}
                style={secondaryButtonStyle}
              >
                السابق
              </button>
              <span style={sectionMetaStyle}>صفحة {pageNumber} من {totalPages}</span>
              <button
                type="button"
                onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                disabled={pageNumber >= totalPages}
                style={secondaryButtonStyle}
              >
                التالي
              </button>
            </div>
          </div>

          <div style={{ ...panelStyle, display: 'none' }}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>تفاصيل الطلب</h2>
              </div>
            </div>

            {detailsLoading ? (
              <div style={loadingBoxStyle}>
                <FaSpinner className="animate-spin" />
                <span>جاري تحميل التفاصيل...</span>
              </div>
            ) : detailsError ? (
              <div style={errorAlertStyle}>
                <FaExclamationTriangle />
                <span>{detailsError}</span>
              </div>
            ) : !selectedRequest ? (
              <div style={emptyBoxStyle}>اختر أي عنصر من القائمة لعرض التفاصيل هنا.</div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 21, color: '#0f172a' }}>{selectedRequest.title || 'بدون عنوان'}</h3>
                  <p style={{ margin: '6px 0 0', color: '#64748b' }}>{selectedRequest.serviceType || selectedRequest.title || 'خدمة الطلب'}</p>
                </div>

                <div style={detailsGridStyle}>
                  <DetailItem label="المهارة المطلوبة" value={selectedRequest.requiredSkill || '-'} />
                  <DetailItem label="الحالة" value={selectedRequestVolunteerChip?.label || String(selectedRequest.status ?? 1)} />
                  <DetailItem label="الاستعجال" value={getUrgencyLabel(selectedRequest.urgencyLevel).label} />
                  <DetailItem label="التاريخ" value={selectedRequest.scheduleDate || '-'} />
                  <DetailItem label="المدة" value={`${selectedRequest.duration || 0} ساعة`} />
                  <DetailItem label="الحد الأقصى للطلبات" value={selectedRequest.maxOrders || '-'} />
                  <DetailItem label="مستوى المتطلب" value={selectedRequest.requiredLevelId || '-'} />
                  <DetailItem label="الشريك" value={partnerNameById[selectedRequest.partnerId] || selectedRequest.title || 'الشريك المرتبط بالطلب'} />
                  <DetailItem label="الخريطة" value={locationNameById[selectedRequest.locationId] || selectedRequest.title || 'موقع الطلب'} />
                </div>

                <div>
                  <h4 style={detailLabelStyle}>الوصف</h4>
                  <p style={{ margin: '6px 0 0', color: '#334155', lineHeight: 1.8 }}>
                    {selectedRequest.briefDescription || 'لا يوجد وصف.'}
                  </p>
                </div>

                {!isAdmin && canVolunteerForRequest(getRequestId(selectedRequest)) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleVolunteer(getRequestId(selectedRequest))}
                      disabled={volunteerActionLoading[getRequestId(selectedRequest)]}
                      style={primaryButtonStyle}
                    >
                      {volunteerActionLoading[getRequestId(selectedRequest)] ? 'جاري الإرسال...' : 'أريد التطوع'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {(detailsLoading || detailsError || selectedRequest) && (
        <div
          className="app-modal-overlay"
          onClick={() => {
            setSelectedRequest(null);
            setDetailsError(null);
            setDetailsLoading(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="app-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="app-modal-header">
              <div>
                <h3 className="app-modal-title">تفاصيل طلب التطوع</h3>
                <p className="app-modal-subtitle">
                  بيانات الطلب والوصف والحالة الحالية
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setDetailsError(null);
                  setDetailsLoading(false);
                }}
                className="app-modal-close"
              >
                <FaTimes />
              </button>
            </div>

            {detailsLoading ? (
              <div style={loadingBoxStyle}>
                <FaSpinner className="animate-spin" />
                <span>جاري تحميل التفاصيل...</span>
              </div>
            ) : detailsError ? (
              <div style={errorAlertStyle}>
                <FaExclamationTriangle />
                <span>{detailsError}</span>
              </div>
            ) : selectedRequest ? (
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 21, color: 'var(--text-primary)', fontWeight: 800 }}>{selectedRequest.title || 'بدون عنوان'}</h3>
                  <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontWeight: 500 }}>{selectedRequest.serviceType || selectedRequest.title || 'خدمة الطلب'}</p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12
                }}>
                  <DetailItem label="المهارة المطلوبة" value={selectedRequest.requiredSkill || '-'} />
                  <DetailItem label="الحالة" value={selectedRequestVolunteerChip?.label || String(selectedRequest.status ?? 1)} />
                  <DetailItem label="الاستعجال" value={getUrgencyLabel(selectedRequest.urgencyLevel).label} />
                  <DetailItem label="التاريخ" value={selectedRequest.scheduleDate || '-'} />
                  <DetailItem label="المدة" value={`${selectedRequest.duration || 0} ساعة`} />
                  <DetailItem label="الحد الأقصى للطلبات" value={selectedRequest.maxOrders || '-'} />
                  <DetailItem label="مستوى المتطلب" value={selectedRequest.requiredLevelId || '-'} />
                  <DetailItem label="الشريك" value={partnerNameById[selectedRequest.partnerId] || selectedRequest.title || 'الشريك المرتبط بالطلب'} />
                  <DetailItem label="الخريطة" value={locationNameById[selectedRequest.locationId] || selectedRequest.title || 'موقع الطلب'} />
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, margin: 0, marginBottom: 8 }}>الوصف</h4>
                  <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.8, fontSize: 14, fontWeight: 500 }}>
                    {selectedRequest.briefDescription || 'لا يوجد وصف.'}
                  </p>
                </div>

                {!isAdmin && canVolunteerForRequest(getRequestId(selectedRequest)) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleVolunteer(getRequestId(selectedRequest))}
                      disabled={volunteerActionLoading[getRequestId(selectedRequest)]}
                      className="app-btn-primary"
                    >
                      {volunteerActionLoading[getRequestId(selectedRequest)] ? 'جاري الإرسال...' : 'أريد التطوع'}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        </div>
      )}

      {renderRequestModal()}

      <EntityHistoryModal
        isOpen={Boolean(historyEntityId)}
        entityId={historyEntityId}
        title="سجل طلب الخدمة"
        onClose={() => setHistoryEntityId(null)}
      />
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div style={{
    padding: '14px',
    borderRadius: 16,
    background: 'rgba(248, 250, 252, 0.95)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    display: 'grid',
    gap: '6px'
  }}>
    <span style={{ color: '#64748b', fontSize: 12, fontWeight: 700 }}>{label}</span>
    <strong style={{ color: '#0f172a', fontSize: 14, fontWeight: 800, wordBreak: 'break-word' }}>{value}</strong>
  </div>
);

const pageStyle = {
  padding: 24,
};

const containerStyle = {
  display: 'grid',
  gap: 18,
};

const heroStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'center',
  padding: '24px 32px',
  borderRadius: 24,
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid rgba(59,130,246,0.3)',
  flexWrap: 'wrap',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
  marginBottom: 24
};

const heroIconStyle = {
  width: 64,
  height: 64,
  borderRadius: 18,
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
  color: '#fff',
  fontSize: 28,
  boxShadow: '0 18px 34px rgba(37,99,235,.25)',
};

const heroTitleStyle = {
  margin: 0,
  fontSize: 32,
  fontWeight: 900,
  color: '#ffffff',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
};

const heroSubtitleStyle = {
  margin: '8px 0 0',
  color: '#cbd5e1',
  fontSize: 16,
  fontWeight: 600
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 14,
};

const statCardStyle = {
  padding: 18,
  borderRadius: 20,
  background: '#fff',
  border: '1px solid rgba(226,232,240,.9)',
  boxShadow: '0 10px 30px rgba(15,23,42,.04)',
  display: 'grid',
  gap: 8,
};

const statLabelStyle = {
  color: '#64748b',
  fontSize: 13,
  fontWeight: 700,
};

const statValueStyle = {
  color: '#0f172a',
  fontSize: 24,
  fontWeight: 900,
};

const contentGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: 18,
};

const panelStyle = {
  padding: 20,
  borderRadius: 24,
  background: '#fff',
  border: '1px solid rgba(226,232,240,.9)',
  boxShadow: '0 18px 40px rgba(15,23,42,.05)',
  display: 'grid',
  gap: 18,
};
const detailsModalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
};

const panelHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
};

const sectionTitleStyle = {
  margin: 0,
  color: '#0f172a',
  fontSize: 20,
  fontWeight: 900,
};

const sectionMetaStyle = {
  margin: '6px 0 0',
  color: '#64748b',
  fontSize: 12,
};

const loadingBoxStyle = {
  minHeight: 220,
  borderRadius: 20,
  border: '1px dashed rgba(148,163,184,.45)',
  display: 'grid',
  placeItems: 'center',
  gap: 12,
  color: '#64748b',
  textAlign: 'center',
  padding: 24,
};

const emptyBoxStyle = {
  minHeight: 220,
  borderRadius: 20,
  background: 'rgba(248,250,252,.9)',
  border: '1px dashed rgba(148,163,184,.45)',
  display: 'grid',
  placeItems: 'center',
  color: '#64748b',
  textAlign: 'center',
  padding: 24,
};

const errorAlertStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 16px',
  borderRadius: 16,
  background: 'rgba(239,68,68,.12)',
  color: '#dc2626',
  border: '1px solid rgba(239,68,68,.18)',
};

const cardStyle = {
  padding: 18,
  borderRadius: 20,
  border: '1px solid rgba(226,232,240,.9)',
  background: 'linear-gradient(180deg, #fff, #f8fbff)',
  display: 'grid',
  gap: 14,
};

const chipStyle = {
  borderRadius: 999,
  padding: '7px 12px',
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const metaGridStyle = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
};

const metaItemStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 12px',
  borderRadius: 999,
  background: 'rgba(241,245,249,.9)',
  color: '#475569',
  fontSize: 12,
  fontWeight: 700,
};

const actionsRowStyle = {
  display: 'flex',
  gap: 10,
  justifyContent: 'flex-end',
};

const iconButtonStyle = {
  width: 42,
  height: 42,
  borderRadius: 12,
  border: '1px solid rgba(148,163,184,.2)',
  background: '#fff',
  color: '#2563eb',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
};

const primaryButtonStyle = {
  border: 'none',
  borderRadius: 14,
  padding: '12px 18px',
  background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 800,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  border: '1px solid rgba(148,163,184,.25)',
  borderRadius: 14,
  padding: '10px 16px',
  background: '#fff',
  color: '#334155',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,.52)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 1100,
  padding: 20,
};

const modalStyle = {
  width: 'min(820px, 100%)',
  maxHeight: '92vh',
  overflowY: 'auto',
  padding: 22,
  borderRadius: 24,
  background: '#fff',
  boxShadow: '0 30px 70px rgba(15,23,42,.22)',
  display: 'grid',
  gap: 20,
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 14,
  alignItems: 'flex-start',
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14,
};

const fieldStyle = {
  display: 'grid',
  gap: 8,
  color: '#334155',
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: 12,
  border: '1px solid rgba(203,213,225,.95)',
  background: '#fff',
  color: '#0f172a',
  fontSize: 14,
};

const detailsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
};

const detailItemStyle = {
  padding: 14,
  borderRadius: 16,
  background: 'rgba(248,250,252,.95)',
  border: '1px solid rgba(226,232,240,.9)',
  display: 'grid',
  gap: 6,
};

const detailLabelStyle = {
  color: '#64748b',
  fontSize: 12,
  fontWeight: 700,
};

const detailValueStyle = {
  color: '#0f172a',
  fontSize: 14,
  fontWeight: 800,
  wordBreak: 'break-word',
};

export default VolunteerRequestsPage;
