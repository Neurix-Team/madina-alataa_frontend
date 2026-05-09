import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaFire,
  FaGem,
  FaLeaf,
  FaMapMarkerAlt,
  FaPlay,
  FaRocket,
  FaSearch,
  FaShieldAlt,
  FaSpinner,
  FaStar,
  FaTasks,
  FaTrophy,
  FaLayerGroup,
} from 'react-icons/fa';
import { availableMissionsService } from '../../services/availableMissionsService';
import MissionDetailModal from '../modals/MissionDetailModal';

const extractAvailableMissions = (response) => {
  const root = response?.value && typeof response.value === 'object' ? response.value : response;
  const items =
    root?.items ||
    root?.data ||
    root?.values ||
    root?.result ||
    (Array.isArray(root) ? root : []);
  const totalCount =
    root?.totalCount ??
    root?.total ??
    root?.count ??
    (Array.isArray(items) ? items.length : 0);
  const pageNumber = root?.pageNumber ?? root?.currentPage ?? root?.page ?? 1;
  const pageSize = root?.pageSize ?? root?.pageSizeValue ?? (Array.isArray(items) ? items.length : 0);
  const totalPages = root?.totalPages ?? (pageSize ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1);

  return {
    items: Array.isArray(items) ? items : [],
    totalCount: Number(totalCount) || 0,
    pageNumber: Number(pageNumber) || 1,
    totalPages: Number(totalPages) || 1,
  };
};

