import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTimes, FaHandHoldingHeart, FaSave, FaExclamationTriangle, FaMoneyBillWave, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { donationRequestsService } from '../../services/donationRequestsService';

const EditDonationRequestModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    donateAmount: 1,
    urgencyLevel: 1,
    briefDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && request) {
      setFormData({
        title: request.title || '',
        location: request.location || request.locationId || '',
        donateAmount: request.donateAmount || 1,
        urgencyLevel: request.urgencyLevel || 1,
        briefDescription: request.briefDescription || ''
      });
    }
  }, [isOpen, request]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الطلب مطلوب';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'الموقع مطلوب';
    }

    if (!formData.donateAmount || formData.donateAmount <= 0) {
      newErrors.donateAmount = 'مبلغ التبرع يجب أن يكون أكبر من صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim() || null,
        location: formData.location.trim() || null,
        donateAmount: parseFloat(formData.donateAmount),
        urgencyLevel: parseInt(formData.urgencyLevel),
        briefDescription: formData.briefDescription.trim() || null
      };

      await donationRequestsService.updateDonationRequest(request.id, payload);

      setErrors({});

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating donation request:', error);
      setErrors({ submit: error.message || 'فشل في تحديث طلب التبرع' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen || !request) return null;

  const fieldClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100/50';

  const labelClass = 'block text-sm font-bold text-slate-700 mb-2 mr-1';

  const urgencyOptions = [
    { value: 1, label: 'منخفض', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { value: 2, label: 'متوسط', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { value: 3, label: 'عالي', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { value: 4, label: 'حرج', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { value: 5, label: 'طارئ', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="app-modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="app-modal-card"
          style={{ maxWidth: '580px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="app-modal-header">
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                <FaEdit className="text-xl" />
              </div>
              <div>
                <h2 className="app-modal-title">تعديل طلب تبرع</h2>
                <p className="app-modal-subtitle">تحديث بيانات طلب التبرع القائم</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="app-modal-close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto">
            <form onSubmit={handleSubmit} className="app-form" dir="rtl">
              <div className="app-form-group">
                <label className="app-form-label">عنوان الطلب</label>
                <div className="relative">
                  <FaHandHoldingHeart className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="app-form-input w-full with-icon"
                    placeholder="عنوان الطلب"
                  />
                </div>
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.title}</p>
                )}
              </div>

              <div className="app-form-grid">
                <div className="app-form-group">
                  <label className="app-form-label">المبلغ المطلوب</label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      name="donateAmount"
                      value={formData.donateAmount}
                      onChange={handleInputChange}
                      className="app-form-input w-full with-icon"
                      min="1"
                    />
                  </div>
                  {errors.donateAmount && (
                    <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.donateAmount}</p>
                  )}
                </div>
                <div className="app-form-group">
                  <label className="app-form-label">مستوى الاستعجال</label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleInputChange}
                    className="app-form-select w-full"
                  >
                    {urgencyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="app-form-group">
                <label className="app-form-label">الموقع</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="app-form-input w-full with-icon"
                    placeholder="أدخل الموقع"
                  />
                </div>
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.location}</p>
                )}
              </div>

              <div className="app-form-group">
                <label className="app-form-label">وصف الطلب</label>
                <div className="relative">
                  <FaInfoCircle className="absolute right-4 top-4 text-slate-400" />
                  <textarea
                    name="briefDescription"
                    value={formData.briefDescription}
                    onChange={handleInputChange}
                    className="app-form-textarea w-full with-icon min-h-[100px]"
                    placeholder="أدخل الوصف..."
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="app-form-actions pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="app-btn-secondary px-8 py-4"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 py-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <FaSave className="text-sm" />
                      <span>حفظ التعديلات</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditDonationRequestModal;
