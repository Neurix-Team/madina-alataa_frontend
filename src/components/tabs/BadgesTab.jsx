// src/components/tabs/BadgesTab.jsx
import React, { useMemo } from 'react';
import badgesData from '../../data/badgesData';
import BadgesEngine from '../../services/BadgesEngine';

const CSS = `
  .badges-page {
    direction: rtl;
  }

  .badges-top-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .badges-stat-card {
    background: var(--bg-card);
    border-radius: 18px;
    padding: 12px 10px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 92px;
    border: 1px solid var(--border);
  }

  .badges-stat-card__icon {
    font-size: 20px;
    margin-bottom: 4px;
    line-height: 1;
  }

  .badges-stat-card__value {
    font-size: 20px;
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

  .badges-stat-card--orange .badges-stat-card__value { color: #f59e0b; }
  .badges-stat-card--purple .badges-stat-card__value { color: #7c3aed; }
  .badges-stat-card--blue .badges-stat-card__value { color: #2563eb; }
  .badges-stat-card--green .badges-stat-card__value { color: #059669; }

  .badges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 14px;
  }

  @media (max-width: 700px) {
    .badges-top-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
  }

  @media (max-width: 480px) {
    .badges-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .badges-stat-card {
      min-height: 86px;
      border-radius: 16px;
      padding: 10px 8px;
    }
    .badges-stat-card__value { font-size: 18px; }
    .badges-stat-card__label { font-size: 10px; }
  }
`;

const BadgesTab = ({ completedQuests = new Set(), userStats = {}, orders = [] }) => {
  const taskDoneCount = parseInt(localStorage.getItem('dt_total_done') || '0', 10);
  const streakCount = parseInt(localStorage.getItem('dt_streak') || '0', 10);
  const donationCount = orders.filter((order) => order?.type === 'DonationOrder').length;
  const impactScore = userStats.impactScore ?? 0;

  // Compute earned badges dynamically via BadgesEngine
  const earnedBadgeIds = useMemo(
    () => BadgesEngine.computeEarnedBadges(completedQuests, userStats, orders),
    [completedQuests, userStats, orders]
  );

  // Merge static badge data with dynamic earned status
  const badges = useMemo(
    () => badgesData.map((b) => ({ ...b, earned: earnedBadgeIds.has(b.id) })),
    [earnedBadgeIds]
  );

  const earnedCount     = badges.filter((b) => b.earned).length;
  const totalCount      = badges.length;
  const inProgressCount = totalCount - earnedCount;
  const overallProgress = totalCount ? Math.round((earnedCount / totalCount) * 100) : 0;

  const statCards = [
    { id: 'tasks',      label: 'مهام مكتملة',       value: taskDoneCount,   icon: '✅', tone: 'blue'   },
    { id: 'donations',  label: 'تبرعات',            value: donationCount,   icon: '🤝', tone: 'green'  },
    { id: 'streak',     label: 'سلسلة متتالية',      value: streakCount,     icon: '🔥', tone: 'orange' },
    { id: 'impact',     label: 'درجة الأثر',         value: impactScore,     icon: '🌍', tone: 'purple' },
  ];

  return (
    <div className="badges-page">
      <style>{CSS}</style>

      <div style={{ background:'var(--bg-card)', borderRadius:22, padding:'18px 24px', marginBottom:14, boxShadow:'var(--shadow-md)', textAlign:'center', direction:'rtl', border:'1.5px solid var(--border)' }}>
        <h2 style={{ fontSize:24, fontWeight:900, color:'var(--text-primary)', marginBottom:4 }}>🏆 الإنجازات والأوسمة</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:600 }}>تابع تقدمك واجمع الشارات والإنجازات</p>
      </div>

      <div className="badges-top-stats">
        {statCards.map((card) => (
          <div key={card.id} className={`badges-stat-card badges-stat-card--${card.tone}`}>
            <div className="badges-stat-card__icon">{card.icon}</div>
            <div className="badges-stat-card__value">{card.value}</div>
            <div className="badges-stat-card__label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="badges-grid">
        {badges.map((badge, i) => {
          const progress = BadgesEngine.getBadgeProgress(badge.id, completedQuests, userStats);
          return (
            <div key={badge.id} style={{
              background:'var(--bg-card)', borderRadius:18, padding:'20px 14px',
              textAlign:'center', boxShadow:'var(--shadow-sm)',
              border: badge.earned ? '1.5px solid #34d399' : '1.5px solid var(--border)',
              opacity: badge.earned ? 1 : 0.55,
              filter:  badge.earned ? 'none' : 'grayscale(0.6)',
              animation:'popIn 0.4s ease-out backwards',
              animationDelay:`${i * 0.06}s`,
              direction:'rtl', transition:'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}
            >
              <span style={{ fontSize:40, display:'block', marginBottom:8 }}>{badge.icon}</span>
              <div style={{ fontSize:13, fontWeight:900, color:'var(--text-primary)', marginBottom:3 }}>{badge.name}</div>
              <div style={{ fontSize:10, color:'var(--text-secondary)', fontWeight:600 }}>{badge.desc}</div>

              {/* Progress bar for unearned badges */}
              {!badge.earned && progress.target > 1 && (
                <div style={{ marginTop:8 }}>
                  <div style={{ height:5, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{
                      height:'100%',
                      width:`${progress.pct}%`,
                      background:'linear-gradient(90deg,#3b82f6,#1d4ed8)',
                      borderRadius:99,
                      transition:'width 0.8s ease-out',
                    }} />
                  </div>
                  <div style={{ fontSize:9, color:'var(--text-secondary)', fontWeight:700, marginTop:3 }}>
                    {progress.current} / {progress.target}
                  </div>
                </div>
              )}

              {badge.earned && (
                <span style={{ display:'inline-block', background:'#dcfce7', color:'#166534', fontSize:9, fontWeight:900, padding:'2px 8px', borderRadius:99, marginTop:6 }}>
                  ✅ محققة
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
