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
  FaEdit, FaTrash
} from 'react-icons/fa';

const MissionsTab = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(9); // Adjusted to 9 for a nice 3x3 grid
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMissions = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = search 
        ? await missionsService.searchMissions(search, page, pageSize)
        : await missionsService.getMissions(page, pageSize);
      
      setMissions(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(response.pagination?.currentPage || page);
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
    } catch (err) {
      console.error('Error adding mission:', err);
      // Extract specific validation errors from the backend
      let errorMsg = 'فشل في إضافة المهمة.';
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const messages = Object.values(validationErrors).flat().join('\\n');
        errorMsg += `\\nالأخطاء:\\n${messages}`;
      } else if (err.response?.data?.message || err.response?.data?.title) {
        errorMsg += `\\n${err.response.data.message || err.response.data.title}`;
      }
      alert(errorMsg);
      setError(errorMsg);
    }
  };

  const handleViewMission = async (missionId) => {
    try {
      const mission = await missionsService.getMissionById(missionId);
      setSelectedMission(mission);
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
      // Error is already handled in the modal
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
      
      // Show detailed error message
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const MissionCard = ({ mission }) => {
    const diffInfo = getDifficultyInfo(mission.difficulty);
    const DiffIcon = diffInfo.icon;

    return (
      <motion.div 
        variants={cardVariants}
        whileHover={{ y: -5, scale: 1.02 }}
        className={`relative group bg-[#0a192f]/80 backdrop-blur-md rounded-2xl p-5 border border-blue-800/30 transition-all duration-300 shadow-lg ${diffInfo.glow} overflow-hidden`}
      >
        {/* Glow Effect on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${diffInfo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
        
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-3 leading-tight">{mission.title}</h3>
            <div className="flex items-center gap-2 text-sm text-blue-200/80 mb-4 bg-blue-900/20 w-fit px-3 py-1.5 rounded-lg border border-blue-800/30">
              <FaMapMarkerAlt className="text-blue-400" />
              <span className="font-medium tracking-wide">{mission.locationId || 'موقع غير محدد'}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-4 py-1.5 rounded-xl ${diffInfo.bg} ${diffInfo.border} border ${diffInfo.textCol} font-bold flex items-center gap-2 shadow-inner text-sm`}>
                <DiffIcon className="text-sm" />
                {diffInfo.textCol === 'text-purple-400' && <span className="animate-pulse absolute w-2 h-2 bg-purple-400 rounded-full blur-sm" />}
                {diffInfo.text}
              </span>
              <span className="px-4 py-1.5 rounded-xl bg-blue-900/40 border border-blue-700/50 text-blue-100 font-bold flex items-center gap-2 text-sm">
                <FaStar className="text-yellow-500" /> مستوى {mission.requiredLevel}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!mission.isActive && (
              <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30" title="غير متاحة">
                <FaLock className="text-lg" />
              </span>
            )}
            {mission.isHidden && (
              <span className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" title="مخفية">
                <FaExclamationTriangle className="text-lg" />
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleViewMission(mission.id)}
              className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all border border-blue-400/30"
              title="عرض التفاصيل"
            >
              <FaEye className="text-xl" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleEditMission(mission)}
              className="p-3 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl shadow-lg shadow-orange-900/50 transition-all border border-orange-400/30"
              title="تعديل المهمة"
            >
              <FaEdit className="text-xl" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDeleteMission(mission.id)}
              className="p-3 bg-gradient-to-br from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-xl shadow-lg shadow-red-900/50 transition-all border border-red-400/30"
              title="حذف المهمة"
            >
              <FaTrash className="text-xl" />
            </motion.button>
          </div>
        </div>
        
        {/* Rewards Section */}
        <div className="relative z-10 grid grid-cols-3 gap-4 text-base mt-6">
          <div className="bg-[#112240]/80 rounded-2xl p-4 border border-blue-900/50 flex flex-col items-center justify-center group-hover:bg-[#1a365d] transition-all duration-300 shadow-inner">
            <FaTrophy className="text-yellow-400 mb-2 text-2xl opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all" />
            <div className="text-yellow-400 font-black text-2xl mb-1">{mission.kpReward}</div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">نقطة خير</div>
          </div>
          
          <div className="bg-[#112240]/80 rounded-2xl p-4 border border-blue-900/50 flex flex-col items-center justify-center group-hover:bg-[#1a365d] transition-all duration-300 shadow-inner">
            <FaStar className="text-purple-400 mb-2 text-2xl opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all" />
            <div className="text-purple-400 font-black text-2xl mb-1">{mission.xpReward}</div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">نقطة خبرة</div>
          </div>
          
          <div className="bg-[#112240]/80 rounded-2xl p-4 border border-blue-900/50 flex flex-col items-center justify-center group-hover:bg-[#1a365d] transition-all duration-300 shadow-inner">
            <FaLeaf className="text-green-400 mb-2 text-2xl opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all" />
            <div className="text-green-400 font-black text-2xl mb-1">{mission.impactReward}</div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">تأثير</div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#020817] text-slate-300 p-4 md:p-8 overflow-hidden" dir="rtl">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10">
        {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <motion.div 
            animate={{ y: [-5, 5, -5], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-white/20"
          >
            <FaTasks className="text-white text-3xl drop-shadow-md" />
          </motion.div>
          <div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 drop-shadow-sm">إدارة المهام</h2>
            <p className="text-blue-300/80 text-base font-medium mt-2 tracking-wide">تصفح، أضف، وقم بإدارة المهام بكل احترافية</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-4 rounded-2xl shadow-xl shadow-blue-600/30 font-bold border border-blue-400/20 w-full md:w-auto justify-center text-lg transition-all"
        >
          <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform duration-300">
            <FaPlus />
          </div>
          <span>مهمة جديدة</span>
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="mb-12 relative z-10">
        <div className="relative max-w-3xl mx-auto md:mx-0 group">
          <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
            <FaSearch className="text-blue-400/50 group-focus-within:text-blue-400 group-focus-within:scale-110 transition-all text-xl" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="ابحث عن مهمة (بالاسم، الصعوبة...)"
            className="w-full bg-[#112240]/80 backdrop-blur-xl border-2 border-blue-800/40 rounded-3xl py-4 pr-14 pl-6 text-xl text-white placeholder-blue-200/30 focus:outline-none focus:border-blue-500 focus:bg-[#1a365d]/90 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-2xl hover:border-blue-700/60"
          />
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-8 flex items-center gap-3 text-red-400"
          >
            <FaExclamationTriangle className="text-xl" />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {loading && missions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <div className="text-blue-400 font-bold animate-pulse">جاري تحميل المهام...</div>
        </div>
      ) : (
        <>
          {/* Missions Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          >
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </motion.div>

          {/* Empty State */}
          {!loading && missions.length === 0 && !error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-[#112240]/40 rounded-3xl border border-blue-900/30"
            >
              <div className="w-24 h-24 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTasks className="text-4xl text-blue-400/50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">لا توجد مهام حالياً</h3>
              <p className="text-blue-200/50 mb-8 max-w-md mx-auto">لم يتم العثور على أي مهام تطابق بحثك. يمكنك إضافة مهام جديدة للبدء.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
              >
                إضافة أول مهمة
              </motion.button>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#112240] hover:bg-[#1a365d] disabled:opacity-50 disabled:cursor-not-allowed text-blue-200 rounded-xl transition-colors font-bold border border-blue-900/50"
              >
                السابق
              </button>
              
              <div className="flex items-center gap-1 bg-[#112240] p-1 rounded-xl border border-blue-900/50">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all font-bold ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-blue-300 hover:bg-blue-900/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#112240] hover:bg-[#1a365d] disabled:opacity-50 disabled:cursor-not-allowed text-blue-200 rounded-xl transition-colors font-bold border border-blue-900/50"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddMissionModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddMission}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailModal && (
          <MissionDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            mission={selectedMission}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <EditMissionModal 
            isOpen={showEditModal} 
            onClose={() => {
              setShowEditModal(false);
              setSelectedMission(null);
            }} 
            onSubmit={handleUpdateMission}
            mission={selectedMission} 
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default MissionsTab;
