import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEdit, FaMapMarkerAlt, FaGlobe, FaCompass, FaStar } from 'react-icons/fa';

const panelClass =
  'rounded-[28px] border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100/70 md:p-6';

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-sky-50 focus:ring-4 focus:ring-sky-100';

const EditLocationModal = ({ isOpen, onClose, onSubmit, location }) => {
  const [formData, setFormData] = useState({
    name: '',
    requiredLevel: 1,
    longitude: '',
    latitude: ''
  });
  const [loading, setLoading] = useState(false);

  // Populate form when location data is available
  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        requiredLevel: location.requiredLevel || 1,
        longitude: location.longitude?.toString() || '',
        latitude: location.latitude?.toString() || ''
      });
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'requiredLevel' 
        ? parseInt(value) || 1 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم العنوان');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        requiredLevel: formData.requiredLevel,
        longitude: formData.longitude,
        latitude: formData.latitude
      };
      
      await onSubmit(location.id, submitData);
      onClose();
    } catch (err) {
      console.error('Error updating location:', err);
      let errorMsg = 'فشل في تحديث العنوان.';
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const messages = Object.values(validationErrors).flat().join('\n');
        errorMsg += `\nالأخطاء:\n${messages}`;
      } else if (err.response?.data?.message || err.response?.data?.title) {
        errorMsg += `\n${err.response.data.message || err.response.data.title}`;
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100/50';

  const labelClass = 'block text-sm font-bold text-slate-700 mb-2 mr-1';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="app-modal-overlay" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="app-modal-card"
            style={{ maxWidth: '580px' }}
          >
            {/* Header */}
            <div className="app-modal-header">
              <div className="flex items-center gap-4">
                <div className="w-[52px] h-[52px] rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                  <FaEdit className="text-xl" />
                </div>
                <div>
                  <h3 className="app-modal-title">تعديل العنوان</h3>
                  <p className="app-modal-subtitle">تحديث بيانات العنوان والإحداثيات بوضوح</p>
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
              <form onSubmit={handleSubmit} className="app-form">
                <div className="app-form-group">
                  <label className="app-form-label">اسم العنوان</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="app-form-input w-full"
                    placeholder="اسم العنوان"
                    required
                  />
                </div>

                <div className="app-form-group">
                  <label className="app-form-label">المستوى المطلوب</label>
                  <div className="relative">
                    <FaStar className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="number"
                      name="requiredLevel"
                      value={formData.requiredLevel}
                      onChange={handleChange}
                      className="app-form-input w-full pr-12"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="app-form-grid">
                  <div className="app-form-group">
                    <label className="app-form-label">خط الطول</label>
                    <div className="relative">
                      <FaGlobe className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400" />
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="app-form-input w-full pr-12 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="app-form-group">
                    <label className="app-form-label">خط العرض</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400" />
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="app-form-input w-full pr-12 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                  <p className="text-sm text-amber-700 leading-relaxed font-medium m-0">
                    <FaEdit className="inline-block ml-2 mb-0.5" />
                    تأكد من صحة الإحداثيات لضمان ظهور العنوان في المكان الصحيح على الخريطة.
                  </p>
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
                    disabled={loading}
                    className="app-btn-primary flex-1 py-4 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <FaEdit className="text-sm" />
                        <span>تحديث البيانات</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditLocationModal;
