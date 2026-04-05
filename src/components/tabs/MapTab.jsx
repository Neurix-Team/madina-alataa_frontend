// src/components/tabs/MapTab.jsx
/**
 * MapTab — Shows all quest zones as interactive cards.
 * Tapping a zone opens the ZoneDetailModal.
 */
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import zonesData from '../../data/zonesData';
import AudioManager from '../../services/AudioManager';

const COLOR_MAP = {
  rose:    { bg: '#fff1f2', border: '#fda4af', badge: '#be123c' },
  purple:  { bg: '#faf5ff', border: '#d8b4fe', badge: '#7e22ce' },
  amber:   { bg: '#fffbeb', border: '#fcd34d', badge: '#b45309' },
  sky:     { bg: '#f0f9ff', border: '#7dd3fc', badge: '#0369a1' },
  indigo:  { bg: '#eef2ff', border: '#a5b4fc', badge: '#4338ca' },
  emerald: { bg: '#f0fdf4', border: '#6ee7b7', badge: '#065f46' },
  red:     { bg: '#fff5f5', border: '#fca5a5', badge: '#b91c1c' },
  orange:  { bg: '#fff7ed', border: '#fdba74', badge: '#c2410c' },
};

const ZoneCard = memo(({ zone, completedQuests, onOpenZone }) => {
  const colors   = COLOR_MAP[zone.color] ?? COLOR_MAP.sky;
  const total    = zone.quests.length;
  const done     = zone.quests.filter((q) => completedQuests.has(q.id)).length;
  const pct      = total ? Math.round((done / total) * 100) : 0;
  const allDone  = done === total;

  return (
    <div
      onClick={() => { AudioManager.getInstance().play('open'); onOpenZone(zone); }}
      style={{
        background: colors.bg,
        border: `2px solid ${allDone ? '#86efac' : colors.border}`,
        borderRadius: 20,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: '0 3px 12px rgba(0,0,0,0.07)',
        direction: 'rtl',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.07)'; }}
    >
      {allDone && (
        <div style={{ position: 'absolute', top: 10, left: 12, background: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 99 }}>
          ✅ مكتمل
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, border: `2px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          {zone.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 2 }}>{zone.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{zone.desc}</div>
        </div>
        <div style={{
          background: colors.badge, color: '#fff',
          borderRadius: 99, padding: '4px 12px',
          fontSize: 11, fontWeight: 900, flexShrink: 0,
        }}>
          {done}/{total} مهمة
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 7, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.max(pct, pct > 0 ? 6 : 0)}%`,
          background: allDone
            ? 'linear-gradient(90deg,#34d399,#10b981)'
            : `linear-gradient(90deg,${colors.border},${colors.badge})`,
          borderRadius: 99,
          transition: 'width 0.8s ease-out',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>التقدم</span>
        <span style={{ fontSize: 10, fontWeight: 900, color: colors.badge }}>{pct}%</span>
      </div>
    </div>
  );
});

const MapTab = ({ completedQuests, onOpenZone }) => {
  const navigate = useNavigate();
  const totalQuests = zonesData.reduce((s, z) => s + z.quests.length, 0);
  const doneQuests  = zonesData.reduce((s, z) => s + z.quests.filter((q) => completedQuests.has(q.id)).length, 0);

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 22, padding: '18px 24px',
        marginBottom: 16, boxShadow: 'var(--shadow-md)',
        textAlign: 'center', direction: 'rtl',
        border: '1.5px solid var(--border)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 0 }}>🗺️ خريطة المهام</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: '🗺️ الخريطة', path: '/map' },
                { label: '📋 الحالات', path: '/cases' },
                { label: '👤 بروفايل', path: '/profile-v2' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    border: '1.5px solid #93c5fd',
                    background: item.path === '/map'
                      ? 'linear-gradient(135deg,#1d4ed8,#2563eb)'
                      : 'rgba(37,99,235,0.08)',
                    color: item.path === '/map' ? '#ffffff' : '#1e3a8a',
                    borderRadius: 999,
                    padding: '7px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: item.path === '/map' ? '0 6px 14px rgba(37,99,235,0.34)' : 'none',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      
        {/* Overall progress */}
        <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginTop: 10 }}>
          <div style={{
            height: '100%',
            width: `${totalQuests ? Math.round((doneQuests / totalQuests) * 100) : 0}%`,
            background: 'linear-gradient(90deg,#38bdf8,#1d6ed8)',
            borderRadius: 99, transition: 'width 1s ease-out',
          }} />
        </div>
      </div>

      {/* Zone cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {zonesData.map((zone) => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            completedQuests={completedQuests}
            onOpenZone={onOpenZone}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(MapTab);
