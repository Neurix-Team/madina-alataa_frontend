import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEdit, FaMapMarkerAlt, FaGlobe, FaCompass, FaStar } from 'react-icons/fa';

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-[#0a192f] to-[#112240] rounded-3xl border border-blue-800/50 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(30,58,138,0.3)]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-blue-900/50 bg-[#0a192f]/50 sticky top-0 z-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                  <FaEdit className="text-orange-400 text-lg" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-wide">تعديل العنوان</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors text-red-400 hover:text-red-300 border border-red-500/20"
              >
                <FaTimes className="text-lg" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Location Name */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-blue-300 px-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <FaMapMarkerAlt className="text-blue-400" />
                  </div>
                  اسم العنوان <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#08101d]/80 border border-white/10 rounded-2xl px-5 py-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-[#0d1728] focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-xl"
                  placeholder="أدخل اسم العنوان بشكل واضح"
                />
              </div>

              {/* Required Level */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-yellow-500 px-1">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                    <FaStar className="text-yellow-400" />
                  </div>
                  المستوى المطلوب
                </label>
                <input
                  type="number"
                  name="requiredLevel"
                  value={formData.requiredLevel}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full bg-[#08101d]/80 border border-white/10 rounded-2xl px-5 py-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:bg-[#0d1728] focus:ring-4 focus:ring-yellow-500/10 transition-all duration-300 shadow-xl"
                  placeholder="من 1 إلى 100"
                />
              </div>

              {/* Coordinates Grid */}
              <div className="bg-white/5 p-7 rounded-[2.5rem] border border-white/10 shadow-inner">
                <h4 className="text-blue-300 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-3">
                  <FaGlobe className="text-blue-400" /> الإحداثيات الجغرافية
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Longitude */}
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                      خط الطول (Longitude)
                    </label>
                    <div className="relative group">
                      <FaCompass className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500/40 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="w-full bg-[#08101d]/90 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-lg text-blue-100 placeholder-blue-900/30 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 font-mono tabular-nums shadow-xl"
                        placeholder="مثال: 31.2357"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Latitude */}
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                      خط العرض (Latitude)
                    </label>
                    <div className="relative group">
                      <FaGlobe className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500/40 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="w-full bg-[#08101d]/90 border border-white/5 rounded-2xl pr-12 pl-4 py-4 text-lg text-blue-100 placeholder-blue-900/30 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 font-mono tabular-nums shadow-xl"
                        placeholder="مثال: 30.0444"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location ID Display */}
              <div className="bg-black/20 rounded-[2rem] p-6 border border-white/5">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500/50" /> معرف العنوان الفريد
                </h4>
                <div className="bg-[#08101d] p-4 rounded-xl border border-white/5 shadow-inner">
                  <p className="text-blue-300/80 font-mono text-sm tracking-widest break-all select-all">{location?.id}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-8 mt-4 border-t border-white/5">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-8 py-5 bg-white/5 text-slate-400 rounded-2xl transition-all font-black text-lg border border-white/5 shadow-xl"
                  disabled={loading}
                >
                  إلغاء التعديل
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(249,115,22,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-[1.5] px-8 py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 font-black text-xl shadow-2xl border border-white/10"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FaEdit className="text-2xl" />
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
