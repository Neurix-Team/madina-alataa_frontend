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
  <div className="rounded-[24px] border border-slate-200/80 bg-white/70 backdrop-blur-xl p-5 shadow-[0_18px_45px_rgba(148,163,184,0.16)]">
    <div className="mb-3 flex items-center gap-3">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}>
        <Icon />
      </div>
      <span className="text-sm font-black tracking-[0.16em] uppercase text-slate-500">{label}</span>
    </div>
    <div className="text-3xl font-black text-slate-900 tabular-nums">{value}</div>
  </div>
);

const RewardCard = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 text-center">
    <Icon className={`mx-auto mb-3 text-2xl ${tone}`} />
    <div className="text-2xl font-black text-slate-900">{value ?? 0}</div>
    <div className="mt-1 text-xs font-black tracking-[0.14em] uppercase text-slate-500">{label}</div>
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

      console.log('🔍 AVAILABLE MISSIONS RAW RESPONSE:', response);
      
      const normalized = extractAvailableMissions(response);
      console.log('📊 AVAILABLE MISSIONS NORMALIZED RESPONSE:', normalized);
      console.log('📋 AVAILABLE MISSIONS ITEMS COUNT:', normalized.items?.length || 0);
      console.log('📄 TOTAL COUNT:', normalized.totalCount);
      console.log('📖 CURRENT PAGE:', normalized.pageNumber);
      console.log('📚 TOTAL PAGES:', normalized.totalPages);
      
      if (normalized.items && normalized.items.length > 0) {
        console.log('🎯 FIRST MISSION ITEM:', normalized.items[0]);
        normalized.items.forEach((mission, index) => {
          console.log(`🚀 MISSION ${index + 1}:`, {
            id: mission.id,
            title: mission.title,
            difficulty: mission.difficulty,
            requiredLevel: mission.requiredLevel,
            userLevel: mission.userLevel,
            locationId: mission.locationId,
            kpReward: mission.kpReward,
            xpReward: mission.xpReward,
            impactReward: mission.impactReward
          });
        });
      }
      
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
    <div className="min-h-screen bg-transparent text-slate-800 p-4 md:p-8 overflow-hidden" dir="rtl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_24%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 rounded-[30px] border border-slate-200/80 bg-white/72 backdrop-blur-xl p-6 md:flex-row md:items-center md:justify-between md:p-8 shadow-[0_20px_55px_rgba(148,163,184,0.16)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_14px_32px_rgba(16,185,129,0.24)]">
              <FaRocket className="text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">المهام المتاحة</h2>
              <p className="mt-2 text-sm md:text-base font-bold text-slate-500">عرض واضح للمهام التي يمكن البدء بها حسب المستوى والفلترة الحالية.</p>
            </div>
          </div>

          <div className="grid w-full gap-3 md:w-auto md:grid-cols-[minmax(260px,360px)_140px]">
            <div className="relative">
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600/70" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ابحث عن مهمة متاحة..."
                className="w-full rounded-[22px] border border-slate-200 bg-white/88 py-3.5 pr-12 pl-4 text-slate-900 outline-none transition focus:border-emerald-400/35 focus:bg-white"
              />
            </div>

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
              className="w-full rounded-[22px] border border-slate-200 bg-white/88 px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-400/35 focus:bg-white"
            />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-[22px] border border-red-300/60 bg-red-50/90 px-5 py-4 text-red-700"
            >
              <FaExclamationTriangle />
              <span className="font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && missions.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[30px] border border-slate-200/80 bg-white/72 backdrop-blur-xl">
            <FaSpinner className="animate-spin text-3xl text-emerald-300" />
            <div className="text-lg font-black text-slate-900">جاري تحميل المهام المتاحة...</div>
          </div>
        ) : missions.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[30px] border border-slate-200/80 bg-white/72 backdrop-blur-xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <FaTasks className="text-3xl" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">لا توجد مهام متاحة الآن</h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-500 font-bold leading-7">
              لم يتم العثور على مهام تطابق مستوى المستخدم أو كلمات البحث الحالية. جرّب تغيير المستوى أو إزالة الفلاتر.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="text-sm font-black text-slate-500">عرض {missions.length} مهمة من أصل {totalCount || missions.length}</div>
              {userLevel && <div className="rounded-full border border-emerald-300/40 bg-emerald-50/90 px-4 py-2 text-sm font-black text-emerald-700">المستوى الحالي: {userLevel}</div>}
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {missions.map((mission, index) => {
                const difficulty = getDifficultyInfo(mission.difficulty);
                const DifficultyIcon = difficulty.icon;
                const locked = mission.userLevel && mission.userLevel < mission.requiredLevel;

                return (
                  <motion.div
                    key={mission.id || `${mission.title}-${index}`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group rounded-[30px] border border-slate-200/80 bg-white/76 backdrop-blur-xl p-5 shadow-[0_18px_45px_rgba(148,163,184,0.16)] hover:shadow-[0_25px_60px_rgba(148,163,184,0.24)] transition-all duration-300"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${difficulty.badge} transition-colors duration-200`}>
                            <DifficultyIcon />
                            <span>{difficulty.label}</span>
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/18 bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-300">
                            <FaStar />
                            <span>مستوى {mission.requiredLevel ?? 0}</span>
                          </span>
                          {locked && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/18 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300">
                              <FaExclamationTriangle />
                              <span>غير متاحة بعد</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 leading-9 group-hover:text-emerald-700 transition-colors duration-200">
                          {mission.title || 'بدون عنوان'}
                        </h3>
                        <div className="mt-2 text-xs font-black text-slate-500">
                          معرف المهمة: <span className="font-mono text-emerald-600">{mission.id || 'N/A'}</span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewMission(mission)}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200"
                        title="عرض التفاصيل"
                      >
                        <FaEye />
                      </motion.button>
                    </div>

                    <div className="mb-5 rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                          <FaMapMarkerAlt className="text-blue-600" />
                          <span>الموقع</span>
                        </div>
                        {mission.userLevel && (
                          <div className="text-xs font-black text-slate-500">
                            مستواك: <span className="text-emerald-600 font-mono">{mission.userLevel}</span>
                          </div>
                        )}
                      </div>
                      <div className="font-mono text-sm break-all text-slate-700 bg-white/50 rounded-lg px-3 py-2 border border-slate-200/50" dir="ltr">
                        {mission.locationId || 'غير محدد'}
                      </div>
                    </div>

                    <div className="mb-6 grid grid-cols-3 gap-3">
                      <div className="rounded-[18px] border border-yellow-200/60 bg-gradient-to-br from-yellow-50/90 to-amber-50/70 p-3 text-center">
                        <FaTrophy className="mx-auto mb-2 text-2xl text-yellow-500" />
                        <div className="text-xl font-black text-slate-900">{mission.kpReward || 0}</div>
                        <div className="text-xs font-black text-yellow-600">نقاط خير</div>
                      </div>
                      <div className="rounded-[18px] border border-fuchsia-200/60 bg-gradient-to-br from-fuchsia-50/90 to-purple-50/70 p-3 text-center">
                        <FaStar className="mx-auto mb-2 text-2xl text-fuchsia-500" />
                        <div className="text-xl font-black text-slate-900">{mission.xpReward || 0}</div>
                        <div className="text-xs font-black text-fuchsia-600">نقاط خبرة</div>
                      </div>
                      <div className="rounded-[18px] border border-emerald-200/60 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 p-3 text-center">
                        <FaLeaf className="mx-auto mb-2 text-2xl text-emerald-500" />
                        <div className="text-xl font-black text-slate-900">{mission.impactReward || 0}</div>
                        <div className="text-xs font-black text-emerald-600">نقاط تأثير</div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: locked ? 1 : 1.01 }}
                      whileTap={{ scale: locked ? 1 : 0.99 }}
                      disabled={locked}
                      className={`w-full rounded-[22px] px-5 py-4 text-base font-black transition-all duration-300 ${locked ? 'cursor-not-allowed border border-red-400/15 bg-red-500/10 text-red-300' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.28)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.35)] hover:from-emerald-600 hover:to-teal-700'}`}
                      title={locked ? 'المستوى الحالي غير كافٍ' : 'ابدأ المهمة'}
                    >
                      <span className="inline-flex items-center gap-3">
                        {locked ? <FaExclamationTriangle /> : <FaPlay />}
                        <span>{locked ? 'المستوى الحالي غير كافٍ' : 'ابدأ المهمة'}</span>
                      </span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/88 text-slate-700 disabled:opacity-40"
                >
                  <FaArrowRight />
                </button>

                  <div className="rounded-full border border-slate-200 bg-white/88 px-5 py-2 text-sm font-black text-slate-700">
                    صفحة {currentPage} من {totalPages}
                  </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/88 text-slate-700 disabled:opacity-40"
                >
                  <FaArrowLeft />
                </button>
              </div>
            )}
          </>
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
