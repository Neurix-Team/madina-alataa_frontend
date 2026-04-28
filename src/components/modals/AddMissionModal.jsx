import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus, FaMapMarkerAlt, FaTasks, FaShieldAlt, FaStar, FaTrophy, FaLeaf } from 'react-icons/fa';

const AddMissionModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 0,
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
      alert('يرجى إدخال معرف الموقع (Location ID) بصيغة صحيحة (Guid)');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        title: formData.title,
        difficulty: formData.difficulty,
        requiredLevel: formData.requiredLevel,
        kpReward: formData.kpReward,
        xpReward: formData.xpReward,
        impactReward: formData.impactReward,
        locationId: formData.locationId
      };
      
      await onSubmit(submitData);
      setFormData({
        title: '',
        difficulty: 0,
        requiredLevel: 1,
        kpReward: 1,
        xpReward: 1,
        impactReward: 1,
        locationId: ''
      });
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
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <FaPlus className="text-blue-400 text-lg" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-wide">إضافة مهمة جديدة</h3>
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
              {/* Title */}
              <div className="group">
                <label className="flex items-center gap-2 text-base font-bold text-blue-200 mb-3">
                  <FaTasks className="text-blue-400" />
                  عنوان المهمة <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0a192f]/50 border-2 border-blue-900/50 rounded-xl px-4 py-3.5 text-lg text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500 focus:bg-[#112240] focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-inner"
                    placeholder="أدخل عنوان المهمة بشكل واضح"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty */}
                <div className="group">
                  <label className="flex items-center gap-2 text-base font-bold text-blue-200 mb-3">
                    <FaShieldAlt className="text-blue-400" />
                    مستوى الصعوبة
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full bg-[#0a192f]/50 border-2 border-blue-900/50 rounded-xl px-4 py-3.5 text-lg text-white focus:outline-none focus:border-blue-500 focus:bg-[#112240] focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-inner appearance-none cursor-pointer"
                  >
                    <option value={0}>سهل (Easy)</option>
                    <option value={1}>متوسط (Normal)</option>
                    <option value={2}>صعب (Hard)</option>
                    <option value={3}>صعب جداً (Very Hard)</option>
                  </select>
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
              </div>

              {/* Rewards Grid */}
              <div className="bg-[#0a192f]/30 p-5 rounded-2xl border border-blue-900/30">
                <h4 className="text-blue-300 font-bold mb-4 flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" /> مكافآت المهمة
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* KP Reward */}
                  <div className="group">
                    <label className="block text-sm font-bold text-yellow-400/80 mb-2">
                      نقاط الخير (KP)
                    </label>
                    <div className="relative">
                      <FaTrophy className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500/50" />
                      <input
                        type="number"
                        name="kpReward"
                        value={formData.kpReward}
                        onChange={handleChange}
                        min="1"
                        className="w-full bg-[#0a192f]/80 border border-yellow-900/50 rounded-xl pr-12 pl-4 py-3 text-lg text-yellow-400 placeholder-yellow-700/30 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* XP Reward */}
                  <div className="group">
                    <label className="block text-sm font-bold text-purple-400/80 mb-2">
                      نقاط الخبرة (XP)
                    </label>
                    <div className="relative">
                      <FaStar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-500/50" />
                      <input
                        type="number"
                        name="xpReward"
                        value={formData.xpReward}
                        onChange={handleChange}
                        min="1"
                        className="w-full bg-[#0a192f]/80 border border-purple-900/50 rounded-xl pr-12 pl-4 py-3 text-lg text-purple-400 placeholder-purple-700/30 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Impact Reward */}
                  <div className="group">
                    <label className="block text-sm font-bold text-green-400/80 mb-2">
                      نقاط التأثير
                    </label>
                    <div className="relative">
                      <FaLeaf className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500/50" />
                      <input
                        type="number"
                        name="impactReward"
                        value={formData.impactReward}
                        onChange={handleChange}
                        min="1"
                        className="w-full bg-[#0a192f]/80 border border-green-900/50 rounded-xl pr-12 pl-4 py-3 text-lg text-green-400 placeholder-green-700/30 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location ID */}
              <div className="group">
                <label className="flex items-center gap-2 text-base font-bold text-blue-200 mb-3">
                  <FaMapMarkerAlt className="text-blue-400" />
                  معرف الموقع (Location ID) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0a192f]/50 border-2 border-blue-900/50 rounded-xl px-4 py-3.5 text-lg text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500 focus:bg-[#112240] focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-inner font-mono text-left"
                    placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    dir="ltr"
                  />
                </div>
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
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59,130,246,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-blue-900/50 border border-blue-400/30"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FaPlus />
                      إضافة المهمة
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

export default AddMissionModal;
