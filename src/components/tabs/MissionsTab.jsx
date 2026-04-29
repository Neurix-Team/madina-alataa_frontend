import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { missionsService } from '../../services/missionsService';
import AddMissionModal from '../modals/AddMissionModal';
import MissionDetailModal from '../modals/MissionDetailModal';
import EditMissionModal from '../modals/EditMissionModal';
import { 
  FaPlus, FaSearch, FaEye, FaLock, FaCheckCircle, 
  FaExclamationTriangle, FaStar, FaRocket, FaGem, 
  FaShieldAlt, FaFire, FaTasks, FaTrophy, FaLeaf, FaMapMarkerAlt,
  FaEdit, FaTrash, FaChartPie, FaArrowRight, FaArrowLeft, FaClock, FaLayerGroup
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
  const [searchTerm, setSearchTerm] = useState('');

  // Quick Stats
  const stats = [
    { label: 'إجمالي المهام', value: missions.length, icon: FaTasks, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'مهام نشطة', value: missions.filter(m => m.isActive).length, icon: FaRocket, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'إجمالي المكافآت', value: missions.reduce((acc, curr) => acc + (curr.kpReward || 0), 0), icon: FaGem, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

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

  const extractPagination = (response) => {
    return (
      response?.pagination ||
      response?.value?.pagination ||
      response?.data?.pagination ||
      {}
    );
  };

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

  const handleAddMission = async (missionData) => {
    try {
      await missionsService.createMission(missionData);
      setShowAddModal(false);
      fetchMissions(currentPage, searchTerm);
      alert('تم إضافة المهمة بنجاح');
    } catch (err) {
      console.error('Error adding mission:', err);
      const apiData = err.response?.data;
      let errorMsg = 'فشل في إضافة المهمة.';
      if (apiData?.errors) {
        const messages = Object.values(apiData.errors).flat().join('\n');
        errorMsg += `\nالأخطاء:\n${messages}`;
      } else if (apiData?.detail) {
        errorMsg += `\n${apiData.detail}`;
      } else if (apiData?.message) {
        errorMsg += `\n${apiData.message}`;
      } else if (apiData?.error) {
        errorMsg += `\n${apiData.error}`;
      } else if (apiData?.title) {
        errorMsg += `\n${apiData.title}`;
      } else if (err.message) {
        errorMsg += `\n${err.message}`;
      }
      alert(errorMsg);
      setError(errorMsg);
    }
  };

  const handleViewMission = async (missionId) => {
    try {
      const mission = await missionsService.getMissionById(missionId);
      const actualMission = mission?.value || mission?.data || mission;
      if (!actualMission || !actualMission.id) {
        console.error('Invalid mission details response:', mission);
        alert('تفاصيل المهمة غير موجودة أو شكل البيانات غير صحيح');
        return;
      }
      setSelectedMission(actualMission);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching mission details:', err);
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
      setSelectedMission(null);
      fetchMissions(currentPage, searchTerm);
    } catch (err) {
      console.error('Error updating mission:', err);
    }
  };

  const handleDeleteMission = async (missionId) => {
    const confirmed = window.confirm('هل أنت متأكد من حذف هذه المهمة؟ هذا الإجراء لا يمكن التراجع عنه.');
    if (!confirmed) return;

    try {
      await missionsService.deleteMission(missionId);
      alert('تم حذف المهمة بنجاح');
      fetchMissions(currentPage, searchTerm);
    } catch (err) {
      console.error('Error deleting mission:', err);
      let errorMessage = 'فشل في حذف المهمة';
      if (err.response?.data?.message) {
        errorMessage = `خطأ: ${err.response.data.message}`;
      } else if (err.response?.data?.error) {
        errorMessage = `خطأ: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage = `خطأ: ${err.message}`;
      }
      alert(errorMessage);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const getDifficultyInfo = (level) => {
    switch (level) {
      case 0:
        return { text: 'سهل', color: 'from-emerald-500/20 to-teal-600/20', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', textCol: 'text-emerald-400', icon: FaLeaf, glow: 'hover:shadow-emerald-900/40' };
      case 1:
        return { text: 'متوسط', color: 'from-blue-500/20 to-indigo-600/20', bg: 'bg-blue-500/10', border: 'border-blue-500/30', textCol: 'text-blue-400', icon: FaShieldAlt, glow: 'hover:shadow-blue-900/40' };
      case 2:
        return { text: 'صعب', color: 'from-orange-500/20 to-red-600/20', bg: 'bg-orange-500/10', border: 'border-orange-500/30', textCol: 'text-orange-400', icon: FaFire, glow: 'hover:shadow-orange-900/40' };
      case 3:
        return { text: 'أسطوري', color: 'from-purple-500/20 to-fuchsia-600/20', bg: 'bg-purple-500/10', border: 'border-purple-500/30', textCol: 'text-purple-400', icon: FaGem, glow: 'hover:shadow-purple-900/40' };
      default:
        return { text: 'غير محدد', color: 'from-slate-500/20 to-slate-600/20', bg: 'bg-slate-500/10', border: 'border-slate-500/30', textCol: 'text-slate-400', icon: FaTasks, glow: 'hover:shadow-slate-900/40' };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    }
  };

  const MissionCard = ({ mission }) => {
    const diffInfo = getDifficultyInfo(mission.difficulty);
    const DiffIcon = diffInfo.icon;

    return (
      <motion.div 
        variants={cardVariants}
        whileHover={{ y: -12, scale: 1.02 }}
        className={`relative group bg-[#0f172a]/40 backdrop-blur-xl rounded-[2.5rem] p-7 border border-white/5 transition-all duration-500 shadow-2xl ${diffInfo.glow} overflow-hidden`}
      >
        <div className={`absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br ${diffInfo.color} rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-all duration-700`} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-4 py-1.5 rounded-full ${diffInfo.bg} ${diffInfo.border} border ${diffInfo.textCol} font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg`}>
                  <DiffIcon className="text-xs" />
                  {diffInfo.text}
                </span>
                {!mission.isActive && (
                  <span className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <FaLock className="text-[9px]" />
                    مغلقة
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-300 transition-all duration-300 leading-tight mb-4">
                {mission.title}
              </h3>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                <FaMapMarkerAlt className="text-blue-400" />
                <span className="truncate max-w-[140px]">{mission.locationId || 'موقع عام'}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleViewMission(mission.id)} className="p-3.5 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-2xl transition-all border border-blue-500/20 shadow-xl" title="عرض">
                <FaEye className="text-lg" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEditMission(mission)} className="p-3.5 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white rounded-2xl transition-all border border-orange-500/20 shadow-xl" title="تعديل">
                <FaEdit className="text-lg" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteMission(mission.id)} className="p-3.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-all border border-red-500/20 shadow-xl" title="حذف">
                <FaTrash className="text-lg" />
              </motion.button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-7">
            {[
              { icon: FaTrophy, val: mission.kpReward, label: 'نقطة خير', color: 'text-yellow-400', border: 'group-hover:border-yellow-500/30' },
              { icon: FaStar, val: mission.xpReward, label: 'خبرة', color: 'text-purple-400', border: 'group-hover:border-purple-500/30' },
              { icon: FaLeaf, val: mission.impactReward, label: 'تأثير', color: 'text-emerald-400', border: 'group-hover:border-emerald-500/30' }
            ].map((r, i) => (
              <div key={i} className={`bg-white/5 backdrop-blur-md rounded-[1.5rem] p-4 border border-white/5 ${r.border} transition-all duration-500 text-center shadow-inner`}>
                <r.icon className={`${r.color} mx-auto mb-2 text-xl`} />
                <div className="text-white font-black text-xl mb-0.5">{r.val}</div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{r.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2">
              <FaLayerGroup className="text-blue-400/50" />
              <span>مستوى: {mission.requiredLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-blue-400/50" />
              <span>{mission.createdAt ? new Date(mission.createdAt).toLocaleDateString('ar-EG') : 'مؤخراً'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-300 p-6 md:p-12 overflow-hidden" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[10%] -left-[5%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1], x: [0, -80, 0], y: [0, -60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-[10%] -right-[5%] w-[800px] h-[800px] bg-purple-600/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-20">
          <div className="flex items-center gap-8">
            <motion.div whileHover={{ rotate: -12, scale: 1.15 }} className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.4)] border border-white/20 relative overflow-hidden group">
              <FaTasks className="text-white text-4xl drop-shadow-2xl z-10 transition-transform group-hover:scale-110" />
              <motion.div animate={{ x: [-150, 150] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" />
            </motion.div>
            <div>
              <h2 className="text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-sm">مركز المهام</h2>
              <div className="flex items-center gap-4 text-blue-400/80 font-black text-xl tracking-wide">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                لوحة التحكم في التحديات والمكافآت
              </div>
            </div>
          </div>
          
          <motion.button whileHover={{ scale: 1.05, y: -5, boxShadow: '0 25px 50px -12px rgba(37,99,235,0.5)' }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(true)} className="group flex items-center justify-center gap-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-6 rounded-[2rem] font-black text-2xl border border-white/10 transition-all duration-300 w-full lg:w-auto shadow-2xl">
            <div className="bg-white/20 p-2.5 rounded-xl group-hover:rotate-180 transition-transform duration-700">
              <FaPlus className="text-xl" />
            </div>
            <span>إنشاء مهمة</span>
          </motion.button>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} whileHover={{ y: -8, borderColor: 'rgba(255,255,255,0.1)' }} className="bg-white/5 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 flex items-center gap-8 group transition-all duration-500 shadow-xl shadow-black/20">
              <div className={`w-20 h-20 rounded-3xl ${s.bg} ${s.border} border flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                <s.icon className={`text-4xl ${s.color}`} />
              </div>
              <div>
                <div className="text-slate-500 font-black text-xs mb-1.5 uppercase tracking-[0.2em]">{s.label}</div>
                <div className="text-5xl font-black text-white tracking-tighter tabular-nums">{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Search Section */}
        <div className="mb-20">
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute inset-y-0 right-0 flex items-center pr-10 pointer-events-none transition-transform group-focus-within:scale-125 duration-500">
              <FaSearch className="text-blue-500/30 text-3xl group-focus-within:text-blue-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="البحث في سجل المهام المتاحة..."
              className="w-full bg-white/5 backdrop-blur-3xl border-2 border-white/5 rounded-[3rem] py-8 pr-20 pl-10 text-2xl text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-[20px] focus:ring-blue-500/5 transition-all duration-500 shadow-2xl text-center font-bold"
            />
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading && missions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-48">
              <div className="relative">
                <div className="w-32 h-32 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin shadow-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaRocket className="text-blue-500 text-3xl animate-bounce" />
                </div>
              </div>
              <div className="mt-12 text-slate-500 font-black text-3xl tracking-[0.3em] animate-pulse">جاري المزامنة</div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}>
              <div className="flex items-center justify-between mb-12 px-8">
                <div className="flex items-center gap-5 text-blue-300/80 font-black text-lg">
                  <div className="w-16 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                  <span className="tracking-widest uppercase">سجل العمليات الميدانية</span>
                </div>
                <div className="bg-white/5 px-6 py-2 rounded-full border border-white/5 text-slate-500 font-black text-sm uppercase tracking-widest">
                  عرض {missions.length} من {totalPages * pageSize}
                </div>
              </div>

              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {missions.map((m) => (
                  <MissionCard key={m.id} mission={m} />
                ))}
              </motion.div>

              {missions.length === 0 && !loading && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-48 bg-white/5 rounded-[5rem] border-4 border-dashed border-white/5 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="w-48 h-48 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl relative z-10">
                    <FaTasks className="text-8xl text-slate-800" />
                  </div>
                  <h3 className="text-5xl font-black text-white mb-8 relative z-10 tracking-tighter">السجل فارغ تماماً</h3>
                  <p className="text-slate-500 text-2xl max-w-xl mx-auto font-bold leading-relaxed mb-12 relative z-10">
                    لا توجد أي مهام مسجلة في النظام حالياً. يمكنك البدء بإضافة أول عملية ميدانية الآن.
                  </p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(true)} className="bg-white text-[#020617] px-14 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl hover:shadow-white/20 relative z-10">
                    إنشاء المهمة الأولى
                  </motion.button>
                </motion.div>
              )}

              {/* Advanced Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-6 mt-24">
                  <motion.button whileHover={{ scale: 1.05, x: 8 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="flex items-center gap-4 px-8 py-5 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-2xl transition-all font-black border border-white/5 shadow-xl">
                    <FaArrowRight className="text-blue-400" />
                    السابق
                  </motion.button>
                  
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setCurrentPage(p)} className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all font-black text-xl ${currentPage === p ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl scale-110 z-10 border border-white/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  
                  <motion.button whileHover={{ scale: 1.05, x: -8 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="flex items-center gap-4 px-8 py-5 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-2xl transition-all font-black border border-white/5 shadow-xl">
                    التالي
                    <FaArrowLeft className="text-blue-400" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && <AddMissionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddMission} />}
        {showDetailModal && <MissionDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} mission={selectedMission} />}
        {showEditModal && <EditMissionModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedMission(null); }} onSubmit={handleUpdateMission} mission={selectedMission} />}
      </AnimatePresence>
    </div>
  );
};

export default MissionsTab;
