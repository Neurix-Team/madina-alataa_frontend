import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import CityBuilderService from '../../services/CityBuilderService';
import AudioManager       from '../../services/AudioManager';
import { caseMarkers, hospitalMarkers, CITIES } from '../../data/mapLocations';

const CITY_W = 800;
const CITY_H = 300;
const ALL_MARKERS = [...caseMarkers, ...hospitalMarkers];

const SvgBuilding = memo(({ b, onClick }) => {
  if (b.type === 'road') {
    return <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} rx={2} />;
  }
  const iconSize = Math.min(b.w, b.h) * 0.42;
  return (
    <g className={`city-building city-building--${b.built ? 'unlocked' : 'locked'}`} onClick={() => onClick(b)}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h}
        fill={b.built ? b.color : '#cbd5e1'} rx={6}
        stroke={b.built ? b.color + '99' : '#94a3b8'} strokeWidth={2}
      />
      <text x={b.x + b.w / 2} y={b.y + b.h / 2 + iconSize * 0.35}
        textAnchor="middle" fontSize={iconSize} style={{ pointerEvents: 'none' }}>
        {b.built ? b.emoji : '🔒'}
      </text>
    </g>
  );
});

const BuildingTooltip = memo(({ b, onClose }) => (
  <>
    <div className="city-overlay" onClick={onClose} />
    <div className="city-tooltip">
      <button className="city-tooltip__close" onClick={onClose}>✕</button>
      <div className="city-tooltip__emoji">{b.emoji || '🏗️'}</div>
      <h3 className="city-tooltip__title">{b.label}</h3>
      {b.built
        ? <span className="city-tooltip__badge city-tooltip__badge--built">✅ تم بناؤه!</span>
        : <p className="city-tooltip__locked">🔒 أكمل المهمة المرتبطة لفتح هذا المبنى</p>
      }
    </div>
  </>
));

import useGameState from '../../hooks/useGameState';

