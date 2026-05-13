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
  const labelClass = "flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700";
  const inputClass = (hasError = false) =>
    `w-full rounded-2xl border ${hasError ? 'border-red-300 bg-red-50' : 'border-sky-100 bg-white'} px-5 py-4 text-slate-900 shadow-sm placeholder-slate-400 transition-all focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100`;

  const urgencyLevels = [
    { value: 1, label: 'منخفض', color: 'text-green-400' },
    { value: 2, label: 'متوسط', color: 'text-yellow-400' },
    { value: 3, label: 'عالي', color: 'text-orange-400' },
    { value: 4, label: 'حرج', color: 'text-red-400' },
    { value: 5, label: 'طارئ', color: 'text-purple-400' }
  ];

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-sky-100 bg-slate-50 shadow-2xl shadow-slate-300/60"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50">
                <FaEdit className="text-2xl text-sky-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950">تعديل طلب التبرع</h2>
                <p className="mt-1 font-medium text-slate-600">تعديل بيانات الطلب</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <FaTimes />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid gap-5 p-8">
            {/* Title Field */}
            <div className="space-y-2">
              <label className={labelClass}>
                <FaHandHoldingHeart className="text-pink-400" />
                عنوان الطلب *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="أدخل عنوان الطلب..."
                className={inputClass(Boolean(errors.title))}
                dir="rtl"
              />
              {errors.title && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.title}
                </motion.div>
              )}
            </div>

            {/* Location Field */}
            <div className="space-y-2">
              <label className={labelClass}>
                <FaMapMarkerAlt className="text-blue-400" />
                الموقع *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="أدخل الموقع..."
                className={inputClass(Boolean(errors.location))}
                dir="ltr"
              />
              {errors.location && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.location}
                </motion.div>
              )}
            </div>

            {/* Donate Amount Field */}
            <div className="space-y-2">
              <label className={labelClass}>
                <FaMoneyBillWave className="text-green-400" />
                مبلغ التبرع *
              </label>
              <input
                type="number"
                name="donateAmount"
                value={formData.donateAmount}
                onChange={handleInputChange}
                placeholder="أدخل مبلغ التبرع..."
                step="0.01"
                min="1"
                className={inputClass(Boolean(errors.donateAmount))}
                dir="ltr"
              />
              {errors.donateAmount && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.donateAmount}
                </motion.div>
              )}
            </div>

            {/* Urgency Level Field */}
            <div className="space-y-2">
              <label className={labelClass}>
                <FaInfoCircle className="text-yellow-400" />
                مستوى الأهمية
              </label>
              <select
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleInputChange}
                className={inputClass(false)}
                dir="rtl"
              >
                {urgencyLevels.map(level => (
                  <option key={level.value} value={level.value} className="bg-white text-slate-900">
                    {level.label} ({level.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Brief Description Field */}
            <div className="space-y-2">
              <label className={labelClass}>
                <FaInfoCircle className="text-cyan-400" />
                وصف مختصر
              </label>
              <textarea
                name="briefDescription"
                value={formData.briefDescription}
                onChange={handleInputChange}
                placeholder="أدخل وصفاً مختصراً للطلب (اختياري)..."
                rows="3"
                className={`${inputClass(false)} resize-none`}
                dir="rtl"
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-500/10 p-4 rounded-xl"
              >
                <FaExclamationTriangle className="text-lg" />
                {errors.submit}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FaSave className="text-lg" />
                  حفظ التغييرات
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditDonationRequestModal;
