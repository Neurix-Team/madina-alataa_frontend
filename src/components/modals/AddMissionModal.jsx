import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus, FaMapMarkerAlt, FaTasks, FaShieldAlt, FaStar, FaTrophy, FaLeaf, FaChartPie } from 'react-icons/fa';

const AddMissionModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 1,
    requiredLevel: 1,
    kpReward: 1,
    xpReward: 1,
    impactReward: 1,
    locationId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'difficulty' || name === 'requiredLevel' || name === 'kpReward' || name === 'xpReward' || name === 'impactReward'
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('يرجى إدخال عنوان المهمة');
      return;
    }

    if (!formData.locationId.trim()) {
      alert('يرجى إدخال معرف الموقع (Location ID)');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        title: formData.title.trim(),
        difficulty: Number(formData.difficulty) || 1,
        requiredLevel: Number(formData.requiredLevel) || 1,
        kpReward: Number(formData.kpReward) || 1,
        xpReward: Number(formData.xpReward) || 1,
        impactReward: Number(formData.impactReward) || 1,
        locationId: formData.locationId.trim()
      };
      
      await onSubmit(submitData);
      setFormData({
        title: '',
        difficulty: 1,
        requiredLevel: 1,
        kpReward: 1,
        xpReward: 1,
        impactReward: 1,
        locationId: ''
      });
      onClose();
    } catch (err) {
      console.error('Error in AddMissionModal:', err);
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
            className="bg-[#0f172a]/90 rounded-[3rem] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)] flex flex-col relative"
          >
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -z-10" />

            {/* Header */}
            <div className="flex justify-between items-center p-10 border-b border-white/5 bg-white/5 backdrop-blur-3xl sticky top-0 z-20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-2xl border border-white/20">
                  <FaPlus className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">إنشاء مهمة جديدة</h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">تحديد تفاصيل العملية الميدانية</p>
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
              {/* Title Section */}
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  <h4 className="text-white font-black text-lg">البيانات الأساسية</h4>
                </div>
                <div className="group space-y-3">
                  <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                    <FaTasks className="text-blue-500" />
                    عنوان العملية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all duration-300 shadow-inner font-bold"
                    placeholder="أدخل عنواناً مميزاً للمهمة..."
                  />
                </div>
              </div>

              {/* Config Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-8 bg-purple-500 rounded-full" />
                    <h4 className="text-white font-black text-lg">الإعدادات</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="group space-y-3">
                      <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                        <FaShieldAlt className="text-purple-500" />
                        درجة الصعوبة
                      </label>
                      <div className="relative">
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleChange}
                          className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-8 focus:ring-purple-500/5 transition-all duration-300 shadow-inner appearance-none cursor-pointer font-bold"
                        >
                          <option value={0}>سهل (EASY)</option>
                          <option value={1}>متوسط (NORMAL)</option>
                          <option value={2}>صعب (HARD)</option>
                          <option value={3}>أسطوري (LEGENDARY)</option>
                        </select>
                        <FaChartPie className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                      </div>
                    </div>

                    <div className="group space-y-3">
                      <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                        <FaStar className="text-yellow-500" />
                        المستوى الأدنى
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

                {/* Rewards Section */}
                <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                    <h4 className="text-white font-black text-lg">المكافآت</h4>
                  </div>
                  <div className="space-y-6">
                    {[
                      { name: 'kpReward', icon: FaTrophy, color: 'text-yellow-500', label: 'نقاط الخير' },
                      { name: 'xpReward', icon: FaStar, color: 'text-purple-500', label: 'نقاط الخبرة' },
                      { name: 'impactReward', icon: FaLeaf, color: 'text-emerald-500', label: 'نقاط التأثير' }
                    ].map((r, i) => (
                      <div key={i} className="group space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <r.icon className={r.color} />
                            {r.label}
                          </label>
                          <span className="text-white font-black text-xs tabular-nums">{formData[r.name]}</span>
                        </div>
                        <input
                          type="number"
                          name={r.name}
                          value={formData[r.name]}
                          onChange={handleChange}
                          min="0"
                          className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-5 py-3 text-lg text-white focus:outline-none focus:border-white/20 transition-all font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                  <h4 className="text-white font-black text-lg">تحديد الموقع</h4>
                </div>
                <div className="group space-y-3">
                  <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                    <FaMapMarkerAlt className="text-indigo-500" />
                    معرف الموقع الجغرافي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-lg text-blue-400 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all duration-300 shadow-inner font-mono text-left"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    dir="ltr"
                  />
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-10 border-t border-white/5 bg-white/5 backdrop-blur-3xl sticky bottom-0 z-20 flex gap-6">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-5 bg-white/5 text-slate-400 rounded-2xl transition-all font-black text-xl border border-white/5"
                disabled={loading}
              >
                إلغاء
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(37,99,235,0.5)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                onClick={handleSubmit}
                className="flex-[2] px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 font-black text-xl shadow-2xl border border-white/10"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-8 h-8 border-[4px] border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FaPlus className="text-lg" />
                    <span>اعتماد المهمة</span>
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

export default AddMissionModal;
