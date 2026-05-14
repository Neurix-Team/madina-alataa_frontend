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

  const fieldClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100/50';

  const labelClass = 'block text-sm font-bold text-slate-700 mb-2 mr-1';

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
              <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <FaChild className="text-xl" />
              </div>
              <div>
                <h2 className="app-modal-title">إضافة طفل جديد</h2>
                <p className="app-modal-subtitle">إنشاء حساب طفل جديد في النظام</p>
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
                <label className="app-form-label">الاسم الكامل</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="app-form-input w-full"
                  placeholder="أدخل اسم الطفل"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.fullName}</p>
                )}
              </div>

              <div className="app-form-grid">
                <div className="app-form-group">
                  <label className="app-form-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="app-form-input w-full"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.email}</p>
                  )}
                </div>
                <div className="app-form-group">
                  <label className="app-form-label">كلمة المرور</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="app-form-input w-full"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.password}</p>
                  )}
                </div>
              </div>

              <div className="app-form-grid">
                <div className="app-form-group">
                  <label className="app-form-label">تاريخ الميلاد</label>
                  <input
                    type="date"
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleInputChange}
                    className="app-form-input w-full"
                  />
                  {errors.birthDay && (
                    <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.birthDay}</p>
                  )}
                </div>
                <div className="app-form-group">
                  <label className="app-form-label">الحد اليومي</label>
                  <div className="relative">
                    <FaCoins className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="number"
                      step="0.01"
                      name="dailyLimit"
                      value={formData.dailyLimit}
                      onChange={handleInputChange}
                      className="app-form-input w-full pr-12"
                    />
                  </div>
                  {errors.dailyLimit && (
                    <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.dailyLimit}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <input
                  type="checkbox"
                  id="allowDonations"
                  name="allowDonations"
                  checked={formData.allowDonations}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300 transition-all"
                />
                <label htmlFor="allowDonations" className="text-sm font-bold text-slate-700 cursor-pointer flex items-center gap-2">
                  <FaHeart className="text-rose-500 text-xs" />
                  السماح باستقبال التبرعات
                </label>
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
                      <span>حفظ الطفل</span>
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

export default AddChildModal;
