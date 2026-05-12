import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEdit, FaMapMarkerAlt, FaGlobe, FaCompass, FaStar } from 'react-icons/fa';

const panelClass =
  'rounded-[28px] border border-white/12 bg-white/[0.06] p-5 md:p-6 shadow-[0_16px_48px_rgba(15,23,42,0.28)]';

const fieldClass =
  'w-full rounded-2xl border border-white/12 bg-[#112033] px-4 py-3 text-base font-medium text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-sky-400/45 focus:bg-[#16283d]';

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
      // Extract specific validation errors from the backend
      let errorMsg = 'فشل في تحديث العنوان.';
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const messages = Object.values(validationErrors).flat().join('\\n');
        errorMsg += `\\nالأخطاء:\\n${messages}`;
      } else if (err.response?.data?.message || err.response?.data?.title) {
        errorMsg += `\\n${err.response.data.message || err.response.data.title}`;
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[30px] border border-white/12 bg-[#0f1b2d] shadow-[0_28px_90px_rgba(15,23,42,0.5)]"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.05] px-6 py-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                  <FaEdit className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">تعديل العنوان</h3>
                  <p className="mt-1 text-sm font-medium text-slate-300">تنسيق منظم لتحديث بيانات العنوان والإحداثيات بوضوح.</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-200"
              >
                <FaTimes />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-7 px-6 py-6 md:px-8 md:py-8">
              <section className={panelClass}>
                <div className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-sky-200">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                    <FaMapMarkerAlt className="text-sky-300" />
                  </div>
                  <span>البيانات الأساسية</span>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <FaMapMarkerAlt className="text-sky-300" />
                      <span>اسم العنوان</span>
                      <span className="text-red-300">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={fieldClass}
                      placeholder="أدخل اسم العنوان بشكل واضح"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <FaStar className="text-amber-300" />
                      <span>المستوى المطلوب</span>
                    </label>
                    <input
                      type="number"
                      name="requiredLevel"
                      value={formData.requiredLevel}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      className={fieldClass}
                      placeholder="من 1 إلى 100"
                    />
                  </div>
                </div>
              </section>

              <section className={panelClass}>
                <div className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-sky-200">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                    <FaGlobe className="text-sky-300" />
                  </div>
                  <span>الإحداثيات الجغرافية</span>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <label className="block text-sm font-semibold text-slate-200">خط الطول</label>
                    <div className="relative">
                      <FaCompass className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-300/70" />
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className={`${fieldClass} pr-11 font-mono`}
                        placeholder="مثال: 31.2357"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-sm font-semibold text-slate-200">خط العرض</label>
                    <div className="relative">
                      <FaGlobe className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-300/70" />
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className={`${fieldClass} pr-11 font-mono`}
                        placeholder="مثال: 30.0444"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className={panelClass}>
                <div className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-200">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                    <FaMapMarkerAlt className="text-sky-300" />
                  </div>
                  <span>معرف العنوان</span>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-[#112033] px-4 py-4">
                  <p className="select-all break-all font-mono text-sm font-medium text-slate-100" dir="ltr">{location?.id}</p>
                </div>
              </section>

              <div className="mt-1 flex flex-col gap-4 border-t border-white/10 pt-7 md:flex-row">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-[22px] border border-white/10 bg-white/[0.06] px-6 py-4 text-base font-semibold text-slate-200"
                  disabled={loading}
                >
                  إلغاء
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="flex flex-[1.4] items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4 text-base font-semibold text-white shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>جاري الحفظ...</span>
                    </span>
                  ) : (
                    <>
                      <FaEdit />
                      <span>حفظ التغييرات</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditLocationModal;
