import React, { useMemo } from 'react';
import badgesData from '../../data/badgesData';
import BadgesEngine from '../../services/BadgesEngine';

import {
  FaTasks,
  FaDonate,
  FaFire,
  FaGlobe,
  FaAward,
  FaMedal,
  FaTrophy,
  FaStar,
  FaMapMarkedAlt,
  FaUsers,
  FaHeart,
  FaLeaf,
  FaCheckCircle,
  FaLock,
} from 'react-icons/fa';
import {
  FiTrendingUp,
  FiBarChart2,
  FiTarget,
  FiLayers,
} from 'react-icons/fi';

const CSS = `
  .badges-page {
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    color: #0f172a;
    display: grid;
    gap: 14px;
  }

  .badges-hero {
    background:
      radial-gradient(circle at top right, rgba(73,198,242,0.12), transparent 28%),
      radial-gradient(circle at bottom left, rgba(184,140,248,0.10), transparent 24%),
      linear-gradient(135deg, #ffffff 0%, #f8fcff 55%, #faf7ff 100%);
    border-radius: 24px;
    padding: 20px 24px;
    box-shadow: 0 18px 40px rgba(15,23,42,0.06);
    border: 1.5px solid rgba(226,232,240,0.9);
    text-align: center;
  }

  .badges-hero__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fff7cc, #fef3c7);
    color: #b45309;
    font-size: 24px;
    box-shadow: 0 12px 24px rgba(245,158,11,0.08);
  }

  .badges-hero__title {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .badges-hero__subtitle {
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
  }

  .badges-top-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .badges-stat-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 20px;
    padding: 14px 12px;
    box-shadow: 0 12px 28px rgba(15,23,42,0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 98px;
    border: 1.5px solid rgba(226,232,240,0.9);
  }

  .badges-stat-card__icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    font-size: 18px;
  }

  .badges-stat-card__value {
    font-size: 22px;
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 4px;
  }

  .badges-stat-card__label {
    font-size: 11px;
    font-weight: 800;
    color: #64748b;
    text-align: center;
    line-height: 1.35;
  }

  .badges-stat-card--orange .badges-stat-card__value,
  .badges-stat-card--orange .badges-stat-card__icon-wrap {
    color: #f59e0b;
  }

  .badges-stat-card--purple .badges-stat-card__value,
  .badges-stat-card--purple .badges-stat-card__icon-wrap {
    color: #7c3aed;
  }

  .badges-stat-card--blue .badges-stat-card__value,
  .badges-stat-card--blue .badges-stat-card__icon-wrap {
    color: #2563eb;
  }

  .badges-stat-card--green .badges-stat-card__value,
  .badges-stat-card--green .badges-stat-card__icon-wrap {
    color: #059669;
  }

  .badges-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .badges-summary-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 20px;
    padding: 18px 16px;
    text-align: center;
    box-shadow: 0 12px 28px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
  }

  .badges-summary-card__icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    font-size: 18px;
  }

  .badges-summary-card__value {
    font-size: 30px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 4px;
  }

  .badges-summary-card__label {
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
  }

  .badges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }

  .badge-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 18px;
    padding: 20px 14px;
    text-align: center;
    box-shadow: 0 12px 28px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
    animation: badgePop 0.4s ease-out backwards;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .badge-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 34px rgba(15,23,42,0.08);
  }

  .badge-card--earned {
    border-color: rgba(52,211,153,0.9);
  }

  .badge-card--locked {
    opacity: 0.58;
    filter: grayscale(0.45);
  }

  .badge-card__icon-wrap {
    width: 62px;
    height: 62px;
    border-radius: 20px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f7f2ff);
    color: #2563eb;
    border: 1.5px solid rgba(226,232,240,0.9);
    box-shadow: 0 10px 22px rgba(15,23,42,0.04);
    font-size: 28px;
  }

  .badge-card--earned .badge-card__icon-wrap {
    background: linear-gradient(135deg, #fff7cc, #fef3c7);
    color: #b45309;
    border-color: rgba(245,158,11,0.18);
  }

  .badge-card__name {
    font-size: 13px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .badge-card__desc {
    font-size: 10px;
    color: #64748b;
    font-weight: 700;
    line-height: 1.6;
  }

  .badge-card__earned {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #dcfce7;
    color: #166534;
    font-size: 10px;
    font-weight: 900;
    padding: 4px 9px;
    border-radius: 999px;
    margin-top: 8px;
  }

  .badge-card__locked-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f8fafc;
    color: #64748b;
    font-size: 10px;
    font-weight: 900;
    padding: 4px 9px;
    border-radius: 999px;
    margin-top: 8px;
    border: 1px solid rgba(226,232,240,0.9);
  }

  .badge-progress {
    margin-top: 9px;
  }

  .badge-progress__track {
    height: 6px;
    background: rgba(226,232,240,0.9);
    border-radius: 999px;
    overflow: hidden;
  }

  .badge-progress__fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg,#3b82f6,#1d4ed8);
    transition: width 0.8s ease-out;
  }

  .badge-progress__text {
    font-size: 9px;
    color: #64748b;
    font-weight: 700;
    margin-top: 4px;
  }

  @keyframes badgePop {
    0% { opacity: 0; transform: translateY(12px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 700px) {
    .badges-top-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .badges-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .badges-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .badges-stat-card {
      min-height: 86px;
      border-radius: 16px;
      padding: 10px 8px;
    }

    .badges-stat-card__value {
      font-size: 18px;
    }

    .badges-stat-card__label {
      font-size: 10px;
    }

    .badges-summary {
      grid-template-columns: 1fr;
    }
  }
`;

