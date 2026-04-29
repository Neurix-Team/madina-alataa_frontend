import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaStar, FaClock, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle, FaTrophy, FaLeaf, FaShieldAlt, FaFire, FaGem, FaTasks, FaFingerprint, FaCalendarAlt, FaLayerGroup, FaTags } from 'react-icons/fa';

const MissionDetailModal = ({ isOpen, onClose, mission }) => {
  if (!isOpen) return null;

  const missionData = mission?.value ?? mission?.data ?? mission?.result ?? mission;
  if (!missionData) return null;

  const missionStatus = String(missionData.status ?? '').toLowerCase();
  const rawIsActive = missionData.isActive;
  const rawIsHidden = missionData.isHidden;

  const isActive = rawIsActive !== undefined && rawIsActive !== null
    ? rawIsActive === true || rawIsActive === 'true'
    : missionStatus === 'open' || missionStatus === 'active' || missionStatus === '';

  const isHidden = rawIsHidden !== undefined && rawIsHidden !== null
    ? rawIsHidden === true || rawIsHidden === 'true'
    : false;

  const getDifficultyInfo = (level) => {
    const normalized = typeof level === 'string' ? level.toLowerCase() : Number(level);
    if (normalized === 0 || normalized === 'easy' || normalized === 'سهل') {
      return { text: 'سهل', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', textCol: 'text-emerald-400', icon: FaLeaf };
    }
    if (normalized === 1 || normalized === 'normal' || normalized === 'medium' || normalized === 'متوسط') {
      return { text: 'متوسط', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20', textCol: 'text-blue-400', icon: FaShieldAlt };
    }
    if (normalized === 2 || normalized === 'hard' || normalized === 'صعب') {
      return { text: 'صعب', color: 'from-orange-500 to-red-600', bg: 'bg-orange-500/10', border: 'border-orange-500/20', textCol: 'text-orange-400', icon: FaFire };
    }
    if (normalized === 3 || normalized === 'veryhard' || normalized === 'very hard' || normalized === 'أسطوري') {
      return { text: 'أسطوري', color: 'from-purple-500 to-fuchsia-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20', textCol: 'text-purple-400', icon: FaGem };
    }
    return { text: 'غير محدد', color: 'from-slate-500 to-slate-600', bg: 'bg-slate-500/10', border: 'border-slate-500/20', textCol: 'text-slate-400', icon: FaTasks };
  };

  const diffInfo = getDifficultyInfo(missionData.difficulty);
  const DiffIcon = diffInfo.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
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
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 md:p-8" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="bg-[#0f172a] rounded-[3.5rem] border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-[0_0_120px_rgba(37,99,235,0.25)] flex flex-col relative"
          >
            {/* Animated Background Orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Header */}
            <div className="flex justify-between items-start p-10 border-b border-white/5 bg-white/5 backdrop-blur-3xl sticky top-0 z-20">
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-6">
                  <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${diffInfo.color} flex items-center justify-center shadow-2xl border border-white/20 group`}>
                    <FaTasks className="text-white text-3xl group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter leading-tight mb-2">
                      {missionData.title || 'بدون عنوان'}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm uppercase tracking-[0.2em]">
                      <FaFingerprint className="text-blue-500/50" />
                      {missionData.id || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className={`px-5 py-2 rounded-2xl ${diffInfo.bg} ${diffInfo.border} border ${diffInfo.textCol} font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg`}>
                    <DiffIcon className="text-sm" />
                    {diffInfo.text}
                  </div>
                  <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg">
                    <FaLayerGroup className="text-yellow-500" />
                    المستوى: {missionData.requiredLevel}
                  </div>
                  <div className={`px-5 py-2 rounded-2xl ${isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} border font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg`}>
                    {isActive ? <FaCheckCircle /> : <FaLock />}
                    {isActive ? 'نشطة' : 'مغلقة'}
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-[1.5rem] transition-all text-slate-400 border border-white/5 shadow-xl"
              >
                <FaTimes className="text-2xl" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {/* Mission Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Description Card */}
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-blue-400 font-black text-sm uppercase tracking-widest mb-2">
                    <FaEye className="text-lg" />
                    <span>نظرة عامة</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-lg font-medium italic">
                    {missionData.description || 'لا يوجد وصف تفصيلي لهذه المهمة في الوقت الحالي.'}
                  </p>
                </div>

                {/* Location Card */}
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-indigo-400 font-black text-sm uppercase tracking-widest mb-2">
                    <FaMapMarkerAlt className="text-lg" />
                    <span>إحداثيات الموقع</span>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-5 border border-white/5 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <FaMapMarkerAlt className="text-indigo-400 text-xl" />
                    </div>
                    <span className="text-indigo-200 font-mono text-lg break-all group-hover:text-white transition-colors">
                      {missionData.locationId || 'موقع غير محدد'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rewards Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white font-black text-xl tracking-tighter px-2">
                  <FaTrophy className="text-yellow-500" />
                  <h4>نظام المكافآت المعتمد</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: FaTrophy, val: missionData.kpReward, label: 'نقطة خير', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                    { icon: FaStar, val: missionData.xpReward, label: 'خبرة مكتسبة', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                    { icon: FaLeaf, val: missionData.impactReward, label: 'تأثير مجتمعي', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                  ].map((r, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className={`${r.bg} rounded-[2rem] p-7 border ${r.border} flex flex-col items-center text-center group transition-all duration-500`}>
                      <r.icon className={`${r.color} text-4xl mb-4 group-hover:scale-110 transition-transform`} />
                      <span className="text-white font-black text-4xl mb-1 tabular-nums">{r.val}</span>
                      <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{r.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Metadata Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Dates Timeline */}
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 text-slate-400 font-black text-sm uppercase tracking-widest mb-2">
                    <FaCalendarAlt className="text-lg" />
                    <span>الجدول الزمني</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'تاريخ الإنشاء', val: missionData.createdAt, icon: FaPlus, color: 'text-blue-500' },
                      { label: 'آخر تحديث', val: missionData.updatedAt, icon: FaClock, color: 'text-purple-500' },
                      { label: 'تاريخ البدء', val: missionData.startDate, icon: FaCheckCircle, color: 'text-emerald-500' },
                      { label: 'تاريخ الانتهاء', val: missionData.endDate, icon: FaTimes, color: 'text-red-500' }
                    ].filter(d => d.val).map((d, i) => (
                      <div key={i} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 font-bold text-slate-400 text-sm">
                          <d.icon className={d.color} />
                          <span>{d.label}</span>
                        </div>
                        <span className="text-white font-black text-sm tabular-nums">{formatDate(d.val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status & Security */}
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 text-slate-400 font-black text-sm uppercase tracking-widest mb-2">
                    <FaShieldAlt className="text-lg" />
                    <span>الحالة والأمان</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                      <span className="text-slate-400 font-bold text-sm">رؤية المهمة</span>
                      <div className={`flex items-center gap-2 font-black text-sm ${isHidden ? 'text-yellow-500' : 'text-blue-400'}`}>
                        {isHidden ? <FaEyeSlash /> : <FaEye />}
                        <span>{isHidden ? 'مخفية' : 'مرئية للجميع'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                      <span className="text-slate-400 font-bold text-sm">مستوى الصعوبة</span>
                      <div className={`flex items-center gap-2 font-black text-sm ${diffInfo.textCol}`}>
                        <DiffIcon />
                        <span>{diffInfo.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags & Prerequisites */}
              {(missionData.tags?.length > 0 || missionData.prerequisites?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {missionData.tags?.length > 0 && (
                    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-4">
                      <div className="flex items-center gap-3 text-slate-400 font-black text-sm uppercase tracking-widest mb-2">
                        <FaTags className="text-lg" />
                        <span>الوسوم</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {missionData.tags.map((tag, i) => (
                          <span key={i} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-black text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {missionData.prerequisites?.length > 0 && (
                    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-4">
                      <div className="flex items-center gap-3 text-slate-400 font-black text-sm uppercase tracking-widest mb-2">
                        <FaCheckCircle className="text-lg" />
                        <span>المتطلبات</span>
                      </div>
                      <div className="space-y-2">
                        {missionData.prerequisites.map((p, i) => (
                          <div key={i} className="bg-black/20 p-3 rounded-xl border border-white/5 text-slate-300 text-sm font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-10 border-t border-white/5 bg-white/5 backdrop-blur-3xl sticky bottom-0 z-20">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-10 py-6 bg-white/5 text-slate-300 rounded-[2rem] transition-all font-black text-xl border border-white/5 shadow-2xl"
              >
                إغلاق سجل البيانات
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MissionDetailModal;
