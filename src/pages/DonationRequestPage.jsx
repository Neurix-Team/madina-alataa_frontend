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
    { value: 'credit_card', label: 'بطاقة ائتمان' },
    { value: 'debit_card', label: 'بطاقة خصم مباشر' },
    { value: 'bank_transfer', label: 'تحويل بنكي' },
    { value: 'cash', label: 'نقدي' },
    { value: 'paypal', label: 'باي بال' },
    { value: 'stripe', label: 'سترايب' },
    { value: 'apple_pay', label: 'آبل باي' },
    { value: 'google_pay', label: 'جوجل باي' }
  ];

  // Categories options
  const categories = [
    { value: 'education', label: 'تعليم' },
    { value: 'healthcare', label: 'رعاية صحية' },
    { value: 'food', label: 'غذاء' },
    { value: 'shelter', label: 'مأوى' },
    { value: 'clothing', label: 'ملابس' },
    { value: 'emergency', label: 'طوارئ' },
    { value: 'infrastructure', label: 'بنية تحتية' },
    { value: 'community', label: 'مجتمع' },
    { value: 'environment', label: 'بيئة' },
    { value: 'other', label: 'أخرى' }
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
      <div className="pro-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="app-btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              <FaArrowLeft />
            </motion.button>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
            }}>
              <FaDonate />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)' }}>طلب تبرع</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>إنشاء طلب تبرع جديد</p>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="app-alert app-alert-danger"
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--error-light)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              fontWeight: '600'
            }}
          >
            <FaExclamationTriangle />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--success-light)',
              border: '1px solid var(--success)',
              color: 'var(--success)',
              fontWeight: '600'
            }}
          >
            <FaCheckCircle />
            <span>تم إنشاء طلب التبرع بنجاح!</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="app-modal-card"
          style={{ width: '100%' }}
        >
          <form onSubmit={handleSubmit} className="app-form">
            <div className="app-form-grid">
              {/* Amount */}
              <div className="app-form-group">
                <label className="app-form-label">
                  <FaMoneyBillWave style={{ marginLeft: '8px', color: 'var(--primary)' }} />
                  المبلغ
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="app-form-input"
                  placeholder="أدخل المبلغ"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="app-form-group">
                <label className="app-form-label">
                  <FaCreditCard style={{ marginLeft: '8px', color: 'var(--primary)' }} />
                  طريقة الدفع
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="app-form-select"
                  required
                >
                  <option value="">اختر طريقة الدفع</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="app-form-group">
                <label className="app-form-label">
                  <FaTag style={{ marginLeft: '8px', color: 'var(--primary)' }} />
                  الفئة
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="app-form-select"
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Location */}
              <div className="app-form-group">
                <label className="app-form-label">
                  <FaMapMarkerAlt style={{ marginLeft: '8px', color: 'var(--primary)' }} />
                  الموقع المستهدف
                </label>
                <input
                  type="text"
                  name="targetLocation"
                  value={formData.targetLocation}
                  onChange={handleInputChange}
                  className="app-form-input"
                  placeholder="أدخل الموقع"
                />
              </div>
            </div>

            <div className="app-form-grid">
              {/* Receipt */}
              <div className="app-form-group">
                <label className="app-form-label">
                  <FaFileAlt style={{ marginLeft: '8px', color: 'var(--primary)' }} />
                  رقم الإيصال
                </label>
                <input
                  type="text"
                  name="receipt"
                  value={formData.receipt}
                  onChange={handleInputChange}
                  className="app-form-input"
                  placeholder="أدخل رقم الإيصال"
                />
              </div>

              {/* Impact Report */}
              <div className="app-form-group">
                <label className="app-form-label">
                  <FaFileAlt style={{ marginLeft: '8px', color: 'var(--primary)' }} />
                  تقرير التأثير
                </label>
                <input
                  type="text"
                  name="impactReport"
                  value={formData.impactReport}
                  onChange={handleInputChange}
                  className="app-form-input"
                  placeholder="أدخل رابط التقرير"
                />
              </div>
            </div>

            <div className="app-form-actions">
              <button
                type="submit"
                disabled={!canSubmit}
                className="app-btn-primary w-full py-4 text-lg"
                style={{ opacity: canSubmit ? 1 : 0.7 }}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>إنشاء طلب التبرع</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DonationRequestPage;
