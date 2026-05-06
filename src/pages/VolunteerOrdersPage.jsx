import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHandsHelping,
  FaEye,
  FaHistory,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaClock,
  FaTasks,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { volunteerOrdersService } from '../services/volunteerOrdersService';
import EntityHistoryModal from '../components/modals/EntityHistoryModal';

const getOrderId = (order) => order?.id || order?.volunteerOrderId || order?.orderId || null;
const getOrderStatus = (order) => order?.status ?? order?.orderStatus ?? order?.state ?? order?.requestStatus ?? null;
const getOrderProgress = (order) => order?.progress ?? order?.currentProgress ?? order?.completionProgress ?? 0;

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
  if (['rejected', 'reject', 'declined', '3'].includes(normalized)) return 'rejected';
  if (['pending', 'awaiting', '1'].includes(normalized)) return 'pending';
  return normalized || 'pending';
};

const VolunteerOrdersPage = () => {
  const { user } = useAuth();
  const roles = parseRoles(user);
  const isAdmin = roles.includes('admin');

  const [activeTab, setActiveTab] = useState(isAdmin ? 'my' : 'my');
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
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

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);
  const currentOrders = activeTab === 'pending' ? pendingOrders : orders;

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
      } else {
        const response = await volunteerOrdersService.getVolunteerOrders(targetPage, targetSize);
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

  const handleViewDetails = async (orderId) => {
    setSelectedOrder(null);
    setDetailsError(null);
    setDetailsLoading(true);
    try {
      const response = await volunteerOrdersService.getVolunteerOrderById(orderId);
      setSelectedOrder(response);
      setProgressDrafts((prev) => ({
        ...prev,
        [orderId]: Number(response?.progress) || 0
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
        await handleViewDetails(selectedOrderForReject);
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

      const mergeUpdatedOrder = (order) => {
        if (getOrderId(order) !== orderId) return order;

        return {
          ...order,
          ...updatedOrder,
          progress: getOrderProgress(updatedOrder) || progressValue,
          status: getOrderStatus(updatedOrder) || getOrderStatus(order) || 'approved',
        };
      };

      setOrders((prev) => prev.map(mergeUpdatedOrder));
      setPendingOrders((prev) => prev.map(mergeUpdatedOrder));
      setProgressDrafts((prev) => ({ ...prev, [orderId]: getOrderProgress(updatedOrder) || progressValue }));
      if (getOrderId(selectedOrder) === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          ...updatedOrder,
          progress: getOrderProgress(updatedOrder) || progressValue,
          status: getOrderStatus(updatedOrder) || getOrderStatus(prev) || 'approved',
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

  const statusChip = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'approved') {
      return { label: 'approved', color: '#16a34a', bg: 'rgba(34,197,94,.14)' };
    }
    if (normalized === 'rejected') {
      return { label: 'rejected', color: '#dc2626', bg: 'rgba(239,68,68,.14)' };
    }
    return { label: 'pending', color: '#ca8a04', bg: 'rgba(234,179,8,.18)' };
  };

  const pageTitle = isAdmin ? 'طلبات المتطوعين' : 'تطوعاتي';

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} style={heroStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={heroIconStyle}>
              <FaHandsHelping />
            </div>
            <div>
              <h1 style={heroTitleStyle}>{pageTitle}</h1>
              <p style={heroSubtitleStyle}>إدارة أوامر التطوع، التفاصيل، الحذف، والطلبات المعلقة للأدمن.</p>
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

        <div style={contentGridStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>{activeTab === 'pending' ? 'الطلبات المعلقة' : 'قائمة التطوعات'}</h2>
                <p style={sectionMetaStyle}>
                  {activeTab === 'pending'
                    ? 'GET `/api/VolunteerOrders/pending?PageNumber=1&PageSize=1`'
                    : 'GET `/api/VolunteerOrders?PageNumber=1&PageSize=1`'}
                </p>
              </div>
            </div>

            {loading ? (
              <div style={loadingBoxStyle}>
                <FaSpinner className="animate-spin" />
                <span>جاري تحميل البيانات...</span>
              </div>
            ) : currentOrders.length === 0 ? (
              <div style={emptyBoxStyle}>لا توجد عناصر في هذا القسم.</div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                <AnimatePresence mode="wait">
                  {currentOrders.map((order, index) => {
                    const orderId = getOrderId(order);
                    const chip = statusChip(getOrderStatus(order));
                    const isApproved = normalizeStatus(getOrderStatus(order)) === 'approved';

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
                                {order.title || order.serviceRequestTitle || `طلب #${orderId || index + 1}`}
                              </h3>
                              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
                                ServiceRequestId: {order.serviceRequestId || '-'}
                              </p>
                            </div>
                            <span style={{ ...chipStyle, color: chip.color, background: chip.bg }}>
                              {chip.label}
                            </span>
                          </div>

                          <div style={metaGridStyle}>
                            <span style={metaItemStyle}><FaClock /> {order.createdAt || order.orderDate || 'غير محدد'}</span>
                            <span style={metaItemStyle}><FaTasks /> progress: {getOrderProgress(order)}</span>
                          </div>

                          {isApproved && (
                            <div style={progressRowStyle}>
                              <input
                                type="number"
                                min="0"
                                value={progressDrafts[orderId] ?? getOrderProgress(order)}
                                onChange={(event) => setProgressDrafts((prev) => ({
                                  ...prev,
                                  [orderId]: Number(event.target.value)
                                }))}
                                style={{ ...inputStyle, maxWidth: 120 }}
                              />
                              <button
                                type="button"
                                onClick={() => handleProgressSave(orderId)}
                                disabled={actionLoading[orderId] === 'progress'}
                                style={primaryButtonStyle}
                              >
                                {actionLoading[orderId] === 'progress' ? 'جاري...' : 'حفظ التقدم'}
                              </button>
                            </div>
                          )}
                        </div>

                        <div style={actionsRowStyle}>
                          <button type="button" onClick={() => handleViewDetails(orderId)} style={iconButtonStyle} title="التفاصيل">
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryEntityId(orderId)}
                            style={{ ...iconButtonStyle, color: '#0f172a' }}
                            title="Ø¹Ø±Ø¶ Ø§Ù„Ù€ history"
                          >
                            <FaHistory />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(orderId)}
                            disabled={actionLoading[orderId] === 'delete'}
                            style={{ ...iconButtonStyle, color: '#dc2626', borderColor: 'rgba(239,68,68,.22)' }}
                            title="حذف"
                          >
                            {actionLoading[orderId] === 'delete' ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                          </button>
                          {isAdmin && activeTab === 'pending' && (
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

          <div style={panelStyle}>
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
                <DetailItem label="المعرف" value={getOrderId(selectedOrder) || '-'} />
                <DetailItem label="ServiceRequestId" value={selectedOrder.serviceRequestId || '-'} />
                <DetailItem label="الحالة" value={String(getOrderStatus(selectedOrder) || '-')} />
                <DetailItem label="التقدم" value={String(getOrderProgress(selectedOrder))} />
                <DetailItem label="سبب الرفض" value={selectedOrder.rejectionReason || '-'} />
              </div>
            )}
          </div>
        </div>
      </div>

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
        title="Ø³Ø¬Ù„ Ø·Ù„Ø¨ Ø§Ù„ØªØ·ÙˆØ¹"
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

const pageStyle = { padding: 24 };
const containerStyle = { display: 'grid', gap: 18 };
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
  width: 64, height: 64, borderRadius: 18, display: 'grid', placeItems: 'center',
  background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#fff', fontSize: 28,
  boxShadow: '0 18px 34px rgba(37,99,235,.25)',
};
const heroTitleStyle = { margin: 0, fontSize: 28, fontWeight: 900, color: '#0f172a' };
const heroSubtitleStyle = { margin: '8px 0 0', color: '#475569', fontSize: 14 };
const statsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 };
const statCardStyle = {
  padding: 18, borderRadius: 20, background: '#fff', border: '1px solid rgba(226,232,240,.9)',
  boxShadow: '0 10px 30px rgba(15,23,42,.04)', display: 'grid', gap: 8,
};
const statLabelStyle = { color: '#64748b', fontSize: 13, fontWeight: 700 };
const statValueStyle = { color: '#0f172a', fontSize: 24, fontWeight: 900 };
const tabsStyle = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };
const tabButtonStyle = {
  border: '1px solid rgba(148,163,184,.25)', borderRadius: 14, padding: '10px 16px',
  background: '#fff', color: '#334155', fontSize: 14, fontWeight: 700, cursor: 'pointer',
};
const activeTabStyle = { background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#fff', borderColor: 'transparent' };
const contentGridStyle = { display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, .9fr)', gap: 18 };
const panelStyle = {
  padding: 20, borderRadius: 24, background: '#fff', border: '1px solid rgba(226,232,240,.9)',
  boxShadow: '0 18px 40px rgba(15,23,42,.05)', display: 'grid', gap: 18,
};
const panelHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 };
const sectionTitleStyle = { margin: 0, color: '#0f172a', fontSize: 20, fontWeight: 900 };
const sectionMetaStyle = { margin: '6px 0 0', color: '#64748b', fontSize: 12 };
const loadingBoxStyle = {
  minHeight: 220, borderRadius: 20, border: '1px dashed rgba(148,163,184,.45)',
  display: 'grid', placeItems: 'center', gap: 12, color: '#64748b', textAlign: 'center', padding: 24,
};
const emptyBoxStyle = {
  minHeight: 220, borderRadius: 20, background: 'rgba(248,250,252,.9)', border: '1px dashed rgba(148,163,184,.45)',
  display: 'grid', placeItems: 'center', color: '#64748b', textAlign: 'center', padding: 24,
};
const errorAlertStyle = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 16,
  background: 'rgba(239,68,68,.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,.18)',
};
const cardStyle = {
  padding: 18, borderRadius: 20, border: '1px solid rgba(226,232,240,.9)',
  background: 'linear-gradient(180deg, #fff, #f8fbff)', display: 'grid', gap: 14,
};
const chipStyle = { borderRadius: 999, padding: '7px 12px', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' };
const metaGridStyle = { display: 'flex', gap: 12, flexWrap: 'wrap' };
const metaItemStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999,
  background: 'rgba(241,245,249,.9)', color: '#475569', fontSize: 12, fontWeight: 700,
};
const actionsRowStyle = { display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' };
const iconButtonStyle = {
  width: 42, height: 42, borderRadius: 12, border: '1px solid rgba(148,163,184,.2)', background: '#fff',
  color: '#2563eb', display: 'grid', placeItems: 'center', cursor: 'pointer',
};
const primaryButtonStyle = {
  border: 'none', borderRadius: 14, padding: '12px 18px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
  color: '#fff', fontSize: 14, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
};
const secondaryButtonStyle = {
  border: '1px solid rgba(148,163,184,.25)', borderRadius: 14, padding: '10px 16px', background: '#fff',
  color: '#334155', fontSize: 14, fontWeight: 700, cursor: 'pointer',
};
const paginationStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' };
const progressRowStyle = { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' };
const detailItemStyle = {
  padding: 14, borderRadius: 16, background: 'rgba(248,250,252,.95)', border: '1px solid rgba(226,232,240,.9)',
  display: 'grid', gap: 6,
};
const detailLabelStyle = { color: '#64748b', fontSize: 12, fontWeight: 700 };
const detailValueStyle = { color: '#0f172a', fontSize: 14, fontWeight: 800, wordBreak: 'break-word' };
const inputStyle = {
  width: '100%', padding: '11px 12px', borderRadius: 12, border: '1px solid rgba(203,213,225,.95)',
  background: '#fff', color: '#0f172a', fontSize: 14,
};
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,.52)', display: 'grid', placeItems: 'center', zIndex: 1100, padding: 20,
};
const modalStyle = {
  width: 'min(620px, 100%)', padding: 22, borderRadius: 24, background: '#fff', boxShadow: '0 30px 70px rgba(15,23,42,.22)', display: 'grid', gap: 16,
};
const preStyle = {
  margin: 0, padding: 14, borderRadius: 16, background: '#0f172a', color: '#e2e8f0',
  whiteSpace: 'pre-wrap', wordBreak: 'break-word', direction: 'ltr', textAlign: 'left',
};

export default VolunteerOrdersPage;