const CityMapTab = () => {
  const { state } = useGameState();
  const { completedQuests = new Set() } = state;
  const svc = CityBuilderService.getInstance();

  const [buildings, setBuildings] = useState(() => {
    svc.syncCompleted(completedQuests ?? new Set());
    return svc.getSlots();
  });
  const [selected, setSelected] = useState(null);
  const [cityFocus, setCityFocus] = useState('all');

  const focusedMarkers = useMemo(() => ALL_MARKERS.filter((marker) => cityFocus === 'all' || marker.city === cityFocus), [cityFocus]);
  const focusClusters = useMemo(() => ({
    cases: focusedMarkers.filter((marker) => marker.type === 'case').length,
    hospitals: focusedMarkers.filter((marker) => marker.type === 'hospital').length,
    cities: new Set(focusedMarkers.map((marker) => marker.city)).size,
  }), [focusedMarkers]);
  const cityGroups = useMemo(() => CITIES.map((city) => ({
    city,
    count: ALL_MARKERS.filter((marker) => marker.city === city).length,
  })), []);

  useEffect(() => {
    svc.syncCompleted(completedQuests ?? new Set());
    setBuildings([...svc.getSlots()]);
  }, [completedQuests]);

  const progress      = svc.getCityProgress();
  const questBuildings = buildings.filter((b) => b.questId !== null);
  const builtCount    = questBuildings.filter((b) => b.built).length;
  const totalCount    = questBuildings.length;
  const cityLevel     = Math.max(1, Math.floor(progress / 20) + 1);

  const handleClick = useCallback((b) => {
    AudioManager.getInstance().play('click');
    setSelected(b);
  }, []);

  return (
    <div className="city-tab">

      {/* Header */}
      <div className="city-header">
        <div>
          <h2 className="city-header__title">🏙️ مدينتي</h2>
          <p className="city-header__subtitle">كل مهمة تبني مبنى جديداً في مدينتك!</p>
        </div>
        <div className="city-header__stats">
          <div className="city-stat">
            <span className="city-stat__value">{builtCount}</span>
            <span className="city-stat__label">مبنى</span>
          </div>
          <div className="city-stat city-stat--accent">
            <span className="city-stat__value">{progress}%</span>
            <span className="city-stat__label">مكتمل</span>
          </div>
          <div className="city-stat city-stat--gold">
            <span className="city-stat__value">Lv.{cityLevel}</span>
            <span className="city-stat__label">مستوى المدينة</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginBottom: 18, padding: '18px 20px', borderRadius: 22, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(255,255,255,0.9)', boxShadow: '0 24px 60px rgba(15,23,42,0.06)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>تركيز المدينة</span>
            <div style={{ marginTop: 8 }}>
              <select value={cityFocus} onChange={(e) => setCityFocus(e.target.value)} style={{ minWidth: 180, padding: '12px 14px', borderRadius: 14, border: '1px solid #cbd5e1', fontSize: 14 }}>
                <option value="all">كل المدن</option>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div style={{ padding: '10px 14px', borderRadius: 16, background: '#f8fafc', color: '#334155', fontWeight: 700, minWidth: 110, textAlign: 'center' }}>
              حالات: {focusClusters.cases}
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 16, background: '#ecfdf5', color: '#115e59', fontWeight: 700, minWidth: 110, textAlign: 'center' }}>
              مستشفيات: {focusClusters.hospitals}
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 16, background: '#eef2ff', color: '#1d4ed8', fontWeight: 700, minWidth: 110, textAlign: 'center' }}>
              لتوزيع: {focusClusters.cities}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
          {cityGroups.map((item) => (
            <div key={item.city} style={{ padding: 14, borderRadius: 18, background: item.city === cityFocus ? '#eef2ff' : '#fff', border: item.city === cityFocus ? '1px solid #93c5fd' : '1px solid rgba(148,163,184,0.18)', fontWeight: 700, color: '#334155' }}>
              {item.city}: {item.count}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="city-progress">
        <div className="city-progress__bar">
          <div className="city-progress__fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="city-progress__text">{builtCount} / {totalCount} مبنى</span>
      </div>

      {/* SVG City */}
      <div className="city-map-wrap">
        <svg viewBox={`0 0 ${CITY_W} ${CITY_H}`} className="city-svg">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect x={0} y={0} width={CITY_W} height={CITY_H} fill="url(#skyGrad)" />

          {/* Sun */}
          <circle cx={740} cy={44} r={30} fill="#fde68a" />
          <circle cx={740} cy={44} r={22} fill="#fbbf24" />

          {/* Clouds */}
          <text x={60}  y={50} fontSize={26} opacity={0.5} className="city-cloud">☁️</text>
          <text x={290} y={36} fontSize={20} opacity={0.4} className="city-cloud city-cloud--2">☁️</text>
          <text x={490} y={58} fontSize={16} opacity={0.35} className="city-cloud city-cloud--3">☁️</text>

          {/* Ground */}
          <rect x={0} y={228} width={CITY_W} height={CITY_H - 228} fill="url(#groundGrad)" />
          <rect x={0} y={228} width={CITY_W} height={5} fill="#4ade80" />

          {/* Road */}
          <rect x={0} y={200} width={CITY_W} height={28} fill="#94a3b8" />
          <rect x={0} y={213} width={CITY_W} height={2} fill="#e2e8f0" opacity={0.6} />

          {/* Buildings */}
          {buildings.map((b) => (
            <SvgBuilding key={b.id} b={b} onClick={handleClick} />
          ))}

          {/* Focus markers (حالات/مستشفيات) */}
          {focusedMarkers.map((marker) => (
            <g key={marker.id} opacity={marker.city === cityFocus || cityFocus === 'all' ? 1 : 0.6}>
              <circle
                cx={(marker.x / 100) * CITY_W}
                cy={(marker.y / 100) * CITY_H}
                r={16}
                fill={marker.type === 'hospital' ? 'rgba(251,146,60,0.95)' : 'rgba(59,130,246,0.95)'}
                stroke="#ffffff"
                strokeWidth={3}
              />
              <text
                x={(marker.x / 100) * CITY_W}
                y={(marker.y / 100) * CITY_H + 6}
                textAnchor="middle"
                fontSize={14}
                style={{ pointerEvents: 'none' }}
              >
                {marker.icon}
              </text>
            </g>
          ))}

          {/* Labels for built buildings */}
          {buildings.filter((b) => b.built && b.type !== 'road').map((b) => (
            <text key={`lbl-${b.id}`}
              x={b.x + b.w / 2} y={b.y + b.h + 13}
              textAnchor="middle" fontSize={7} fontWeight="900"
              fill="#1e293b" fontFamily="Cairo,sans-serif"
              style={{ pointerEvents: 'none' }}>
              {b.label}
            </text>
          ))}

          {/* Decorative trees */}
          {[45, 170, 430, 545, 695].map((x, i) => (
            <text key={i} x={x} y={226} fontSize={18} opacity={0.75}>🌲</text>
          ))}

          {/* Pond */}
          <ellipse cx={660} cy={262} rx={52} ry={16} fill="#93c5fd" opacity={0.55} />
          <text x={645} y={267} fontSize={12} opacity={0.8}>🌊</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="city-legend">
        {[
          { color: '#cbd5e1', label: 'مقفل 🔒' },
          { color: '#34d399', label: 'مبنى مفتوح ✅' },
          { color: '#c4b5fd', label: 'معلم رئيسي 🕌' },
        ].map(({ color, label }) => (
          <div key={label} className="city-legend__item">
            <div className="city-legend__dot" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Building cards */}
      <div className="city-buildings-grid">
        {questBuildings.map((b) => (
          <div
            key={b.id}
            className={`city-building-card${b.built ? ' city-building-card--built' : ''}`}
            onClick={() => handleClick(b)}
          >
            <span className="city-building-card__icon">{b.built ? b.emoji : '🔒'}</span>
            <div className="city-building-card__name">{b.label}</div>
            {b.built && <span className="city-building-card__badge">✅</span>}
          </div>
        ))}
      </div>

      {selected && <BuildingTooltip b={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default memo(CityMapTab);
