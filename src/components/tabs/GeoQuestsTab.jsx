// src/components/tabs/GeoQuestsTab.jsx
/**
 * GeoQuestsTab — Real-world GPS-based quests.
 * Player must physically travel to a location to unlock and complete the quest.
 */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geoQuestsService } from '../../services/geoQuestsService';
import GeoQuestService from '../../services/GeoQuestService';
import useGameState from '../../hooks/useGameState';
import AudioManager from '../../services/AudioManager';
import JellyButton from '../common/JellyButton';
import AddGeoQuestModal from '../modals/AddGeoQuestModal';
import GeoQuestDetailModal from '../modals/GeoQuestDetailModal';
import EditGeoQuestModal from '../modals/EditGeoQuestModal';

import {
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaStar,
  FaBullseye,
  FaExclamationTriangle,
  FaRoute,
  FaRocket,
  FaGem,
  FaShieldAlt,
  FaFire,
  FaTasks,
  FaTrophy,
  FaLeaf,
  FaChartPie,
  FaArrowRight,
  FaArrowLeft,
  FaClock,
  FaLayerGroup,
  FaUserShield,
  FaGlobe,
  FaHospital,
  FaSchool,
  FaMosque,
  FaPaw,
  FaHandsHelping
} from 'react-icons/fa';
import { FiNavigation, FiInfo, FiTarget, FiTrendingUp } from 'react-icons/fi';

const GQ_CSS = `
  .gq-tab {
    direction: rtl;
    display: grid;
    gap: 16px;
    font-family: 'Cairo', sans-serif;
    color: #0f172a;
  }

  .gq-header {
    background:
      radial-gradient(circle at top right, rgba(73,198,242,0.12), transparent 28%),
      radial-gradient(circle at bottom left, rgba(184,140,248,0.08), transparent 24%),
      linear-gradient(135deg, #ffffff 0%, #f8fcff 55%, #faf7ff 100%);
    border-radius: 24px;
    padding: 20px 24px;
    box-shadow: 0 18px 40px rgba(15,23,42,0.06);
    border: 1.5px solid rgba(226,232,240,0.9);
    text-align: center;
  }

  .gq-header__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #2563eb;
    font-size: 24px;
    box-shadow: 0 12px 24px rgba(59,130,246,0.08);
  }

  .gq-header__title {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .gq-header__subtitle {
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
  }

  .gq-info-banner {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1.5px solid #bfdbfe;
    border-radius: 18px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 12px 24px rgba(59,130,246,0.05);
  }

  .gq-info-banner__icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: rgba(255,255,255,0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1d4ed8;
    font-size: 22px;
    flex-shrink: 0;
  }

  .gq-info-banner__title {
    font-size: 13px;
    font-weight: 900;
    color: #1d4ed8;
    margin-bottom: 2px;
  }

  .gq-info-banner__desc {
    font-size: 12px;
    color: #1e40af;
    font-weight: 700;
    line-height: 1.7;
  }

  .gq-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .gq-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 22px;
    padding: 20px 22px;
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
    transition: all 0.2s ease;
  }

  .gq-card--done {
    border-color: rgba(134,239,172,0.9);
    background: linear-gradient(180deg, #f0fdf4 0%, #f7fff9 100%);
    opacity: 0.92;
  }

  .gq-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 34px rgba(15,23,42,0.08);
  }

  .gq-card__top {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 12px;
  }

  .gq-card__icon {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(226,232,240,0.9);
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    color: #2563eb;
    font-size: 24px;
  }

  .gq-card__title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 4px;
  }

  .gq-card__title {
    font-size: 15px;
    font-weight: 900;
    color: #0f172a;
  }

  .gq-card__desc {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
    line-height: 1.7;
  }

  .gq-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 900;
    padding: 6px 10px;
    border-radius: 999px;
  }

  .gq-hint {
    background: rgba(29,110,216,0.08);
    border-radius: 12px;
    padding: 10px 12px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(29,110,216,0.14);
    color: #2563eb;
    font-size: 12px;
    font-weight: 800;
  }

  .gq-rewards {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .gq-complete-badge {
    text-align: center;
    background: linear-gradient(135deg, #dcfce7, #ecfdf5);
    border-radius: 14px;
    padding: 12px;
    color: #166534;
    font-weight: 900;
    font-size: 13px;
    border: 1px solid rgba(134,239,172,0.9);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
  }

  .gq-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.42);
    backdrop-filter: blur(3px);
    z-index: 100;
  }

  .gq-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 24px;
    padding: 30px 28px;
    max-width: 360px;
    width: 90%;
    z-index: 110;
    text-align: center;
    box-shadow: 0 24px 60px rgba(15,23,42,0.18);
    border: 1.5px solid rgba(226,232,240,0.9);
    animation: gqPop 0.35s ease-out;
  }

  .gq-modal__icon {
    width: 76px;
    height: 76px;
    border-radius: 22px;
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #2563eb;
    font-size: 30px;
    box-shadow: 0 12px 24px rgba(15,23,42,0.06);
  }

  .gq-modal__title {
    font-size: 18px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .gq-modal__desc {
    font-size: 13px;
    color: #64748b;
    font-weight: 700;
    margin-bottom: 18px;
    line-height: 1.7;
  }

  @keyframes gqPop {
    0% { opacity: 0; transform: translate(-50%,-50%) scale(0.95); }
    100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  }
`;

