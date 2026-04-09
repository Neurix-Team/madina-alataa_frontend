// src/components/tabs/MapTab.jsx
/**
 * MapTab — Shows all quest zones as interactive cards.
 * Tapping a zone opens the ZoneDetailModal.
 */
import React, { memo, useMemo, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import zonesData from '../../data/zonesData';
import AudioManager from '../../services/AudioManager';
import { getUnreadCount } from '../../data/notificationsData';
import useGameState from '../../hooks/useGameState';
import {
  caseMarkers,
  hospitalMarkers,
  CITIES,
  MAP_TYPES,
  MAP_CATEGORIES,
} from '../../data/mapLocations';

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

const ALL_MARKERS = [...caseMarkers, ...hospitalMarkers];

const MapTab = ({ onOpenZone }) => {
  const { state } = useGameState();
  const { completedQuests } = state;
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [activeCity, setActiveCity] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const handleOpenZone = onOpenZone || ((zone) => {
    AudioManager.getInstance().play('open');
    setSelectedZone(zone);
    setShowZoneModal(true);
  });

  // Load unread count on mount and when tab becomes active
  useEffect(() => {
    const count = getUnreadCount();
    setUnreadCount(count);
    
    // Check periodically for updates
    const interval = setInterval(() => {
      setUnreadCount(getUnreadCount());
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalQuests = zonesData.reduce((s, z) => s + z.quests.length, 0);
  const doneQuests  = zonesData.reduce((s, z) => s + z.quests.filter((q) => completedQuests.has(q.id)).length, 0);

  const filteredMarkers = useMemo(() => ALL_MARKERS.filter((marker) => {
    const cityOk     = activeCity === 'all' || marker.city === activeCity;
    const typeOk     = activeType === 'all' || marker.type === activeType;
    const categoryOk = activeCategory === 'all' || marker.category === activeCategory;
    return cityOk && typeOk && categoryOk;
  }), [activeCity, activeType, activeCategory]);

  const nearestPlace = useMemo(() => {
    if (filteredMarkers.length === 0) return null;
    const cityMatch = filteredMarkers.find((marker) => marker.city === activeCity);
    return cityMatch || filteredMarkers[0];
  }, [filteredMarkers, activeCity]);

  const mapPanelColumns = windowWidth <= 640 ? '1fr' : windowWidth <= 900 ? '1fr 1fr' : '1fr 320px';
  const mapAreaMinHeight = windowWidth <= 640 ? 260 : 340;

  const cityCounts = useMemo(() => {
    return CITIES.map((city) => ({
      city,
      count: filteredMarkers.filter((marker) => marker.city === city).length,
    }));
  }, [filteredMarkers]);

  const clusterCounts = useMemo(() => {
    return MAP_TYPES.filter((type) => type.id !== 'all').map((type) => ({
      label: type.label,
      count: filteredMarkers.filter((marker) => marker.type === type.id).length,
    }));
  }, [filteredMarkers]);

  const summary = useMemo(() => ({
    cases: filteredMarkers.filter((marker) => marker.type === 'case').length,
    hospitals: filteredMarkers.filter((marker) => marker.type === 'hospital').length,
  }), [filteredMarkers]);

  const selectedZoneStats = selectedZone
    ? selectedZone.quests.reduce(
        (acc, quest) => ({
          kp: acc.kp + (quest.kp || 0),
          xp: acc.xp + (quest.xp || 0),
          impact: acc.impact + (quest.impact || 0),
        }),
        { kp: 0, xp: 0, impact: 0 }
      )
    : { kp: 0, xp: 0, impact: 0 };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 22,
        padding: 20,
        boxShadow: 'var(--shadow-md)',
        border: '1.5px solid var(--border)',
        direction: 'rtl',
        fontFamily: "'Cairo', sans-serif",
        lineHeight: 1.6,
        color: '#0f172a'
      }}>
        <div style={{ display: 'grid', gap: 18 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: 21,
                fontWeight: 900,
                fontFamily: "'Cairo', sans-serif",
                color: '#0f172a'
              }}>
                خريطة الطلبات والمستشفيات
              </h2>
              <p style={{
                margin: '8px 0 0',
                color: 'rgb(100, 116, 139)',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Cairo', sans-serif"
              }}>
                اعرض مؤشرات الحالات والمستشفيات، وابحث عن أقرب مكان حسب المدينة والفئة.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
              type='button'
              onClick={() => navigate('/notifications')}
              title="الإشعارات"
              style={{
                position: 'relative',
                width: 44,
                height: 44,
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08))',
                color: 'rgb(239, 68, 68)',
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: '0.3s',
                fontFamily: "'Cairo', sans-serif"
              }}
            >
              <FaBell />
              <span style={{
                position: 'absolute',
                top: -6,
                left: -6,
                background: 'rgb(239, 68, 68)',
                color: 'rgb(255, 255, 255)',
                borderRadius: '50%',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 900,
                border: '2px solid white',
                boxShadow: 'rgba(239, 68, 68, 0.4) 0px 2px 8px',
                fontFamily: "'Cairo', sans-serif"
              }}>
                {unreadCount || 0}
              </span>
            </button>

              <span style={{
                padding: '8px 12px',
                borderRadius: 999,
                background: 'rgba(59, 130, 246, 0.12)',
                color: 'rgb(29, 78, 216)',
                fontWeight: 800,
                fontSize: 12,
                fontFamily: "'Cairo', sans-serif"
              }}>
                حالات: 4
              </span>

              <span style={{
                padding: '8px 12px',
                borderRadius: 999,
                background: 'rgba(59, 130, 246, 0.12)',
                color: 'rgb(29, 78, 216)',
                fontWeight: 800,
                fontSize: 12,
                fontFamily: "'Cairo', sans-serif"
              }}>
                مستشفيات: 3
              </span>
      </div>
    </div>

    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      <div style={{
        padding: 16,
        borderRadius: 18,
        border: '1px solid rgba(148, 163, 184, 0.18)',
        background: 'rgb(248, 250, 252)',
        fontFamily: "'Cairo', sans-serif"
      }}>
        <div style={{
          fontSize: 12,
          color: 'rgb(71, 85, 105)',
          fontWeight: 700,
          fontFamily: "'Cairo', sans-serif"
        }}>
          عدد العلامات بعد الفلترة
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 22,
          fontWeight: 900,
          fontFamily: "'Cairo', sans-serif",
          color: '#0f172a'
        }}>
          {filteredMarkers.length}
        </div>
        <div style={{
          marginTop: 4,
          fontSize: 12,
          color: 'rgb(100, 116, 139)',
          fontWeight: 600,
          fontFamily: "'Cairo', sans-serif"
        }}>
          {summary.cases} حالات · {summary.hospitals} مستشفيات
        </div>
      </div>

      <div style={{
        padding: 16,
        borderRadius: 18,
        border: '1px solid rgba(148, 163, 184, 0.18)',
        background: 'rgb(248, 250, 252)',
        fontFamily: "'Cairo', sans-serif"
      }}>
        <div style={{
          fontSize: 12,
          color: 'rgb(71, 85, 105)',
          fontWeight: 700,
          fontFamily: "'Cairo', sans-serif"
        }}>
          أقرب مكان
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 16,
          fontWeight: 900,
          fontFamily: "'Cairo', sans-serif",
          color: '#0f172a'
        }}>
          {nearestPlace ? `${nearestPlace.icon} ${nearestPlace.label}` : 'لا توجد علامات'}
        </div>
        <div style={{
          marginTop: 4,
          color: 'rgb(100, 116, 139)',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Cairo', sans-serif"
        }}>
          {nearestPlace ? nearestPlace.subtitle : 'استخدم الفلاتر لإيجاد أماكن'}
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>

      <label style={{ display: 'grid', gap: 8, fontFamily: "'Cairo', sans-serif" }}>
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'rgb(51, 65, 85)',
          fontFamily: "'Cairo', sans-serif"
        }}>
          حسب المدينة
        </span>
        <select
          value={activeCity}
          onChange={(e) => setActiveCity(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 18,
            border: '1px solid rgba(59,130,246,0.25)',
            fontSize: 15,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            color: '#0f172a',
            background: 'linear-gradient(180deg, #ffffff, #f1f7ff)',
            boxShadow: '0 10px 22px rgba(59,130,246,0.08)',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundImage: 'linear-gradient(45deg, transparent 50%, rgba(15,23,42,0.8) 50%), linear-gradient(135deg, rgba(15,23,42,0.8) 50%, transparent 50%)',
            backgroundPosition: 'calc(100% - 18px) calc(50% - 4px), calc(100% - 12px) calc(50% - 4px)',
            backgroundSize: '6px 6px',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <option value="all" style={{
            fontSize: 13,
            fontWeight: 900,
            color: '#0f172a',
            fontFamily: "'Cairo', sans-serif",
            background: '#eef5ff'
          }}>
            الكل
          </option>
          {CITIES.map((city) => (
            <option
              key={city}
              value={city}
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: '#0f172a',
                fontFamily: "'Cairo', sans-serif",
                background: '#eef5ff'
              }}
            >
              {city}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'grid', gap: 8, fontFamily: "'Cairo', sans-serif" }}>
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'rgb(51, 65, 85)',
          fontFamily: "'Cairo', sans-serif"
        }}>
          نوع العلامة
        </span>
        <select
          value={activeType}
          onChange={(e) => setActiveType(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 18,
            border: '1px solid rgba(59,130,246,0.25)',
            fontSize: 15,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            color: '#0f172a',
            background: 'linear-gradient(180deg, #ffffff, #f1f7ff)',
            boxShadow: '0 10px 22px rgba(59,130,246,0.08)',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundImage: 'linear-gradient(45deg, transparent 50%, rgba(15,23,42,0.8) 50%), linear-gradient(135deg, rgba(15,23,42,0.8) 50%, transparent 50%)',
            backgroundPosition: 'calc(100% - 18px) calc(50% - 4px), calc(100% - 12px) calc(50% - 4px)',
            backgroundSize: '6px 6px',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {MAP_TYPES.map((type) => (
            <option
              key={type.id}
              value={type.id}
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: '#0f172a',
                fontFamily: "'Cairo', sans-serif",
                background: '#eef5ff'
              }}
            >
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'grid', gap: 8, fontFamily: "'Cairo', sans-serif" }}>
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'rgb(51, 65, 85)',
          fontFamily: "'Cairo', sans-serif"
        }}>
          نوع الحالة
        </span>
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 18,
            border: '1px solid rgba(59,130,246,0.25)',
            fontSize: 15,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            color: '#0f172a',
            background: 'linear-gradient(180deg, #ffffff, #f1f7ff)',
            boxShadow: '0 10px 22px rgba(59,130,246,0.08)',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundImage: 'linear-gradient(45deg, transparent 50%, rgba(15,23,42,0.8) 50%), linear-gradient(135deg, rgba(15,23,42,0.8) 50%, transparent 50%)',
            backgroundPosition: 'calc(100% - 18px) calc(50% - 4px), calc(100% - 12px) calc(50% - 4px)',
            backgroundSize: '6px 6px',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {MAP_CATEGORIES.map((category) => (
            <option
              key={category.id}
              value={category.id}
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: '#0f172a',
                fontFamily: "'Cairo', sans-serif",
                background: '#eef5ff'
              }}
            >
              {category.label}
            </option>
          ))}
        </select>
      </label>

    </div>
  </div>
