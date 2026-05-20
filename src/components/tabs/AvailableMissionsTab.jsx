import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaFire,
  FaGem,
  FaLeaf,
  FaLock,
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
import { missionsService } from '../../services/missionsService';

const PAGE_CSS = `
  .available-missions-page__hero {
    background:
      radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 40%),
      radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.1), transparent 40%),
      var(--bg-app);
  }

  .available-missions-page__heroActions {
    display: grid;
    gap: 14px;
    width: min(100%, 520px);
  }

  .available-missions-page__searchGrid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .available-missions-page__inputWrap {
    position: relative;
  }

  .available-missions-page__inputIcon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(100, 116, 139, 0.85);
    font-size: 16px;
    pointer-events: none;
  }

  .available-missions-page__input {
    width: 100%;
    min-height: 52px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 700;
    padding: 0 46px 0 16px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }

  .available-missions-page__input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
  }

  .available-missions-page__cta {
    min-height: 54px;
    border: none;
    border-radius: 18px;
    background: linear-gradient(135deg, #16a34a 0%, #0f766e 100%);
    color: #f8fafc;
    font-size: 15px;
    font-weight: 900;
    padding: 0 20px;
    cursor: pointer;
    box-shadow: 0 18px 36px rgba(15, 118, 110, 0.26);
    transition: transform 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease;
  }

  .available-missions-page__cta:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 24px 44px rgba(15, 118, 110, 0.32);
  }

  .available-missions-page__cta:disabled {
    opacity: 0.74;
    cursor: wait;
  }

  .available-missions-page__helper {
    margin: 0;
    color: rgba(226, 232, 240, 0.86);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.7;
  }

  .available-missions-page__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 22px;
  }

  .available-missions-page__stat {
    padding: 18px;
    border-radius: 24px;
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    box-shadow: var(--shadow-md);
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .available-missions-page__statIcon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 20px;
    flex-shrink: 0;
  }

  .available-missions-page__statLabel {
    margin: 0 0 4px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 800;
  }

  .available-missions-page__statValue {
    margin: 0;
    color: var(--text-primary);
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
  }

  .available-missions-page__shell {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.95fr);
    gap: 20px;
    align-items: start;
  }

  .available-missions-page__panel {
    border-radius: 30px;
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .available-missions-page__panelHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 22px 22px 0;
    flex-wrap: wrap;
  }

  .available-missions-page__panelTitle {
    margin: 0;
    color: var(--text-primary);
    font-size: 20px;
    font-weight: 900;
  }

  .available-missions-page__panelMeta {
    margin: 6px 0 0;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 700;
  }

  .available-missions-page__list {
    display: grid;
    gap: 14px;
    padding: 22px;
  }

  .available-missions-page__card {
    border-radius: 24px;
    border: 1px solid var(--border);
    background: var(--bg-card-2);
    padding: 18px;
    display: grid;
    gap: 16px;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }

  .available-missions-page__card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary);
  }

  .available-missions-page__card.is-active {
    border-color: var(--primary);
    box-shadow: var(--shadow-glow);
  }

  .available-missions-page__cardHead {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .available-missions-page__badgeRow {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .available-missions-page__badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid transparent;
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
  }

  .available-missions-page__badge--easy {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.16);
    color: var(--success);
  }

  .available-missions-page__badge--medium {
    background: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.16);
    color: var(--primary);
  }

  .available-missions-page__badge--hard {
    background: rgba(249, 115, 22, 0.1);
    border-color: rgba(249, 115, 22, 0.16);
    color: #f59e0b;
  }

  .available-missions-page__badge--legend {
    background: rgba(192, 38, 211, 0.1);
    border-color: rgba(192, 38, 211, 0.16);
    color: #d946ef;
  }

  .available-missions-page__badge--muted {
    background: rgba(148, 163, 184, 0.12);
    border-color: rgba(148, 163, 184, 0.2);
    color: var(--text-secondary);
  }

  .available-missions-page__detailBtn {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--bg-card-2);
    color: var(--primary);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
    flex-shrink: 0;
  }

  .available-missions-page__detailBtn:hover:not(:disabled) {
    transform: translateY(-1px);
    background: var(--bg-card);
  }

  .available-missions-page__detailBtn:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .available-missions-page__cardTitle {
    margin: 0;
    color: var(--text-primary);
    font-size: 20px;
    font-weight: 900;
    line-height: 1.45;
  }

  .available-missions-page__cardDesc {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.8;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .available-missions-page__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 800;
  }

  .available-missions-page__metaItem {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .available-missions-page__rewardGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .available-missions-page__rewardCard {
    border-radius: 18px;
    border: 1px solid var(--border);
    padding: 14px 12px;
    text-align: center;
    background: var(--bg-card-2);
  }

  .available-missions-page__rewardValue {
    margin: 0;
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 900;
  }

  .available-missions-page__rewardLabel {
    margin: 6px 0 0;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 800;
  }

  .available-missions-page__ctaRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .available-missions-page__status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
  }

  .available-missions-page__status--ready {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success);
  }

  .available-missions-page__status--locked {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error);
  }

  .available-missions-page__ghostBtn {
    min-height: 38px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-card-2);
    color: var(--primary);
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
  }

  .available-missions-page__detailPanelBody {
    display: grid;
    gap: 18px;
    padding: 22px;
  }

  .available-missions-page__detailHero {
    display: grid;
    gap: 12px;
    padding: 18px;
    border-radius: 24px;
    background: var(--bg-card-2);
    border: 1px solid var(--border);
  }

  .available-missions-page__detailTitle {
    margin: 0;
    color: var(--text-primary);
    font-size: 22px;
    font-weight: 900;
    line-height: 1.5;
  }

  .available-missions-page__detailText {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.9;
  }

  .available-missions-page__detailBadges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .available-missions-page__detailGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .available-missions-page__detailItem {
    padding: 14px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--bg-card-2);
    display: grid;
    gap: 6px;
  }

  .available-missions-page__detailLabel {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 800;
  }

  .available-missions-page__detailValue {
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 900;
    word-break: break-word;
  }

  .available-missions-page__timeline {
    display: grid;
    gap: 10px;
  }

  .available-missions-page__timelineItem {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--bg-card-2);
  }

  .available-missions-page__timelineIcon {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: rgba(37, 99, 235, 0.08);
    color: var(--primary);
    flex-shrink: 0;
  }

  .available-missions-page__placeholder,
  .available-missions-page__empty,
  .available-missions-page__loading {
    padding: 28px 22px;
    text-align: center;
    display: grid;
    gap: 12px;
    justify-items: center;
  }

  .available-missions-page__placeholderIcon,
  .available-missions-page__emptyIcon,
  .available-missions-page__loadingIcon {
    width: 74px;
    height: 74px;
    border-radius: 24px;
    display: grid;
    place-items: center;
    font-size: 28px;
  }

  .available-missions-page__placeholderIcon {
    background: rgba(37, 99, 235, 0.08);
    color: var(--primary);
  }

  .available-missions-page__emptyIcon {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }

  .available-missions-page__loadingIcon {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
  }

  .available-missions-page__placeholderTitle,
  .available-missions-page__emptyTitle {
    margin: 0;
    color: var(--text-primary);
    font-size: 20px;
    font-weight: 900;
  }

  .available-missions-page__placeholderText,
  .available-missions-page__emptyText {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.9;
    max-width: 42ch;
  }

  .available-missions-page__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 0 22px 22px;
    flex-wrap: wrap;
  }

  .available-missions-page__pageBtn {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--bg-card-2);
    color: var(--text-primary);
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .available-missions-page__pageBtn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .available-missions-page__pageIndicator {
    min-height: 42px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-card-2);
    color: var(--text-primary);
    display: inline-flex;
    align-items: center;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 900;
  }

  @media (max-width: 1100px) {
    .available-missions-page__shell {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .available-missions-page__stats {
      grid-template-columns: 1fr;
    }

    .available-missions-page__searchGrid {
      grid-template-columns: 1fr;
    }

    .available-missions-page__detailGrid,
    .available-missions-page__rewardGrid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .available-missions-page__cardHead,
    .available-missions-page__panelHead,
    .available-missions-page__ctaRow {
      align-items: stretch;
    }

    .available-missions-page__detailBtn {
      width: 100%;
      height: 44px;
      border-radius: 14px;
    }

    .available-missions-page__card {
      padding: 16px;
    }

    .available-missions-page__panelHead,
    .available-missions-page__list,
    .available-missions-page__detailPanelBody {
      padding-left: 16px;
      padding-right: 16px;
    }
  }
`;

const unwrapResponse = (payload) => {
  if (payload?.value && typeof payload.value === 'object') return payload.value;
  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) return payload.data;
  if (payload?.result && typeof payload.result === 'object') return payload.result;
  return payload;
};

const normalizeMission = (mission) => {
  const source = unwrapResponse(mission) || {};
  return {
    ...source,
    id: source.id ?? source.missionId ?? source.Id ?? null,
    title: source.title || source.name || 'بدون عنوان',
    description: source.description || source.summary || '',
    requiredLevel: Number(source.requiredLevel ?? source.levelRequired ?? 0) || 0,
    kpReward: Number(source.kpReward ?? source.kp ?? 0) || 0,
    xpReward: Number(source.xpReward ?? source.xp ?? 0) || 0,
    impactReward: Number(source.impactReward ?? source.impact ?? 0) || 0,
    difficulty: source.difficulty ?? source.levelDifficulty ?? source.priority ?? null,
  };
};

const extractAvailableMissions = (response) => {
  const root = unwrapResponse(response);
  const items = root?.items || root?.data || root?.values || (Array.isArray(root) ? root : []);
  const totalCount = root?.totalCount ?? root?.total ?? root?.count ?? (Array.isArray(items) ? items.length : 0);
  const pageNumber = root?.pageNumber ?? root?.currentPage ?? root?.page ?? 1;
  const pageSize = root?.pageSize ?? root?.pageSizeValue ?? (Array.isArray(items) ? items.length : 0);
  const totalPages = root?.totalPages ?? (pageSize ? Math.max(1, Math.ceil(Number(totalCount || 0) / Number(pageSize || 1))) : 1);

  return {
    items: Array.isArray(items) ? items.map(normalizeMission) : [],
    totalCount: Number(totalCount) || 0,
    pageNumber: Number(pageNumber) || 1,
    totalPages: Number(totalPages) || 1,
  };
};

const getDifficultyMeta = (level) => {
  const normalized = typeof level === 'string' ? level.trim().toLowerCase() : Number(level);

  if (normalized === 0 || normalized === 'easy' || normalized === 'سهل') {
    return { label: 'سهل', Icon: FaLeaf, className: 'available-missions-page__badge available-missions-page__badge--easy' };
  }

  if (normalized === 1 || normalized === 'medium' || normalized === 'normal' || normalized === 'متوسط') {
    return { label: 'متوسط', Icon: FaShieldAlt, className: 'available-missions-page__badge available-missions-page__badge--medium' };
  }

  if (normalized === 2 || normalized === 'hard' || normalized === 'صعب') {
    return { label: 'صعب', Icon: FaFire, className: 'available-missions-page__badge available-missions-page__badge--hard' };
  }

  if (normalized === 3 || normalized === 'legendary' || normalized === 'veryhard' || normalized === 'أسطوري') {
    return { label: 'أسطوري', Icon: FaGem, className: 'available-missions-page__badge available-missions-page__badge--legend' };
  }

  return { label: 'غير محدد', Icon: FaTasks, className: 'available-missions-page__badge available-missions-page__badge--muted' };
};

const getLocationLabel = (mission) =>
  mission.locationName ||
  mission.location?.name ||
  mission.location?.Name ||
  mission.locationTitle ||
  mission.city ||
  'الموقع غير محدد';

const getMissionStatus = (mission) => {
  const statusText = String(mission.status ?? '').trim().toLowerCase();
  const isActive =
    mission.isActive !== undefined && mission.isActive !== null
      ? mission.isActive === true || mission.isActive === 'true'
      : statusText === '' || statusText === 'active' || statusText === 'open' || statusText === 'available';
  const isHidden =
    mission.isHidden !== undefined && mission.isHidden !== null
      ? mission.isHidden === true || mission.isHidden === 'true'
      : false;

  return {
    activeLabel: isActive ? 'نشطة' : 'مغلقة',
    visibilityLabel: isHidden ? 'مخفية' : 'عامة',
    isActive,
  };
};

const formatDate = (value) => {
  if (!value) return 'غير متاح';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildTimeline = (mission) =>
  [
    { key: 'createdAt', label: 'تاريخ الإنشاء', value: mission.createdAt, Icon: FaCalendarAlt },
    { key: 'updatedAt', label: 'آخر تحديث', value: mission.updatedAt, Icon: FaClock },
    { key: 'startDate', label: 'تاريخ البدء', value: mission.startDate, Icon: FaPlay },
    { key: 'endDate', label: 'تاريخ الانتهاء', value: mission.endDate, Icon: FaCheckCircle },
  ].filter((item) => item.value);

const StatCard = ({ icon: Icon, label, value, colors }) => (
  <div className="available-missions-page__stat">
    <div className="available-missions-page__statIcon" style={{ background: colors }}>
      <Icon />
    </div>
    <div>
      <p className="available-missions-page__statLabel">{label}</p>
      <p className="available-missions-page__statValue">{value}</p>
    </div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="available-missions-page__detailItem">
    <span className="available-missions-page__detailLabel">{label}</span>
    <strong className="available-missions-page__detailValue">{value}</strong>
  </div>
);

const RewardCard = ({ icon: Icon, label, value, color }) => (
  <div className="available-missions-page__rewardCard">
    <Icon style={{ color, fontSize: 20 }} />
    <p className="available-missions-page__rewardValue">{value || 0}</p>
    <p className="available-missions-page__rewardLabel">{label}</p>
  </div>
);

export default function AvailableMissionsTab() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [detailError, setDetailError] = useState(null);

  const fetchAvailableMissions = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = searchTerm.trim()
        ? await availableMissionsService.searchAvailableMissions(searchTerm.trim(), pageNumber, pageSize)
        : await availableMissionsService.getAvailableMissions(pageNumber, pageSize);

      const normalized = extractAvailableMissions(response);
      setMissions(normalized.items);
      setCurrentPage(normalized.pageNumber || pageNumber);
      setTotalPages(normalized.totalPages || 1);
      setTotalCount(normalized.totalCount);
      setHasLoaded(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'فشل في جلب المهام المتاحة';

      setError(message);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // جلب المهام تلقائياً عند تحميل الصفحة لأول مرة
  React.useEffect(() => {
    fetchAvailableMissions(1);
  }, []);

  const handleLoadButtonClick = async () => {
    const targetPage = 1;
    setCurrentPage(targetPage);
    await fetchAvailableMissions(targetPage);
  };

  const handlePageChange = async (pageNumber) => {
    if (pageNumber === currentPage || pageNumber < 1 || pageNumber > totalPages || loading) {
      return;
    }

    await fetchAvailableMissions(pageNumber);
  };

  const handleShowDetails = async (mission) => {
    if (!mission?.id) return;

    setSelectedMission(mission);
    setDetailError(null);
    setDetailLoadingId(mission.id);

    try {
      const response = await missionsService.getMissionById(mission.id);
      const missionDetails = normalizeMission({ ...mission, ...unwrapResponse(response) });
      setSelectedMission(missionDetails);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'فشل في جلب تفاصيل المهمة';

      setDetailError(message);
    } finally {
      setDetailLoadingId(null);
    }
  };

  const stats = useMemo(() => {
    const readyCount = missions.length;

    const averageLevel = missions.length
      ? Math.round(missions.reduce((sum, mission) => sum + (Number(mission.requiredLevel) || 0), 0) / missions.length)
      : 0;

    return [
      { icon: FaTasks, label: 'عدد العناصر', value: totalCount || missions.length, colors: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
      { icon: FaStar, label: 'متوسط المستوى', value: averageLevel, colors: 'linear-gradient(135deg, #d97706, #f59e0b)' },
      { icon: FaRocket, label: 'جاهزة للعرض', value: readyCount, colors: 'linear-gradient(135deg, #059669, #0f766e)' },
    ];
  }, [missions, totalCount]);

  const selectedDifficulty = selectedMission ? getDifficultyMeta(selectedMission.difficulty) : null;
  const selectedStatus = selectedMission ? getMissionStatus(selectedMission) : null;
  const selectedTimeline = selectedMission ? buildTimeline(selectedMission) : [];

  return (
    <div className="mission-page available-missions-page" dir="rtl">
      <style>{PAGE_CSS}</style>

      <div className="mission-page__container">
        <section className="mission-page__hero available-missions-page__hero">
          <div className="mission-page__heroGroup">
            <div className="mission-page__heroIcon">
              <FaTasks />
            </div>
            <div className="mission-page__heroText">
              <h1 className="mission-page__heroTitle">المهام المتاحة</h1>
              <p className="mission-page__heroSubtitle">
                صفحة موحدة للمستخدم والمتطوع والمتبرع. عند الضغط على زر العرض يتم إرسال التوكن تلقائيًا مع الطلب ثم تظهر العناصر داخل الصفحة.
              </p>
            </div>
          </div>

          <div className="available-missions-page__heroActions">
            <div className="available-missions-page__searchGrid">
              <div className="available-missions-page__inputWrap">
                <FaSearch className="available-missions-page__inputIcon" />
                <input
                  type="text"
                  className="available-missions-page__input"
                  placeholder="ابحث بالعنوان أو الوصف"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="available-missions-page__cta"
              onClick={handleLoadButtonClick}
              disabled={loading}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                {loading ? <FaSpinner className="animate-spin" /> : <FaRocket />}
                <span>{loading ? 'جاري تحميل المهام...' : 'عرض المهام المتاحة'}</span>
              </span>
            </button>

            <p className="available-missions-page__helper">
              أيقونة العين بجوار كل عنصر ترسل التوكن ومعرّف المهمة ثم تعرض التفاصيل داخل الصفحة بنفس أسلوب بطاقات التفاصيل في التطبيق.
            </p>
          </div>
        </section>

        <section className="available-missions-page__stats">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 18px',
                borderRadius: 20,
                border: '1px solid var(--error)',
                background: 'var(--error-light)',
                color: 'var(--error)',
                fontWeight: 800,
              }}
            >
              <FaExclamationTriangle />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="available-missions-page__shell">
          <div className="available-missions-page__panel">
            <div className="available-missions-page__panelHead">
              <div>
                <h2 className="available-missions-page__panelTitle">قائمة المهام</h2>
                <p className="available-missions-page__panelMeta">
                  {hasLoaded ? `تم تحميل ${totalCount || missions.length} عنصر` : 'اضغط زر عرض المهام المتاحة لبدء الجلب'}
                </p>
              </div>

              {hasLoaded && (
                <button
                  type="button"
                  className="available-missions-page__ghostBtn"
                  onClick={handleLoadButtonClick}
                  disabled={loading}
                >
                  تحديث القائمة
                </button>
              )}
            </div>

            {!hasLoaded ? (
              <div className="available-missions-page__placeholder">
                <div className="available-missions-page__placeholderIcon">
                  <FaPlay />
                </div>
                <h3 className="available-missions-page__placeholderTitle">ابدأ بجلب المهام</h3>
                <p className="available-missions-page__placeholderText">
                  القائمة لن تُحمّل تلقائيًا. اضغط زر عرض المهام المتاحة بالأعلى ليتم إرسال التوكن واستلام العناصر من الـ API.
                </p>
              </div>
            ) : loading && missions.length === 0 ? (
              <div className="available-missions-page__loading">
                <div className="available-missions-page__loadingIcon">
                  <FaSpinner className="animate-spin" />
                </div>
                <h3 className="available-missions-page__placeholderTitle">جاري تحميل البيانات</h3>
                <p className="available-missions-page__placeholderText">يتم الآن إرسال الطلب واستقبال عناصر المهام المتاحة.</p>
              </div>
            ) : missions.length === 0 ? (
              <div className="available-missions-page__empty">
                <div className="available-missions-page__emptyIcon">
                  <FaTasks />
                </div>
                <h3 className="available-missions-page__emptyTitle">لا توجد مهام متاحة حاليًا</h3>
                <p className="available-missions-page__emptyText">
                  جرّب تعديل البحث أو مستوى الفلترة، ثم اضغط على عرض المهام المتاحة مرة أخرى.
                </p>
              </div>
            ) : (
              <>
                <div className="available-missions-page__list">
                  {missions.map((mission, index) => {
                    const difficulty = getDifficultyMeta(mission.difficulty);
                    const DifficultyIcon = difficulty.Icon;
                    const readyNow = true;
                    const isDetailLoading = detailLoadingId === mission.id;
                    const isActive = selectedMission?.id === mission.id;

                    return (
                      <motion.article
                        key={mission.id || `${mission.title}-${index}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`available-missions-page__card${isActive ? ' is-active' : ''}`}
                      >
                        <div className="available-missions-page__cardHead">
                          <div className="available-missions-page__badgeRow">
                            <span className={difficulty.className}>
                              <DifficultyIcon />
                              <span>{difficulty.label}</span>
                            </span>
                            <span className="available-missions-page__badge available-missions-page__badge--muted">
                              <FaStar />
                              <span>مستوى {mission.requiredLevel || 0}</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            className="available-missions-page__detailBtn"
                            title="عرض التفاصيل"
                            onClick={() => handleShowDetails(mission)}
                            disabled={isDetailLoading}
                          >
                            {isDetailLoading ? <FaSpinner className="animate-spin" /> : <FaEye />}
                          </button>
                        </div>

                        <div>
                          <h3 className="available-missions-page__cardTitle">{mission.title}</h3>
                          <p className="available-missions-page__cardDesc">
                            {mission.description || 'مهمة متاحة الآن ويمكنك مراجعة تفاصيلها الكاملة من أيقونة العرض.'}
                          </p>
                        </div>

                        <div className="available-missions-page__meta">
                          <span className="available-missions-page__metaItem">
                            <FaMapMarkerAlt />
                            <span>{getLocationLabel(mission)}</span>
                          </span>
                          <span className="available-missions-page__metaItem">
                            <FaCheckCircle />
                            <span>{getMissionStatus(mission).activeLabel}</span>
                          </span>
                        </div>

                        <div className="available-missions-page__rewardGrid">
                          <RewardCard icon={FaTrophy} label="نقاط الخير" value={mission.kpReward} color="#d97706" />
                          <RewardCard icon={FaStar} label="الخبرة" value={mission.xpReward} color="#c026d3" />
                          <RewardCard icon={FaLeaf} label="التأثير" value={mission.impactReward} color="#059669" />
                        </div>

                        <div className="available-missions-page__ctaRow">
                          <span className={`available-missions-page__status ${readyNow ? 'available-missions-page__status--ready' : 'available-missions-page__status--locked'}`}>
                            {readyNow ? <FaCheckCircle /> : <FaLock />}
                            <span>{readyNow ? 'متاحة للعرض الآن' : 'تحتاج مستوى أعلى'}</span>
                          </span>

                          <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 800 }}>
                            #{mission.id || 'N/A'}
                          </span>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="available-missions-page__pagination">
                    <button
                      type="button"
                      className="available-missions-page__pageBtn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <FaArrowRight />
                    </button>

                    <div className="available-missions-page__pageIndicator">
                      صفحة {currentPage} من {totalPages}
                    </div>

                    <button
                      type="button"
                      className="available-missions-page__pageBtn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      <FaArrowLeft />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="available-missions-page__panel">
            <div className="available-missions-page__panelHead">
              <div>
                <h2 className="available-missions-page__panelTitle">تفاصيل المهمة</h2>
                <p className="available-missions-page__panelMeta">
                  {selectedMission ? 'تم تحميل التفاصيل داخل الصفحة' : 'اختر أيقونة التفاصيل من أي عنصر لعرض البيانات الكاملة'}
                </p>
              </div>
            </div>

            {!selectedMission ? (
              <div className="available-missions-page__placeholder">
                <div className="available-missions-page__placeholderIcon">
                  <FaEye />
                </div>
                <h3 className="available-missions-page__placeholderTitle">لا توجد تفاصيل معروضة</h3>
                <p className="available-missions-page__placeholderText">
                  اضغط على أيقونة العين بجوار المهمة المطلوبة، وسيتم إرسال التوكن ومعرّف المهمة ثم عرض التفاصيل هنا.
                </p>
              </div>
            ) : (
              <div className="available-missions-page__detailPanelBody">
                {detailError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '14px 16px',
                      borderRadius: 18,
                      border: '1px solid var(--error)',
                      background: 'var(--error-light)',
                      color: 'var(--error)',
                      fontWeight: 800,
                    }}
                  >
                    <FaExclamationTriangle />
                    <span>{detailError}</span>
                  </div>
                )}

                <div className="available-missions-page__detailHero">
                  <div className="available-missions-page__detailBadges">
                    {selectedDifficulty && (
                      <span className={selectedDifficulty.className}>
                        <selectedDifficulty.Icon />
                        <span>{selectedDifficulty.label}</span>
                      </span>
                    )}
                    {selectedStatus && (
                      <>
                        <span className="available-missions-page__badge available-missions-page__badge--medium">
                          <FaCheckCircle />
                          <span>{selectedStatus.activeLabel}</span>
                        </span>
                        <span className="available-missions-page__badge available-missions-page__badge--muted">
                          <FaEye />
                          <span>{selectedStatus.visibilityLabel}</span>
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="available-missions-page__detailTitle">{selectedMission.title}</h3>
                  <p className="available-missions-page__detailText">
                    {selectedMission.description || 'لا يوجد وصف تفصيلي متاح لهذه المهمة حاليًا.'}
                  </p>
                </div>

                <div className="available-missions-page__detailGrid">
                  <DetailItem label="عنوان المهمة" value={selectedMission.title || 'بدون عنوان'} />
                  <DetailItem label="المستوى المطلوب" value={selectedMission.requiredLevel || 0} />
                  <DetailItem label="الحالة الحالية" value={selectedStatus?.activeLabel || 'غير محدد'} />
                  <DetailItem label="الرؤية" value={selectedStatus?.visibilityLabel || 'غير محدد'} />
                </div>

                <div>
                  <h3 className="available-missions-page__panelTitle" style={{ fontSize: 18 }}>المكافآت</h3>
                  <div className="available-missions-page__rewardGrid" style={{ marginTop: 12 }}>
                    <RewardCard icon={FaTrophy} label="نقاط الخير" value={selectedMission.kpReward} color="#d97706" />
                    <RewardCard icon={FaStar} label="الخبرة" value={selectedMission.xpReward} color="#c026d3" />
                    <RewardCard icon={FaLeaf} label="التأثير" value={selectedMission.impactReward} color="#059669" />
                  </div>
                </div>

                {selectedTimeline.length > 0 && (
                  <div>
                    <h3 className="available-missions-page__panelTitle" style={{ fontSize: 18 }}>الجدول الزمني</h3>
                    <div className="available-missions-page__timeline" style={{ marginTop: 12 }}>
                      {selectedTimeline.map((item) => (
                        <div key={item.key} className="available-missions-page__timelineItem">
                          <div className="available-missions-page__timelineIcon">
                            <item.Icon />
                          </div>
                          <div>
                            <div className="available-missions-page__detailLabel">{item.label}</div>
                            <div className="available-missions-page__detailValue">{formatDate(item.value)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
