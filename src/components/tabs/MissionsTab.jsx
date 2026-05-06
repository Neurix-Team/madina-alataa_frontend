import React, { useState, useEffect } from 'react';
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
  FaHistory,
  FaLock,
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

  const stats = [
    { label: 'إجمالي المهام', value: missions.length, icon: FaTasks, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'مهام نشطة', value: missions.filter((m) => m.isActive).length, icon: FaRocket, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
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
        const items =
          Array.isArray(response) ? response :
          Array.isArray(response?.data) ? response.data :
          Array.isArray(response?.items) ? response.items :
          Array.isArray(response?.value) ? response.value :
          [];
        setLocations(items);
      } catch (err) {
        console.error('Error fetching locations for missions:', err);
      }
    };

    loadLocations();
  }, []);

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
        return { text: 'سهل', color: 'from-emerald-500/20 to-teal-600/20', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', textCol: 'text-emerald-400', icon: FaLeaf };
      case 1:
        return { text: 'متوسط', color: 'from-blue-500/20 to-indigo-600/20', bg: 'bg-blue-500/10', border: 'border-blue-500/30', textCol: 'text-blue-400', icon: FaShieldAlt };
      case 2:
        return { text: 'صعب', color: 'from-orange-500/20 to-red-600/20', bg: 'bg-orange-500/10', border: 'border-orange-500/30', textCol: 'text-orange-400', icon: FaFire };
      case 3:
        return { text: 'أسطوري', color: 'from-purple-500/20 to-fuchsia-600/20', bg: 'bg-purple-500/10', border: 'border-purple-500/30', textCol: 'text-purple-400', icon: FaGem };
      default:
        return { text: 'غير محدد', color: 'from-slate-500/20 to-slate-600/20', bg: 'bg-slate-500/10', border: 'border-slate-500/30', textCol: 'text-slate-400', icon: FaTasks };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
  };

  const MissionCard = ({ mission }) => {
    const diffInfo = getDifficultyInfo(mission.difficulty);
    const DiffIcon = diffInfo.icon;

    return (
      <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.01 }} className="mission-page__card">
        <div className={`absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br ${diffInfo.color} rounded-full blur-[80px] opacity-20`} />
        <div className="relative z-10">
          <div className="mission-page__cardHead">
            <div>
              <div className="mission-page__cardMeta">
                <span className={`mission-page__pill ${diffInfo.bg} ${diffInfo.border} ${diffInfo.textCol}`}>
                  <DiffIcon />
                  {diffInfo.text}
                </span>
                {!mission.isActive && (
                  <span className="mission-page__pill bg-red-500/10 border-red-500/20 text-red-400">
                    <FaLock />
                    مغلقة
                  </span>
                )}
              </div>
              <h3 className="mission-page__cardTitle">{mission.title}</h3>
              <div className="mission-page__location">
                <FaMapMarkerAlt className="text-blue-400" />
                <span>{mission.locationId || 'موقع عام'}</span>
              </div>
            </div>

            <div className="mission-page__actions">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewMission(mission.id)} className="mission-page__iconBtn text-blue-400" title="عرض">
                <FaEye />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditMission(mission)} className="mission-page__iconBtn text-amber-400" title="تعديل">
                <FaEdit />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteMission(mission.id)} className="mission-page__iconBtn text-red-400" title="حذف">
                <FaTrash />
              </motion.button>
            </div>
          </div>

          <div className="mission-page__rewardGrid">
            {[
              { icon: FaTrophy, val: mission.kpReward, label: 'نقطة خير', color: 'text-yellow-400' },
              { icon: FaStar, val: mission.xpReward, label: 'خبرة', color: 'text-purple-400' },
              { icon: FaLeaf, val: mission.impactReward, label: 'تأثير', color: 'text-emerald-400' },
            ].map((reward, index) => (
              <div key={index} className="mission-page__rewardItem">
                <reward.icon className={`${reward.color} mx-auto text-xl`} />
                <div className="mission-page__rewardValue">{reward.val}</div>
                <div className="mission-page__rewardLabel">{reward.label}</div>
              </div>
            ))}
          </div>

          <div className="mission-page__cardFooter">
            <div className="mission-page__footerItem">
              <FaLayerGroup className="text-blue-400/60" />
              <span>مستوى: {mission.requiredLevel}</span>
            </div>
            <div className="mission-page__footerItem">
              <FaClock className="text-blue-400/60" />
              <span>{mission.createdAt ? new Date(mission.createdAt).toLocaleDateString('ar-EG') : 'مؤخرًا'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mission-page p-6 md:p-12 overflow-hidden" dir="rtl">
      <div className="mission-page__container">
        <div className="mission-page__hero">
          <div className="mission-page__heroGroup">
            <motion.div whileHover={{ rotate: -10, scale: 1.08 }} className="mission-page__heroIcon">
              <FaTasks />
            </motion.div>
            <div className="mission-page__heroText">
              <h2 className="mission-page__heroTitle">مركز المهام</h2>
              <p className="mission-page__heroSubtitle">لوحة احترافية لإدارة التحديات والمكافآت والعمليات الميدانية.</p>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddModal(true)} className="mission-page__heroAction">
            <FaPlus />
            <span>إنشاء مهمة</span>
          </motion.button>
        </div>

        <div className="mission-page__stats">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="mission-page__stat">
              <div className={`mission-page__statIcon ${stat.bg} ${stat.border}`}>
                <stat.icon className={stat.color} />
              </div>
              <div>
                <p className="mission-page__statLabel">{stat.label}</p>
                <p className="mission-page__statValue">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mission-page__searchPanel">
          <div className="mission-page__searchWrap">
            <span className="mission-page__searchIcon">
              <FaSearch />
            </span>
            <input type="text" value={searchTerm} onChange={handleSearch} placeholder="ابحث عن مهمة بالاسم أو الوصف..." className="mission-page__searchInput" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading && missions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mission-page__empty">
              <div className="mission-page__emptyIcon">
                <FaRocket />
              </div>
              <h3 className="mission-page__emptyTitle">جاري تحميل المهام</h3>
              <p className="mission-page__emptyText">يتم الآن مزامنة بيانات المهام من النظام.</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <div className="mission-page__sectionHead">
                <div className="mission-page__sectionTitle">سجل العمليات الميدانية</div>
                <div className="mission-page__sectionMeta">عرض {missions.length} من {totalPages * pageSize}</div>
              </div>

              {error && (
                <div className="donation-requests-page__alert">
                  <span>{error}</span>
                </div>
              )}

              {missions.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mission-page__grid">
                  {missions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mission-page__empty">
                  <div className="mission-page__emptyIcon">
                    <FaTasks />
                  </div>
                  <h3 className="mission-page__emptyTitle">لا توجد مهام حالية</h3>
                  <p className="mission-page__emptyText">يمكنك البدء بإضافة أول مهمة لتظهر هنا فورًا، مع نفس التنسيق حتى إذا تعطل Tailwind.</p>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddModal(true)} className="mission-page__emptyAction">
                    إنشاء المهمة الأولى
                  </motion.button>
                </motion.div>
              )}

              {totalPages > 1 && (
                <div className="mission-page__pagination">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="mission-page__pageBtn">
                    <FaArrowRight />
                    <span>السابق</span>
                  </motion.button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`mission-page__pageBtn ${currentPage === page ? 'is-active' : ''}`}>
                      {page}
                    </button>
                  ))}

                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="mission-page__pageBtn">
                    <span>التالي</span>
                    <FaArrowLeft />
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && <AddMissionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddMission} locations={locations} />}
        {showDetailModal && <MissionDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} mission={selectedMission} />}
        {showEditModal && (
          <EditMissionModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedMission(null);
            }}
            onSubmit={handleUpdateMission}
            mission={selectedMission}
            locations={locations}
          />
        )}
      </AnimatePresence>

      <EntityHistoryModal
        isOpen={Boolean(historyEntityId)}
        entityId={historyEntityId}
        title="History"
        onClose={() => setHistoryEntityId(null)}
      />
    </div>
  );
};

export default MissionsTab;