const getDifficultyInfo = (level) => {
  switch (Number(level)) {
    case 0:
      return { label: 'سهل', icon: FaLeaf, badge: 'bg-emerald-500/12 border-emerald-400/20 text-emerald-300' };
    case 1:
      return { label: 'متوسط', icon: FaShieldAlt, badge: 'bg-blue-500/12 border-blue-400/20 text-blue-300' };
    case 2:
      return { label: 'صعب', icon: FaFire, badge: 'bg-orange-500/12 border-orange-400/20 text-orange-300' };
    case 3:
      return { label: 'أسطوري', icon: FaGem, badge: 'bg-fuchsia-500/12 border-fuchsia-400/20 text-fuchsia-300' };
    default:
      return { label: 'غير محدد', icon: FaTasks, badge: 'bg-slate-500/12 border-slate-400/20 text-slate-300' };
  }
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-[0_15px_45px_rgba(148,163,184,0.12)] hover:shadow-[0_25px_60px_rgba(148,163,184,0.18)] transition-all duration-300">
    <div className="flex items-center gap-6">
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${accent} text-2xl shadow-inner`}>
        <Icon />
      </div>
      <div>
        <div className="text-sm font-black tracking-[0.1em] uppercase text-slate-500 mb-1">{label}</div>
        <div className="text-4xl font-black text-slate-900 tabular-nums leading-none">{value}</div>
      </div>
    </div>
  </div>
);

const RewardCard = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 text-center">
    <Icon className={`mx-auto mb-3 text-2xl ${tone}`} />
    <div className="text-2xl font-black text-slate-900">{value ?? 0}</div>
    <div className="mt-1 text-xs font-black tracking-[0.14em] uppercase text-slate-500">{label}</div>
  </div>
);

const HighlightPill = ({ icon: Icon, label, value, tone }) => (
  <div className={`inline-flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-black ${tone}`}>
    <Icon />
    <span>{label}</span>
    <span className="font-mono">{value}</span>
  </div>
);

export default function AvailableMissionsTab() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(9);
  const [totalCount, setTotalCount] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLevel, setUserLevel] = useState('');

  const fetchAvailableMissions = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = search.trim()
        ? await availableMissionsService.searchAvailableMissions(search.trim(), userLevel, page, pageSize)
        : await availableMissionsService.getAvailableMissions(userLevel, page, pageSize);

      const normalized = extractAvailableMissions(response);
      setMissions(normalized.items);
      setCurrentPage(normalized.pageNumber || page);
      setTotalPages(normalized.totalPages || 1);
      setTotalCount(normalized.totalCount);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'فشل في جلب المهام المتاحة';
      setError(message);
      console.error('❌ Error fetching available missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAvailableMissions(currentPage, searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, userLevel]);

  const stats = useMemo(
    () => [
      { icon: FaTasks, label: 'إجمالي المعروض', value: totalCount || missions.length, accent: 'bg-blue-500/12 text-blue-300' },
      { icon: FaStar, label: 'متوسط المستوى', value: missions.length ? Math.round(missions.reduce((sum, item) => sum + (Number(item.requiredLevel) || 0), 0) / missions.length) : 0, accent: 'bg-amber-500/12 text-amber-300' },
      { icon: FaRocket, label: 'جاهزة للبدء', value: missions.filter((item) => !(item.userLevel && item.userLevel < item.requiredLevel)).length, accent: 'bg-emerald-500/12 text-emerald-300' },
    ],
    [missions, totalCount]
  );

  const handleViewMission = (mission) => {
    setSelectedMission(mission);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 p-8 md:p-16" dir="rtl">
      <div className="relative mx-auto max-w-7xl space-y-16">
        <div className="flex flex-col gap-10 rounded-[48px] border border-slate-200/80 bg-white/80 backdrop-blur-2xl p-10 md:flex-row md:items-center md:justify-between md:p-14 shadow-[0_30px_80px_rgba(148,163,184,0.2)]">
          <div className="flex items-center gap-10">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] border border-white/20">
              <FaRocket className="text-4xl" />
            </div>
            <div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">المهام المتاحة</h2>
              <p className="mt-4 text-lg md:text-xl font-bold text-slate-500 max-w-lg leading-relaxed">استكشف الفرص التطوعية الميدانية المتاحة لك الآن بناءً على تصنيفاتك الحالية.</p>
            </div>
          </div>

          <div className="grid w-full gap-6 md:w-auto md:grid-cols-[minmax(350px,480px)_180px]">
            <div className="relative group">
              <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-600/50 group-focus-within:text-emerald-600 transition-colors text-xl" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ابحث عن تحدي متاح..."
                className="w-full rounded-[28px] border-2 border-slate-100 bg-white py-5 pr-16 pl-6 text-slate-900 text-lg outline-none transition focus:border-emerald-400/50 focus:ring-8 focus:ring-emerald-500/5 shadow-sm"
              />
            </div>

            <div className="relative group">
              <FaLayerGroup className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-600/50 text-xl" />
              <input
                type="number"
                value={userLevel}
                onChange={(event) => {
                  setUserLevel(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="المستوى"
                min="1"
                max="100"
                className="w-full rounded-[28px] border-2 border-slate-100 bg-white py-5 pr-16 pl-6 text-slate-900 text-lg outline-none transition focus:border-emerald-400/50 focus:ring-8 focus:ring-emerald-500/5 shadow-sm font-mono tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} accent={stat.accent.replace('bg-blue-500/12 text-blue-300', 'bg-blue-500/10 text-blue-600').replace('bg-amber-500/12 text-amber-300', 'bg-amber-500/10 text-amber-600').replace('bg-emerald-500/12 text-emerald-300', 'bg-emerald-500/10 text-emerald-600')} />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-4 rounded-[28px] border-2 border-red-200 bg-red-50/90 p-6 text-red-700 shadow-xl"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FaExclamationTriangle />
              </div>
              <span className="font-black text-lg">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && missions.length === 0 ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-10 rounded-[48px] border border-slate-200/80 bg-white/80 backdrop-blur-2xl shadow-inner">
            <div className="relative">
              <FaSpinner className="animate-spin text-7xl text-emerald-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">جاري مزامنة قاعدة بيانات المهام...</div>
          </div>
        ) : missions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="rounded-[48px] border border-slate-200/80 bg-white/80 backdrop-blur-2xl p-24 text-center shadow-inner"
          >
            <div className="mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-[3rem] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg">
              <FaTasks className="text-6xl" />
            </div>
            <h3 className="text-5xl font-black text-slate-900 leading-tight">لا توجد تحديات متوفرة حاليًا</h3>
            <p className="mx-auto mt-8 max-w-2xl text-slate-500 font-bold text-xl leading-relaxed">
              يبدو أنك أنجزت كل شيء، أو لا توجد مهام تناسب المستوى المختار حاليًا. جرّب تغيير معايير البحث أو الانتظار لتحديثات جديدة.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="text-base font-black text-slate-500 uppercase tracking-widest">
                  إجمالي النتائج: <span className="text-slate-900 tabular-nums">{totalCount || missions.length}</span>
                </div>
              </div>
              {userLevel && (
                <div className="rounded-full border border-emerald-200 bg-emerald-50/90 px-6 py-2.5 text-sm font-black text-emerald-700 shadow-sm">
                  مستوى الفلترة النشط: {userLevel}
                </div>
              )}
            </div>

            <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
              {missions.map((mission, index) => {
                const difficulty = getDifficultyInfo(mission.difficulty);
                const DifficultyIcon = difficulty.icon;
                const locked = mission.userLevel && mission.userLevel < mission.requiredLevel;

                return (
                  <motion.div
                    key={mission.id || `${mission.title}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-[40px] border border-slate-200/80 bg-white p-10 shadow-[0_20px_50px_rgba(148,163,184,0.12)] hover:shadow-[0_40px_90px_rgba(148,163,184,0.22)] transition-all duration-500 flex flex-col"
                  >
                    <div className="mb-10 flex items-start justify-between gap-6">
                      <div className="min-w-0 flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-black uppercase tracking-widest ${difficulty.badge} shadow-sm`}>
                            <DifficultyIcon />
                            <span>{difficulty.label}</span>
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-amber-600 shadow-sm">
                            <FaStar />
                            <span>مستوى {mission.requiredLevel ?? 0}</span>
                          </span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors duration-300">
                          {mission.title || 'بدون عنوان'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                          ID: <span className="font-mono text-emerald-600/70">{mission.id || 'N/A'}</span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: '#eff6ff' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewMission(mission)}
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-blue-100 bg-white text-blue-600 shadow-lg transition-all"
                        title="عرض التفاصيل الكاملة"
                      >
                        <FaEye className="text-2xl" />
                      </motion.button>
                    </div>

                    <div className="mb-10 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 p-8 space-y-5 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500">
                          <FaMapMarkerAlt className="text-blue-500 text-lg" />
                          <span>الموقع الجغرافي</span>
                        </div>
                        {mission.userLevel && (
                          <div className="text-xs font-black text-emerald-600 bg-emerald-100/50 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                            مستواك: {mission.userLevel}
                          </div>
                        )}
                      </div>
                      <div className="font-mono text-sm break-all text-slate-600 bg-white/80 rounded-2xl px-6 py-4 border border-slate-200/50 tracking-widest leading-relaxed" dir="ltr">
                        {mission.locationId || 'UNSPECIFIED_LOCATION'}
                      </div>
                    </div>

                    <div className="mb-12 grid grid-cols-3 gap-6">
                      {[
                        { icon: FaTrophy, val: mission.kpReward, label: 'نقاط خير', accent: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                        { icon: FaStar, val: mission.xpReward, label: 'خبرة', accent: 'text-fuchsia-600', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200' },
                        { icon: FaLeaf, val: mission.impactReward, label: 'تأثير', accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                      ].map((reward, i) => (
                        <div key={i} className={`rounded-[2rem] border-2 ${reward.border} ${reward.bg} p-6 text-center shadow-sm hover:scale-105 transition-transform duration-300`}>
                          <reward.icon className={`mx-auto mb-3 text-3xl ${reward.accent}`} />
                          <div className="text-3xl font-black text-slate-900 tabular-nums leading-none">{reward.val || 0}</div>
                          <div className={`mt-2 text-[10px] font-black uppercase tracking-widest ${reward.accent} opacity-80`}>{reward.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <motion.button
                        whileHover={{ scale: locked ? 1 : 1.02 }}
                        whileTap={{ scale: locked ? 1 : 0.98 }}
                        disabled={locked}
                        className={`w-full rounded-[28px] px-8 py-6 text-xl font-black transition-all duration-300 shadow-2xl ${locked ? 'cursor-not-allowed border-2 border-red-100 bg-red-50 text-red-300' : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 border border-white/10'}`}
                      >
                        <span className="inline-flex items-center gap-5">
                          {locked ? <FaLock className="text-red-300" /> : <FaPlay className="animate-pulse" />}
                          <span>{locked ? 'المستوى غير كافٍ' : 'بدء المهمة الآن'}</span>
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-700 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FaArrowRight className="text-xl" />
                </motion.button>

                <div className="rounded-full border-2 border-slate-200 bg-white px-8 py-3 text-lg font-black text-slate-700 shadow-md">
                  صفحة {currentPage} من {totalPages}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-700 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FaArrowLeft className="text-xl" />
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>

      <MissionDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMission(null);
        }}
        mission={selectedMission}
      />
    </div>
  );
}
