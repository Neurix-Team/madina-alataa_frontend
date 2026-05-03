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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] w-full max-w-lg border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-0">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center border border-blue-500/30">
                <FaEdit className="text-blue-400 text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">تعديل طلب التبرع</h2>
                <p className="text-blue-300/70 font-medium mt-1">تعديل بيانات الطلب</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-white/80" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaHandHoldingHeart className="text-pink-400" />
                عنوان الطلب *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="أدخل عنوان الطلب..."
                className={`w-full bg-white/5 border ${errors.title ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all`}
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
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-400" />
                الموقع *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="أدخل الموقع..."
                className={`w-full bg-white/5 border ${errors.location ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all`}
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
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
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
                className={`w-full bg-white/5 border ${errors.donateAmount ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all`}
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
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaInfoCircle className="text-yellow-400" />
                مستوى الأهمية
              </label>
              <select
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                dir="rtl"
              >
                {urgencyLevels.map(level => (
                  <option key={level.value} value={level.value} className="bg-slate-800">
                    {level.label} ({level.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Brief Description Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaInfoCircle className="text-cyan-400" />
                وصف مختصر
              </label>
              <textarea
                name="briefDescription"
                value={formData.briefDescription}
                onChange={handleInputChange}
                placeholder="أدخل وصفاً مختصراً للطلب (اختياري)..."
                rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all resize-none"
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
