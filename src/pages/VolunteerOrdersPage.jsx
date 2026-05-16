import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHandsHelping,
  FaEye,
  FaHistory,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaClock,
  FaTasks,
  FaSearch,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { volunteerOrdersService } from '../services/volunteerOrdersService';
import { serviceRequestsService } from '../services/serviceRequestsService';
import EntityHistoryModal from '../components/modals/EntityHistoryModal';

const getOrderId = (order) => order?.id || order?.volunteerOrderId || order?.orderId || null;
const getServiceRequestId = (order) =>
  order?.serviceRequestId ||
  order?.serviceRequest?.id ||
  order?.serviceRequest?.serviceRequestId ||
  order?.requestId ||
  null;
const getOrderStatus = (order) =>
  order?.status ??
  order?.orderStatus ??
  order?.state ??
  order?.requestStatus ??
  order?.approvalStatus ??
  order?.approvalState ??
  order?.volunteerOrderStatus ??
  order?.adminStatus ??
  null;
const getOrderProgress = (order) => order?.progress ?? order?.currentProgress ?? order?.completionProgress ?? 0;
const PROGRESS_OPTIONS = [
  { value: 0, label: 'لم يبدأ' },
  { value: 1, label: 'قيد التنفيذ' },
  { value: 2, label: 'مكتمل' },
];

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

const normalizeStatus = (status) => {
  if (typeof status === 'number') {
    if (status === 2) return 'approved';
    if (status === 3) return 'rejected';
    return 'pending';
  }

  const normalized = String(status || '').trim().toLowerCase();
  if (['approved', 'approve', 'accepted', '2'].includes(normalized)) return 'approved';
  if (['in_progress', 'in progress', 'processing', 'running', 'active', '4'].includes(normalized)) return 'in_progress';
  if (['rejected', 'reject', 'declined', '3'].includes(normalized)) return 'rejected';
  if (['pending', 'awaiting', '1'].includes(normalized)) return 'pending';
  return normalized || 'pending';
};

const deriveOrderStatus = (order) => {
  const progress = Number(getOrderProgress(order)) || 0;
  if (progress > 0) return 'in_progress';

  const normalized = normalizeStatus(getOrderStatus(order));
  if (normalized !== 'pending') return normalized;

  if (
    order?.isApproved === true ||
    order?.approved === true ||
    order?.approvalStatus === true ||
    order?.approvedAt ||
    order?.approvedBy
  ) {
    return 'approved';
  }

  return normalized;
};