const DIFF_STYLE = {
  سهل: { bg: '#dcfce7', color: '#15803d' },
  متوسط: { bg: '#fef9c3', color: '#854d0e' },
  صعب: { bg: '#fee2e2', color: '#b91c1c' },
  'صعب جداً': { bg: '#fce7f3', color: '#9d174d' },
};

const getQuestIcon = (quest) => {
  const text = `${quest?.title || ''} ${quest?.desc || ''} ${quest?.hint || ''}`.toLowerCase();

  if (text.includes('مستشفى') || text.includes('مرض')) return FaHospital;
  if (text.includes('مدرس') || text.includes('تعليم')) return FaSchool;
  if (text.includes('مسجد') || text.includes('قرآن') || text.includes('صلاة')) return FaMosque;
  if (text.includes('شجر') || text.includes('بيئة') || text.includes('حديقة')) return FaLeaf;
  if (text.includes('حيوان') || text.includes('قط') || text.includes('كلب')) return FaPaw;
  if (text.includes('مساعدة') || text.includes('خدمة')) return FaHandsHelping;

  return FaMapMarkerAlt;
};

const GeoQuestCard = memo(({ quest, completed, onVerify, isVerifying }) => {
  const dl = DIFF_STYLE[quest.difficulty] ?? DIFF_STYLE['متوسط'];
  const QuestIcon = getQuestIcon(quest);

  return (
    <div className={`gq-card${completed ? ' gq-card--done' : ''}`}>
      <div className="gq-card__top">
        <div className="gq-card__icon">
          {completed ? <FaCheckCircle /> : <QuestIcon />}
        </div>

        <div style={{ flex: 1 }}>
          <div className="gq-card__title-row">
            <span className="gq-card__title">{quest.title}</span>
            <span
              className="gq-chip"
              style={{
                background: dl.bg,
                color: dl.color,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {quest.difficulty}
            </span>
          </div>

          <p className="gq-card__desc">{quest.desc}</p>
        </div>
      </div>

      <div className="gq-hint">
        <FiInfo />
        <span>{quest.hint}</span>
      </div>

      <div className="gq-rewards">
        <span className="gq-chip" style={{ background: '#fff7cc', color: '#92400e' }}>
          <FaStar />
          <span>{quest.kp} KP</span>
        </span>

        <span className="gq-chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
          <FiTarget />
          <span>{quest.xp} XP</span>
        </span>

        <span className="gq-chip" style={{ background: '#ecfdf5', color: '#166534' }}>
          <FiTrendingUp />
          <span>تأثير {quest.impact}</span>
        </span>
      </div>

      {completed ? (
        <div className="gq-complete-badge">
          <FaCheckCircle />
          <span>مهمة مكتملة! أحسنت!</span>
        </div>
      ) : (
        <JellyButton
          variant="primary"
          size="md"
          fullWidth
          sound="click"
          onClick={() => onVerify(quest)}
          disabled={isVerifying}
        >
          {isVerifying ? 'جاري التحقق من موقعك…' : 'أنا في المكان الصحيح'}
        </JellyButton>
      )}
    </div>
  );
});

const VerifyModal = memo(({ result, quest, onClose, onComplete }) => {
  if (!result) return null;

  const QuestIcon = quest ? getQuestIcon(quest) : FaMapMarkerAlt;

  let title = '';
  let desc = '';
  let Icon = QuestIcon;
  let action = null;

  if (result.loading) {
    title = 'جاري التحقق من موقعك';
    desc = 'انتظر قليلاً حتى نحصل على إحداثياتك الحالية بدقة.';
    Icon = FiNavigation;
  } else if (result.success) {
    title = 'تم التحقق! أنت في المكان الصحيح';
    desc = `ممتاز، أنت على بُعد ${GeoQuestService.formatDistance(result.distance)} من الهدف.`;
    Icon = FaCheckCircle;
    action = (
      <JellyButton variant="success" size="md" fullWidth sound="win" onClick={onComplete}>
        استلام المكافأة
      </JellyButton>
    );
  } else if (result.error) {
    title = 'تعذر التحقق من GPS';
    desc = result.error;
    Icon = FaExclamationTriangle;
    action = (
      <JellyButton variant="dark" size="md" fullWidth sound="click" onClick={onClose}>
        فهمت
      </JellyButton>
    );
  } else {
    title = `أنت بعيد بـ ${GeoQuestService.formatDistance(result.distance)}`;
    desc = `تحتاج أن تكون على بُعد ${GeoQuestService.formatDistance(quest.radiusM)} من الهدف.`;
    Icon = FaRoute;
    action = (
      <JellyButton variant="dark" size="md" fullWidth sound="click" onClick={onClose}>
        سأتحرك إلى الموقع
      </JellyButton>
    );
  }

  return (
    <>
      <div className="gq-modal-overlay" onClick={onClose} />
      <div className="gq-modal">
        <div className="gq-modal__icon">
          <Icon />
        </div>

        <h3 className="gq-modal__title">{title}</h3>
        <p className="gq-modal__desc">{desc}</p>

        {action}
      </div>
    </>
  );
});

const GeoQuestsTab = () => {
  const [geoQuests, setGeoQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGeoQuest, setSelectedGeoQuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin (you can modify this logic based on your auth system)
  useEffect(() => {
    const checkAdmin = () => {
      const userData = localStorage.getItem('user_data') || localStorage.getItem('madeena_login_user_response');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          
          // Robust admin check
          const roles = parsed.roles || parsed.role || (parsed.user?.roles) || [];
          const isAdminRole = Array.isArray(roles) 
            ? roles.some(r => String(r).toLowerCase() === 'admin')
            : String(roles).toLowerCase() === 'admin';
            
          setIsAdmin(isAdminRole || parsed.isAdmin || false);
        } catch (e) {
          console.warn('Failed to parse user data for admin check');
        }
      }
    };
    checkAdmin();
  }, []);

  const fetchGeoQuests = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = search
        ? await geoQuestsService.searchGeoQuests(search, page, pageSize)
        : await geoQuestsService.getGeoQuests(page, pageSize);

      setGeoQuests(response.data);
      setTotalPages(response.pagination.totalPages || 1);
      setCurrentPage(response.pagination.currentPage || page);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في جلب المهام الجغرافية');
      console.error('Error fetching GeoQuests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeoQuests(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleAddGeoQuest = async (geoQuestData) => {
    try {
      await geoQuestsService.createGeoQuest(geoQuestData);
      setShowAddModal(false);
      fetchGeoQuests(currentPage, searchTerm);
      alert('تم إضافة المهمة الجغرافية بنجاح');
    } catch (err) {
      console.error('Error adding GeoQuest:', err);
      const apiData = err.response?.data;
      let errorMsg = 'فشل في إضافة المهمة الجغرافية.';
      if (apiData?.errors) {
        const messages = Object.values(apiData.errors).flat().join('\n');
        errorMsg += `\nالأخطاء:\n${messages}`;
      } else if (apiData?.detail) {
        errorMsg += `\n${apiData.detail}`;
      } else if (apiData?.message) {
        errorMsg += `\n${apiData.message}`;
      } else if (apiData?.error) {
        errorMsg += `\n${apiData.error}`;
      } else if (err.message) {
        errorMsg += `\n${err.message}`;
      }
      alert(errorMsg);
      setError(errorMsg);
    }
  };

  const handleViewGeoQuest = async (geoQuestId) => {
    try {
      const geoQuest = await geoQuestsService.getGeoQuestById(geoQuestId);
      setSelectedGeoQuest(geoQuest);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching GeoQuest details:', err);
      alert('فشل في جلب تفاصيل المهمة الجغرافية');
    }
  };

  const handleEditGeoQuest = (geoQuest) => {
    setSelectedGeoQuest(geoQuest);
    setShowEditModal(true);
  };

  const handleUpdateGeoQuest = async (geoQuestId, geoQuestData) => {
    try {
      await geoQuestsService.updateGeoQuest(geoQuestId, geoQuestData);
      setShowEditModal(false);
      setSelectedGeoQuest(null);
      fetchGeoQuests(currentPage, searchTerm);
      alert('تم تحديث المهمة الجغرافية بنجاح');
    } catch (err) {
      console.error('Error updating GeoQuest:', err);
      let errorMessage = 'فشل في تحديث المهمة الجغرافية';
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

  const handleDeleteGeoQuest = async (geoQuestId) => {
    const confirmed = window.confirm('هل أنت متأكد من حذف هذه المهمة الجغرافية؟ هذا الإجراء لا يمكن التراجع عنه.');
    if (!confirmed) return;

    try {
      await geoQuestsService.deleteGeoQuest(geoQuestId);
      alert('تم حذف المهمة الجغرافية بنجاح');
      fetchGeoQuests(currentPage, searchTerm);
    } catch (err) {
      console.error('Error deleting GeoQuest:', err);
      let errorMessage = 'فشل في حذف المهمة الجغرافية';
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

  const { state, actions } = useGameState();
  const { completedQuests } = state;
  const { completeQuest } = actions;

  const [verifying, setVerifying] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [pendingQuest, setPendingQuest] = useState(null);

  const startVerify = useCallback(async (quest) => {
    setPendingQuest(quest);
    setVerifying(quest);
    setVerifyResult({ loading: true });
    AudioManager.getInstance().play('click');

    const result = await GeoQuestService.verifyQuestLocation(quest);

    setVerifying(null);
    setVerifyResult(result);

    if (result.success) AudioManager.getInstance().play('open');
  }, []);

  const completeVerified = useCallback(() => {
    if (!pendingQuest || !verifyResult?.success) return;

    completeQuest(pendingQuest);
    setVerifyResult(null);
    setPendingQuest(null);
    AudioManager.getInstance().play('win');
  }, [pendingQuest, verifyResult, completeQuest]);

  return (
    <div className="gq-tab">
      <style>{GQ_CSS}</style>

      <div className="gq-header">
        <div className="gq-header__icon">
          <FaMapMarkedAlt />
        </div>
        <div className="gq-header__title">مهام العالم الحقيقي</div>
        <div className="gq-header__subtitle">
          توجه إلى الأماكن الحقيقية وأكمل المهام — GPS يتحقق من وجودك
        </div>
      </div>

      <div className="gq-info-banner">
        <span className="gq-info-banner__icon">
          <FiNavigation />
        </span>
        <div>
          <div className="gq-info-banner__title">كيف تعمل المهام الجغرافية؟</div>
          <div className="gq-info-banner__desc">
            اذهب إلى المكان المحدد، اضغط على زر التحقق، وسيتأكد النظام من موقعك تلقائيًا.
          </div>
        </div>
      </div>

      <div className="gq-grid">
        {geoQuests.map((quest) => (
          <GeoQuestCard
            key={quest.id}
            quest={quest}
            completed={completedQuests.has(quest.id)}
            onVerify={startVerify}
            isVerifying={verifying?.id === quest.id}
          />
        ))}
      </div>

      {(verifyResult || verifying) && (
        <VerifyModal
          result={verifying ? { loading: true } : verifyResult}
          quest={pendingQuest}
          onClose={() => {
            setVerifyResult(null);
            setPendingQuest(null);
          }}
          onComplete={completeVerified}
        />
      )}
    </div>
  );
};

export default memo(GeoQuestsTab);