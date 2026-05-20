import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useGameState from '../../hooks/useGameState';
import {
  FaTrophy,
  FaMedal,
  FaCrown,
  FaStar,
  FaUserCircle,
} from 'react-icons/fa';
import { FiTrendingUp } from 'react-icons/fi';
import leaderboardData from '../../data/leaderboardData';

const CSS = `
  .lb-page {
    direction: rtl;
    display: grid;
    gap: 16px;
    font-family: 'Cairo', sans-serif;
    color: var(--text-primary);
  }

  .lb-hero {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-md);
    text-align: center;
  }

  .lb-hero__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card-2);
    color: #f59e0b;
    font-size: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border);
  }

  .lb-hero__title {
    margin: 0;
    font-size: 24px;
    font-weight: 900;
    color: var(--text-primary);
  }

  .lb-hero__subtitle {
    margin: 8px 0 0;
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 700;
  }

  .lb-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .lb-summary-card {
    background: var(--bg-card-2);
    border-radius: 20px;
    padding: 18px 16px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border);
  }

  .lb-summary-card__icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    font-size: 18px;
    border: 1px solid var(--border);
  }

  .lb-summary-card__value {
    font-size: 28px;
    line-height: 1;
    font-weight: 900;
    margin-bottom: 4px;
  }

  .lb-summary-card__label {
    font-size: 12px;
    font-weight: 800;
    color: var(--text-secondary);
  }

  .lb-list {
    display: grid;
    gap: 12px;
  }

  .lb-row {
    background: var(--bg-card-2);
    border-radius: 18px;
    padding: 14px 20px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: var(--shadow-sm);
    animation: lbPop 0.3s ease-out backwards;
  }

  .lb-row:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .lb-row--me {
    border: 2px solid var(--primary);
    background: rgba(59, 130, 246, 0.05);
    box-shadow: var(--shadow-md);
  }

  .lb-rank {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-weight: 900;
    font-size: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }

  .lb-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid var(--border);
    object-fit: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    background: var(--bg-card);
    color: var(--primary);
  }

  .lb-row--me .lb-avatar {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
  }

  .lb-content {
    flex: 1;
    min-width: 0;
  }

  .lb-name {
    font-size: 15px;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lb-sub {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .lb-score {
    font-size: 18px;
    font-weight: 900;
    color: var(--primary);
    white-space: nowrap;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .lb-row--me .lb-score {
    color: var(--primary);
    font-weight: 900;
  }

  @keyframes lbPop {
    0% { opacity: 0; transform: translateY(10px) scale(0.97); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 700px) {
    .lb-summary {
      grid-template-columns: 1fr;
    }
  }
`;

const RANK_COLOR = ['#f59e0b', '#94a3b8', '#cd7c2f'];

const RankIcon = ({ index }) => {
  if (index === 0) return <FaTrophy />;
  if (index === 1) return <FaMedal />;
  if (index === 2) return <FaMedal />;
  return <span style={{ fontSize: 16 }}>{index + 1}</span>;
};

const LeaderboardTab = () => {
  const { user } = useAuth();
  const { state } = useGameState();
  const userKP = state?.userStats?.kp ?? user?.points ?? user?.kp ?? 0;

  const rows = useMemo(() => {
    return leaderboardData
      .map((p) => ({ ...p, kp: p.isMe ? userKP : p.kp }))
      .sort((a, b) => b.kp - a.kp);
  }, [userKP]);

  const myIndex = rows.findIndex((p) => p.isMe);
  const topScore = rows[0]?.kp ?? 0;

  return (
    <div className="lb-page">
      <style>{CSS}</style>

      <div className="lb-hero">
        <div className="lb-hero__icon">
          <FaTrophy />
        </div>
        <div className="lb-hero__title">لوحة الشرف</div>
        <div className="lb-hero__subtitle">المتطوعون الأكثر عطاءً هذا الأسبوع</div>
      </div>

      <div className="lb-summary">
        <div className="lb-summary-card">
          <div className="lb-summary-card__icon" style={{ color: '#f59e0b' }}>
            <FaTrophy />
          </div>
          <div className="lb-summary-card__value" style={{ color: '#f59e0b' }}>
            {topScore.toLocaleString()}
          </div>
          <div className="lb-summary-card__label">أعلى نقاط</div>
        </div>

        <div className="lb-summary-card">
          <div className="lb-summary-card__icon" style={{ color: '#2563eb' }}>
            <FiTrendingUp />
          </div>
          <div className="lb-summary-card__value" style={{ color: '#2563eb' }}>
            {myIndex >= 0 ? myIndex + 1 : '-'}
          </div>
          <div className="lb-summary-card__label">ترتيبك الحالي</div>
        </div>

        <div className="lb-summary-card">
          <div className="lb-summary-card__icon" style={{ color: '#7c3aed' }}>
            <FaStar />
          </div>
          <div className="lb-summary-card__value" style={{ color: '#7c3aed' }}>
            {userKP.toLocaleString()}
          </div>
          <div className="lb-summary-card__label">نقاطك</div>
        </div>
      </div>

      <div className="lb-list">
        {rows.map((player, i) => (
          <div
            key={player.id}
            className={`lb-row${player.isMe ? ' lb-row--me' : ''}`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div
              className="lb-rank"
              style={{ color: i < 3 ? RANK_COLOR[i] : player.isMe ? '#fff' : '#64748b' }}
            >
              <RankIcon index={i} />
            </div>

            <div className="lb-avatar">
              {player.isMe ? <FaCrown /> : <FaUserCircle />}
            </div>

            <div className="lb-content">
              <div className="lb-name">
                {player.name}
                {player.isMe ? ' (أنت)' : ''}
              </div>
              <div className="lb-sub">
                <FaStar />
                <span>متطوع نشط</span>
              </div>
            </div>

            <div className="lb-score">
              <FaStar />
              <span>{player.kp.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardTab;