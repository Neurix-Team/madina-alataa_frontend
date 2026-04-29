import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTimes, FaMapMarkerAlt, FaSave, FaExclamationTriangle } from 'react-icons/fa';

const EditGeoQuestModal = ({ isOpen, onClose, onSubmit, geoQuest }) => {
  const [formData, setFormData] = useState({
    title: '',
    locationId: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (geoQuest) {
      setFormData({
        title: geoQuest.title || '',
        locationId: geoQuest.locationId || ''
      });
    }
  }, [geoQuest]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'عنوان المهمة الجغرافية مطلوب';
    }
    
    if (!formData.locationId.trim()) {
      newErrors.locationId = 'معرف الموقع مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(geoQuest.id, formData);
      setErrors({});
    } catch (error) {
      console.error('Error updating GeoQuest:', error);
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

  if (!isOpen || !geoQuest) return null;

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
                <h2 className="text-3xl font-black text-white">تعديل مهمة جغرافية</h2>
                <p className="text-orange-300/70 font-medium mt-1">تحديث معلومات المهمة الحالية</p>
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
          <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
            {/* Title Field */}
            <div className="space-y-3">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-400" />
                عنوان المهمة
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="أدخل عنوان المهمة الجغرافية..."
                className={`w-full bg-white/5 border ${errors.title ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all`}
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

            {/* Location ID Field */}
            <div className="space-y-3">
              <label className="text-white/80 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-400" />
                معرف الموقع
              </label>
              <input
                type="text"
                name="locationId"
                value={formData.locationId}
                onChange={handleInputChange}
                placeholder="أدخل معرف الموقع (GUID)..."
                className={`w-full bg-white/5 border ${errors.locationId ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-mono`}
                dir="ltr"
              />
              {errors.locationId && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <FaExclamationTriangle className="text-xs" />
                  {errors.locationId}
                </motion.div>
              )}
            </div>

            {/* Current Info */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-white/60 text-sm font-medium mb-2">المعرف الحالي للمهمة:</p>
              <p className="text-white font-mono text-sm bg-black/30 rounded-lg px-3 py-2">
                {geoQuest.id}
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl px-8 py-5 font-black text-lg flex items-center justify-center gap-3 border border-orange-400/30 shadow-xl shadow-orange-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <FaSave />
                  تحديث المهمة الجغرافية
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditGeoQuestModal;
