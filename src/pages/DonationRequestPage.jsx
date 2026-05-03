import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDonate, FaMoneyBillWave, FaCreditCard, FaTag, FaMapMarkerAlt, 
  FaFileAlt, FaSave, FaSpinner, FaExclamationTriangle, FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa';
import { donationOrdersService } from '../services/donationOrdersService';

const DonationRequestPage = () => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    category: '',
    targetLocation: '',
    receipt: '',
    impactReport: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      setError('المبلغ مطلوب ويجب أن يكون أكبر من صفر');
      return;
    }

    if (!formData.paymentMethod) {
      setError('طريقة الدفع مطلوبة');
      return;
    }

    if (!formData.category) {
      setError('الفئة مطلوبة');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await donationOrdersService.createDonationOrder(formData);
      console.log('Donation request created successfully:', result);
      
      setSuccess(true);
      // Reset form
      setFormData({
        amount: '',
        paymentMethod: '',
        category: '',
        targetLocation: '',
        receipt: '',
        impactReport: ''
      });
    } catch (err) {
      console.error('Error creating donation request:', err);
      setError(err.message || 'فشل في إنشاء طلب التبرع');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && formData.amount && formData.paymentMethod && formData.category;

  return (
    <div className="donation-request-page" style={{ padding: '24px', minHeight: '100vh' }}>
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
              <h2 className="pro-header-title">طلب تبرع</h2>
              <p className="pro-header-subtitle">إنشاء طلب تبرع جديد</p>
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
            <span>تم إنشاء طلب التبرع بنجاح!</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-card"
        >
          <form onSubmit={handleSubmit}>
            {/* Amount */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                <FaMoneyBillWave style={{ marginLeft: '8px', color: 'var(--primary)' }} />
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

            {/* Payment Method */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                <FaCreditCard style={{ marginLeft: '8px', color: 'var(--primary)' }} />
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

            {/* Category */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                <FaTag style={{ marginLeft: '8px', color: 'var(--primary)' }} />
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

            {/* Target Location */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                <FaMapMarkerAlt style={{ marginLeft: '8px', color: 'var(--primary)' }} />
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

            {/* Receipt */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                <FaFileAlt style={{ marginLeft: '8px', color: 'var(--primary)' }} />
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

            {/* Impact Report */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                <FaFileAlt style={{ marginLeft: '8px', color: 'var(--primary)' }} />
                تقرير الأثر (اختياري)
              </label>
              <textarea
                name="impactReport"
                value={formData.impactReport}
                onChange={handleInputChange}
                className="pro-input"
                placeholder="أدخل تفاصيل تقرير الأثر"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={canSubmit ? { scale: 1.02 } : {}}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              disabled={!canSubmit}
              className="pro-btn pro-btn-primary"
              style={{
                width: '100%',
                opacity: canSubmit ? 1 : 0.5,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>جاري إنشاء الطلب...</span>
                </>
              ) : (
                <>
                  <FaDonate />
                  <span>إنشاء طلب التبرع</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DonationRequestPage;
