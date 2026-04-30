import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaChild, FaSave, FaExclamationTriangle, FaCoins, FaHeart } from 'react-icons/fa';

const AddChildModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    birthDay: '',
    dailyLimit: 0.01,
    allowDonations: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'اسم الطفل مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'كلمة المرور مطلوبة';
    }

    if (!formData.birthDay.trim()) {
      newErrors.birthDay = 'تاريخ الميلاد مطلوب';
    }

    if (formData.dailyLimit <= 0) {
      newErrors.dailyLimit = 'الحد اليومي يجب أن يكون أكبر من صفر';
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
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        birthDay: formData.birthDay,
        dailyLimit: parseFloat(formData.dailyLimit),
        allowDonations: formData.allowDonations
      };

      await onSubmit(payload);
      setFormData({ fullName: '', email: '', password: '', birthDay: '', dailyLimit: 0.01, allowDonations: true });
      setErrors({});
    } catch (error) {
      console.error('Error adding child:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center border border-pink-500/30">
                <FaChild className="text-pink-400 text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">إضافة طفل</h2>
                <p className="text-pink-300/70 font-medium mt-1">إضافة طفل جديد لحسابك</p>
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
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaChild className="text-pink-400" />
                الاسم الكامل *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="أدخل اسم الطفل الكامل..."
                className={`w-full bg-white/5 border ${errors.fullName ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all`}
                dir="rtl"
              />
              {errors.fullName && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.fullName}
                </motion.div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaChild className="text-blue-400" />
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="أدخل البريد الإلكتروني..."
                className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all`}
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

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaChild className="text-green-400" />
                كلمة المرور *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="أدخل كلمة المرور..."
                className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all`}
                dir="ltr"
              />
              {errors.password && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.password}
                </motion.div>
              )}
            </div>

            {/* Birth Day Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaChild className="text-purple-400" />
                تاريخ الميلاد *
              </label>
              <input
                type="date"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleInputChange}
                className={`w-full bg-white/5 border ${errors.birthDay ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all`}
                dir="ltr"
              />
              {errors.birthDay && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.birthDay}
                </motion.div>
              )}
            </div>

            {/* Daily Limit Field */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaCoins className="text-yellow-400" />
                الحد اليومي للتبرع (جنيه) *
              </label>
              <input
                type="number"
                name="dailyLimit"
                value={formData.dailyLimit}
                onChange={handleInputChange}
                placeholder="أدخل الحد اليومي..."
                step="0.01"
                min="0.01"
                className={`w-full bg-white/5 border ${errors.dailyLimit ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all`}
                dir="ltr"
              />
              {errors.dailyLimit && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.dailyLimit}
                </motion.div>
              )}
              <p className="text-white/50 text-xs">
                الحد الأقصى للتبرعات اليومية لهذا الطفل
              </p>
            </div>

            {/* Allow Donations Toggle */}
            <div className="space-y-2">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaHeart className="text-rose-400" />
                السماح بالتبرعات
              </label>
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-5 py-4 border border-white/10">
                <input
                  type="checkbox"
                  name="allowDonations"
                  id="allowDonations"
                  checked={formData.allowDonations}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-white/30 bg-white/10 text-pink-500 focus:ring-pink-500 focus:ring-offset-0"
                />
                <label htmlFor="allowDonations" className="text-white font-medium cursor-pointer flex-1">
                  السماح للآخرين بالتبرع لهذا الطفل
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl px-8 py-5 font-black text-lg flex items-center justify-center gap-3 border border-pink-400/30 shadow-xl shadow-pink-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FaSave />
                  حفظ الطفل
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddChildModal;
