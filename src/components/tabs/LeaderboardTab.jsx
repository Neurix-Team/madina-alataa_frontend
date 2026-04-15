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
    color: #0f172a;
  }

  .lb-hero {
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

  .lb-hero__icon {
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
    box-shadow: 0 12px 24px rgba(245,158,11,0.10);
  }

  .lb-hero__title {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .lb-hero__subtitle {
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
  }

  .lb-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .lb-summary-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 20px;
    padding: 18px 16px;
    text-align: center;
    box-shadow: 0 12px 28px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
  }

  .lb-summary-card__icon {
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

  .lb-summary-card__value {
    font-size: 28px;
    line-height: 1;
    font-weight: 900;
    margin-bottom: 4px;
  }

  .lb-summary-card__label {
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
  }

  .lb-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .lb-row {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1.5px solid rgba(226,232,240,0.9);
    border-radius: 18px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 12px 28px rgba(15,23,42,0.04);
    animation: lbPop 0.3s ease-out backwards;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .lb-row:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 34px rgba(15,23,42,0.08);
  }

  .lb-row--me {
    background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%);
    border: 2px solid #60a5fa;
    box-shadow: 0 18px 34px rgba(29,78,216,0.22);
  }

  .lb-rank {
    min-width: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 900;
  }

  .lb-avatar {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    border: 1.5px solid rgba(226,232,240,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
    font-size: 22px;
    flex-shrink: 0;
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
  }

  .lb-row--me .lb-avatar {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.16);
    color: #fff;
  }

  .lb-content {
    flex: 1;
    min-width: 0;
  }

  .lb-name {
    font-size: 14px;
    font-weight: 900;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
  }

  .lb-row--me .lb-name {
    color: #fff;
  }

  .lb-sub {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .lb-row--me .lb-sub {
    color: rgba(255,255,255,0.86);
  }

  .lb-score {
    font-weight: 900;
    font-size: 14px;
    color: #92400e;
    background: #fff7cc;
    padding: 6px 12px;
    border-radius: 999px;
    white-space: nowrap;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .lb-row--me .lb-score {
    background: rgba(255,255,255,0.14);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.16);
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