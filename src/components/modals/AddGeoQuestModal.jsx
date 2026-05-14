import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaMapMarkerAlt, FaSave, FaExclamationTriangle } from 'react-icons/fa';

const AddGeoQuestModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    locationId: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'عنوان المهمة الجغرافية مطلوب';
    }
    
    if (!formData.locationId.trim()) {
      newErrors.locationId = 'اختيار الموقع مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ title: '', locationId: '' });
      setErrors({});
    } catch (error) {
      console.error('Error adding GeoQuest:', error);
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
                <FaPlus className="text-xl" />
              </div>
              <div>
                <h2 className="app-modal-title">إضافة مهمة جغرافية</h2>
                <p className="app-modal-subtitle">إنشاء مهمة جديدة في موقع محدد</p>
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
                <label className="app-form-label">عنوان المهمة</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="app-form-input w-full pr-12"
                    placeholder="مثال: استكشاف المنطقة التعليمية"
                  />
                </div>
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.title}</p>
                )}
              </div>

              <div className="app-form-group">
                <label className="app-form-label">الموقع المرتبط</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleInputChange}
                    className="app-form-input w-full pr-12 font-mono"
                    placeholder="اكتب أو اختر الموقع المرتبط"
                    dir="ltr"
                  />
                </div>
                {errors.locationId && (
                  <p className="text-red-500 text-xs mt-1.5 mr-1 font-bold">{errors.locationId}</p>
                )}
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
                      <span>حفظ المهمة</span>
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

export default AddGeoQuestModal;
