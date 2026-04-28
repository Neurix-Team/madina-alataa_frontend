import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaStar, FaClock, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle, FaTrophy, FaLeaf, FaShieldAlt, FaFire, FaGem, FaTasks } from 'react-icons/fa';

const MissionDetailModal = ({ isOpen, onClose, mission }) => {
  if (!isOpen || !mission) return null;

  const getDifficultyInfo = (level) => {
    switch (level) {
      case 0:
        return { text: 'سهل', color: 'from-green-500/20 to-emerald-600/20', bg: 'bg-green-500/10', border: 'border-green-500/30', textCol: 'text-green-400', icon: FaLeaf, glow: 'hover:shadow-green-900/50' };
      case 1:
        return { text: 'متوسط', color: 'from-blue-500/20 to-cyan-600/20', bg: 'bg-blue-500/10', border: 'border-blue-500/30', textCol: 'text-blue-400', icon: FaShieldAlt, glow: 'hover:shadow-blue-900/50' };
      case 2:
        return { text: 'صعب', color: 'from-orange-500/20 to-red-600/20', bg: 'bg-orange-500/10', border: 'border-orange-500/30', textCol: 'text-orange-400', icon: FaFire, glow: 'hover:shadow-orange-900/50' };
      case 3:
        return { text: 'صعب جداً', color: 'from-purple-500/20 to-pink-600/20', bg: 'bg-purple-500/10', border: 'border-purple-500/30', textCol: 'text-purple-400', icon: FaGem, glow: 'hover:shadow-purple-900/50' };
      default:
        return { text: 'غير محدد', color: 'from-gray-500/20 to-slate-600/20', bg: 'bg-gray-500/10', border: 'border-gray-500/30', textCol: 'text-gray-400', icon: FaTasks, glow: 'hover:shadow-gray-900/50' };
    }
  };

  const diffInfo = getDifficultyInfo(mission.difficulty);
  const DiffIcon = diffInfo.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            className="bg-gradient-to-br from-[#0a192f] to-[#112240] rounded-3xl border border-blue-800/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(30,58,138,0.3)]"
          >
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-blue-900/50 bg-[#0a192f]/50 sticky top-0 z-10 backdrop-blur-xl">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <FaTasks className="text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 leading-tight">
                    {mission.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className={`px-4 py-1.5 rounded-xl ${diffInfo.bg} ${diffInfo.border} border ${diffInfo.textCol} font-bold flex items-center gap-2 shadow-inner text-sm`}>
                    <DiffIcon className="text-sm" />
                    {diffInfo.textCol === 'text-purple-400' && <span className="animate-pulse absolute w-2 h-2 bg-purple-400 rounded-full blur-sm" />}
                    {diffInfo.text}
                  </span>
                  <span className="px-4 py-1.5 rounded-xl bg-blue-900/40 border border-blue-700/50 text-blue-100 font-bold flex items-center gap-2 text-sm shadow-inner">
                    <FaStar className="text-yellow-500" /> المستوى: {mission.requiredLevel}
                  </span>
                  {!mission.isActive && (
                    <span className="px-4 py-1.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold flex items-center gap-2 shadow-inner text-sm">
                      <FaLock /> غير متاحة
                    </span>
                  )}
                  {mission.isHidden && (
                    <span className="px-4 py-1.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold flex items-center gap-2 shadow-inner text-sm">
                      <FaEyeSlash /> مخفية
                    </span>
                  )}
                </div>
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

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Mission ID */}
              <div className="bg-[#112240]/50 rounded-2xl p-4 border border-blue-900/30">
                <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                  <FaTasks className="text-blue-500/70" /> معرف المهمة
                </h4>
                <p className="text-blue-100 font-mono text-base tracking-wider bg-[#0a192f] p-3 rounded-xl border border-blue-900/50">{mission.id}</p>
              </div>

              {/* Description */}
              {mission.description && (
                <div className="bg-[#112240]/50 rounded-2xl p-4 border border-blue-900/30">
                  <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                    <FaEye className="text-blue-500/70" /> وصف المهمة
                  </h4>
                  <p className="text-blue-100 leading-relaxed text-lg bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">{mission.description}</p>
                </div>
              )}

              {/* Rewards */}
              <div>
                <h4 className="text-base font-bold text-blue-300 mb-4 flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" /> المكافآت
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-[#112240] to-[#1a365d] rounded-2xl p-5 border border-yellow-500/30 flex flex-col items-center justify-center group hover:scale-105 transition-transform duration-300 shadow-lg">
                    <FaTrophy className="text-yellow-400 mb-3 text-3xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    <span className="text-yellow-400 font-black text-3xl mb-1">{mission.kpReward}</span>
                    <div className="text-yellow-200/60 text-sm font-bold uppercase tracking-wider">نقطة خير</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#112240] to-[#1a365d] rounded-2xl p-5 border border-purple-500/30 flex flex-col items-center justify-center group hover:scale-105 transition-transform duration-300 shadow-lg">
                    <FaStar className="text-purple-400 mb-3 text-3xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    <span className="text-purple-400 font-black text-3xl mb-1">{mission.xpReward}</span>
                    <div className="text-purple-200/60 text-sm font-bold uppercase tracking-wider">نقطة خبرة</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#112240] to-[#1a365d] rounded-2xl p-5 border border-green-500/30 flex flex-col items-center justify-center group hover:scale-105 transition-transform duration-300 shadow-lg">
                    <FaLeaf className="text-green-400 mb-3 text-3xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    <span className="text-green-400 font-black text-3xl mb-1">{mission.impactReward}</span>
                    <div className="text-green-200/60 text-sm font-bold uppercase tracking-wider">نقطة تأثير</div>
                  </div>
                </div>
              </div>

              {/* Location */}
              {mission.locationId && (
                <div className="bg-[#112240]/50 rounded-2xl p-4 border border-blue-900/30">
                  <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500/70" /> الموقع
                  </h4>
                  <div className="flex items-center gap-3 bg-[#0a192f] rounded-xl p-4 border border-blue-900/50">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FaMapMarkerAlt className="text-blue-400 text-xl" />
                    </div>
                    <span className="text-blue-100 font-mono text-lg">{mission.locationId}</span>
                  </div>
                </div>
              )}

              {/* Status Information */}
              <div className="bg-[#112240]/50 rounded-2xl p-4 border border-blue-900/30">
                <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <FaExclamationTriangle className="text-blue-500/70" /> حالة المهمة
                </h4>
                <div className="space-y-3 bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">
                  <div className="flex justify-between items-center pb-3 border-b border-blue-900/30">
                    <span className="text-blue-200 font-bold">الحالة العامة</span>
                    <span className={`px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-2 ${
                      mission.isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {mission.isActive ? <FaCheckCircle /> : <FaTimes />}
                      {mission.isActive ? 'نشطة ومتاحة' : 'غير نشطة'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 font-bold">الرؤية لللاعبين</span>
                    <span className={`px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-2 ${
                      mission.isHidden 
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {mission.isHidden ? <FaEyeSlash /> : <FaEye />}
                      {mission.isHidden ? 'مخفية عن اللاعبين' : 'مرئية للجميع'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-[#112240]/50 rounded-2xl p-4 border border-blue-900/30">
                <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <FaClock className="text-blue-500/70" /> المواعيد والتواريخ
                </h4>
                <div className="space-y-3 bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">
                  {mission.createdAt && (
                    <div className="flex justify-between items-center pb-3 border-b border-blue-900/30">
                      <span className="text-blue-200 font-bold">تاريخ الإنشاء</span>
                      <span className="text-blue-100 font-medium bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-800/30 text-sm">
                        {formatDate(mission.createdAt)}
                      </span>
                    </div>
                  )}
                  {mission.updatedAt && (
                    <div className="flex justify-between items-center pb-3 border-b border-blue-900/30">
                      <span className="text-blue-200 font-bold">آخر تحديث</span>
                      <span className="text-blue-100 font-medium bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-800/30 text-sm">
                        {formatDate(mission.updatedAt)}
                      </span>
                    </div>
                  )}
                  {mission.startDate && (
                    <div className="flex justify-between items-center pb-3 border-b border-blue-900/30">
                      <span className="text-blue-200 font-bold">تاريخ البدء</span>
                      <span className="text-blue-100 font-medium bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-800/30 text-sm">
                        {formatDate(mission.startDate)}
                      </span>
                    </div>
                  )}
                  {mission.endDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200 font-bold">تاريخ الانتهاء</span>
                      <span className="text-blue-100 font-medium bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-800/30 text-sm">
                        {formatDate(mission.endDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {mission.prerequisites && mission.prerequisites.length > 0 && (
                <div className="bg-[#112240]/50 rounded-2xl p-4 border border-blue-900/30">
                  <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-blue-500/70" /> المتطلبات المسبقة
                  </h4>
                  <div className="space-y-2">
                    {mission.prerequisites.map((prereq, index) => (
                      <div key={index} className="bg-[#0a192f] rounded-xl p-3 text-blue-100 text-sm border border-blue-900/50 flex items-center gap-2 font-medium">
                        <FaStar className="text-blue-500/50 text-xs" /> {prereq}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {mission.tags && mission.tags.length > 0 && (
                <div className="bg-[#112240]/50 rounded-2xl p-4 border border-blue-900/30">
                  <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <FaStar className="text-blue-500/70" /> الوسوم
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mission.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl text-blue-200 font-bold text-sm border border-blue-500/30 shadow-inner">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-blue-900/50 bg-[#0a192f]/50 backdrop-blur-xl sticky bottom-0 z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#112240] to-[#1a365d] hover:from-[#1a365d] hover:to-[#112240] text-blue-200 rounded-2xl transition-all font-bold text-lg border border-blue-800/50 shadow-lg"
              >
                إغلاق التفاصيل
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MissionDetailModal;
