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
const panel = 'rounded-[28px] bg-white/5 border border-white/8';
const smallPanel = 'rounded-[22px] bg-black/20 border border-white/8';

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

const StatCard = ({ icon: Icon, label, value, accent = 'text-blue-300' }) => (
  <div className={`${smallPanel} p-5`}>
    <div className={`mb-3 flex items-center gap-2 text-xs font-black tracking-[0.18em] text-slate-400 uppercase`}>
      <Icon className={accent} />
      <span>{label}</span>
    </div>
    <div className="text-2xl font-black text-white tabular-nums">{value ?? 0}</div>
  </div>
);

const MetaRow = ({ icon: Icon, label, value, valueClass = 'text-white' }) => (
  <div className={`${smallPanel} flex items-center justify-between gap-4 p-4`}>
    <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
      <Icon className="text-blue-300" />
      <span>{label}</span>
    </div>
    <div className={`text-sm font-black ${valueClass}`}>{value}</div>
  </div>
);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/88 backdrop-blur-xl p-4 md:p-8" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.2 }}
            className={`${shell} relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[36px] shadow-[0_30px_120px_rgba(15,23,42,0.55)]`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_25%)] pointer-events-none" />

            <div className="relative flex items-start justify-between gap-6 border-b border-white/8 bg-white/5 px-6 py-6 md:px-8">
              <div className="flex min-w-0 flex-1 items-start gap-4 md:gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-xl">
                  <FaTasks className="text-2xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${difficulty.badge}`}>
                      <DifficultyIcon />
                      <span>{difficulty.text}</span>
                    </span>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${isActive ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20' : 'bg-red-500/10 text-red-300 border-red-400/20'}`}>
                      {isActive ? <FaCheckCircle /> : <FaLock />}
                      <span>{isActive ? 'نشطة' : 'مغلقة'}</span>
                    </span>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${isHidden ? 'bg-amber-500/10 text-amber-300 border-amber-400/20' : 'bg-sky-500/10 text-sky-300 border-sky-400/20'}`}>
                      {isHidden ? <FaEyeSlash /> : <FaEye />}
                      <span>{isHidden ? 'مخفية' : 'مرئية'}</span>
                    </span>
                  </div>
                  <h3 className="truncate text-2xl md:text-4xl font-black tracking-tight text-white">{missionData.title || 'بدون عنوان'}</h3>
                  <div className="mt-3 flex items-center gap-2 text-xs md:text-sm font-bold text-slate-400">
                    <FaFingerprint className="text-blue-300" />
                    <span className="font-mono break-all">{missionData.id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.06, rotate: 90 }}
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-slate-300"
              >
                <FaTimes />
              </motion.button>
            </div>

            <div className="relative flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="grid gap-6">
                  <section className={`${panel} p-6 md:p-7`}>
                    <div className="mb-4 flex items-center gap-3 text-sm font-black tracking-[0.18em] uppercase text-blue-300">
                      <FaTasks />
                      <span>ملخص المهمة</span>
                    </div>
                    <p className="text-base md:text-lg leading-8 text-slate-200">
                      {missionData.description || 'لا يوجد وصف تفصيلي لهذه المهمة حاليًا.'}
                    </p>
                  </section>

                  <section className={`${panel} p-6 md:p-7`}>
                    <div className="mb-5 flex items-center gap-3 text-sm font-black tracking-[0.18em] uppercase text-indigo-300">
                      <FaMapMarkerAlt />
                      <span>العنوان المرتبط</span>
                    </div>
                    <div className={`${smallPanel} flex items-start gap-4 p-5`}>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 border border-indigo-400/15">
                        <FaMapMarkerAlt />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Location ID</div>
                        <div className="font-mono text-sm md:text-base break-all text-white">
                          {missionData.locationId || 'غير محدد'}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className={`${panel} p-6 md:p-7`}>
                    <div className="mb-5 flex items-center gap-3 text-sm font-black tracking-[0.18em] uppercase text-amber-300">
                      <FaTrophy />
                      <span>المكافآت</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <StatCard icon={FaTrophy} label="نقاط الخير" value={missionData.kpReward} accent="text-yellow-300" />
                      <StatCard icon={FaStar} label="الخبرة" value={missionData.xpReward} accent="text-fuchsia-300" />
                      <StatCard icon={FaLeaf} label="التأثير" value={missionData.impactReward} accent="text-emerald-300" />
                    </div>
                  </section>
                </div>

                <div className="grid gap-6">
                  <section className={`${panel} p-6 md:p-7`}>
                    <div className="mb-5 flex items-center gap-3 text-sm font-black tracking-[0.18em] uppercase text-slate-300">
                      <FaLayerGroup />
                      <span>بيانات أساسية</span>
                    </div>
                    <div className="grid gap-3">
                      <MetaRow icon={FaShieldAlt} label="مستوى الصعوبة" value={difficulty.text} valueClass="text-white" />
                      <MetaRow icon={FaLayerGroup} label="المستوى المطلوب" value={missionData.requiredLevel ?? 'غير متوفر'} />
                      <MetaRow icon={isHidden ? FaEyeSlash : FaEye} label="الرؤية" value={isHidden ? 'مخفية' : 'مرئية للجميع'} valueClass={isHidden ? 'text-amber-300' : 'text-sky-300'} />
                      <MetaRow icon={isActive ? FaCheckCircle : FaLock} label="الحالة" value={isActive ? 'نشطة' : 'مغلقة'} valueClass={isActive ? 'text-emerald-300' : 'text-red-300'} />
                    </div>
                  </section>

                  <section className={`${panel} p-6 md:p-7`}>
                    <div className="mb-5 flex items-center gap-3 text-sm font-black tracking-[0.18em] uppercase text-slate-300">
                      <FaCalendarAlt />
                      <span>التسلسل الزمني</span>
                    </div>
                    <div className="grid gap-3">
                      {timeline.length > 0 ? (
                        timeline.map((item) => (
                          <MetaRow
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            value={formatDate(item.value)}
                            valueClass="text-slate-200"
                          />
                        ))
                      ) : (
                        <div className={`${smallPanel} p-4 text-sm font-bold text-slate-400`}>لا توجد تواريخ إضافية متاحة.</div>
                      )}
                    </div>
                  </section>

                  {(missionData.tags?.length > 0 || missionData.prerequisites?.length > 0) && (
                    <section className={`${panel} p-6 md:p-7`}>
                      <div className="mb-5 flex items-center gap-3 text-sm font-black tracking-[0.18em] uppercase text-slate-300">
                        <FaTags />
                        <span>وسوم ومتطلبات</span>
                      </div>
                      <div className="grid gap-5">
                        {missionData.tags?.length > 0 && (
                          <div>
                            <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">الوسوم</div>
                            <div className="flex flex-wrap gap-2">
                              {missionData.tags.map((tag, index) => (
                                <span key={`${tag}-${index}`} className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-2 text-xs font-black text-blue-300">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {missionData.prerequisites?.length > 0 && (
                          <div>
                            <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">المتطلبات</div>
                            <div className="grid gap-2">
                              {missionData.prerequisites.map((item, index) => (
                                <div key={`${item}-${index}`} className={`${smallPanel} flex items-center gap-3 p-3 text-sm font-bold text-slate-200`}>
                                  <FaCheckCircle className="text-emerald-300" />
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

            <div className="relative border-t border-white/8 bg-white/5 p-5 md:p-6">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
                className="w-full rounded-[22px] border border-white/8 bg-white/6 px-6 py-4 text-lg font-black text-slate-200"
              >
                إغلاق التفاصيل
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
