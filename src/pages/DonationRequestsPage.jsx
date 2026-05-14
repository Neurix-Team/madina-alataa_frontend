import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  FaHandHoldingHeart,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
  FaEye,
  FaHistory,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaBuilding,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
} from 'react-icons/fa';
import { donationRequestsService, normalizeDonationRequestsListResponse } from '../services/donationRequestsService';
import { locationsService } from '../services/locationsService';
import ViewDonationRequestModal from '../components/modals/ViewDonationRequestModal';
import EditDonationRequestModal from '../components/modals/EditDonationRequestModal';
import CreateDonationRequestModal from '../components/modals/CreateDonationRequestModal';
import EntityHistoryModal from '../components/modals/EntityHistoryModal';

const getTokenFromStorage = () => {
  return (
    localStorage.getItem('madina_access_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('google_temp_token') ||
    localStorage.getItem('jwt') ||
    ''
  );
};

const decodeJwtPayload = (token) => {
  try {
    if (!token || !token.includes('.')) return null;

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn('Failed to decode token payload:', error);
    return null;
  }
};

const extractRoles = (user) => {
  const tokenPayload = decodeJwtPayload(getTokenFromStorage());

  const rawRoles =
    user?.roles ??
    user?.role ??
    user?.Role ??
    user?.userRoles ??
    user?.claims?.role ??
    user?.claims?.roles ??
    user?.['role'] ??
    user?.['roles'] ??
    user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    tokenPayload?.roles ??
    tokenPayload?.role ??
    tokenPayload?.Role ??
    tokenPayload?.['role'] ??
    tokenPayload?.['roles'] ??
    tokenPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    [];

  if (Array.isArray(rawRoles)) {
    return rawRoles.map((role) => String(role).trim()).filter(Boolean);
  }

  return String(rawRoles || '')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);
};

