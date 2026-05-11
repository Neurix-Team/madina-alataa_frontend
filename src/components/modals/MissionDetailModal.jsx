import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaFingerprint,
  FaFire,
  FaGem,
  FaLayerGroup,
  FaLeaf,
  FaLock,
  FaMapMarkerAlt,
  FaPlus,
  FaShieldAlt,
  FaStar,
  FaTags,
  FaTasks,
  FaTimes,
  FaTrophy,
} from 'react-icons/fa';

const shell = 'bg-[#0b1220] border border-white/10';
const panel = 'rounded-[32px] bg-white/5 border border-white/8 shadow-2xl';
const smallPanel = 'rounded-[24px] bg-black/30 border border-white/8 shadow-inner';

const getDifficultyInfo = (level) => {
  const normalized = typeof level === 'string' ? level.toLowerCase() : Number(level);
  if (normalized === 0 || normalized === 'easy' || normalized === 'سهل') {
    return { text: 'سهل', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20', icon: FaLeaf };
  }
  if (normalized === 1 || normalized === 'normal' || normalized === 'medium' || normalized === 'متوسط') {
    return { text: 'متوسط', badge: 'bg-blue-500/10 text-blue-300 border-blue-400/20', icon: FaShieldAlt };
  }
  if (normalized === 2 || normalized === 'hard' || normalized === 'صعب') {
    return { text: 'صعب', badge: 'bg-orange-500/10 text-orange-300 border-orange-400/20', icon: FaFire };
  }
  if (normalized === 3 || normalized === 'veryhard' || normalized === 'very hard' || normalized === 'أسطوري') {
    return { text: 'أسطوري', badge: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/20', icon: FaGem };
  }
  return { text: 'غير محدد', badge: 'bg-slate-500/10 text-slate-300 border-slate-400/20', icon: FaTasks };
};

const formatDate = (dateString) => {
  if (!dateString) return 'غير متوفر';
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function MissionDetailModal({ isOpen, onClose, mission }) {
  if (!isOpen) return null;

  const missionData = mission?.value ?? mission?.data ?? mission?.result ?? mission;
  if (!missionData) return null;

  const statusText = String(missionData.status ?? '').toLowerCase();
  const isActive =
    missionData.isActive !== undefined && missionData.isActive !== null
      ? missionData.isActive === true || missionData.isActive === 'true'
      : statusText === 'open' || statusText === 'active' || statusText === '';
  const isHidden =
    missionData.isHidden !== undefined && missionData.isHidden !== null
      ? missionData.isHidden === true || missionData.isHidden === 'true'
      : false;

  const difficulty = getDifficultyInfo(missionData.difficulty);
  const DifficultyIcon = difficulty.icon;

  const timeline = [
    { label: 'تاريخ الإنشاء', value: missionData.createdAt, icon: FaPlus },
    { label: 'آخر تحديث', value: missionData.updatedAt, icon: FaClock },
    { label: 'تاريخ البدء', value: missionData.startDate, icon: FaCheckCircle },
    { label: 'تاريخ الانتهاء', value: missionData.endDate, icon: FaCalendarAlt },
  ].filter((item) => item.value);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-2xl p-4 md:p-8" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="bg-[#0f172a] rounded-[3.5rem] border border-white/10 w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-[0_0_120px_rgba(79,70,229,0.25)] flex flex-col relative"
          >
            {/* Animated Background Orbs */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1.5s' }} />

            {/* Header Section */}
            <div className="flex justify-between items-start p-12 border-b border-white/10 bg-white/5 backdrop-blur-3xl sticky top-0 z-20">
              <div className="flex-1">
                <div className="flex items-center gap-8 mb-8">
                  <div className="w-20 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.4)] border border-white/20 group">
                    <FaTasks className="text-white text-4xl group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-5xl font-black text-white tracking-tight leading-none mb-6">
                      {missionData.title || 'بدون عنوان'}
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <span className={`inline-flex items-center gap-3 rounded-2xl border px-6 py-3 text-sm font-black uppercase tracking-widest shadow-2xl backdrop-blur-md ${difficulty.badge}`}>
                        <DifficultyIcon className="text-xl" />
                        <span>الصعوبة: {difficulty.text}</span>
                      </span>
                      <span className={`inline-flex items-center gap-3 rounded-2xl border px-6 py-3 text-sm font-black uppercase tracking-widest shadow-2xl backdrop-blur-md ${isActive ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                        {isActive ? <FaCheckCircle className="text-xl" /> : <FaLock className="text-xl" />}
                        <span>الحالة: {isActive ? 'نشطة' : 'مغلقة'}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-slate-400 font-black text-xs uppercase tracking-[0.3em] bg-black/20 w-fit px-5 py-2.5 rounded-xl border border-white/5">
                  <FaFingerprint className="text-blue-400 text-base" />
                  ID: {missionData.id || 'N/A'}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl transition-all text-slate-400 border border-white/10 shadow-2xl"
              >
                <FaTimes className="text-3xl" />
              </motion.button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-12 space-y-16 custom-scrollbar">
              <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-12">
                  {/* Summary Section */}
                  <section className="bg-white/5 rounded-[3.5rem] p-12 border border-white/10 space-y-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-5 text-blue-300 font-black text-xs uppercase tracking-[0.3em]">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                        <FaTasks className="text-xl" />
                      </div>
                      <span>ملخص العملية الميدانية</span>
                    </div>
                    <p className="text-2xl leading-relaxed text-slate-200 font-medium px-2">
                      {missionData.description || 'لا يوجد وصف تفصيلي لهذه المهمة حاليًا.'}
                    </p>
                  </section>

                  {/* Location Info */}
                  <section className="bg-white/5 rounded-[3.5rem] p-12 border border-white/10 space-y-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-5 text-indigo-300 font-black text-xs uppercase tracking-[0.3em]">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                        <FaMapMarkerAlt className="text-xl" />
                      </div>
                      <span>الموقع الجغرافي المستهدف</span>
                    </div>
                    <div className="bg-black/40 flex items-center gap-8 p-10 rounded-[2.5rem] border border-white/5 group hover:bg-black/60 transition-all shadow-inner">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 shadow-2xl group-hover:scale-110 transition-transform">
                        <FaMapMarkerAlt className="text-3xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-slate-500">Unique Location ID</div>
                        <div className="font-mono text-xl md:text-2xl break-all text-white tracking-widest font-black">
                          {missionData.locationId || 'غير محدد'}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Rewards Section */}
                  <section className="bg-white/5 rounded-[3.5rem] p-12 border border-white/10 space-y-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-5 text-amber-300 font-black text-xs uppercase tracking-[0.3em]">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                        <FaTrophy className="text-xl" />
                      </div>
                      <span>المكافآت التقديرية</span>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                      <StatCard icon={FaTrophy} label="نقاط الخير" value={missionData.kpReward} accent="text-yellow-400" />
                      <StatCard icon={FaStar} label="الخبرة" value={missionData.xpReward} accent="text-fuchsia-400" />
                      <StatCard icon={FaLeaf} label="التأثير" value={missionData.impactReward} accent="text-emerald-400" />
                    </div>
                  </section>
                </div>

                <div className="space-y-12">
                  {/* Technical Specs */}
                  <section className="bg-white/5 rounded-[3.5rem] p-12 border border-white/10 space-y-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-5 text-slate-300 font-black text-xs uppercase tracking-[0.3em]">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                        <FaLayerGroup className="text-xl" />
                      </div>
                      <span>المواصفات الفنية</span>
                    </div>
                    <div className="grid gap-6">
                      <MetaRow icon={FaShieldAlt} label="درجة الصعوبة" value={difficulty.text} valueClass="text-white text-xl" />
                      <MetaRow icon={FaLayerGroup} label="المستوى المطلوب" value={missionData.requiredLevel ?? 'غير متوفر'} valueClass="text-yellow-500 text-2xl" />
                      <MetaRow icon={isHidden ? FaEyeSlash : FaEye} label="نطاق الرؤية" value={isHidden ? 'مخفية' : 'عامة'} valueClass={isHidden ? 'text-amber-400 text-xl' : 'text-sky-400 text-xl'} />
                      <MetaRow icon={isActive ? FaCheckCircle : FaLock} label="الحالة الحالية" value={isActive ? 'نشطة' : 'مغلقة'} valueClass={isActive ? 'text-emerald-400 text-xl' : 'text-red-400 text-xl'} />
                    </div>
                  </section>

                  {/* Timeline Section */}
                  <section className="bg-white/5 rounded-[3.5rem] p-12 border border-white/10 space-y-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-5 text-slate-300 font-black text-xs uppercase tracking-[0.3em]">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                        <FaCalendarAlt className="text-xl" />
                      </div>
                      <span>الجدول الزمني</span>
                    </div>
                    <div className="grid gap-6">
                      {timeline.length > 0 ? (
                        timeline.map((item) => (
                          <div key={item.label} className="bg-black/40 p-8 rounded-[2rem] border border-white/5 group hover:bg-black/60 transition-all shadow-inner space-y-3">
                            <div className="flex items-center gap-4 text-slate-500 font-black text-xs uppercase tracking-[0.2em]">
                              <item.icon className="text-blue-500 text-xl" />
                              {item.label}
                            </div>
                            <span className="text-white font-black text-2xl tabular-nums tracking-wide block">
                              {formatDate(item.value)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5 text-slate-500 text-center italic font-black text-lg">
                          لا توجد بيانات زمنية مسجلة.
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Tags & Requirements */}
                  {(missionData.tags?.length > 0 || missionData.prerequisites?.length > 0) && (
                    <section className="bg-white/5 rounded-[3.5rem] p-12 border border-white/10 space-y-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center gap-5 text-slate-300 font-black text-xs uppercase tracking-[0.3em]">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                          <FaTags className="text-xl" />
                        </div>
                        <span>وسوم ومتطلبات</span>
                      </div>
                      <div className="space-y-10">
                        {missionData.tags?.length > 0 && (
                          <div className="space-y-5">
                            <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 px-2">الوسوم النشطة</div>
                            <div className="flex flex-wrap gap-4">
                              {missionData.tags.map((tag, index) => (
                                <span key={`${tag}-${index}`} className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-6 py-3 text-sm font-black text-blue-300 shadow-xl backdrop-blur-md">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {missionData.prerequisites?.length > 0 && (
                          <div className="space-y-5">
                            <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 px-2">المتطلبات المسبقة</div>
                            <div className="grid gap-4">
                              {missionData.prerequisites.map((item, index) => (
                                <div key={`${item}-${index}`} className="bg-black/40 flex items-center gap-5 p-6 rounded-2xl border border-white/5 text-lg font-black text-slate-200 shadow-inner">
                                  <FaCheckCircle className="text-emerald-400 text-xl" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="p-10 border-t border-white/10 bg-white/5 backdrop-blur-3xl sticky bottom-0 z-20">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-10 py-8 bg-white/5 text-slate-300 rounded-[2.5rem] transition-all font-black text-2xl border border-white/10 shadow-2xl"
              >
                إغلاق ملف المهمة
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const StatCard = ({ icon: Icon, label, value, accent = 'text-blue-300' }) => (
  <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 shadow-inner group hover:bg-black/60 transition-all">
    <div className={`mb-4 flex items-center gap-3 text-xs font-black tracking-[0.2em] text-slate-500 uppercase`}>
      <Icon className={accent} />
      <span>{label}</span>
    </div>
    <div className="text-4xl font-black text-white tabular-nums group-hover:scale-105 transition-transform origin-right">
      {value ?? 0}
    </div>
  </div>
);

const MetaRow = ({ icon: Icon, label, value, valueClass = 'text-white' }) => (
  <div className="bg-black/40 flex items-center justify-between gap-6 p-8 rounded-[2rem] border border-white/5 group hover:bg-black/60 transition-all shadow-inner">
    <div className="flex items-center gap-4 text-slate-500 font-black text-sm uppercase tracking-widest">
      <Icon className="text-blue-400 text-xl" />
      <span>{label}</span>
    </div>
    <div className={`font-black ${valueClass}`}>{value}</div>
  </div>
);