</div>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: mapPanelColumns, minHeight: mapAreaMinHeight }}>
          <div style={{ position: 'relative', borderRadius: 24, background: '#eef2ff', overflow: 'hidden', border: '1px solid rgba(148,163,184,0.2)', minHeight: mapAreaMinHeight }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08), transparent 30%), radial-gradient(circle at 75% 25%, rgba(16,185,129,0.08), transparent 24%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gridTemplateRows: 'repeat(6,1fr)', opacity: 0.25 }}>
              {Array.from({ length: 48 }).map((_, index) => (
                <div key={index} style={{ border: '1px solid rgba(148,163,184,0.08)' }} />
              ))}
            </div>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {filteredMarkers.map((marker) => (
                <button
                  key={marker.id}
                  type="button"
                  onClick={() => handleMarkerClick(marker)}
                  style={{
                    position: 'absolute',
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    border: marker.type === 'hospital' ? '2px solid #f97316' : '2px solid #3b82f6',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 10px 24px rgba(15,23,42,0.12)',
                  }}
                  title={`${marker.label} (${marker.subtitle})`}
                >
                  <span style={{ fontSize: 18 }}>{marker.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ padding: 18, borderRadius: 24, border: '1px solid rgba(148,163,184,0.2)', background: '#fff' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>تفاصيل Marker</h3>
              {selectedMarker ? (
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{selectedMarker.icon} {selectedMarker.label}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{selectedMarker.subtitle}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', fontSize: 12 }}>{selectedMarker.type === 'case' ? 'حالة' : 'مستشفى'}</span>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: '#ecfdf5', color: '#15803d', fontSize: 12 }}>{selectedMarker.categoryLabel}</span>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>اختر علامة في الخريطة لعرض المزيد من التفاصيل.</p>
              )}
            </div>

            <div style={{ padding: 18, borderRadius: 24, border: '1px solid rgba(148,163,184,0.2)', background: '#fff' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>توزيع المدن</h3>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {cityCounts.map((item) => (
                  <div key={item.city} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, color: '#334155', fontWeight: 700 }}>
                    <span>{item.city}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            {zonesData.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                completedQuests={completedQuests}
                onOpenZone={handleOpenZone}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Zone Detail Modal */}
      {showZoneModal && selectedZone && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.18), transparent 28%), rgba(15, 23, 42, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
          onClick={() => setShowZoneModal(false)}
        >
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,246,254,0.96))',
              borderRadius: '32px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              border: '1px solid rgba(59,130,246,0.18)',
              boxShadow: '0 32px 90px rgba(15,23,42,0.3)',
              direction: 'rtl',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: -28, right: -28, width: 160, height: 160, borderRadius: '50%', background: 'rgba(59,130,246,0.18)' }} />
              <div style={{ position: 'absolute', bottom: -32, left: -24, width: 120, height: 120, borderRadius: '50%', background: 'rgba(168,85,247,0.14)' }} />
              <div style={{ position: 'absolute', top: '40%', left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(14,165,233,0.07)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 24,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(168,85,247,0.18))',
                    boxShadow: '0 16px 35px rgba(59,130,246,0.18)',
                  }}>
                    <span style={{ fontSize: 36 }}>{selectedZone.emoji}</span>
                  </div>
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: '900',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {selectedZone.title}
                    </h2>
                    <div style={{ marginTop: 6, color: '#475569', fontSize: 14, fontWeight: 700 }}>
                      {selectedZone.desc}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowZoneModal(false)}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid rgba(148,163,184,0.24)',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#475569',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 16, background: 'rgba(59,130,246,0.12)', color: '#1d4ed8', fontWeight: 800, fontSize: 13 }}>
                  ⚡ {selectedZoneStats.kp} نقاط
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 16, background: 'rgba(16,185,129,0.12)', color: '#047857', fontWeight: 800, fontSize: 13 }}>
                  ⭐ {selectedZoneStats.xp} خبرة
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 16, background: 'rgba(248,113,113,0.12)', color: '#b91c1c', fontWeight: 800, fontSize: 13 }}>
                  ❤️ {selectedZoneStats.impact} تأثير
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3
                  style={{
                    margin: '0 0 14px',
                    fontSize: '18px',
                    fontWeight: '900',
                    color: 'var(--text-primary)',
                  }}
                >
                  مهمات المنطقة ({selectedZone.quests.length})
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedZone.quests.slice(0, 6).map((quest, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        background: 'rgba(59,130,246,0.08)',
                        borderRadius: '18px',
                        border: '1px solid rgba(59,130,246,0.16)',
                        display: 'grid',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>
                          {quest.title || `مهمة ${idx + 1}`}
                        </div>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          background: 'rgba(99,102,241,0.16)',
                          color: '#4338ca',
                          fontSize: 12,
                          fontWeight: 900,
                        }}>
                          {quest.diff || 'متوسطة'}
                        </span>
                      </div>
                      <div style={{ color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                        {quest.story || 'تحدى نفسك في هذه المهمة واجعل العالم أفضل.'}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: '#065f46', fontSize: 12, fontWeight: 800 }}>
                          {quest.kp || 0} نقاط
                        </span>
                        <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(59,130,246,0.12)', color: '#1d4ed8', fontSize: 12, fontWeight: 800 }}>
                          {quest.xp || 0} XP
                        </span>
                        <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(248,113,113,0.12)', color: '#b91c1c', fontSize: 12, fontWeight: 800 }}>
                          {quest.impact || 0} تأثير
                        </span>
                      </div>
                    </div>
                  ))}
                  {selectedZone.quests.length > 6 && (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: 13,
                        padding: '10px 0',
                        borderTop: '1px dashed rgba(148,163,184,0.4)',
                      }}
                    >
                      و {selectedZone.quests.length - 6} مهام إضافية...
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowZoneModal(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.94'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                العودة للخريطة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MapTab);
