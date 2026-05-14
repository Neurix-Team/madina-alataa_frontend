import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDonate, FaSearch, FaPlus, FaEye, FaSpinner, FaExclamationTriangle, 
  FaCheckCircle, FaChevronLeft, FaChevronRight, FaMoneyBillWave, 
  FaMapMarkerAlt, FaCreditCard, FaTag, FaFileAlt, FaArrowLeft
} from 'react-icons/fa';
import { donationOrdersService } from '../services/donationOrdersService';

const DonorDonationOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load donation orders on mount and when page changes
  useEffect(() => {
    loadDonationOrders();
  }, [currentPage]);

  const loadDonationOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await donationOrdersService.getMyDonationOrders(currentPage, pageSize);
      
      // Handle different response structures
      const ordersData = response.value || response.data || response.items || response;
      const paginationData = response.pagination || response;
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTotalPages(paginationData.totalPages || paginationData.totalPages || 1);
      
      console.log('All donation orders loaded:', ordersData);
      console.log('Pagination data:', paginationData);
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

  const handleViewDetails = async (order) => {
    try {
      setActionLoading(true);
      const orderDetails = await donationOrdersService.getDonationOrderById(order.id);
      setSelectedOrder(orderDetails);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'فشل في جلب تفاصيل التبرع');
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
      <div className="donor-donation-orders-page" style={{ padding: '24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="animate-spin" size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text)' }}>جاري تحميل طلبات التبرع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-donation-orders-page" style={{ padding: '24px', minHeight: '100vh' }}>
      <div className="pro-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-header"
          style={{ marginBottom: '24px' }}
        >
          <div className="pro-header-left">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="pro-btn pro-btn-secondary"
              style={{ marginRight: '16px', padding: '8px 16px' }}
            >
              <FaArrowLeft />
            </motion.button>
            <div className="pro-header-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <FaDonate />
            </div>
            <div>
              <h2 className="pro-header-title">طلبات التبرع</h2>
              <p className="pro-header-subtitle">استكشاف طلبات التبرع والمساهمة في الأعمال الخيرية</p>
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="pro-btn pro-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaPlus />
              <span>تبرع الآن</span>
            </motion.button>
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
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="pro-card"
              style={{ 
                maxWidth: '600px', 
                width: '100%', 
                maxHeight: '80vh', 
                overflow: 'auto' 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--text)', margin: 0 }}>تفاصيل طلب التبرع</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  ×
                </motion.button>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--background)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>المبلغ:</span>
                  <span style={{ color: 'var(--text)' }}>{selectedOrder.amount || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--background)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>طريقة الدفع:</span>
                  <span style={{ color: 'var(--text)' }}>{selectedOrder.paymentMethod || 'غير محدد'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--background)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>الفئة:</span>
                  <span style={{ color: 'var(--text)' }}>{selectedOrder.category || 'غير محدد'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--background)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>الموقع المستهدف:</span>
                  <span style={{ color: 'var(--text)' }}>{selectedOrder.targetLocation || 'غير محدد'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--background)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>الحالة:</span>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: getStatusColor(selectedOrder.status)
                    }}
                  >
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--background)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>تاريخ الإنشاء:</span>
                  <span style={{ color: 'var(--text)' }}>{formatDate(selectedOrder.createdAt)}</span>
                </div>

                {selectedOrder.receipt && (
                  <div style={{ padding: '12px', background: 'var(--background)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>الإيصال:</div>
                    <div style={{ color: 'var(--text)' }}>{selectedOrder.receipt}</div>
                  </div>
                )}

                {selectedOrder.impactReport && (
                  <div style={{ padding: '12px', background: 'var(--background)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>تقرير الأثر:</div>
                    <div style={{ color: 'var(--text)' }}>{selectedOrder.impactReport}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Create Donation Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="pro-card"
              style={{ 
                maxWidth: '600px', 
                width: '100%', 
                maxHeight: '80vh', 
                overflow: 'auto' 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--text)', margin: 0 }}>إنشاء طلب تبرع</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  ×
                </motion.button>
              </div>

              <CreateDonationForm 
                onSuccess={() => {
                  setShowCreateModal(false);
                  setSuccess('تم إنشاء طلب التبرع بنجاح!');
                  loadDonationOrders(); // Refresh the list
                }}
                onError={(errorMessage) => {
                  setError(errorMessage);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Create Donation Form Component
const CreateDonationForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    category: '',
    targetLocation: '',
    receipt: '',
    impactReport: ''
  });
  const [loading, setLoading] = useState(false);

  // Payment methods options
  const paymentMethods = [
    'credit_card',
    'debit_card', 
    'bank_transfer',
    'cash',
    'paypal',
    'stripe',
    'apple_pay',
    'google_pay'
  ];

  // Categories options
  const categories = [
    'education',
    'healthcare',
    'food',
    'shelter',
    'clothing',
    'emergency',
    'infrastructure',
    'community',
    'environment',
    'other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.amount || Number(formData.amount) <= 0) {
      onError('المبلغ مطلوب ويجب أن يكون أكبر من صفر');
      return;
    }

    if (!formData.paymentMethod) {
      onError('طريقة الدفع مطلوبة');
      return;
    }

    if (!formData.category) {
      onError('الفئة مطلوبة');
      return;
    }

    setLoading(true);

    try {
      const result = await donationOrdersService.createDonationOrder(formData);
      console.log('Donation request created successfully:', result);
      
      // Reset form
      setFormData({
        amount: '',
        paymentMethod: '',
        category: '',
        targetLocation: '',
        receipt: '',
        impactReport: ''
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error creating donation request:', err);
      onError(err.message || 'فشل في إنشاء طلب التبرع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            المبلغ
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="pro-input"
            placeholder="أدخل المبلغ"
            min="1"
            step="0.01"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            طريقة الدفع
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="pro-input"
            required
          >
            <option value="">اختر طريقة الدفع</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            الفئة
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="pro-input"
            required
          >
            <option value="">اختر الفئة</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            الموقع المستهدف (اختياري)
          </label>
          <input
            type="text"
            name="targetLocation"
            value={formData.targetLocation}
            onChange={handleInputChange}
            className="pro-input"
            placeholder="أدخل الموقع المستهدف"
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            الإيصال (اختياري)
          </label>
          <textarea
            name="receipt"
            value={formData.receipt}
            onChange={handleInputChange}
            className="pro-input"
            placeholder="أدخل تفاصيل الإيصال"
            rows={3}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            تقرير الأثر (اختياري)
          </label>
          <textarea
            name="impactReport"
            value={formData.impactReport}
            onChange={handleInputChange}
            className="pro-input"
            placeholder="أدخل تفاصيل تقرير الأثر"
            rows={3}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="pro-btn pro-btn-primary"
          style={{ flex: 1 }}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>جاري الإنشاء...</span>
            </>
          ) : (
            <>
              <FaDonate />
              <span>إنشاء طلب التبرع</span>
            </>
          )}
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSuccess()}
          className="pro-btn pro-btn-secondary"
          style={{ flex: 1 }}
        >
          إلغاء
        </motion.button>
      </div>
    </form>
  );
};

export default DonorDonationOrdersPage;
