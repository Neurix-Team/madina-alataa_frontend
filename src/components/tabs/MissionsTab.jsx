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
    <div className="min-h-screen bg-transparent text-slate-100 p-6 md:p-12" dir="rtl">
      <div className="relative mx-auto max-w-7xl space-y-12">
        {/* Hero Header */}
        <div className="flex flex-col gap-8 rounded-[40px] border border-white/10 bg-[#0f172a]/60 backdrop-blur-2xl p-8 md:flex-row md:items-center md:justify-between md:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_18px_40px_rgba(37,99,235,0.3)] border border-white/20">
              <FaTasks className="text-3xl" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">إدارة العمليات</h2>
              <p className="mt-3 text-base md:text-lg font-bold text-slate-400 max-w-md leading-relaxed">التحكم الكامل في المهام الميدانية، المكافآت، وتوزيع الموارد الجغرافية.</p>
            </div>
          </div>

          <div className="grid w-full gap-5 md:w-auto md:grid-cols-[minmax(300px,420px)_auto]">
            <div className="relative group">
              <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500/50 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="ابحث عن مهمة محددة..."
                className="w-full rounded-[24px] border border-white/10 bg-black/40 py-4 pr-14 pl-5 text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 shadow-inner"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 15px 35px rgba(37,99,235,0.25)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-3 rounded-[24px] bg-blue-600 px-8 py-4 font-black text-lg text-white shadow-xl transition-all border border-white/10"
            >
              <FaPlus />
              <span>إضافة مهمة</span>
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-xl">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${stat.bg} ${stat.border} ${stat.accent} text-2xl shadow-inner`}>
                <stat.icon />
              </div>
              <div>
                <div className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-4xl font-black text-white tabular-nums">{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Missions Grid */}
        {loading && missions.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl">
            <FaSpinner className="animate-spin text-5xl text-blue-500" />
            <div className="text-xl font-black text-white tracking-tight">جاري استدعاء سجلات المهام...</div>
          </div>
        ) : missions.length === 0 ? (
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-16 text-center">
            <FaTasks className="mx-auto mb-6 text-5xl text-blue-500/50" />
            <h3 className="text-3xl font-black text-white">لا توجد مهام مسجلة</h3>
            <p className="mt-4 text-slate-400 font-bold text-lg">لم يتم العثور على أي مهام في قاعدة البيانات حاليًا.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {missions.map((mission, index) => {
              const diff = getDifficultyInfo(mission.difficulty);
              const DiffIcon = diff.icon;

              return (
                <motion.div
                  key={mission.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)] transition-all duration-500 flex flex-col"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="space-y-4 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${diff.badge}`}>
                          <DiffIcon />
                          <span>{diff.label}</span>
                        </span>
                        <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest ${mission.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {mission.status === 1 ? <FaCheckCircle /> : <FaTimesCircle />}
                          <span>{mission.status === 1 ? 'نشطة' : 'متوقفة'}</span>
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white leading-tight group-hover:text-blue-400 transition-colors">{mission.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        ID: <span className="font-mono text-blue-500/70">{mission.id || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleViewMission(mission.id)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-blue-400"><FaEye /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEditMission(mission)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-yellow-500"><FaEdit /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteMission(mission.id)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-red-500"><FaTrash /></motion.button>
                    </div>
                  </div>

                  <div className="mb-6 rounded-[2rem] border border-white/5 bg-black/30 p-5 space-y-4 shadow-inner">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <FaMapMarkerAlt className="text-blue-500" />
                      <span>الموقع الجغرافي</span>
                    </div>
                    <div className="font-mono text-xs break-all text-blue-300/80 bg-black/40 rounded-xl px-4 py-3 border border-white/5 tracking-wider" dir="ltr">
                      {mission.locationId || 'UNSPECIFIED_LOCATION'}
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-3 gap-4">
                    {[
                      { icon: FaTrophy, val: mission.kpReward, label: 'نقاط خير', accent: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                      { icon: FaStar, val: mission.xpReward, label: 'خبرة', accent: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
                      { icon: FaLeaf, val: mission.impactReward, label: 'تأثير', accent: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    ].map((reward, i) => (
                      <div key={i} className={`rounded-[1.5rem] border ${reward.border} ${reward.bg} p-4 text-center`}>
                        <reward.icon className={`mx-auto mb-2 text-xl ${reward.accent}`} />
                        <div className="text-xl font-black text-white">{reward.val || 0}</div>
                        <div className={`mt-1 text-[8px] font-black uppercase tracking-widest ${reward.accent} opacity-70`}>{reward.label}</div>
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
          <div className="flex justify-center items-center gap-4 mt-12">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white disabled:opacity-30"><FaArrowRight /> السابق</button>
            <div className="text-white font-black">صفحة {currentPage} من {totalPages}</div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white disabled:opacity-30">التالي <FaArrowLeft /></button>
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
