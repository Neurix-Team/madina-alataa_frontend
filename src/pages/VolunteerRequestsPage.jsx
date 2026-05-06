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
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { locationsService } from '../services/locationsService';
import partnersService from '../services/partnersService';
import { serviceRequestsService } from '../services/serviceRequestsService';
import { volunteerOrdersService } from '../services/volunteerOrdersService';
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
});

const getRequestId = (request) =>
  request?.id || request?.serviceRequestId || request?.requestId || null;

const getLocationId = (location) => location?.id || location?.locationId || '';

const getLocationLabel = (location) => location?.name || location?.title || getLocationId(location) || 'خريطة بدون اسم';

const normalizeVolunteerOrderStatus = (status) => {
  if (typeof status === 'number') {
    if (status === 2) return 'approved';
    if (status === 3) return 'rejected';
    return 'pending';
  }

  const normalized = String(status || '').trim().toLowerCase();
  if (['approved', 'approve', 'accepted', '2'].includes(normalized)) return 'approved';
  if (['rejected', 'reject', 'declined', '3'].includes(normalized)) return 'rejected';
  return 'pending';
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
  const [volunteerActionLoading, setVolunteerActionLoading] = useState({});
  const [volunteerOrdersByRequestId, setVolunteerOrdersByRequestId] = useState({});
  const [historyEntityId, setHistoryEntityId] = useState(null);

  const locationNameById = useMemo(() => {
    return locations.reduce((accumulator, location) => {
      const locationId = getLocationId(location);
      if (locationId) {
        accumulator[locationId] = getLocationLabel(location);
      }
      return accumulator;
    }, {});
  }, [locations]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [pageSize, totalCount]
  );

  const fetchRequests = async (targetPage = pageNumber, targetSize = pageSize) => {
    setLoading(true);
    setError(null);

    try {
      const response = await serviceRequestsService.getServiceRequests(targetPage, targetSize, 1);
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
  }, [pageNumber, pageSize]);

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [loadedLocations, loadedPartners] = await Promise.all([
          locationsService.getLocations(),
          partnersService.getPartners(1, 100),
        ]);

        setLocations(Array.isArray(loadedLocations) ? loadedLocations : []);
        setPartners(Array.isArray(loadedPartners?.data) ? loadedPartners.data : []);
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
            status: normalizeVolunteerOrderStatus(
              order?.status ?? order?.orderStatus ?? order?.state ?? order?.requestStatus
            ),
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
      setSelectedRequest(response);
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
      alert('معرف طلب التطوع غير متوفر، لا يمكن الحذف.');
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
        ...formData,
        title: derivedTitle,
      };

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

  const getUrgencyLabel = (level) => {
    const levels = {
      1: { label: 'منخفض', color: '#16a34a', bg: 'rgba(34,197,94,.14)' },
      2: { label: 'متوسط', color: '#ca8a04', bg: 'rgba(234,179,8,.16)' },
      3: { label: 'عالٍ', color: '#ea580c', bg: 'rgba(249,115,22,.15)' },
      4: { label: 'حرج', color: '#dc2626', bg: 'rgba(239,68,68,.16)' },
      5: { label: 'طارئ', color: '#7c3aed', bg: 'rgba(168,85,247,.16)' },
    };
    return levels[level] || { label: 'غير محدد', color: '#64748b', bg: 'rgba(148,163,184,.16)' };
  };

  const renderRequestModal = () => {
    const isOpen = isCreateModalOpen || isEditModalOpen;
    if (!isOpen) return null;

    return (
      <div style={overlayStyle} onClick={closeFormModal}>
        <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
          <div style={modalHeaderStyle}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>
                {formMode === 'create' ? 'إضافة طلب تطوع' : 'تعديل طلب تطوع'}
              </h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>
                {formMode === 'create'
                  ? 'أدخل بيانات الطلب ثم احفظه مباشرة في قاعدة البيانات.'
                  : 'عدّل البيانات المطلوبة ثم احفظ التغييرات.'}
              </p>
            </div>
            <button type="button" onClick={closeFormModal} style={iconButtonStyle}>
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            {formError && (
              <div style={errorAlertStyle}>
                <FaExclamationTriangle />
                <span>{formError}</span>
              </div>
            )}

            <div style={formGridStyle}>
              <label style={fieldStyle}>
                <span>الخريطة</span>
                <select
                  value={formData.locationId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, locationId: event.target.value }))}
                  style={inputStyle}
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
                <label style={fieldStyle}>
                  <span>نوع الخدمة</span>
                  <input
                    value={formData.serviceType}
                    onChange={(event) => setFormData((prev) => ({ ...prev, serviceType: event.target.value }))}
                    style={inputStyle}
                  />
                </label>
              )}

              <label style={fieldStyle}>
                <span>المهارة المطلوبة</span>
                <input
                  value={formData.requiredSkill}
                  onChange={(event) => setFormData((prev) => ({ ...prev, requiredSkill: event.target.value }))}
                  style={inputStyle}
                />
              </label>

              <label style={fieldStyle}>
                <span>مستوى الاستعجال</span>
                <select
                  value={formData.urgencyLevel}
                  onChange={(event) => setFormData((prev) => ({ ...prev, urgencyLevel: Number(event.target.value) }))}
                  style={inputStyle}
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label style={fieldStyle}>
                <span>تاريخ التنفيذ</span>
                <input
                  type="datetime-local"
                  value={formData.scheduleDate}
                  onChange={(event) => setFormData((prev) => ({ ...prev, scheduleDate: event.target.value }))}
                  style={inputStyle}
                />
              </label>

              <label style={fieldStyle}>
                <span>المدة</span>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(event) => setFormData((prev) => ({ ...prev, duration: Number(event.target.value) }))}
                  style={inputStyle}
                />
              </label>

              {formMode === 'create' && (
                <label style={fieldStyle}>
                  <span>الشريك</span>
                  <select
                    value={formData.partnerId}
                    onChange={(event) => setFormData((prev) => ({ ...prev, partnerId: event.target.value }))}
                    style={inputStyle}
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

            <label style={fieldStyle}>
              <span>الوصف المختصر</span>
              <textarea
                value={formData.briefDescription}
                onChange={(event) => setFormData((prev) => ({ ...prev, briefDescription: event.target.value }))}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={closeFormModal} style={secondaryButtonStyle}>
                إلغاء
              </button>
              <button type="submit" disabled={formSubmitting} style={primaryButtonStyle}>
                {formSubmitting ? 'جاري الحفظ...' : formMode === 'create' ? 'حفظ الطلب' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} style={heroStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={heroIconStyle}>
              <FaHandsHelping />
            </div>
            <div>
              <h1 style={heroTitleStyle}>طلبات التطوع</h1>
              <p style={heroSubtitleStyle}>
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

        <div style={contentGridStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>قائمة الطلبات</h2>
                <p style={sectionMetaStyle}>GET `/api/ServiceRequests?PageNumber={pageNumber}&PageSize={pageSize}&status=1`</p>
              </div>
            </div>

            {loading ? (
              <div style={loadingBoxStyle}>
                <FaSpinner className="animate-spin" />
                <span>جاري تحميل الطلبات...</span>
              </div>
            ) : requests.length === 0 ? (
              <div style={emptyBoxStyle}>لا توجد طلبات تطوع متاحة حاليًا.</div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                <AnimatePresence mode="wait">
                  {requests.map((request, index) => {
                    const urgency = getUrgencyLabel(request.urgencyLevel);
                    const requestId = getRequestId(request);

                    return (
                      <motion.div
                        key={requestId || index}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ delay: index * 0.04 }}
                        style={cardStyle}
                      >
                        <div style={{ display: 'grid', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                            <div>
                              <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>
                                {request.title || 'بدون عنوان'}
                              </h3>
                              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
                                {request.serviceType || 'نوع خدمة غير محدد'}
                              </p>
                            </div>
                            <span style={{ ...chipStyle, color: urgency.color, background: urgency.bg }}>
                              {urgency.label}
                            </span>
                          </div>

                          <div style={metaGridStyle}>
                            <span style={metaItemStyle}><FaTools /> {request.requiredSkill || 'غير محدد'}</span>
                            <span style={metaItemStyle}><FaCalendarAlt /> {request.scheduleDate || 'غير محدد'}</span>
                            <span style={metaItemStyle}><FaClock /> {request.duration || 0} ساعة</span>
                            <span style={metaItemStyle}><FaBuilding /> {request.partnerId || 'بدون شريك'}</span>
                            <span style={metaItemStyle}><FaMapMarkerAlt /> {locationNameById[request.locationId] || request.locationId || 'بدون خريطة'}</span>
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
                          <button type="button" onClick={() => setHistoryEntityId(requestId)} style={{ ...iconButtonStyle, color: '#0f172a' }} title="Ø¹Ø±Ø¶ Ø§Ù„Ù€ history">
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

          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>تفاصيل الطلب</h2>
                <p style={sectionMetaStyle}>GET `/api/ServiceRequests/{'{id}'}`</p>
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
                  <p style={{ margin: '6px 0 0', color: '#64748b' }}>{selectedRequest.serviceType || 'نوع خدمة غير محدد'}</p>
                </div>

                <div style={detailsGridStyle}>
                  <DetailItem label="المعرف" value={getRequestId(selectedRequest) || '-'} />
                  <DetailItem label="المهارة المطلوبة" value={selectedRequest.requiredSkill || '-'} />
                  <DetailItem label="الاستعجال" value={getUrgencyLabel(selectedRequest.urgencyLevel).label} />
                  <DetailItem label="التاريخ" value={selectedRequest.scheduleDate || '-'} />
                  <DetailItem label="المدة" value={`${selectedRequest.duration || 0} ساعة`} />
                  <DetailItem label="الشريك" value={selectedRequest.partnerId || '-'} />
                  <DetailItem label="الخريطة" value={locationNameById[selectedRequest.locationId] || selectedRequest.locationId || '-'} />
                  <DetailItem label="الحالة" value={String(selectedRequest.status ?? 1)} />
                </div>

                <div>
                  <h4 style={detailLabelStyle}>الوصف</h4>
                  <p style={{ margin: '6px 0 0', color: '#334155', lineHeight: 1.8 }}>
                    {selectedRequest.briefDescription || 'لا يوجد وصف.'}
                  </p>
                </div>

                {canVolunteerForRequest(getRequestId(selectedRequest)) && (
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

      {renderRequestModal()}

      <EntityHistoryModal
        isOpen={Boolean(historyEntityId)}
        entityId={historyEntityId}
        title="Ø³Ø¬Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø®Ø¯Ù…Ø©"
        onClose={() => setHistoryEntityId(null)}
      />
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div style={detailItemStyle}>
    <span style={detailLabelStyle}>{label}</span>
    <strong style={detailValueStyle}>{value}</strong>
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
  padding: 24,
  borderRadius: 24,
  background: 'linear-gradient(135deg, rgba(14,165,233,.12), rgba(37,99,235,.08))',
  border: '1px solid rgba(59,130,246,.16)',
  flexWrap: 'wrap',
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
  fontSize: 28,
  fontWeight: 900,
  color: '#0f172a',
};

const heroSubtitleStyle = {
  margin: '8px 0 0',
  color: '#475569',
  fontSize: 14,
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
  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, .9fr)',
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
