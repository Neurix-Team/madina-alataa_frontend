import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTimes, FaBuilding, FaSave, FaExclamationTriangle, FaPhone, FaEnvelope, FaIndustry, FaIdCard } from 'react-icons/fa';

const EditPartnerModal = ({ isOpen, onClose, onSubmit, partner }) => {
  const [formData, setFormData] = useState({
    orgName: '',
    orgType: 1,
    phoneNumber: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orgTypes = [
    { value: 1, label: 'مؤسسة تجارية' },
    { value: 2, label: 'مؤسسة خيرية' },
    { value: 3, label: 'مؤسسة حكومية' },
    { value: 4, label: 'مؤسسة تعليمية' }
  ];

  useEffect(() => {
    if (partner) {
      setFormData({
        orgName: partner.orgName || '',
        orgType: partner.orgType || 1,
        phoneNumber: partner.phoneNumber || '',
        email: partner.email || ''
      });
    }
  }, [partner]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.orgName.trim()) {
      newErrors.orgName = 'اسم المؤسسة مطلوب';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    if (formData.phoneNumber && !/^[+]?[\d\s-]{8,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'رقم الهاتف غير صالح';
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
        orgName: formData.orgName.trim(),
        orgType: parseInt(formData.orgType),
        phoneNumber: formData.phoneNumber.trim() || null,
        email: formData.email.trim() || null
      };
      
      await onSubmit(partner.id, payload);
      setErrors({});
    } catch (error) {
      console.error('Error updating partner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen || !partner) return null;

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
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] w-full max-w-lg border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-0">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-600/20 flex items-center justify-center border border-orange-500/30">
                <FaEdit className="text-orange-400 text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">تعديل مؤسسة</h2>
                <p className="text-orange-300/70 font-medium mt-1">تحديث معلومات المؤسسة الحالية</p>
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
            {/* Organization Name Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaBuilding className="text-blue-400" />
                اسم المؤسسة *
              </label>
              <input
                type="text"
                name="orgName"
                value={formData.orgName}
                onChange={handleInputChange}
                placeholder="أدخل اسم المؤسسة..."
                className={`w-full bg-white/5 border ${errors.orgName ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all`}
                dir="rtl"
              />
              {errors.orgName && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.orgName}
                </motion.div>
              )}
            </div>

            {/* Organization Type Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaIndustry className="text-green-400" />
                نوع المؤسسة
              </label>
              <select
                name="orgType"
                value={formData.orgType}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                dir="rtl"
              >
                {orgTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-slate-800 text-white">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaPhone className="text-purple-400" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="أدخل رقم الهاتف (اختياري)..."
                className={`w-full bg-white/5 border ${errors.phoneNumber ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all`}
                dir="ltr"
              />
              {errors.phoneNumber && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.phoneNumber}
                </motion.div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaEnvelope className="text-orange-400" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="أدخل البريد الإلكتروني (اختياري)..."
                className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all`}
                dir="ltr"
              />
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.email}
                </motion.div>
              )}
            </div>

            {/* Current Info */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <FaIdCard className="text-cyan-400" />
                <span className="text-white/60 text-sm font-medium">المعرف الحالي للمؤسسة:</span>
              </div>
              <p className="text-white font-mono text-sm bg-black/30 rounded-lg px-3 py-2">
                {partner.id}
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl px-8 py-5 font-black text-lg flex items-center justify-center gap-3 border border-orange-400/30 shadow-xl shadow-orange-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <FaSave />
                  تحديث المؤسسة
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditPartnerModal;
