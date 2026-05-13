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

const panel = 'rounded-[28px] border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100/70 md:p-6';
const smallPanel = 'rounded-[20px] border border-sky-100 bg-sky-50 px-4 py-4 text-slate-900 shadow-inner';

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
  return { text: 'غير محدد', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: FaTasks };
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md md:p-8" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-sky-100 bg-slate-50 shadow-2xl shadow-slate-300/60"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.5)_45%,rgba(238,242,255,0.58))]" />

            <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 px-6 py-5 md:px-8">
              <div className="flex-1">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg">
                    <FaTasks className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-950">
                      {missionData.title || 'بدون عنوان'}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      عرض منظم لبيانات المهمة مع تفاصيل الحالة والمكافآت والجدول الزمني.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <span className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium ${difficulty.badge}`}>
                        <DifficultyIcon />
                        <span>الصعوبة: {difficulty.text}</span>
                      </span>
                      <span className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {isActive ? <FaCheckCircle /> : <FaLock />}
                        <span>الحالة: {isActive ? 'نشطة' : 'مغلقة'}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700">
                  <FaFingerprint className="text-sky-600" />
                  <span dir="ltr">ID: {missionData.id || 'N/A'}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
              >
                <FaTimes />
              </motion.button>
            </div>

            <div className="relative flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="grid gap-7">
                  <section className={panel}>
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-sky-700">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                        <FaTasks className="text-sky-600" />
                      </div>
                      <span>ملخص المهمة</span>
                    </div>
                    <p className="mt-5 text-base font-medium leading-7 text-slate-700">
                      {missionData.description || 'لا يوجد وصف تفصيلي لهذه المهمة حاليًا.'}
                    </p>
                  </section>

                  <section className={panel}>
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-sky-700">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                        <FaMapMarkerAlt className="text-sky-600" />
                      </div>
                      <span>الموقع المرتبط</span>
                    </div>
                    <div className={`${smallPanel} mt-5`}>
                      <div className="mb-2 text-sm font-medium text-slate-600">معرف العنوان</div>
                      <div className="break-all font-mono text-sm font-semibold text-slate-900" dir="ltr">
                        {missionData.locationId || 'غير محدد'}
                      </div>
                    </div>
                  </section>

                  <section className={panel}>
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-amber-700">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                        <FaTrophy className="text-amber-600" />
                      </div>
                      <span>المكافآت</span>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <StatCard icon={FaTrophy} label="نقاط الخير" value={missionData.kpReward} accent="text-yellow-600" />
                      <StatCard icon={FaStar} label="الخبرة" value={missionData.xpReward} accent="text-fuchsia-600" />
                      <StatCard icon={FaLeaf} label="التأثير" value={missionData.impactReward} accent="text-emerald-600" />
                    </div>
                  </section>
                </div>

                <div className="grid gap-7">
                  <section className={panel}>
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                        <FaLayerGroup className="text-sky-600" />
                      </div>
                      <span>البيانات الأساسية</span>
                    </div>
                    <div className="mt-5 grid gap-4">
                      <MetaRow icon={FaShieldAlt} label="درجة الصعوبة" value={difficulty.text} />
                      <MetaRow icon={FaLayerGroup} label="المستوى المطلوب" value={missionData.requiredLevel ?? 'غير متوفر'} />
                      <MetaRow icon={isHidden ? FaEyeSlash : FaEye} label="نطاق الرؤية" value={isHidden ? 'مخفية' : 'عامة'} />
                      <MetaRow icon={isActive ? FaCheckCircle : FaLock} label="الحالة الحالية" value={isActive ? 'نشطة' : 'مغلقة'} />
                    </div>
                  </section>

                  <section className={panel}>
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                        <FaCalendarAlt className="text-sky-600" />
                      </div>
                      <span>الجدول الزمني</span>
                    </div>
                    <div className="mt-5 grid gap-4">
                      {timeline.length > 0 ? (
                        timeline.map((item) => (
                          <div key={item.label} className={`${smallPanel} space-y-2.5`}>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                              <item.icon className="text-sky-600" />
                              {item.label}
                            </div>
                            <span className="block text-sm font-semibold text-slate-900">
                              {formatDate(item.value)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className={smallPanel}>
                          لا توجد بيانات زمنية مسجلة.
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Tags & Requirements */}
                  {(missionData.tags?.length > 0 || missionData.prerequisites?.length > 0) && (
                    <section className={panel}>
                      <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                          <FaTags className="text-sky-600" />
                        </div>
                        <span>وسوم ومتطلبات</span>
                      </div>
                      <div className="mt-5 space-y-6">
                        {missionData.tags?.length > 0 && (
                          <div className="space-y-4">
                            <div className="px-1 text-sm font-semibold text-slate-600">الوسوم النشطة</div>
                            <div className="flex flex-wrap gap-3">
                              {missionData.tags.map((tag, index) => (
                                <span key={`${tag}-${index}`} className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {missionData.prerequisites?.length > 0 && (
                          <div className="space-y-4">
                            <div className="px-1 text-sm font-semibold text-slate-600">المتطلبات المسبقة</div>
                            <div className="grid gap-4">
                              {missionData.prerequisites.map((item, index) => (
                                <div key={`${item}-${index}`} className={`${smallPanel} flex items-center gap-3 text-sm font-medium text-slate-700`}>
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

            <div className="relative border-t border-slate-200 bg-white/90 px-6 py-5 md:px-8">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
                className="w-full rounded-[22px] border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 shadow-sm"
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

const StatCard = ({ icon: Icon, label, value, accent = 'text-blue-300' }) => (
  <div className="rounded-[20px] border border-sky-100 bg-white px-4 py-4 shadow-sm">
    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600">
      <Icon className={accent} />
      <span>{label}</span>
    </div>
    <div className="text-lg font-semibold text-slate-950 tabular-nums">
      {value ?? 0}
    </div>
  </div>
);

const MetaRow = ({ icon: Icon, label, value, valueClass = 'text-slate-950' }) => (
  <div className="flex items-center justify-between gap-4 rounded-[20px] border border-sky-100 bg-white px-4 py-4 shadow-sm">
    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
      <Icon className="text-sky-600" />
      <span>{label}</span>
    </div>
    <div className={`text-sm font-semibold ${valueClass}`}>{value}</div>
  </div>
);