const DonationRequestsPage = () => {
  const { user } = useAuth();
  const roles = extractRoles(user);
  const isAdmin = roles.some(
    (role) => String(role).trim().toLowerCase() === 'admin'
  );
  
  // console.log('🔍 Donation Requests Page - User:', user);
  // console.log('👑 User roles:', user?.roles);
  // console.log('🛡️ Is Admin:', isAdmin);
  console.log('🔍 Donation Requests Page - User:', user);
console.log('👑 Extracted roles:', roles);
console.log('🛡️ Is Admin:', isAdmin);
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [apiResponse, setApiResponse] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [locations, setLocations] = useState([]);
  const [historyEntityId, setHistoryEntityId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await donationRequestsService.getAllDonationRequests(pageNumber, pageSize);
      const normalized = normalizeDonationRequestsListResponse(response);
      console.log('DONATION REQUESTS ADMIN RAW RESPONSE:', normalized.raw);
      setApiResponse(normalized.raw);
      setRequests(normalized.items);
      setTotalCount(normalized.totalCount);
    } catch (err) {
      console.error('Error fetching donation requests:', err);
      setError(err.message || 'فشل في جلب طلبات التبرع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [pageNumber, pageSize]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await locationsService.getLocations();
        const items =
          Array.isArray(response) ? response :
          Array.isArray(response?.data) ? response.data :
          Array.isArray(response?.items) ? response.items :
          Array.isArray(response?.value) ? response.value :
          [];
        setLocations(items);
      } catch (err) {
        console.error('Error fetching locations for donation requests:', err);
      }
    };

    loadLocations();
  }, []);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const locationNameById = useMemo(
    () =>
      locations.reduce((acc, location) => {
        const id = location?.id || location?.locationId || location?.Id || location?.LocationId;
        if (id) acc[String(id)] = location?.name || location?.Name || 'موقع الطلب';
        return acc;
      }, {}),
    [locations]
  );
  const getLocationName = (request) =>
    request.locationName ||
    request.location?.name ||
    request.location ||
    locationNameById[String(request.locationId || '')] ||
    request.targetLocation ||
    request.title ||
    'موقع الطلب';
  const getPartnerName = (request) =>
    request.partnerName || request.partner?.orgName || request.partner?.name || request.partner || request.title || 'الشريك المرتبط بالطلب';
  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return requests;

    return requests.filter((request) =>
      [
        request.title,
        request.briefDescription,
        request.status,
        getUrgencyLabel(request.urgencyLevel).label,
        getLocationName(request),
        getPartnerName(request),
        request.donateAmount,
      ]
        .map((value) => String(value || '').toLowerCase())
        .some((value) => value.includes(term))
    );
  }, [requests, searchTerm, locations]);

  const handleApprove = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'approve' }));
    try {
      await donationRequestsService.approveDonationRequest(id);
      await fetchRequests();
    } catch (err) {
      console.error('Error approving request:', err);
      alert(err.message || 'فشل في قبول الطلب');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
    try {
      await donationRequestsService.rejectDonationRequest(id);
      await fetchRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(err.message || 'فشل في رفض الطلب');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    setActionLoading((prev) => ({ ...prev, [id]: 'delete' }));
    try {
      await donationRequestsService.deleteDonationRequest(id);
      await fetchRequests();
    } catch (err) {
      console.error('Error deleting request:', err);
      alert(err.message || 'فشل في حذف الطلب');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  function getUrgencyLabel(level) {
    const levels = {
      1: { label: 'منخفض', color: 'text-green-400', bg: 'bg-green-500/20' },
      2: { label: 'متوسط', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      3: { label: 'عالي', color: 'text-orange-400', bg: 'bg-orange-500/20' },
      4: { label: 'حرج', color: 'text-red-400', bg: 'bg-red-500/20' },
      5: { label: 'طارئ', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    };
    return levels[level] || { label: 'درجة الاستعجال', color: 'text-gray-400', bg: 'bg-gray-500/20' };
  }

  const getStatusLabel = (status) => {
    const statuses = {
      pending: { label: 'قيد الانتظار', className: 'is-pending' },
      approved: { label: 'تمت الموافقة', className: 'is-approved' },
      rejected: { label: 'مرفوض', className: 'is-rejected' },
    };
    return statuses[status?.toLowerCase()] || { label: status || 'غير معروف', className: '' };
  };

  return (
    <div className="pro-page" style={{ background: 'transparent' }} dir="rtl">
      <div className="pro-container space-y-12">
        {/* Header */}
        <div className="pro-header">
          <div className="pro-header-left">
            <div className="pro-header-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <FaHandHoldingHeart />
            </div>
            <div>
              <h1 className="pro-header-title">طلبات التبرع</h1>
              <p className="pro-header-subtitle">إدارة ومراجعة جميع طلبات التبرع والمساهمات الإنسانية</p>
            </div>
          </div>
          
          <div className="pro-header-actions">
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="pro-btn pro-btn-primary"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
              >
                <FaPlus />
                <span>إضافة طلب جديد</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="pro-stats">
          {[
            { label: 'إجمالي الطلبات', value: totalCount, icon: FaHandHoldingHeart, type: 'primary' },
            { label: 'قيد الانتظار', value: requests.filter((r) => r.status?.toLowerCase() === 'pending').length, icon: FaSpinner, type: 'warning' },
            { label: 'تمت الموافقة', value: requests.filter((r) => r.status?.toLowerCase() === 'approved').length, icon: FaCheck, type: 'success' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }} 
              className="pro-stat pro-animate-in"
            >
              <div className={`pro-stat-icon ${stat.type}`}>
                <stat.icon className={stat.label === 'قيد الانتظار' ? 'animate-spin' : ''} />
              </div>
              <div>
                <p className="pro-stat-label">{stat.label}</p>
                <p className="pro-stat-value">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* {apiResponse && (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="donation-requests-page__panel">
            <div className="donation-requests-page__sectionHead">
              <p className="donation-requests-page__sectionTitle">استجابة API الخام</p>
              <span className="donation-requests-page__sectionMeta">GET /api/donation-requests</span>
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text)', direction: 'ltr', textAlign: 'left' }}>
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </motion.div>
        )} */}

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="donation-requests-page__alert">
            <FaExclamationTriangle />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="pro-section" style={{ marginBottom: 0 }}>
          <div className="pro-input-group" style={{ maxWidth: '520px' }}>
            <FaSearch className="pro-input-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ابحث بالعنوان أو الموقع أو الشريك أو الحالة..."
              className="pro-input with-icon"
            />
          </div>
        </div>

        {loading ? (
          <div className="donation-requests-page__loading">
            <div className="mission-page__emptyIcon">
              <FaSpinner className="animate-spin" />
            </div>
            <h3 className="donation-requests-page__emptyTitle">جاري تحميل الطلبات</h3>
            <p className="donation-requests-page__emptyText">انتظر لحظات حتى يتم جلب البيانات.</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="donation-requests-page__empty">
            <div className="donation-requests-page__emptyIcon">
              <FaHandHoldingHeart />
            </div>
            <h3 className="donation-requests-page__emptyTitle">لا توجد طلبات تبرع</h3>
            <p className="donation-requests-page__emptyText">عند وصول طلبات جديدة ستظهر هنا بنفس الشكل حتى إذا لم يتم تحميل Tailwind.</p>
          </motion.div>
        ) : (
          <>
            <div className="donation-requests-page__panel">
              <div className="donation-requests-page__sectionHead">
                <p className="donation-requests-page__sectionTitle">سجل الطلبات الحالية</p>
                <span className="donation-requests-page__sectionMeta">صفحة {pageNumber} من {totalPages || 1}</span>
              </div>

              <div className="donation-requests-page__list">
                <AnimatePresence>
                  {filteredRequests.map((request, index) => {
                    const status = getStatusLabel(request.status);
                    const urgency = getUrgencyLabel(request.urgencyLevel);

                    return (
                      <motion.div
                        key={request.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.04 }}
                        className="donation-requests-page__card"
                      >
                        <div className="donation-requests-page__content">
                          <div className="donation-requests-page__titleRow">
                            <h3 className="donation-requests-page__requestTitle">{request.title || 'بدون عنوان'}</h3>
                            <span className={`donation-requests-page__chip ${status.className}`}>{status.label}</span>
                            <span className={`donation-requests-page__chip is-urgency ${urgency.bg} ${urgency.color}`}>{urgency.label}</span>
                          </div>

                          <div className="donation-requests-page__meta">
                            <span className="donation-requests-page__metaItem">
                              <FaMoneyBillWave className="text-green-400" />
                              {request.donateAmount?.toLocaleString('ar-EG') || 0} ج.م
                            </span>
                            <span className="donation-requests-page__metaItem">
                              <FaMapMarkerAlt className="text-blue-400" />
                              {getLocationName(request)}
                            </span>
                            <span className="donation-requests-page__metaItem">
                              <FaBuilding className="text-purple-400" />
                              {getPartnerName(request)}
                            </span>
                          </div>

                          {request.briefDescription && <p className="donation-requests-page__description">{request.briefDescription}</p>}
                        </div>

                        <div className="donation-requests-page__actions">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewDetails(request)} className="donation-requests-page__actionBtn is-info" title="عرض التفاصيل">
                            <FaEye />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEdit(request)} className="donation-requests-page__actionBtn is-edit" title="تعديل">
                            <FaEdit />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(request.id)} disabled={actionLoading[request.id]} className="donation-requests-page__actionBtn is-delete" title="حذف">
                            {actionLoading[request.id] === 'delete' ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                          </motion.button>
                          {request.status?.toLowerCase() === 'pending' && (
                            <>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleApprove(request.id)} disabled={actionLoading[request.id]} className="donation-requests-page__actionBtn is-approve" title="قبول الطلب">
                                {actionLoading[request.id] === 'approve' ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleReject(request.id)} disabled={actionLoading[request.id]} className="donation-requests-page__actionBtn is-reject" title="رفض الطلب">
                                {actionLoading[request.id] === 'reject' ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                              </motion.button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {totalPages > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="donation-requests-page__pagination">
                <button onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))} disabled={pageNumber === 1} className="donation-requests-page__pageBtn">
                  السابق
                </button>
                <span className="donation-requests-page__sectionMeta">صفحة {pageNumber} من {totalPages}</span>
                <button onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))} disabled={pageNumber === totalPages} className="donation-requests-page__pageBtn">
                  التالي
                </button>
              </motion.div>
            )}
          </>
        )}

        <ViewDonationRequestModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRequest(null);
          }}
          requestId={selectedRequest?.id}
        />

        <EditDonationRequestModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onSuccess={fetchRequests}
        />

        {isAdmin && (
          <CreateDonationRequestModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={fetchRequests}
            locations={locations}
          />
        )}
        <EntityHistoryModal
          isOpen={Boolean(historyEntityId)}
          entityId={historyEntityId}
          title="Donation Request History"
          onClose={() => setHistoryEntityId(null)}
        />
      </div>
    </div>
  );
};

export default DonationRequestsPage;