const VolunteerOrdersPage = () => {
  const { user } = useAuth();
  const roles = parseRoles(user);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'my' : 'my');
  const [orders, setOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [myAcceptedOrders, setMyAcceptedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailsError, setDetailsError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState({});
  const [progressDrafts, setProgressDrafts] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrderForReject, setSelectedOrderForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [historyEntityId, setHistoryEntityId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userRoles = parseRoles(user);
    setIsAdmin(userRoles.includes('admin'));
  }, [user]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);
  const currentOrders = activeTab === 'pending' ? pendingOrders : activeTab === 'accepted' ? myAcceptedOrders : orders;
  const filteredCurrentOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return currentOrders;

    return currentOrders.filter((order) =>
      [
        order.title,
        order.serviceRequestTitle,
        order.serviceType,
        order.category,
        order.briefDescription,
        statusChip(deriveOrderStatus(order)).label,
        order.createdAt,
        order.orderDate,
      ]
        .map((value) => String(value || '').toLowerCase())
        .some((value) => value.includes(term))
    );
  }, [currentOrders, searchTerm]);

  const fetchPendingCount = async () => {
    if (!isAdmin) return;
    try {
      const count = await volunteerOrdersService.getPendingVolunteerOrdersCount();
      setPendingCount(count);
    } catch (requestError) {
      console.warn('VOLUNTEER ORDERS PENDING COUNT PAGE ERROR:', requestError);
    }
  };

  const fetchOrders = async (targetPage = pageNumber, targetSize = pageSize, targetTab = activeTab) => {
    setLoading(true);
    setError(null);

    try {
      if (targetTab === 'pending' && isAdmin) {
        const response = await volunteerOrdersService.getPendingVolunteerOrders(targetPage, targetSize);
        setPendingOrders(response.items);
        setTotalCount(response.totalCount);
      } else if (targetTab === 'accepted') {
        const response = await serviceRequestsService.getApprovedServiceRequests(targetPage, targetSize);
        console.log('VOLUNTEER APPROVED SERVICE REQUESTS PAGE RESPONSE:', response);
        setMyAcceptedOrders(response.items);
        setTotalCount(response.totalCount);
      } else if (isAdmin) {
        const response = await volunteerOrdersService.getVolunteerOrders(targetPage, targetSize);
        setOrders(response.items);
        setTotalCount(response.totalCount);
      } else {
        const response = await volunteerOrdersService.getMyVolunteerOrders(targetPage, targetSize);
        console.log('VOLUNTEER MY ORDERS PAGE RESPONSE:', response);
        setOrders(response.items);
        setTotalCount(response.totalCount);
      }
    } catch (requestError) {
      setError(requestError.message || 'فشل في جلب بيانات التطوع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pageNumber, pageSize, activeTab]);

  useEffect(() => {
    fetchPendingCount();
  }, [isAdmin]);

  const handleViewDetails = async (order) => {
    const orderId = getOrderId(order);
    const serviceRequestId = getServiceRequestId(order);

    setSelectedOrder(null);
    setDetailsError(null);
    setDetailsLoading(true);
    try {
      let response;

      if (!isAdmin && activeTab === 'accepted') {
        response = order;
      } else {
        response = await volunteerOrdersService.getVolunteerOrderById(orderId);
      }

      const mergedResponse = {
        ...order,
        ...response,
        serviceRequestId: response?.serviceRequestId || serviceRequestId,
      };

      setSelectedOrder(mergedResponse);
      setProgressDrafts((prev) => ({
        ...prev,
        [orderId]: Number(getOrderProgress(mergedResponse)) || 0
      }));
    } catch (requestError) {
      setDetailsError(requestError.message || 'فشل في جلب التفاصيل');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!orderId) return;
    if (!confirm('هل أنت متأكد من حذف عنصر التطوع؟')) return;

    setActionLoading((prev) => ({ ...prev, [orderId]: 'delete' }));
    try {
      await volunteerOrdersService.deleteVolunteerOrder(orderId);
      setOrders((prev) => prev.filter((order) => getOrderId(order) !== orderId));
      setMyAcceptedOrders((prev) => prev.filter((order) => getOrderId(order) !== orderId));
      setPendingOrders((prev) => prev.filter((order) => getOrderId(order) !== orderId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (getOrderId(selectedOrder) === orderId) {
        setSelectedOrder(null);
      }
      await fetchPendingCount();
    } catch (requestError) {
      alert(requestError.message || 'فشل في حذف عنصر التطوع');
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  const handleApprove = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: 'approve' }));
    try {
      const approvedResponse = await volunteerOrdersService.approveVolunteerOrder(orderId);
      const updatedOrder = approvedResponse?.value || approvedResponse?.data || approvedResponse || {};

      const mergeApprovedOrder = (order) => {
        if (getOrderId(order) !== orderId) return order;

        return {
          ...order,
          ...updatedOrder,
          status: getOrderStatus(updatedOrder) || getOrderStatus(order) || 'approved',
        };
      };

      setOrders((prev) => prev.map(mergeApprovedOrder));
      setMyAcceptedOrders((prev) => prev.map(mergeApprovedOrder));
      setPendingOrders((prev) => prev.map(mergeApprovedOrder));
      await fetchPendingCount();
      if (getOrderId(selectedOrder) === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          ...updatedOrder,
          status: getOrderStatus(updatedOrder) || getOrderStatus(prev) || 'approved',
        }));
      }

      try {
        await fetchOrders(pageNumber, pageSize, activeTab);
      } catch (refreshError) {
        console.warn('VOLUNTEER ORDERS REFRESH AFTER PROGRESS FAILED:', refreshError);
      }
    } catch (requestError) {
      alert(requestError.message || 'فشل في اعتماد الطلب');
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  const openRejectModal = (orderId) => {
    setSelectedOrderForReject(orderId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedOrderForReject) return;
    setActionLoading((prev) => ({ ...prev, [selectedOrderForReject]: 'reject' }));
    try {
      await volunteerOrdersService.rejectVolunteerOrder(selectedOrderForReject, rejectionReason);
      setShowRejectModal(false);
      setSelectedOrderForReject(null);
      await fetchOrders(pageNumber, pageSize, activeTab);
      await fetchPendingCount();
      if (getOrderId(selectedOrder) === selectedOrderForReject) {
        await handleViewDetails({ id: selectedOrderForReject });
      }
    } catch (requestError) {
      alert(requestError.message || 'فشل في رفض الطلب');
    } finally {
      setActionLoading((prev) => ({ ...prev, [selectedOrderForReject]: null }));
    }
  };

  const handleProgressSave = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: 'progress' }));
    try {
      const progressValue = Number(progressDrafts[orderId]) || 0;
      const updatedResponse = await volunteerOrdersService.updateVolunteerOrderProgress(orderId, progressValue);
      const updatedOrder = updatedResponse?.value || updatedResponse?.data || updatedResponse || {};
      const nextProgress =
        updatedOrder?.progress ??
        updatedOrder?.currentProgress ??
        updatedOrder?.completionProgress ??
        progressValue;
      const nextStatus = nextProgress > 0 ? 'in_progress' : (getOrderStatus(updatedOrder) || 'approved');

      const mergeUpdatedOrder = (order) => {
        if (getOrderId(order) !== orderId) return order;

        return {
          ...order,
          ...updatedOrder,
          progress: nextProgress,
          status: nextStatus,
        };
      };

      setOrders((prev) => prev.map(mergeUpdatedOrder));
      setMyAcceptedOrders((prev) => prev.map(mergeUpdatedOrder));
      setPendingOrders((prev) => prev.map(mergeUpdatedOrder));
      setProgressDrafts((prev) => ({ ...prev, [orderId]: nextProgress }));
      if (getOrderId(selectedOrder) === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          ...updatedOrder,
          progress: nextProgress,
          status: nextStatus,
        }));
      }

      try {
        await fetchOrders(pageNumber, pageSize, activeTab);
      } catch (refreshError) {
        console.warn('VOLUNTEER ORDERS REFRESH AFTER PROGRESS FAILED:', refreshError);
      }
    } catch (requestError) {
      alert(requestError.message || 'فشل في حفظ التقدم');
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  function statusChip(status) {
    const normalized = normalizeStatus(status);
    if (normalized === 'approved') {
      return { label: 'approved', color: '#16a34a', bg: 'rgba(34,197,94,.14)' };
    }
    if (normalized === 'in_progress') {
      return { label: 'in progress', color: '#2563eb', bg: 'rgba(59,130,246,.14)' };
    }
    if (normalized === 'rejected') {
      return { label: 'rejected', color: '#dc2626', bg: 'rgba(239,68,68,.14)' };
    }
    return { label: 'pending', color: '#ca8a04', bg: 'rgba(234,179,8,.18)' };
  }

  const pageTitle = isAdmin ? 'طلبات المتطوعين' : 'تطوعاتي';
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
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{pageTitle}</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14, fontWeight: 500 }}>
                إدارة أوامر التطوع، التفاصيل، الحذف، والطلبات المعلقة للأدمن.
              </p>
            </div>
          </div>
        </motion.div>

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>إجمالي العناصر</span>
            <strong style={statValueStyle}>{totalCount}</strong>
          </div>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>الصفحة الحالية</span>
            <strong style={statValueStyle}>{pageNumber}</strong>
          </div>
          {isAdmin && (
            <div style={statCardStyle}>
              <span style={statLabelStyle}>الطلبات المعلقة</span>
              <strong style={statValueStyle}>{pendingCount}</strong>
            </div>
          )}
        </div>

        <div style={tabsStyle}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('my');
              setPageNumber(1);
            }}
            style={{ ...tabButtonStyle, ...(activeTab === 'my' ? activeTabStyle : {}) }}
          >
            {isAdmin ? 'كل طلبات المتطوعين' : 'تطوعاتي'}
          </button>
          {!isAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('accepted');
                setPageNumber(1);
              }}
              style={{ ...tabButtonStyle, ...(activeTab === 'accepted' ? activeTabStyle : {}) }}
            >
              طلباتي المقبولة
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('pending');
                setPageNumber(1);
              }}
              style={{ ...tabButtonStyle, ...(activeTab === 'pending' ? activeTabStyle : {}) }}
            >
              الطلبات المعلقة ({pendingCount})
            </button>
          )}
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPageNumber(1);
            }}
            style={{ ...inputStyle, maxWidth: 130 }}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

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
            placeholder="بحث بالعنوان أو نوع الخدمة أو الحالة"
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <div style={contentGridStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>{activeTab === 'pending' ? 'الطلبات المعلقة' : 'قائمة التطوعات'}</h2>
                <p style={sectionMetaStyle}>
                  {activeTab === 'pending'
                    ? 'GET `/api/VolunteerOrders/pending?PageNumber=1&PageSize=1`'
                    : activeTab === 'accepted'
                      ? 'GET `/api/VolunteerOrders/my-orders?PageNumber=1&PageSize=1`'
                      : isAdmin
                        ? 'GET `/api/VolunteerOrders?PageNumber=1&PageSize=1`'
                        : 'GET `/api/ServiceRequests/approved?PageNumber=1&PageSize=1`'}
                </p>
              </div>
            </div>

            {loading ? (
              <div style={loadingBoxStyle}>
                <FaSpinner className="animate-spin" />
                <span>جاري تحميل البيانات...</span>
              </div>
            ) : filteredCurrentOrders.length === 0 ? (
              <div style={emptyBoxStyle}>لا توجد عناصر في هذا القسم.</div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                <AnimatePresence mode="wait">
                  {filteredCurrentOrders.map((order, index) => {
                    const orderId = getOrderId(order);
                    const derivedStatus = deriveOrderStatus(order);
                    const chip = statusChip(derivedStatus);
                    const normalizedStatus = normalizeStatus(derivedStatus);
                    const isApproved = normalizedStatus === 'approved';
                    const isPending = normalizedStatus === 'pending';

                    return (
                      <motion.div
                        key={orderId || index}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ delay: index * 0.03 }}
                        style={cardStyle}
                      >
                        <div style={{ display: 'grid', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                            <div>
                              <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>
                                {order.title || order.serviceRequestTitle || order.requestName || order.name || `طلب ${index + 1}`}
                              </h3>
                              {isAdmin && (
                                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
                                  {order.serviceRequestTitle || order.title || order.serviceType || 'طلب تطوع'}
                                </p>
                              )}
                            </div>
                            <span style={{ ...chipStyle, color: chip.color, background: chip.bg }}>
                              {chip.label}
                            </span>
                          </div>

                          <div style={metaGridStyle}>
                            <span style={metaItemStyle}><FaClock /> {order.createdAt || order.orderDate || 'تاريخ الطلب'}</span>
                            <span style={metaItemStyle}>
                              <FaTasks /> {isAdmin ? `progress: ${getOrderProgress(order)}` : (activeTab === 'accepted' ? 'مقبول' : 'approved')}
                            </span>
                          </div>

                          {activeTab === 'accepted' && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              style={{ 
                                marginTop: 12, 
                                padding: 14, 
                                borderRadius: 16, 
                                background: '#0f172a', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#38bdf8' }}>
                                <FaTasks size={14} />
                                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.05em' }}>تفاصيل المهمة المقبولة</span>
                              </div>
                              <div style={{ display: 'grid', gap: 8, color: '#e2e8f0', fontSize: 13, fontWeight: 700 }}>
                                <span>{order.serviceRequestTitle || order.title || 'طلب تطوع'}</span>
                                <span>{order.serviceType || order.category || order.title || 'خدمة الطلب'}</span>
                                <span>{statusChip(deriveOrderStatus(order)).label}</span>
                              </div>
                            </motion.div>
                          )}

                          {isAdmin && isApproved && (
                            <div style={progressRowStyle}>
                              <select
                                value={progressDrafts[orderId] ?? getOrderProgress(order)}
                                onChange={async (event) => {
                                  const newProgress = Number(event.target.value);
                                  setProgressDrafts((prev) => ({
                                    ...prev,
                                    [orderId]: newProgress
                                  }));
                                  
                                  // Immediate API call on change
                                  setActionLoading((prev) => ({ ...prev, [orderId]: 'progress' }));
                                  try {
                                    const updatedResponse = await volunteerOrdersService.updateVolunteerOrderProgress(orderId, newProgress);
                                    const updatedOrder = updatedResponse?.value || updatedResponse?.data || updatedResponse || {};
                                    const nextStatus = newProgress > 0 ? 'in_progress' : (getOrderStatus(updatedOrder) || 'approved');
                                    
                                    const mergeUpdatedOrder = (order) => {
                                      if (getOrderId(order) !== orderId) return order;
                                      return {
                                        ...order,
                                        ...updatedOrder,
                                        progress: getOrderProgress(updatedOrder) || newProgress,
                                        status: nextStatus,
                                      };
                                    };
                                    
                                    setOrders((prev) => prev.map(mergeUpdatedOrder));
                                    setPendingOrders((prev) => prev.map(mergeUpdatedOrder));
                                    if (getOrderId(selectedOrder) === orderId) {
                                      setSelectedOrder((prev) => ({
                                        ...prev,
                                        ...updatedOrder,
                                        progress: getOrderProgress(updatedOrder) || newProgress,
                                        status: nextStatus,
                                      }));
                                    }
                                  } catch (error) {
                                    console.error('Failed to update progress:', error);
                                    alert(error.message || 'فشل في تحديث التقدم');
                                  } finally {
                                    setActionLoading((prev) => ({ ...prev, [orderId]: null }));
                                  }
                                }}
                                disabled={actionLoading[orderId] === 'progress'}
                                style={{ ...inputStyle, maxWidth: 120 }}
                              >
                                {PROGRESS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        <div style={actionsRowStyle}>
                          <button type="button" onClick={() => handleViewDetails(order)} style={iconButtonStyle} title="التفاصيل">
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryEntityId(orderId)}
                            style={{ ...iconButtonStyle, color: '#0f172a' }}
                            title="عرض السجل"
                          >
                            <FaHistory />
                          </button>
                          {isAdmin && isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(orderId)}
                                disabled={actionLoading[orderId] === 'approve'}
                                style={{ ...iconButtonStyle, color: '#16a34a', borderColor: 'rgba(34,197,94,.22)' }}
                                title="اعتماد"
                              >
                                {actionLoading[orderId] === 'approve' ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                              </button>
                              <button
                                type="button"
                                onClick={() => openRejectModal(orderId)}
                                disabled={actionLoading[orderId] === 'reject'}
                                style={{ ...iconButtonStyle, color: '#ea580c', borderColor: 'rgba(249,115,22,.22)' }}
                                title="رفض"
                              >
                                {actionLoading[orderId] === 'reject' ? <FaSpinner className="animate-spin" /> : <FaTimes />}
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
                <h2 style={sectionTitleStyle}>تفاصيل عنصر التطوع</h2>
                <p style={sectionMetaStyle}>GET `/api/VolunteerOrders/{'{id}'}`</p>
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
            ) : !selectedOrder ? (
              <div style={emptyBoxStyle}>اختر أي عنصر لعرض التفاصيل هنا.</div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                <DetailItem label="الطلب" value={selectedOrder.title || selectedOrder.serviceRequestTitle || 'طلب تطوع'} />
                <DetailItem label="نوع الخدمة" value={selectedOrder.serviceType || selectedOrder.category || '-'} />
                <DetailItem label="الحالة" value={String(deriveOrderStatus(selectedOrder) || '-')} />
              </div>
            )}
          </div>
        </div>
      </div>

      {(detailsLoading || detailsError || selectedOrder) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            zIndex: 2000,
          }}
          onClick={() => {
            setSelectedOrder(null);
            setDetailsError(null);
            setDetailsLoading(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              width: 'min(820px, 100%)',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 22,
              borderRadius: 24,
              background: '#fff',
              boxShadow: 'rgba(15, 23, 42, 0.22) 0px 30px 70px',
              display: 'grid',
              gap: 20,
              position: 'relative',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: 20, fontWeight: 900 }}>تفاصيل عنصر التطوع</h3>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13, fontWeight: 500 }}>
                  معلومات الطلب وحالته الحالية
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setDetailsError(null);
                  setDetailsLoading(false);
                }}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  background: '#fff',
                  color: '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
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
            ) : selectedOrder ? (
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 21, color: '#0f172a', fontWeight: 800 }}>
                    {selectedOrder.title || selectedOrder.serviceRequestTitle || 'بدون عنوان'}
                  </h3>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontWeight: 500 }}>
                    {selectedOrder.serviceType || selectedOrder.category || selectedOrder.title || 'خدمة الطلب'}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12
                }}>
                  <DetailItem label="الحالة" value={String(deriveOrderStatus(selectedOrder) || '-')} />
                  <DetailItem label="التاريخ" value={selectedOrder.createdAt || selectedOrder.orderDate || '-'} />
                  <DetailItem label="التقدم" value={`${getOrderProgress(selectedOrder)}%`} />
                </div>

                {selectedOrder.briefDescription && (
                  <div>
                    <h4 style={{ color: '#64748b', fontSize: 12, fontWeight: 700, margin: 0, marginBottom: 8 }}>الوصف</h4>
                    <p style={{ margin: 0, color: '#334155', lineHeight: 1.8, fontSize: 14, fontWeight: 500 }}>
                      {selectedOrder.briefDescription}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        </div>
      )}

      {showRejectModal && (
        <div style={overlayStyle} onClick={() => setShowRejectModal(false)}>
          <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
            <h3 style={{ margin: 0, color: '#0f172a' }}>رفض طلب التطوع</h3>
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="اكتب سبب الرفض"
              rows={5}
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowRejectModal(false)} style={secondaryButtonStyle}>
                إلغاء
              </button>
              <button type="button" onClick={handleReject} style={primaryButtonStyle}>
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      <EntityHistoryModal
        isOpen={Boolean(historyEntityId)}
        entityId={historyEntityId}
        title="سجل طلب التطوع"
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

const pageStyle = { padding: 16 };
const containerStyle = { display: 'grid', gap: 16 };
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
  width: 48, height: 48, borderRadius: 16, display: 'grid', placeItems: 'center',
  background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#fff', fontSize: 24,
  boxShadow: '0 18px 34px rgba(37,99,235,.25)',
};
const heroTitleStyle = { 
  margin: 0, 
  fontSize: 28, 
  fontWeight: 900, 
  color: '#ffffff',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
};
const heroSubtitleStyle = { 
  margin: '8px 0 0', 
  color: '#cbd5e1', 
  fontSize: 14,
  fontWeight: 600
};
const statsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 };
const statCardStyle = {
  padding: 14, borderRadius: 16, background: '#fff', border: '1px solid rgba(226,232,240,.9)',
  boxShadow: '0 8px 20px rgba(15,23,42,.04)', display: 'grid', gap: 6,
};
const statLabelStyle = { color: '#64748b', fontSize: 12, fontWeight: 700 };
const statValueStyle = { color: '#0f172a', fontSize: 20, fontWeight: 900 };
const tabsStyle = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' };
const tabButtonStyle = {
  border: '1px solid rgba(148,163,184,.25)', borderRadius: 12, padding: '8px 12px',
  background: '#fff', color: '#334155', fontSize: 12, fontWeight: 700, cursor: 'pointer',
};
const activeTabStyle = { background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#fff', borderColor: 'transparent' };
const contentGridStyle = { display: 'grid', gridTemplateColumns: '1fr', gap: 14 };
const panelStyle = {
  padding: 16, borderRadius: 20, background: '#fff', border: '1px solid rgba(226,232,240,.9)',
  boxShadow: '0 12px 24px rgba(15,23,42,.05)', display: 'grid', gap: 14,
};
const panelHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 };
const sectionTitleStyle = { margin: 0, color: '#0f172a', fontSize: 16, fontWeight: 900 };
const sectionMetaStyle = { margin: '4px 0 0', color: '#64748b', fontSize: 11 };
const loadingBoxStyle = {
  minHeight: 180, borderRadius: 16, border: '1px dashed rgba(148,163,184,.45)',
  display: 'grid', placeItems: 'center', gap: 8, color: '#64748b', textAlign: 'center', padding: 16,
};
const emptyBoxStyle = {
  minHeight: 180, borderRadius: 16, background: 'rgba(248,250,252,.9)', border: '1px dashed rgba(148,163,184,.45)',
  display: 'grid', placeItems: 'center', color: '#64748b', textAlign: 'center', padding: 16,
};
const errorAlertStyle = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 12px', borderRadius: 12,
  background: 'rgba(239,68,68,.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,.18)',
};
const cardStyle = {
  padding: 14, borderRadius: 16, border: '1px solid rgba(226,232,240,.9)',
  background: 'linear-gradient(180deg, #fff, #f8fbff)', display: 'grid', gap: 12,
};
const chipStyle = { borderRadius: 999, padding: '6px 10px', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' };
const metaGridStyle = { display: 'flex', gap: 8, flexWrap: 'wrap' };
const metaItemStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 999,
  background: 'rgba(241,245,249,.9)', color: '#475569', fontSize: 11, fontWeight: 700,
};
const actionsRowStyle = { display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' };
const iconButtonStyle = {
  width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(148,163,184,.2)', background: '#fff',
  color: '#2563eb', display: 'grid', placeItems: 'center', cursor: 'pointer',
};
const primaryButtonStyle = {
  border: 'none', borderRadius: 12, padding: '10px 14px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
  color: '#fff', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
};
const secondaryButtonStyle = {
  border: '1px solid rgba(148,163,184,.25)', borderRadius: 12, padding: '8px 12px', background: '#fff',
  color: '#334155', fontSize: 12, fontWeight: 700, cursor: 'pointer',
};
const paginationStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' };
const progressRowStyle = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' };
const detailItemStyle = {
  padding: 12, borderRadius: 12, background: 'rgba(248,250,252,.95)', border: '1px solid rgba(226,232,240,.9)',
  display: 'grid', gap: 4,
};
const detailLabelStyle = { color: '#64748b', fontSize: 11, fontWeight: 700 };
const detailValueStyle = { color: '#0f172a', fontSize: 12, fontWeight: 800, wordBreak: 'break-word' };
const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(203,213,225,.95)',
  background: '#fff', color: '#0f172a', fontSize: 12,
};
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,.52)', display: 'grid', placeItems: 'center', zIndex: 1100, padding: 16,
};
const modalStyle = {
  width: 'min(520px, 95%)', padding: 18, borderRadius: 20, background: '#fff', boxShadow: '0 24px 48px rgba(15,23,42,.22)', display: 'grid', gap: 12,
};
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 };
const preStyle = {
  margin: 0, padding: 14, borderRadius: 16, background: '#0f172a', color: '#e2e8f0',
  whiteSpace: 'pre-wrap', wordBreak: 'break-word', direction: 'ltr', textAlign: 'left',
};

export default VolunteerOrdersPage;




