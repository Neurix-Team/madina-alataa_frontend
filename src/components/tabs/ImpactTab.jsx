import React from 'react';
import { useTranslation } from 'react-i18next';
import JellyButton from '../common/JellyButton';
import { beneficiariesData } from '../../data/beneficiariesData';
import useGameState from '../../hooks/useGameState';

import {
  FaChartLine,
  FaCheckCircle,
  FaLayerGroup,
  FaHandHoldingHeart,
  FaGlobe,
  FaUsers,
  FaHeart,
  FaDonate,
  FaShieldAlt,
  FaArrowUp,
  FaUserFriends,
} from 'react-icons/fa';

import {
  FiTrendingUp,
  FiBarChart2,
  FiHeart,
} from 'react-icons/fi';

const CSS = `
  .impact-tab {
    direction: rtl;
    display: grid;
    gap: 18px;
    font-family: 'Cairo', sans-serif;
    color: #0f172a;
  }

  .impact-home-top-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
  }

  .impact-home-card {
    border-radius: 22px;
    padding: 16px 16px 14px;
    color: #fff;
    min-height: 104px;
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.10);
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.10);
  }

  .impact-home-card::before {
    content: '';
    position: absolute;
    top: -32px;
    left: -26px;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: rgba(255,255,255,0.10);
  }

  .impact-home-card::after {
    content: '';
    position: absolute;
    bottom: -34px;
    right: -18px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }

  .impact-home-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 900;
    opacity: 0.96;
    position: relative;
    z-index: 1;
  }

  .impact-home-card__head-left {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .impact-home-card__head-icon {
    font-size: 13px;
  }

  .impact-home-card__label {
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 8px;
    position: relative;
    z-index: 1;
  }

  .impact-home-card__value {
    font-size: 30px;
    font-weight: 900;
    line-height: 1;
    position: relative;
    z-index: 1;
    letter-spacing: 0.3px;
  }

  .impact-home-card--blue {
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%);
  }

  .impact-home-card--green {
    background: linear-gradient(135deg, #047857 0%, #059669 55%, #10b981 100%);
  }

  .impact-home-card--purple {
    background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 55%, #8b5cf6 100%);
  }

  .impact-home-card--orange {
    background: linear-gradient(135deg, #d97706 0%, #f59e0b 55%, #fbbf24 100%);
  }

  .impact-hero {
    background:
      radial-gradient(circle at top right, rgba(73,198,242,0.10), transparent 26%),
      radial-gradient(circle at bottom left, rgba(184,140,248,0.08), transparent 24%),
      linear-gradient(135deg, #ffffff 0%, #f8fcff 55%, #faf7ff 100%);
    border-radius: 24px;
    padding: 20px 24px;
    box-shadow: 0 18px 40px rgba(15,23,42,0.06);
    border: 1.5px solid rgba(226,232,240,0.9);
    text-align: center;
  }

  .impact-hero__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #2563eb;
    box-shadow: 0 12px 24px rgba(59,130,246,0.08);
    font-size: 24px;
  }

  .impact-hero__title {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .impact-hero__subtitle {
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
  }

  .impact-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .impact-stat-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 20px;
    padding: 18px 16px;
    text-align: center;
    box-shadow: 0 12px 28px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
    animation: impactPopIn 0.4s ease-out backwards;
    direction: rtl;
  }

  .impact-stat-card__icon {
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

  .impact-stat-card__value {
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 4px;
    line-height: 1;
  }

  .impact-stat-card__label {
    font-size: 12px;
    color: #64748b;
    font-weight: 800;
  }

  .impact-panel {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 22px;
    padding: 22px 24px;
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
    direction: rtl;
  }

  .impact-panel__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 17px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 6px;
  }

  .impact-panel__title-icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f7f2ff);
    color: #2563eb;
    border: 1px solid rgba(186,230,253,0.9);
    font-size: 14px;
  }

  .impact-panel__subtitle {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
    margin-bottom: 14px;
  }

  .impact-progress-row {
    margin-bottom: 14px;
  }

  .impact-progress-row:last-child {
    margin-bottom: 0;
  }

  .impact-progress-row__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    gap: 10px;
  }

  .impact-progress-row__label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
  }

  .impact-progress-row__label-icon {
    font-size: 13px;
    color: #64748b;
  }

  .impact-progress-row__count {
    font-size: 12px;
    font-weight: 900;
    color: #64748b;
  }

  .impact-progress-row__track {
    height: 10px;
    background: rgba(226,232,240,0.9);
    border-radius: 999px;
    overflow: hidden;
  }

  .impact-progress-row__fill {
    height: 100%;
    border-radius: 999px;
    transition: width 1s ease-out;
  }

  .impact-beneficiary-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(226,232,240,0.9);
  }

  .impact-beneficiary-item:last-child {
    border-bottom: none;
  }

  .impact-beneficiary-item__icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #2563eb;
    border: 1px solid rgba(186,230,253,0.9);
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    font-size: 18px;
  }

  .impact-beneficiary-item__body {
    flex: 1;
    min-width: 0;
  }

  .impact-beneficiary-item__name {
    font-size: 13px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 3px;
  }

  .impact-beneficiary-item__meta {
    font-size: 10px;
    color: #64748b;
    font-weight: 700;
    margin-top: 4px;
  }

  .impact-beneficiary-item__badge {
    font-size: 10px;
    font-weight: 900;
    padding: 4px 9px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .impact-donate-card {
    background:
      radial-gradient(circle at top right, rgba(16,185,129,0.10), transparent 25%),
      linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
    border-radius: 22px;
    padding: 22px 24px;
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(187,247,208,0.9);
    direction: rtl;
    text-align: center;
  }

  .impact-donate-card__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dcfce7, #ecfdf5);
    color: #059669;
    box-shadow: 0 12px 24px rgba(16,185,129,0.08);
    font-size: 24px;
  }

  .impact-donate-card__title {
    font-size: 18px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .impact-donate-card__text {
    font-size: 13px;
    color: #64748b;
    font-weight: 700;
    margin-bottom: 14px;
  }

  @keyframes impactPopIn {
    0% { opacity: 0; transform: translateY(14px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 900px) {
    .impact-home-top-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .impact-stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .impact-home-top-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .impact-home-card {
      min-height: 90px;
      border-radius: 18px;
      padding: 12px 12px 10px;
    }

    .impact-home-card__label {
      font-size: 11px;
      margin-bottom: 4px;
    }

    .impact-home-card__value {
      font-size: 24px;
    }

    .impact-stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .impact-hero__title {
      font-size: 21px;
    }
  }

  @media (max-width: 360px) {
    .impact-stat-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const urgencyMap = {
  critical: { label: 'حرج', color: '#b91c1c', bg: '#b91c1c18' },
  high: { label: 'عالي', color: '#d97706', bg: '#d9770618' },
  medium: { label: 'متوسط', color: '#1d4ed8', bg: '#1d4ed818' },
  low: { label: 'منخفض', color: '#15803d', bg: '#15803d18' },
};

const ProgressBar = ({ label, value, count, color, icon: Icon }) => (
  <div className="impact-progress-row">
    <div className="impact-progress-row__top">
      <span className="impact-progress-row__label">
        {Icon && <Icon className="impact-progress-row__label-icon" />}
        <span>{label}</span>
      </span>
      <span className="impact-progress-row__count">{count}</span>
    </div>

    <div className="impact-progress-row__track">
      <div
        className="impact-progress-row__fill"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  </div>
);

const StatMiniCard = ({ number, label, color, delay, icon: Icon }) => (
  <div className="impact-stat-card" style={{ animationDelay: `${delay}s` }}>
    <div className="impact-stat-card__icon" style={{ color }}>
      <Icon />
    </div>
    <div className="impact-stat-card__value" style={{ color }}>
      {number}
    </div>
    <div className="impact-stat-card__label">{label}</div>
  </div>
);

const ImpactTab = () => {
  const { t } = useTranslation();
  const { state, actions } = useGameState();
  const { userStats, completedQuests = new Set() } = state;
  const { handleDonate } = actions;

  const completedCount = completedQuests.size || 0;
  const helpedCount = Math.floor((userStats?.kp || 0) / 50);
  const levelNow = Math.max(1, Math.floor((userStats?.impactScore || 0) / 100));
  const currentWeekGive = Math.floor((userStats?.kp || 0) / 10);
  const nextLevelTarget = (levelNow + 1) * 100;
  const levelProgress = userStats?.impactScore || 0;

  const topCards = [
    {
      head: t('impact.impact'),
      side: t('impact.total'),
      icon: FaChartLine,
      label: t('impact.impact_score'),
      value: (userStats?.impactScore || 0).toLocaleString(),
      className: 'impact-home-card impact-home-card--blue',
    },
    {
      head: t('impact.achievement'),
      side: t('impact.monthly'),
      icon: FaCheckCircle,
      label: t('impact.completed_missions'),
      value: completedCount,
      className: 'impact-home-card impact-home-card--green',
    },
    {
      head: t('impact.level'),
      side: t('impact.current'),
      icon: FaLayerGroup,
      label: t('impact.current_level'),
      value: levelNow,
      className: 'impact-home-card impact-home-card--purple',
    },
    {
      head: t('impact.giving'),
      side: t('impact.this_week'),
      icon: FaHandHoldingHeart,
      label: t('impact.giving_points'),
      value: currentWeekGive,
      className: 'impact-home-card impact-home-card--orange',
    },
  ];

  const summaryCards = [
    {
      number: completedCount,
      label: t('impact.completed_missions'),
      color: '#3ba2f8',
      delay: 0,
      icon: FaCheckCircle,
    },
    {
      number: userStats?.impactScore || 0,
      label: t('impact.impact_score'),
      color: '#10b981',
      delay: 0.1,
      icon: FiTrendingUp,
    },
    {
      number: helpedCount,
      label: t('impact.people_helped'),
      color: '#f59e0b',
      delay: 0.2,
      icon: FaUsers,
    },
  ];

  const levelPercent = Math.min(
    100,
    Math.round((levelProgress / nextLevelTarget) * 100)
  );

  return (
    <div className="impact-tab">
      <style>{CSS}</style>

      <div className="impact-home-top-grid">
        {topCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={card.className}>
              <div className="impact-home-card__head">
                <span className="impact-home-card__head-left">
                  <Icon className="impact-home-card__head-icon" />
                  <span>{card.head}</span>
                </span>
                <span>{card.side}</span>
              </div>

              <div className="impact-home-card__label">{card.label}</div>
              <div className="impact-home-card__value">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="impact-hero">
        <div className="impact-hero__icon">
          <FaGlobe />
        </div>
        <div className="impact-hero__title">{t('impact.real_impact')}</div>
        <div className="impact-hero__subtitle">
          {t('impact.real_impact_desc')}
        </div>
      </div>

      <div className="impact-stat-grid">
        {summaryCards.map((card, i) => (
          <StatMiniCard
            key={i}
            number={card.number}
            label={card.label}
            color={card.color}
            delay={card.delay}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="impact-panel">
        <div className="impact-panel__title">
          <span className="impact-panel__title-icon">
            <FiBarChart2 />
          </span>
          <span>{t('impact.impact_details')}</span>
        </div>

        <div className="impact-panel__subtitle">
          {t('impact.impact_distribution')}
        </div>

        <ProgressBar
          label={t('impact.elderly_support')}
          count={t('impact.missions_plural', { count: 12 })}
          value={80}
          color="linear-gradient(90deg,#f87171,#ef4444)"
          icon={FaHeart}
        />

        <ProgressBar
          label={t('impact.orphan_support')}
          count={t('impact.missions_plural', { count: 7 })}
          value={55}
          color="linear-gradient(90deg,#c084fc,#a855f7)"
          icon={FaUserFriends}
        />

        <ProgressBar
          label={t('impact.neighborhood_service')}
          count={t('impact.missions_plural', { count: 18 })}
          value={90}
          color="linear-gradient(90deg,#38bdf8,#1d6ed8)"
          icon={FaShieldAlt}
        />

        <ProgressBar
          label={t('impact.environmental_work')}
          count={t('impact.missions_plural', { count: 5 })}
          value={40}
          color="linear-gradient(90deg,#4ade80,#16a34a)"
          icon={FaGlobe}
        />

        <ProgressBar
          label="التقدم نحو المستوى التالي"
          count={`${levelProgress} / ${nextLevelTarget} XP`}
          value={levelPercent}
          color="linear-gradient(90deg,#8b5cf6,#6d28d9)"
          icon={FaArrowUp}
        />
      </div>

      <div className="impact-panel">
        <div className="impact-panel__title">
          <span className="impact-panel__title-icon">
            <FaUsers />
          </span>
          <span>المستفيدون من عطائك</span>
        </div>

        <div className="impact-panel__subtitle">
          هؤلاء هم من يستفيدون من مساهماتك في المجتمع
        </div>

        {beneficiariesData.slice(0, 5).map((ben) => {
          const helped = ben.helpedCount ?? 0;
          const needs = ben.needsCount ?? 1;
          const pct = Math.min(100, Math.round((helped / needs) * 100));
          const urgency = urgencyMap[ben.urgency] || urgencyMap.medium;

          return (
            <div key={ben.id} className="impact-beneficiary-item">
              <span className="impact-beneficiary-item__icon">
                <FiHeart />
              </span>

              <div className="impact-beneficiary-item__body">
                <div className="impact-beneficiary-item__name">{ben.name}</div>

                <div
                  style={{
                    height: 7,
                    background: 'rgba(226,232,240,0.9)',
                    borderRadius: 999,
                    overflow: 'hidden',
                    marginBottom: 2,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background:
                        pct >= 80
                          ? 'linear-gradient(90deg,#34d399,#10b981)'
                          : 'linear-gradient(90deg,#3b82f6,#1d4ed8)',
                      borderRadius: 999,
                      transition: 'width 0.8s ease-out',
                    }}
                  />
                </div>

                <div className="impact-beneficiary-item__meta">
                  {helped} / {needs} احتياج مُلبّى ({pct}%)
                </div>
              </div>

              <span
                className="impact-beneficiary-item__badge"
                style={{
                  background: urgency.bg,
                  color: urgency.color,
                }}
              >
                {urgency.label}
              </span>
            </div>
          );
        })}

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 800 }}>
            + {Math.max(0, beneficiariesData.length - 5)} مستفيد آخر في قائمة الانتظار
          </span>
        </div>
      </div>

      {userStats?.kp >= 50 && (
        <div className="impact-donate-card">
          <div className="impact-donate-card__icon">
            <FaDonate />
          </div>

          <div className="impact-donate-card__title">تبرع بنقاطك</div>

          <div className="impact-donate-card__text">
            حوّل نقاط العطاء إلى أثر واقعي داخل مجتمعك وادعم الحالات الأكثر احتياجًا
          </div>

          <JellyButton
            variant="success"
            size="md"
            sound="reward"
            onClick={() => handleDonate?.(50)}
          >
            تبرع بـ 50 KP
          </JellyButton>
        </div>
      )}
    </div>
  );
};

export default ImpactTab;