const getBadgeIcon = (badge) => {
  const id = badge?.id?.toLowerCase?.() || '';
  const text = `${badge?.name || ''} ${badge?.desc || ''}`.toLowerCase();

  if (id.includes('daily') || id.includes('task') || text.includes('مهام')) return FaTasks;
  if (id.includes('donat') || text.includes('تبرع')) return FaDonate;
  if (id.includes('streak') || text.includes('سلسلة')) return FaFire;
  if (id.includes('impact') || text.includes('أثر')) return FaGlobe;
  if (id.includes('geo') || text.includes('جغرافي') || text.includes('عالم')) return FaMapMarkedAlt;
  if (id.includes('team') || text.includes('فريق')) return FaUsers;
  if (id.includes('love') || text.includes('عطاء') || text.includes('خدمة')) return FaHeart;
  if (id.includes('green') || text.includes('بيئة')) return FaLeaf;
  if (id.includes('legend') || id.includes('elite')) return FaTrophy;
  if (id.includes('award') || id.includes('medal')) return FaMedal;

  return FaAward;
};

const StatCard = ({ card }) => {
  const Icon = card.icon;
  return (
    <div className={`badges-stat-card badges-stat-card--${card.tone}`}>
      <div className="badges-stat-card__icon-wrap">
        <Icon />
      </div>
      <div className="badges-stat-card__value">{card.value}</div>
      <div className="badges-stat-card__label">{card.label}</div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className="badges-summary-card">
    <div className="badges-summary-card__icon" style={{ color }}>
      <Icon />
    </div>
    <div className="badges-summary-card__value" style={{ color }}>
      {value}
    </div>
    <div className="badges-summary-card__label">{label}</div>
  </div>
);

const BadgesTab = ({ completedQuests = new Set(), userStats = {}, orders = [] }) => {
  const taskDoneCount = parseInt(localStorage.getItem('dt_total_done') || '0', 10);
  const streakCount = parseInt(localStorage.getItem('dt_streak') || '0', 10);
  const donationCount = orders.filter((order) => order?.type === 'DonationOrder').length;
  const impactScore = userStats.impactScore ?? 0;

  const earnedBadgeIds = useMemo(
    () => BadgesEngine.computeEarnedBadges(completedQuests, userStats, orders),
    [completedQuests, userStats, orders]
  );

  const badges = useMemo(
    () => badgesData.map((b) => ({ ...b, earned: earnedBadgeIds.has(b.id) })),
    [earnedBadgeIds]
  );

  const earnedCount = badges.filter((b) => b.earned).length;
  const totalCount = badges.length;
  const inProgressCount = totalCount - earnedCount;
  const overallProgress = totalCount ? Math.round((earnedCount / totalCount) * 100) : 0;

  const statCards = [
    { id: 'tasks', label: 'مهام مكتملة', value: taskDoneCount, icon: FaTasks, tone: 'blue' },
    { id: 'donations', label: 'تبرعات', value: donationCount, icon: FaDonate, tone: 'green' },
    { id: 'streak', label: 'سلسلة متتالية', value: streakCount, icon: FaFire, tone: 'orange' },
    { id: 'impact', label: 'درجة الأثر', value: impactScore, icon: FaGlobe, tone: 'purple' },
  ];

  return (
    <div className="badges-page">
      <style>{CSS}</style>

      <div className="badges-hero">
        <div className="badges-hero__icon">
          <FaTrophy />
        </div>
        <div className="badges-hero__title">الإنجازات والأوسمة</div>
        <div className="badges-hero__subtitle">
          تابع تقدمك واجمع الشارات والإنجازات الخاصة بك
        </div>
      </div>

      <div className="badges-top-stats">
        {statCards.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </div>

      <div className="badges-summary">
        <SummaryCard
          icon={FaCheckCircle}
          label="محصّلة"
          value={earnedCount}
          color="#10b981"
        />

        <SummaryCard
          icon={FiLayers}
          label="قيد التقدم"
          value={inProgressCount}
          color="#7c3aed"
        />

        <SummaryCard
          icon={FiTrendingUp}
          label="التقدم الكلي"
          value={`${overallProgress}%`}
          color="#2563eb"
        />
      </div>

      <div className="badges-grid">
        {badges.map((badge, i) => {
          const progress = BadgesEngine.getBadgeProgress(badge.id, completedQuests, userStats);
          const BadgeIcon = getBadgeIcon(badge);

          return (
            <div
              key={badge.id}
              className={`badge-card ${badge.earned ? 'badge-card--earned' : 'badge-card--locked'}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="badge-card__icon-wrap">
                <BadgeIcon />
              </div>

              <div className="badge-card__name">{badge.name}</div>
              <div className="badge-card__desc">{badge.desc}</div>

              {!badge.earned && progress.target > 1 && (
                <div className="badge-progress">
                  <div className="badge-progress__track">
                    <div
                      className="badge-progress__fill"
                      style={{ width: `${progress.pct}%` }}
                    />
                  </div>
                  <div className="badge-progress__text">
                    {progress.current} / {progress.target}
                  </div>
                </div>
              )}

              {badge.earned ? (
                <span className="badge-card__earned">
                  <FaCheckCircle />
                  <span>محققة</span>
                </span>
              ) : (
                <span className="badge-card__locked-badge">
                  <FaLock />
                  <span>غير مكتملة</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesTab;