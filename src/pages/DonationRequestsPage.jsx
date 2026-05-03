import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHandHoldingHeart,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
  FaEye,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaBuilding,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { donationRequestsService, normalizeDonationRequestsListResponse } from '../services/donationRequestsService';
import ViewDonationRequestModal from '../components/modals/ViewDonationRequestModal';
import EditDonationRequestModal from '../components/modals/EditDonationRequestModal';

const DonationRequestsPage = () => {
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
  const [actionLoading, setActionLoading] = useState({});

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

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);

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

  const getUrgencyLabel = (level) => {
    const levels = {
      1: { label: 'منخفض', color: 'text-green-400', bg: 'bg-green-500/20' },
      2: { label: 'متوسط', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      3: { label: 'عالي', color: 'text-orange-400', bg: 'bg-orange-500/20' },
      4: { label: 'حرج', color: 'text-red-400', bg: 'bg-red-500/20' },
      5: { label: 'طارئ', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    };
    return levels[level] || { label: 'غير محدد', color: 'text-gray-400', bg: 'bg-gray-500/20' };
  };

  const getStatusLabel = (status) => {
    const statuses = {
      pending: { label: 'قيد الانتظار', className: 'is-pending' },
      approved: { label: 'تمت الموافقة', className: 'is-approved' },
      rejected: { label: 'مرفوض', className: 'is-rejected' },
    };
    return statuses[status?.toLowerCase()] || { label: status || 'غير معروف', className: '' };
  };

  return (
    <div className="donation-requests-page p-6">
      <div className="donation-requests-page__container">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="donation-requests-page__hero">
          <div className="donation-requests-page__heroGroup">
            <div className="donation-requests-page__heroIcon">
              <FaHandHoldingHeart />
            </div>
            <div className="donation-requests-page__heroText">
              <h1 className="donation-requests-page__heroTitle">طلبات التبرع</h1>
              <p className="donation-requests-page__heroSubtitle">لوحة مراجعة واعتماد وحذف الطلبات بشكل واضح واحترافي.</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="donation-requests-page__stats">
          <div className="donation-requests-page__stat">
            <div>
              <p className="donation-requests-page__statLabel">إجمالي الطلبات</p>
              <p className="donation-requests-page__statValue">{totalCount}</p>
            </div>
          </div>
          <div className="donation-requests-page__stat">
            <div>
              <p className="donation-requests-page__statLabel">قيد الانتظار</p>
              <p className="donation-requests-page__statValue">{requests.filter((r) => r.status?.toLowerCase() === 'pending').length}</p>
            </div>
          </div>
          <div className="donation-requests-page__stat">
            <div>
              <p className="donation-requests-page__statLabel">تمت الموافقة</p>
              <p className="donation-requests-page__statValue">{requests.filter((r) => r.status?.toLowerCase() === 'approved').length}</p>
            </div>
          </div>
        </motion.div>

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

        {loading ? (
          <div className="donation-requests-page__loading">
            <div className="mission-page__emptyIcon">
              <FaSpinner className="animate-spin" />
            </div>
            <h3 className="donation-requests-page__emptyTitle">جاري تحميل الطلبات</h3>
            <p className="donation-requests-page__emptyText">انتظر لحظات حتى يتم جلب البيانات.</p>
          </div>
        ) : requests.length === 0 ? (
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
                  {requests.map((request, index) => {
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
                              {request.locationId || request.location || 'غير محدد'}
                            </span>
                            <span className="donation-requests-page__metaItem">
                              <FaBuilding className="text-purple-400" />
                              {request.partnerId || 'غير محدد'}
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
      </div>
    </div>
  );
};

export default DonationRequestsPage;
