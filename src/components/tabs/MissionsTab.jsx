import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { missionsService } from '../../services/missionsService';
import { locationsService } from '../../services/locationsService';
import AddMissionModal from '../modals/AddMissionModal';
import MissionDetailModal from '../modals/MissionDetailModal';
import EditMissionModal from '../modals/EditMissionModal';
import EntityHistoryModal from '../modals/EntityHistoryModal';
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaStar,
  FaRocket,
  FaGem,
  FaShieldAlt,
  FaFire,
  FaTasks,
  FaTrophy,
  FaLeaf,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaArrowRight,
  FaArrowLeft,
  FaClock,
  FaLayerGroup,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

const MissionsTab = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(9);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [historyEntityId, setHistoryEntityId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState([]);

  const extractMissions = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.value)) return response.value;
    if (Array.isArray(response?.values)) return response.values;
    if (Array.isArray(response?.value?.data)) return response.value.data;
    if (Array.isArray(response?.value?.values)) return response.value.values;
    if (Array.isArray(response?.value?.items)) return response.value.items;
    if (Array.isArray(response?.data?.values)) return response.data.values;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    return [];
  };

  const extractPagination = (response) =>
    response?.pagination || response?.value?.pagination || response?.data?.pagination || {};

  const fetchMissions = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = search
        ? await missionsService.searchMissions(search, page, pageSize)
        : await missionsService.getMissions(page, pageSize);

      const items = extractMissions(response);
      const pagination = extractPagination(response);

      setMissions(items);
      setTotalPages(pagination.totalPages || 1);
      setCurrentPage(pagination.currentPage || page);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في جلب المهام');
      console.error('Error fetching missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMissions(currentPage, searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await locationsService.getLocations();
        const items = Array.isArray(response) ? response : (response?.data || response?.value || []);
        setLocations(items);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    loadLocations();
  }, []);

  const stats = useMemo(() => [
    { label: 'إجمالي المهام', value: missions.length, icon: FaTasks, accent: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'مهام نشطة', value: missions.filter((m) => m.status === 1).length, icon: FaRocket, accent: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'صعوبة عالية', value: missions.filter((m) => m.difficulty >= 2).length, icon: FaShieldAlt, accent: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ], [missions]);

  const handleAddMission = async (missionData) => {
    try {
      await missionsService.createMission(missionData);
      setShowAddModal(false);
      fetchMissions(currentPage, searchTerm);
      alert('تم إضافة المهمة بنجاح');
    } catch (err) {
      alert(err.response?.data?.message || 'فشل في إضافة المهمة');
    }
  };

  const handleViewMission = async (missionId) => {
    try {
      const mission = await missionsService.getMissionById(missionId);
      const actualMission = mission?.value || mission?.data || mission;
      setSelectedMission(actualMission);
      setShowDetailModal(true);
    } catch (err) {
      alert('فشل في جلب تفاصيل المهمة');
    }
  };

  const handleEditMission = (mission) => {
    setSelectedMission(mission);
    setShowEditModal(true);
  };

  const handleUpdateMission = async (missionId, missionData) => {
    try {
      await missionsService.updateMission(missionId, missionData);
      setShowEditModal(false);
      fetchMissions(currentPage, searchTerm);
    } catch (err) {
      console.error('Error updating mission:', err);
    }
  };

  const handleDeleteMission = async (missionId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    try {
      await missionsService.deleteMission(missionId);
      fetchMissions(currentPage, searchTerm);
    } catch (err) {
      alert('فشل في حذف المهمة');
    }
  };

  const getDifficultyInfo = (level) => {
    switch (level) {
      case 0: return { label: 'سهل', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: FaLeaf };
      case 1: return { label: 'متوسط', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: FaShieldAlt };
      case 2: return { label: 'صعب', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: FaFire };
      case 3: return { label: 'أسطوري', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: FaGem };
      default: return { label: 'غير محدد', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: FaTasks };
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-6 text-slate-100 md:p-10" dir="rtl">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-6 rounded-[32px] border border-white/12 bg-[#0f1b2d]/80 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-[0_18px_40px_rgba(37,99,235,0.28)]">
              <FaTasks className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">إدارة المهام</h2>
              <p className="mt-2 max-w-xl text-sm md:text-base font-medium leading-7 text-slate-300">إدارة المهام الميدانية والمكافآت والعناوين المرتبطة بها من واجهة أوضح وأكثر تنظيمًا.</p>
            </div>
          </div>

          <div className="grid w-full gap-4 md:w-auto md:grid-cols-[minmax(280px,380px)_auto]">
            <div className="relative group">
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-300/70 transition-colors group-focus-within:text-sky-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="ابحث عن مهمة محددة..."
                className="w-full rounded-[22px] border border-white/12 bg-[#112033] py-3.5 pr-12 pl-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-400 focus:border-sky-400/45 focus:bg-[#16283d]"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-3.5 text-base font-semibold text-white shadow-xl transition-all"
            >
              <FaPlus />
              <span>إضافة مهمة</span>
            </motion.button>
          </div>
        </div>

        {error && (
          <div className="rounded-[24px] border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-4 rounded-[26px] border border-white/12 bg-white/[0.06] p-5 shadow-xl">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${stat.bg} ${stat.border} ${stat.accent} text-xl shadow-inner`}>
                <stat.icon />
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-slate-300">{stat.label}</div>
                <div className="text-2xl font-semibold text-white tabular-nums">{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && missions.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[30px] border border-white/12 bg-white/[0.06] backdrop-blur-xl">
            <FaSpinner className="animate-spin text-4xl text-sky-300" />
            <div className="text-lg font-semibold tracking-tight text-white">جاري استدعاء سجلات المهام...</div>
          </div>
        ) : missions.length === 0 ? (
          <div className="rounded-[30px] border border-white/12 bg-white/[0.06] p-12 text-center backdrop-blur-xl">
            <FaTasks className="mx-auto mb-5 text-4xl text-sky-300/70" />
            <h3 className="text-2xl font-semibold text-white">لا توجد مهام مسجلة</h3>
            <p className="mt-3 text-sm md:text-base font-medium text-slate-300">لم يتم العثور على أي مهام في قاعدة البيانات حاليًا.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {missions.map((mission, index) => {
              const diff = getDifficultyInfo(mission.difficulty);
              const DiffIcon = diff.icon;

              return (
                <motion.div
                  key={mission.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative flex flex-col gap-5 rounded-[28px] border border-white/12 bg-white/[0.06] p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(0,0,0,0.45)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${diff.badge}`}>
                          <DiffIcon />
                          <span>{diff.label}</span>
                        </span>
                        <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-medium ${mission.status === 1 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                          {mission.status === 1 ? <FaCheckCircle /> : <FaTimesCircle />}
                          <span>{mission.status === 1 ? 'نشطة' : 'متوقفة'}</span>
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold leading-8 text-white transition-colors group-hover:text-sky-200">{mission.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                        <span>ID:</span>
                        <span className="font-mono text-sky-200/80" dir="ltr">{mission.id || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <motion.button whileHover={{ scale: 1.06 }} onClick={() => handleViewMission(mission.id)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-sky-300"><FaEye /></motion.button>
                      <motion.button whileHover={{ scale: 1.06 }} onClick={() => handleEditMission(mission)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-amber-300"><FaEdit /></motion.button>
                      <motion.button whileHover={{ scale: 1.06 }} onClick={() => handleDeleteMission(mission.id)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-red-300"><FaTrash /></motion.button>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-[#112033] p-4 shadow-inner">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                      <FaMapMarkerAlt className="text-sky-300" />
                      <span>الموقع الجغرافي</span>
                    </div>
                    <div className="break-all rounded-xl border border-white/10 bg-slate-950/25 px-4 py-3 font-mono text-xs text-sky-100" dir="ltr">
                      {mission.locationId || 'UNSPECIFIED_LOCATION'}
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-3 gap-3">
                    {[
                      { icon: FaTrophy, val: mission.kpReward, label: 'نقاط خير', accent: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                      { icon: FaStar, val: mission.xpReward, label: 'خبرة', accent: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
                      { icon: FaLeaf, val: mission.impactReward, label: 'تأثير', accent: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    ].map((reward, i) => (
                      <div key={i} className={`rounded-[18px] border ${reward.border} ${reward.bg} p-3 text-center`}>
                        <reward.icon className={`mx-auto mb-2 text-lg ${reward.accent}`} />
                        <div className="text-lg font-semibold text-white">{reward.val || 0}</div>
                        <div className={`mt-1 text-[10px] font-medium ${reward.accent} opacity-80`}>{reward.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white disabled:opacity-30"><FaArrowRight /> السابق</button>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white">صفحة {currentPage} من {totalPages}</div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white disabled:opacity-30">التالي <FaArrowLeft /></button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && <AddMissionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddMission} locations={locations} />}
        {showDetailModal && <MissionDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} mission={selectedMission} />}
        {showEditModal && <EditMissionModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedMission(null); }} onSubmit={handleUpdateMission} mission={selectedMission} locations={locations} />}
      </AnimatePresence>
    </div>
  );
};

export default MissionsTab;
