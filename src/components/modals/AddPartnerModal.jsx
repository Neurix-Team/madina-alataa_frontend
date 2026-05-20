import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaBuilding, FaSave, FaExclamationTriangle, FaPhone, FaEnvelope, FaIndustry } from 'react-icons/fa';

const AddPartnerModal = ({ isOpen, onClose, onSubmit }) => {
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
      
      await onSubmit(payload);
      setFormData({ orgName: '', orgType: 1, phoneNumber: '', email: '' });
      setErrors({});
    } catch (error) {
      console.error('Error adding partner:', error);
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

  if (!isOpen) return null;

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
              <div
                className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shadow-sm"
                style={{
                  background: 'var(--bg-card-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--primary)',
                }}
              >
                <FaBuilding className="text-xl" />
              </div>
              <div>
                <h2 className="app-modal-title">إضافة مؤسسة</h2>
                <p className="app-modal-subtitle">إنشاء مؤسسة شريك جديدة في النظام</p>
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
                <label className="app-form-label">اسم المؤسسة</label>
                <div className="relative">
                  <FaBuilding className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="orgName"
                    value={formData.orgName}
                    onChange={handleInputChange}
                    className="app-form-input pr-12 w-full"
                    placeholder="أدخل اسم المؤسسة"
                  />
                </div>
                {errors.orgName && (
                  <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold flex items-center gap-1">
                    <FaExclamationTriangle className="text-[10px]" />
                    {errors.orgName}
                  </p>
                )}
              </div>

              <div className="app-form-group">
                <label className="app-form-label">نوع المؤسسة</label>
                <div className="relative">
                  <FaIndustry className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    name="orgType"
                    value={formData.orgType}
                    onChange={handleInputChange}
                    className="app-form-select pr-12 w-full appearance-none"
                  >
                    {orgTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="app-form-group">
                <label className="app-form-label">رقم الهاتف</label>
                <div className="relative">
                  <FaPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="app-form-input pr-12 w-full"
                    placeholder="مثال: 0123456789"
                    dir="ltr"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold flex items-center gap-1">
                    <FaExclamationTriangle className="text-[10px]" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="app-form-group">
                <label className="app-form-label">البريد الإلكتروني</label>
                <div className="relative">
                  <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="app-form-input pr-12 w-full"
                    placeholder="example@mail.com"
                    dir="ltr"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold flex items-center gap-1">
                    <FaExclamationTriangle className="text-[10px]" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="app-form-actions pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
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
                      <span>حفظ المؤسسة</span>
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

export default AddPartnerModal;
