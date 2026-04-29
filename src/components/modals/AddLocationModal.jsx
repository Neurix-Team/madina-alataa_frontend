import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus, FaMapMarkerAlt, FaGlobe, FaCompass, FaStar, FaSatellite } from 'react-icons/fa';

const AddLocationModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    requiredLevel: 1,
    longitude: 0,
    latitude: 0
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'requiredLevel' || name === 'longitude' || name === 'latitude'
        ? (value === '' ? '' : (name === 'requiredLevel' ? parseInt(value) : parseFloat(value)))
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
        name: formData.name.trim(),
        requiredLevel: Number(formData.requiredLevel) || 1,
        longitude: Number(formData.longitude) || 0,
        latitude: Number(formData.latitude) || 0
      };
      await onSubmit(submitData);
      setFormData({
        name: '',
        requiredLevel: 1,
        longitude: 0,
        latitude: 0
      });
      onClose();
    } catch (err) {
      console.error('Error in AddLocationModal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 md:p-8" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40, rotateX: 15 }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.3 }}
            className="bg-[#0f172a]/90 rounded-[3rem] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)] flex flex-col relative"
          >
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -z-10" />

            {/* Header */}
            <div className="flex justify-between items-center p-10 border-b border-white/5 bg-white/5 backdrop-blur-3xl sticky top-0 z-20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-800 flex items-center justify-center shadow-2xl border border-white/20">
                  <FaPlus className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">إضافة موقع جديد</h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">تحديد الإحداثيات والبيانات الجغرافية</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl transition-all text-slate-400 border border-white/5"
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {/* Basic Info Section */}
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6 shadow-inner">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <h4 className="text-white font-black text-lg">البيانات الوصفية</h4>
                </div>
                <div className="space-y-6">
                  <div className="group space-y-3">
                    <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                      <FaMapMarkerAlt className="text-indigo-500" />
                      اسم الموقع الجغرافي <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all duration-300 shadow-inner font-bold"
                      placeholder="أدخل اسماً واضحاً للموقع..."
                    />
                  </div>

                  <div className="group space-y-3">
                    <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                      <FaStar className="text-yellow-500" />
                      المستوى المطلوب للوصول
                    </label>
                    <input
                      type="number"
                      name="requiredLevel"
                      value={formData.requiredLevel}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white focus:outline-none focus:border-yellow-500/50 focus:ring-8 focus:ring-yellow-500/5 transition-all duration-300 shadow-inner font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6 shadow-inner">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <h4 className="text-white font-black text-lg">إحداثيات القمر الصناعي</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group space-y-3">
                    <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                      <FaCompass className="text-blue-500" />
                      خط الطول (Longitude)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all duration-300 shadow-inner font-mono font-bold tabular-nums"
                    />
                  </div>

                  <div className="group space-y-3">
                    <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                      <FaGlobe className="text-blue-500" />
                      خط العرض (Latitude)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all duration-300 shadow-inner font-mono font-bold tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/10 flex items-start gap-4">
                <FaSatellite className="text-blue-400 text-2xl mt-1 animate-pulse" />
                <p className="text-blue-300/60 text-sm font-medium leading-relaxed">
                  تأكد من إدخال الإحداثيات بدقة عالية لضمان عمل ميزات الخريطة والمهام الجغرافية بشكل صحيح داخل النظام.
                </p>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-10 border-t border-white/5 bg-white/5 backdrop-blur-3xl sticky bottom-0 z-20 flex gap-6">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-5 bg-white/5 text-slate-400 rounded-2xl transition-all font-black text-xl border border-white/5 shadow-lg"
                disabled={loading}
              >
                تراجع
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(79,70,229,0.5)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                onClick={handleSubmit}
                className="flex-[2] px-8 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 font-black text-xl shadow-2xl border border-white/10"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-8 h-8 border-[4px] border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FaPlus className="text-lg" />
                    <span>حفظ الموقع</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddLocationModal;
