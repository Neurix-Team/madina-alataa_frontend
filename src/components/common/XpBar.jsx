// src/components/common/XpBar.jsx

import GameEngine from '../../services/GameEngine';

const XpBar = ({ userStats }) => {
  const pct = GameEngine.xpPercent(userStats.xp, userStats.xpNeeded);
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 16,
      padding: '12px 20px',
      marginBottom: 16,
      boxShadow: 'var(--shadow-sm)',
      border: '1.5px solid var(--border)',
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-primary)' }}>⚡ تقدم المستوى</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
          {userStats.xp} / {userStats.xpNeeded} XP
        </span>
      </div>
      <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg,#fbbf24,#f59e0b)',
          borderRadius: 99,
          transition: 'width 0.8s ease-out',
        }} />
      </div>
    </div>
  );
};

export default XpBar;