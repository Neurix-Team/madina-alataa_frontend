import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { availableMissionsService } from '../../services/availableMissionsService';
import MissionDetailModal from '../modals/MissionDetailModal';
import { 
  FaSearch, FaEye, FaLock, FaCheckCircle, 
  FaExclamationTriangle, FaStar, FaRocket, FaGem, 
  FaShieldAlt, FaFire, FaTasks, FaTrophy, FaLeaf, 
  FaMapMarkerAlt, FaPlay, FaClock, FaFilter, FaSortAmountDown
} from 'react-icons/fa';

const AvailableMissionsTab = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(9);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLevel, setUserLevel] = useState('');
  const [sortBy, setSortBy] = useState('difficulty');
  const [showFilters, setShowFilters] = useState(false);

  const fetchAvailableMissions = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = search 
        ? await availableMissionsService.searchAvailableMissions(search, userLevel, page, pageSize)
        : await availableMissionsService.getAvailableMissions(userLevel, page, pageSize);
      
      setMissions(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(response.pagination?.currentPage || page);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'فشل في جلب المهام المتاحة';
      setError(errorMessage);
      console.error('Error fetching available missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAvailableMissions(currentPage, searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, userLevel]);

  const handleViewMission = (mission) => {
    setSelectedMission(mission);
    setShowDetailModal(true);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleLevelChange = (e) => {
    setUserLevel(e.target.value);
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

  const MissionCard = ({ mission }) => {
    const diffInfo = getDifficultyInfo(mission.difficulty);
    const DiffIcon = diffInfo.icon;

    return (
      <motion.div 
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
              {mission.userLevel && mission.userLevel < mission.requiredLevel && (
                <span className="px-4 py-1.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold flex items-center gap-2 text-sm">
                  <FaLock /> غير متاح بعد
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleViewMission(mission)}
              className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all border border-blue-400/30"
              title="عرض التفاصيل"
            >
              <FaEye className="text-xl" />
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

        {/* Action Button */}
        <div className="relative z-10 mt-6">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(34,197,94,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-green-900/50 border border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={mission.userLevel && mission.userLevel < mission.requiredLevel}
            title={mission.userLevel && mission.userLevel < mission.requiredLevel ? 'المستوى الحالي غير كافي' : 'ابدأ المهمة'}
          >
            <FaPlay className="text-xl" />
            {mission.userLevel && mission.userLevel < mission.requiredLevel ? 'المستوى غير كافي' : 'ابدأ المهمة'}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020817] text-slate-300 p-4 md:p-8 overflow-hidden" dir="rtl">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-teal-600/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10">
        {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <motion.div 
            animate={{ y: [-5, 5, -5], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)] border border-white/20"
          >
            <FaRocket className="text-white text-3xl drop-shadow-md" />
          </motion.div>
          <div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-green-300 drop-shadow-sm">المهام المتاحة</h2>
            <p className="text-green-300/80 text-base font-medium mt-2 tracking-wide">اكتشف المهام المتاحة لمستواك وابدأ رحلة الخير</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-12 space-y-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-2xl group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
              <FaSearch className="text-green-400/50 group-focus-within:text-green-400 group-focus-within:scale-110 transition-all text-xl" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="ابحث عن مهمة متاحة (بالاسم، الصعوبة...)"
              className="w-full bg-[#112240]/80 backdrop-blur-xl border-2 border-green-800/40 rounded-3xl py-4 pr-14 pl-6 text-xl text-white placeholder-green-200/30 focus:outline-none focus:border-green-500 focus:bg-[#1a365d]/90 focus:ring-4 focus:ring-green-500/20 transition-all shadow-2xl hover:border-green-700/60"
            />
          </div>

          {/* User Level Input */}
          <div className="relative">
            <input
              type="number"
              value={userLevel}
              onChange={handleLevelChange}
              placeholder="المستوى الخاص بك"
              min="1"
              max="100"
              className="bg-[#112240]/80 backdrop-blur-xl border-2 border-green-800/40 rounded-3xl py-4 pr-6 pl-6 text-xl text-white placeholder-green-200/30 focus:outline-none focus:border-green-500 focus:bg-[#1a365d]/90 focus:ring-4 focus:ring-green-500/20 transition-all shadow-2xl hover:border-green-700/60 w-48"
            />
          </div>
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
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          <div className="text-green-400 font-bold animate-pulse">جاري تحميل المهام المتاحة...</div>
        </div>
      ) : (
        <>
          {/* Results Counter */}
          {!loading && missions.length > 0 && (
            <div className="flex items-center justify-between mb-6 text-green-300">
              <div className="flex items-center gap-2">
                <FaTrophy className="text-green-400" />
                <span className="font-bold">{missions.length} مهمة متاحة</span>
              </div>
              {userLevel && (
                <div className="text-sm text-green-200/60">
                  للمستوى: {userLevel}
                </div>
              )}
            </div>
          )}

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
          {!loading && missions.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-[#112240]/40 rounded-3xl border border-green-900/30 backdrop-blur-sm"
            >
              <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTasks className="text-4xl text-green-400/50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">لا توجد مهام متاحة</h3>
              <p className="text-green-200/50 mb-8 max-w-md mx-auto">لم يتم العثور على أي مهام تطابق بحثك. جرب تغيير المستوى أو البحث عن مهام أخرى.</p>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#112240] hover:bg-[#1a365d] text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-800/30"
              >
                السابق
              </button>
              <span className="px-4 py-2 text-green-300 font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#112240] hover:bg-[#1a365d] text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-800/30"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}

      {/* Mission Detail Modal */}
      <MissionDetailModal 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        mission={selectedMission} 
      />
      </div>
    </div>
  );
};

export default AvailableMissionsTab;
