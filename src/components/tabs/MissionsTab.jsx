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
    { label: 'إجمالي المهام', value: missions.length, icon: FaTasks, accent: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'مهام نشطة', value: missions.filter((m) => m.status === 1).length, icon: FaRocket, accent: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'صعوبة عالية', value: missions.filter((m) => m.difficulty >= 2).length, icon: FaShieldAlt, accent: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
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
        padding: '32px 24px',
        color: '#0f172a',
      }}
    >
      {/* ===== Main Container with proper margins ===== */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >

        {/* ===== Header Card ===== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.92) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '28px 32px',
            boxShadow: '0 20px 50px -20px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255,255,255,0.4) inset',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0, flex: '1 1 320px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  flexShrink: 0,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
                  color: '#fff',
                  boxShadow: '0 12px 28px -8px rgba(99, 102, 241, 0.55)',
                }}
              >
                <FaTasks style={{ fontSize: '26px' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#020617', margin: 0, lineHeight: 1.2 }}>
                  إدارة المهام
                </h2>
                <p style={{ marginTop: '8px', fontSize: '14px', lineHeight: 1.6, color: '#475569', maxWidth: '480px' }}>
                  إدارة المهام الميدانية والمكافآت والعناوين المرتبطة بها من واجهة أوضح وأكثر تنظيمًا.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                <FaSearch
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#0284c7',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="ابحث عن مهمة محددة..."
                  style={{
                    width: '100%',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    padding: '12px 48px 12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0f172a',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
                  padding: '12px 22px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 24px -8px rgba(99, 102, 241, 0.55)',
                }}
              >
                <FaPlus style={{ fontSize: '12px' }} />
                <span>إضافة مهمة</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ===== Error Message ===== */}
        {error && (
          <div
            style={{
              borderRadius: '14px',
              border: '1px solid #fecaca',
              background: 'rgba(254, 242, 242, 0.95)',
              padding: '14px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#b91c1c',
            }}
          >
            {error}
          </div>
        )}

        {/* ===== Stats Cards ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.92) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '20px',
                boxShadow: '0 10px 30px -12px rgba(15, 23, 42, 0.3)',
                transition: 'box-shadow 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  className={`${stat.bg} ${stat.border} ${stat.accent}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    flexShrink: 0,
                    borderRadius: '14px',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    fontSize: '22px',
                  }}
                >
                  <stat.icon />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ marginBottom: '4px', fontSize: '13px', fontWeight: 500, color: '#475569' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#020617', fontVariantNumeric: 'tabular-nums' }}>
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
              minHeight: '360px',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              borderRadius: '22px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '40px',
              boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.3)',
            }}
          >
            <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '44px', color: '#6366f1' }} />
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>جاري استدعاء سجلات المهام...</div>
          </div>
        ) : missions.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '22px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '64px 24px',
              textAlign: 'center',
              boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.3)',
            }}
          >
            <div
              style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 100%)',
                color: '#4f46e5',
              }}
            >
              <FaTasks style={{ fontSize: '32px' }} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#020617', margin: 0 }}>لا توجد مهام مسجلة</h3>
            <p style={{ marginTop: '12px', maxWidth: '420px', fontSize: '14px', lineHeight: 1.7, color: '#475569' }}>
              لم يتم العثور على أي مهام في قاعدة البيانات حاليًا. اضغط على "إضافة مهمة" لإنشاء أول مهمة.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
              justifyContent: 'start',
            }}
          >
            {missions.map((mission, index) => {
              const diff = getDifficultyInfo(mission.difficulty);
              const DiffIcon = diff.icon;
              const isActive = mission.status === 1;

              return (
                <motion.div
                  key={mission.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    overflow: 'hidden',
                    borderRadius: '22px',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    padding: '24px',
                    boxShadow: '0 15px 40px -15px rgba(15, 23, 42, 0.35)',
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
                    <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                        <span
                          className={diff.badge}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            borderRadius: '999px',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            padding: '5px 10px',
                            fontSize: '11px',
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
                            gap: '6px',
                            borderRadius: '999px',
                            border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`,
                            background: isActive ? '#ecfdf5' : '#fef2f2',
                            color: isActive ? '#047857' : '#b91c1c',
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {isActive ? <FaCheckCircle style={{ fontSize: '11px' }} /> : <FaTimesCircle style={{ fontSize: '11px' }} />}
                          <span>{isActive ? 'نشطة' : 'متوقفة'}</span>
                        </span>
                      </div>
                      <h3
                        style={{
                          fontSize: '19px',
                          fontWeight: 800,
                          lineHeight: 1.4,
                          color: '#020617',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {mission.title || 'بدون عنوان'}
                      </h3>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#64748b',
                          width: 'fit-content',
                        }}
                      >
                        <span style={{ color: '#94a3b8' }}>ID:</span>
                        <span style={{ fontFamily: 'monospace', color: '#4f46e5', direction: 'ltr' }}>
                          {mission.id ? `${mission.id.substring(0, 8)}...` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewMission(mission.id)}
                        title="عرض التفاصيل"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          border: '1px solid #bae6fd',
                          background: '#f0f9ff',
                          color: '#0284c7',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <FaEye style={{ fontSize: '13px' }} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditMission(mission)}
                        title="تعديل"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          border: '1px solid #fde68a',
                          background: '#fffbeb',
                          color: '#d97706',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <FaEdit style={{ fontSize: '13px' }} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteMission(mission.id)}
                        title="حذف"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          border: '1px solid #fecaca',
                          background: '#fef2f2',
                          color: '#dc2626',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <FaTrash style={{ fontSize: '13px' }} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
                    }}
                  />

                  {/* Rewards Grid */}
                  <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { icon: FaTrophy, val: mission.kpReward, label: 'نقاط خير', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                      { icon: FaStar, val: mission.xpReward, label: 'خبرة', color: '#c026d3', bg: '#fdf4ff', border: '#f5d0fe' },
                      { icon: FaLeaf, val: mission.impactReward, label: 'تأثير', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
                    ].map((reward, i) => (
                      <div
                        key={i}
                        style={{
                          borderRadius: '12px',
                          border: `1px solid ${reward.border}`,
                          background: reward.bg,
                          padding: '12px 8px',
                          textAlign: 'center',
                        }}
                      >
                        <reward.icon style={{ display: 'block', margin: '0 auto 6px', fontSize: '15px', color: reward.color }} />
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                          {reward.val || 0}
                        </div>
                        <div style={{ marginTop: '2px', fontSize: '10px', fontWeight: 700, color: reward.color }}>
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
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1,
                boxShadow: '0 6px 20px -8px rgba(15,23,42,0.3)',
              }}
            >
              <FaArrowRight style={{ fontSize: '11px' }} />
              <span>السابق</span>
            </button>
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                boxShadow: '0 6px 20px -8px rgba(15,23,42,0.3)',
              }}
            >
              صفحة {currentPage} من {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1,
                boxShadow: '0 6px 20px -8px rgba(15,23,42,0.3)',
              }}
            >
              <span>التالي</span>
              <FaArrowLeft style={{ fontSize: '11px' }} />
            </button>
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
