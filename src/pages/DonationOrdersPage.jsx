import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDonate, FaSearch, FaCheck, FaTimes, FaEdit, FaEye, FaHistory, FaSpinner, 
  FaExclamationTriangle, FaCheckCircle, FaChevronLeft, FaChevronRight,
  FaMoneyBillWave, FaMapMarkerAlt, FaCreditCard, FaTag, FaFileAlt
} from 'react-icons/fa';
import { donationOrdersService, normalizeDonationOrdersListResponse } from '../services/donationOrdersService';
import EntityHistoryModal from '../components/modals/EntityHistoryModal';

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

const DonationOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [apiResponse, setApiResponse] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [historyEntityId, setHistoryEntityId] = useState(null);

  // Load donation orders on mount and when page changes
  useEffect(() => {
    loadDonationOrders();
  }, [currentPage]);

  const loadDonationOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await donationOrdersService.getAllDonationOrders(currentPage, pageSize);
      const normalized = normalizeDonationOrdersListResponse(response);

      setApiResponse(normalized.raw);
      setOrders(normalized.items);
      setTotalPages(normalized.totalPages);
      setTotalCount(normalized.totalCount);

      console.log('DONATION ORDERS ADMIN RAW RESPONSE:', normalized.raw);
      console.log('Donation orders loaded:', normalized.items);
      console.log('Pagination data:', normalized);
    } catch (err) {
      console.error('Error loading donation orders:', err);
      setError(err.message || 'فشل في تحميل طلبات التبرع');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredOrders = orders.filter(order => 
    order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.targetLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveOrder = async (orderId) => {
    try {
      setActionLoading(true);
      const updatedOrder = await donationOrdersService.approveDonationOrder(orderId);
      console.log('APPROVED DONATION ORDER RESPONSE:', updatedOrder);
      setSuccess('تمت الموافقة على طلب التبرع بنجاح');
      loadDonationOrders(); // Refresh the list
    } catch (err) {
      console.error('Error approving order:', err);
      setError(err.message || 'فشل في الموافقة على طلب التبرع');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      setActionLoading(true);
      const updatedOrder = await donationOrdersService.rejectDonationOrder(orderId);
      console.log('REJECTED DONATION ORDER RESPONSE:', updatedOrder);
      setSuccess('تم رفض طلب التبرع بنجاح');
      loadDonationOrders(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting order:', err);
      setError(err.message || 'فشل في رفض طلب التبرع');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (order) => {
    try {
      setActionLoading(true);
      const orderDetails = await donationOrdersService.getDonationOrderById(order.id);
      console.log('DONATION ORDER DETAILS ADMIN RESPONSE:', orderDetails);
      setSelectedOrder(orderDetails);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'فشل في جلب تفاصيل طلب التبرع');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'var(--success)';
      case 'rejected':
        return 'var(--danger)';
      case 'pending':
        return 'var(--warning)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'موافق عليه';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'قيد الانتظار';
      default:
        return status || 'غير محدد';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="donation-orders-page" style={{ padding: '24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="animate-spin" size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text)' }}>جاري تحميل طلبات التبرع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-page" style={{ background: 'transparent' }} dir="rtl">
      <div className="pro-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
              background: '#ecfdf5',
              color: '#10b981',
              fontSize: 24,
              border: '1px solid #d1fae5'
            }}>
              <FaDonate />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>طلبات التبرع</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14, fontWeight: 500 }}>إدارة جميع طلبات التبرع والمساهمات في النظام</p>
            </div>
          </div>
        </motion.div>

        
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pro-alert"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--danger)',
            }}
          >
            <FaExclamationTriangle />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pro-alert"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--success)',
            }}
          >
            <FaCheckCircle />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pro-card"
          style={{ marginBottom: '24px' }}
        >
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="البحث في طلبات التبرع..."
              value={searchTerm}
              onChange={handleSearch}
              className="pro-input"
              style={{ paddingRight: '40px' }}
            />
          </div>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pro-card"
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text)' }}>المبلغ</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text)' }}>طريقة الدفع</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text)' }}>الفئة</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text)' }}>الموقع المستهدف</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text)' }}>الحالة</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text)' }}>التاريخ</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text)' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد طلبات تبرع حالياً'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaMoneyBillWave style={{ color: 'var(--primary)' }} />
                          {order.amount || 0}
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaCreditCard style={{ color: 'var(--text-muted)' }} />
                          {order.paymentMethod || 'غير محدد'}
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaTag style={{ color: 'var(--text-muted)' }} />
                          {order.category || 'غير محدد'}
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaMapMarkerAlt style={{ color: 'var(--text-muted)' }} />
                          {order.targetLocation || 'غير محدد'}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: getStatusColor(order.status)
                          }}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text)' }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {/* View Details */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewDetails(order)}
                            title="عرض التفاصيل"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FaEye size={12} />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setHistoryEntityId(order.id)}
                            title="عرض السجل"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #0f172a, #334155)',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FaHistory size={12} />
                          </motion.button>

                          {/* Approve Button */}
                          {order.status?.toLowerCase() === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleApproveOrder(order.id)}
                              disabled={actionLoading}
                              title="موافقة"
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: actionLoading ? 0.5 : 1
                              }}
                            >
                              {actionLoading ? <FaSpinner className="animate-spin" size={12} /> : <FaCheck size={12} />}
                            </motion.button>
                          )}

                          {/* Reject Button */}
                          {order.status?.toLowerCase() === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRejectOrder(order.id)}
                              disabled={actionLoading}
                              title="رفض"
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: '#fff',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: actionLoading ? 0.5 : 1
                              }}
                            >
                              {actionLoading ? <FaSpinner className="animate-spin" size={12} /> : <FaTimes size={12} />}
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '24px',
              padding: '16px',
              borderTop: '1px solid var(--border)'
            }}>
              <motion.button
                whileHover={{ scale: currentPage > 1 ? 1.05 : 1 }}
                whileTap={{ scale: currentPage > 1 ? 0.95 : 1 }}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="pro-btn pro-btn-secondary"
                style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}
              >
                <FaChevronRight />
              </motion.button>
              
              <span style={{ color: 'var(--text)', margin: '0 8px' }}>
                صفحة {currentPage} من {totalPages}
              </span>
              
              <motion.button
                whileHover={{ scale: currentPage < totalPages ? 1.05 : 1 }}
                whileTap={{ scale: currentPage < totalPages ? 0.95 : 1 }}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="pro-btn pro-btn-secondary"
                style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}
              >
                <FaChevronLeft />
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            onClick={() => setShowDetailsModal(false)}
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
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: 20, fontWeight: 900 }}>تفاصيل طلب التبرع</h3>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13, fontWeight: 500 }}>
                    بيانات الطلب والوصف والحالة الحالية
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
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

              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12
                }}>
                  <DetailItem label="الطلب" value={selectedOrder.category || selectedOrder.targetLocation || 'طلب تبرع'} />
                  <DetailItem label="المبلغ" value={`${selectedOrder.amount || 0} ج.م`} />
                  <DetailItem label="طريقة الدفع" value={selectedOrder.paymentMethod || 'غير محدد'} />
                  <DetailItem label="الفئة" value={selectedOrder.category || 'غير محدد'} />
                  <DetailItem label="الموقع المستهدف" value={selectedOrder.targetLocation || 'غير محدد'} />
                  <DetailItem label="الحالة" value={getStatusText(selectedOrder.status)} />
                  <DetailItem label="تاريخ الإنشاء" value={formatDate(selectedOrder.createdAt)} />
                </div>

                {selectedOrder.receipt && (
                  <div>
                    <h4 style={{ color: '#64748b', fontSize: 12, fontWeight: 700, margin: 0, marginBottom: 8 }}>الإيصال</h4>
                    <p style={{ margin: 0, color: '#334155', lineHeight: 1.8, fontSize: 14, fontWeight: 500 }}>
                      {selectedOrder.receipt}
                    </p>
                  </div>
                )}

                {selectedOrder.impactReport && (
                  <div>
                    <h4 style={{ color: '#64748b', fontSize: 12, fontWeight: 700, margin: 0, marginBottom: 8 }}>تقرير الأثر</h4>
                    <p style={{ margin: 0, color: '#334155', lineHeight: 1.8, fontSize: 14, fontWeight: 500 }}>
                      {selectedOrder.impactReport}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
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

export default DonationOrdersPage;
