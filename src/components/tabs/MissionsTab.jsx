import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { missionsService } from '../../services/missionsService';
import { locationsService } from '../../services/locationsService';
import AddMissionModal from '../modals/AddMissionModal';
import MissionDetailModal from '../modals/MissionDetailModal';
import EditMissionModal from '../modals/EditMissionModal';
import EntityHistoryModal from '../modals/EntityHistoryModal';
import { showAppConfirm } from '../../utils/appAlerts';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const fetchMissions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await missionsService.getMissions(page, pageSize);

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
    fetchMissions(currentPage);
  }, [currentPage]);

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
    { label: 'إجمالي المهام', value: missions.length, icon: FaTasks, accent: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'مهام نشطة', value: missions.filter((m) => m.status === 1).length, icon: FaRocket, accent: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'صعوبة عالية', value: missions.filter((m) => m.difficulty >= 2).length, icon: FaShieldAlt, accent: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
  ], [missions]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const displayedMissions = useMemo(() => {
    if (!normalizedSearchTerm) return missions;

    return missions.filter((mission) => {
      const searchableValues = [
        mission.title,
        mission.description,
        mission.locationName,
        mission.location?.name,
        mission.status,
        mission.difficulty,
        mission.requiredLevel,
        mission.kpReward,
        mission.xpReward,
        mission.impactReward,
      ];

      return searchableValues
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(normalizedSearchTerm));
    });
  }, [missions, normalizedSearchTerm]);

  const handleAddMission = async (missionData) => {
    try {
      await missionsService.createMission(missionData);
      setShowAddModal(false);
      fetchMissions(currentPage);
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
      fetchMissions(currentPage);
    } catch (err) {
      console.error('Error updating mission:', err);
    }
  };

  const handleDeleteMission = async (missionId) => {
    const confirmed = await showAppConfirm({
      title: 'حذف المهمة',
      message: 'هل أنت متأكد من حذف هذه المهمة؟',
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
    });
    if (!confirmed) return;
    try {
      await missionsService.deleteMission(missionId);
      fetchMissions(currentPage);
    } catch (err) {
      alert('فشل في حذف المهمة');
    }
  };

  const getDifficultyInfo = (level) => {
    switch (level) {
      case 0: return { label: 'سهل', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: FaLeaf };
      case 1: return { label: 'متوسط', badge: 'bg-blue-50 text-blue-700 border-blue-100', icon: FaShieldAlt };
      case 2: return { label: 'صعب', badge: 'bg-orange-50 text-orange-700 border-orange-100', icon: FaFire };
      case 3: return { label: 'أسطوري', badge: 'bg-purple-50 text-purple-700 border-purple-100', icon: FaGem };
      default: return { label: 'غير محدد', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: FaTasks };
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        width: '100%',
        padding: isMobile ? '12px' : '32px 24px',
        color: 'var(--text-primary)',
        background: 'transparent',
      }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .missions-header { 
            padding: 20px !important; 
            flex-direction: column !important; 
            align-items: stretch !important; 
            gap: 20px !important; 
          }
          .missions-header-info { 
            flex: 1 1 auto !important; 
          }
          .missions-actions { 
            flex-direction: column !important; 
            width: 100% !important; 
          }
          .missions-search-wrapper { 
            width: 100% !important; 
          }
          .missions-add-btn { 
            width: 100% !important; 
          }
        }
      `}</style>
      {/* ===== Main Container with proper margins ===== */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '16px' : '28px',
        }}
      >

        {/* ===== Header Card ===== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="missions-header"
          style={{
            padding: isMobile ? '20px' : '24px 32px',
            borderRadius: 24,
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isMobile ? 16 : 24,
            flexWrap: 'wrap',
            gap: isMobile ? 16 : 20
          }}
        >
          <div className="missions-header-info" style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'center', 
            gap: isMobile ? 12 : 20, 
            minWidth: 0, 
            flex: isMobile ? '1 1 100%' : '1 1 320px',
            textAlign: isMobile ? 'center' : 'right'
          }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '52px' : '64px',
                height: isMobile ? '52px' : '64px',
                flexShrink: 0,
                borderRadius: isMobile ? '14px' : '18px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
                color: '#fff',
                boxShadow: '0 12px 28px -8px rgba(99, 102, 241, 0.55)',
              }}
            >
              <FaTasks style={{ fontSize: isMobile ? '20px' : '26px' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                إدارة المهام
              </h2>
              <p style={{ marginTop: isMobile ? '4px' : '8px', fontSize: isMobile ? '12px' : '14px', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '480px' }}>
                إدارة المهام الميدانية والمكافآت والعناوين المرتبطة بها.
              </p>
            </div>
          </div>

            <div className="missions-actions" style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center', 
              gap: '12px', 
              flexWrap: 'wrap',
              width: isMobile ? '100%' : 'auto'
            }}>
              <div className="missions-search-wrapper" style={{ position: 'relative', width: isMobile ? '100%' : '320px', maxWidth: '100%' }}>
                <FaSearch
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--primary)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن مهمة..."
                  style={{
                    width: '100%',
                    borderRadius: '14px',
                    border: '1px solid var(--input-border)',
                    background: 'var(--input-bg)',
                    padding: '12px 48px 12px 16px',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                />
              </div>

              <motion.button
                whileHover={isMobile ? {} : { scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="missions-add-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
                  padding: '12px 22px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 700,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 24px -8px rgba(99, 102, 241, 0.55)',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <FaPlus style={{ fontSize: '12px' }} />
                <span>إضافة مهمة</span>
              </motion.button>
            </div>
        </motion.div>

        {/* ===== Stats Cards ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: isMobile ? '12px' : '20px',
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={isMobile ? {} : { y: -4 }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: isMobile ? '14px' : '18px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: isMobile ? '16px' : '20px',
                boxShadow: 'var(--shadow-md)',
                transition: 'box-shadow 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
                <div
                  className={`${stat.bg} ${stat.border} ${stat.accent}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isMobile ? '44px' : '56px',
                    height: isMobile ? '44px' : '56px',
                    flexShrink: 0,
                    borderRadius: isMobile ? '12px' : '14px',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    fontSize: isMobile ? '18px' : '22px',
                  }}
                >
                  <stat.icon />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ marginBottom: '2px', fontSize: isMobile ? '11px' : '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ===== Missions Grid / States ===== */}
        {loading && missions.length === 0 ? (
          <div
            style={{
              display: 'flex',
              minHeight: isMobile ? '240px' : '360px',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              borderRadius: '22px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              padding: isMobile ? '24px' : '40px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: isMobile ? '32px' : '44px', color: '#6366f1' }} />
            <div style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 700, color: 'var(--text-primary)' }}>جاري التحميل...</div>
          </div>
        ) : displayedMissions.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '22px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              padding: isMobile ? '40px 20px' : '64px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '64px' : '80px',
                height: isMobile ? '64px' : '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 100%)',
                color: '#4f46e5',
              }}
            >
              <FaTasks style={{ fontSize: isMobile ? '24px' : '32px' }} />
            </div>
            <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>لا توجد مهام</h3>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: isMobile ? '16px' : '24px',
              justifyContent: 'start',
            }}
          >
            {displayedMissions.map((mission, index) => {
              const diff = getDifficultyInfo(mission.difficulty);
              const DiffIcon = diff.icon;
              const isActive = mission.status === 1;

              return (
                <motion.div
                  key={mission.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={isMobile ? {} : { y: -6 }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '14px' : '18px',
                    overflow: 'hidden',
                    borderRadius: isMobile ? '18px' : '22px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    padding: isMobile ? '16px' : '24px',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'box-shadow 0.3s',
                  }}
                >
                  {/* Top gradient accent */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #0ea5e9, #6366f1, #a855f7)',
                    }}
                  />

                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                        <span
                          className={diff.badge}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '999px',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            padding: isMobile ? '3px 8px' : '5px 10px',
                            fontSize: isMobile ? '10px' : '11px',
                            fontWeight: 700,
                          }}
                        >
                          <DiffIcon style={{ fontSize: '11px' }} />
                          <span>{diff.label}</span>
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '999px',
                            border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`,
                            background: 'var(--bg-card-2)',
                            color: isActive ? '#047857' : '#b91c1c',
                            padding: isMobile ? '3px 8px' : '5px 10px',
                            fontSize: isMobile ? '10px' : '11px',
                            fontWeight: 700,
                          }}
                        >
                          {isActive ? <FaCheckCircle style={{ fontSize: '11px' }} /> : <FaTimesCircle style={{ fontSize: '11px' }} />}
                          <span>{isActive ? 'نشطة' : 'متوقفة'}</span>
                        </span>
                      </div>
                      <h3
                        style={{
                          fontSize: isMobile ? '16px' : '19px',
                          fontWeight: 800,
                          lineHeight: 1.4,
                          color: 'var(--text-primary)',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {mission.title || 'بدون عنوان'}
                      </h3>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'row' : 'column', 
                      gap: isMobile ? '4px' : '8px' 
                    }}>
                      <motion.button
                        whileHover={isMobile ? {} : { scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewMission(mission.id)}
                        title="عرض"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: isMobile ? '32px' : '36px',
                          height: isMobile ? '32px' : '36px',
                          borderRadius: '10px',
                          border: '1px solid #bae6fd',
                          background: '#f0f9ff',
                          color: '#0284c7',
                          cursor: 'pointer',
                        }}
                      >
                        <FaEye size={isMobile ? 12 : 13} />
                      </motion.button>
                      <motion.button
                        whileHover={isMobile ? {} : { scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditMission(mission)}
                        title="تعديل"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: isMobile ? '32px' : '36px',
                          height: isMobile ? '32px' : '36px',
                          borderRadius: '10px',
                          border: '1px solid #fde68a',
                          background: 'var(--bg-card-2)',
                          color: '#d97706',
                          cursor: 'pointer',
                        }}
                      >
                        <FaEdit size={isMobile ? 12 : 13} />
                      </motion.button>
                      <motion.button
                        whileHover={isMobile ? {} : { scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteMission(mission.id)}
                        title="حذف"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: isMobile ? '32px' : '36px',
                          height: isMobile ? '32px' : '36px',
                          borderRadius: '10px',
                          border: '1px solid #fecaca',
                          background: '#fef2f2',
                          color: '#dc2626',
                          cursor: 'pointer',
                        }}
                      >
                        <FaTrash size={isMobile ? 12 : 13} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
                    }}
                  />

                  {/* Rewards Grid */}
                  <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? '6px' : '10px' }}>
                    {[
                      { icon: FaTrophy, val: mission.kpReward, label: 'نقاط خير', color: '#d97706', bg: 'var(--bg-card-2)', border: 'var(--border)' },
                      { icon: FaStar, val: mission.xpReward, label: 'خبرة', color: '#c026d3', bg: 'var(--bg-card-2)', border: 'var(--border)' },
                      { icon: FaLeaf, val: mission.impactReward, label: 'تأثير', color: '#059669', bg: 'var(--bg-card-2)', border: 'var(--border)' },
                    ].map((reward, i) => (
                      <div
                        key={i}
                        style={{
                          borderRadius: '12px',
                          border: `1px solid ${reward.border}`,
                          background: reward.bg,
                          padding: isMobile ? '8px 4px' : '12px 8px',
                          textAlign: 'center',
                        }}
                      >
                        <reward.icon style={{ display: 'block', margin: '0 auto 4px', fontSize: isMobile ? '12px' : '15px', color: reward.color }} />
                        <div style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                          {reward.val || 0}
                        </div>
                        <div style={{ marginTop: '2px', fontSize: isMobile ? '9px' : '10px', fontWeight: 700, color: reward.color }}>
                          {reward.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ===== Pagination ===== */}
        {totalPages > 1 && (
          <div style={{ 
            marginTop: '8px', 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: isMobile ? '10px' : '12px' 
          }}>
            <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.6)',
                  background: 'var(--bg-card-2)',
                  backdropFilter: 'blur(12px)',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  boxShadow: '0 6px 20px -8px rgba(15,23,42,0.3)',
                }}
              >
                <FaArrowRight style={{ fontSize: '11px' }} />
                <span>السابق</span>
              </button>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.6)',
                  background: 'var(--bg-card-2)',
                  backdropFilter: 'blur(12px)',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  boxShadow: '0 6px 20px -8px rgba(15,23,42,0.3)',
                }}
              >
                <span>التالي</span>
                <FaArrowLeft style={{ fontSize: '11px' }} />
              </button>
            </div>

            <div
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'var(--bg-card-2)',
                backdropFilter: 'blur(12px)',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                boxShadow: '0 6px 20px -8px rgba(15,23,42,0.3)',
                width: isMobile ? '100%' : 'auto',
                textAlign: 'center'
              }}
            >
              صفحة {currentPage} من {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* ===== Modals ===== */}
      <AnimatePresence>
        {showAddModal && <AddMissionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddMission} locations={locations} />}
        {showDetailModal && <MissionDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} mission={selectedMission} />}
        {showEditModal && <EditMissionModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedMission(null); }} onSubmit={handleUpdateMission} mission={selectedMission} locations={locations} />}
      </AnimatePresence>
    </div>
  );
};

export default MissionsTab;
