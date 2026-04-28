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
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Location Name */}
              <div className="group">
                <label className="flex items-center gap-2 text-base font-bold text-blue-200 mb-3">
                  <FaMapMarkerAlt className="text-blue-400" />
                  اسم العنوان <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0a192f]/50 border-2 border-blue-900/50 rounded-xl px-4 py-3.5 text-lg text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500 focus:bg-[#112240] focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-inner"
                    placeholder="أدخل اسم العنوان بشكل واضح"
                  />
                </div>
              </div>

              {/* Required Level */}
              <div className="group">
                <label className="flex items-center gap-2 text-base font-bold text-blue-200 mb-3">
                  <FaStar className="text-yellow-500" />
                  المستوى المطلوب
                </label>
                <input
                  type="number"
                  name="requiredLevel"
                  value={formData.requiredLevel}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full bg-[#0a192f]/50 border-2 border-blue-900/50 rounded-xl px-4 py-3.5 text-lg text-white placeholder-blue-300/30 focus:outline-none focus:border-yellow-500 focus:bg-[#112240] focus:ring-4 focus:ring-yellow-500/20 transition-all duration-300 shadow-inner"
                  placeholder="من 1 إلى 100"
                />
              </div>

              {/* Coordinates Grid */}
              <div className="bg-[#0a192f]/30 p-5 rounded-2xl border border-blue-900/30">
                <h4 className="text-blue-300 font-bold mb-4 flex items-center gap-2">
                  <FaGlobe className="text-blue-400" /> الإحداثيات الجغرافية
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Longitude */}
                  <div className="group">
                    <label className="block text-sm font-bold text-blue-200/80 mb-2">
                      خط الطول (Longitude)
                    </label>
                    <div className="relative">
                      <FaCompass className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500/50" />
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="w-full bg-[#0a192f]/80 border border-blue-900/50 rounded-xl pr-12 pl-4 py-3 text-lg text-blue-100 placeholder-blue-700/30 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 font-mono"
                        placeholder="مثال: 31.2357"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Latitude */}
                  <div className="group">
                    <label className="block text-sm font-bold text-blue-200/80 mb-2">
                      خط العرض (Latitude)
                    </label>
                    <div className="relative">
                      <FaGlobe className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500/50" />
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="w-full bg-[#0a192f]/80 border border-blue-900/50 rounded-xl pr-12 pl-4 py-3 text-lg text-blue-100 placeholder-blue-700/30 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 font-mono"
                        placeholder="مثال: 30.0444"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location ID Display */}
              <div className="bg-[#112240]/50 rounded-2xl p-4 border border-blue-900/30">
                <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500/70" /> معرف العنوان
                </h4>
                <p className="text-blue-100 font-mono text-sm tracking-wider bg-[#0a192f] p-3 rounded-xl border border-blue-900/50">{location?.id}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 mt-6 border-t border-blue-900/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-[#112240] hover:bg-[#1a365d] text-blue-200 rounded-xl transition-colors font-bold text-lg border border-blue-800/50"
                  disabled={loading}
                >
                  إلغاء
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(251,146,60,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-orange-900/50 border border-orange-400/30"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FaEdit />
                      تحديث العنوان
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
