// src/components/tabs/MapTab.jsx
/**
 * MapTab — Shows all quest zones as interactive cards.
 * Tapping a zone opens the ZoneDetailModal.
 */
import React, { memo, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaBell, FaChevronDown } from 'react-icons/fa';
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
import DashboardCards from '../common/DashboardCards';

const COLOR_MAP = {
  rose:    { bg: 'rgba(255, 241, 242, 0.1)', border: 'rgba(253, 164, 175, 0.4)', badge: '#be123c' },
  purple:  { bg: 'rgba(250, 245, 255, 0.1)', border: 'rgba(216, 180, 254, 0.4)', badge: '#7e22ce' },
  amber:   { bg: 'rgba(255, 251, 235, 0.1)', border: 'rgba(252, 211, 77, 0.4)', badge: '#b45309' },
  sky:     { bg: 'rgba(240, 249, 255, 0.1)', border: 'rgba(125, 211, 252, 0.4)', badge: '#0369a1' },
  indigo:  { bg: 'rgba(238, 242, 255, 0.1)', border: 'rgba(165, 180, 252, 0.4)', badge: '#4338ca' },
  emerald: { bg: 'rgba(240, 253, 244, 0.1)', border: 'rgba(110, 231, 183, 0.4)', badge: '#065f46' },
  red:     { bg: 'rgba(255, 245, 245, 0.1)', border: 'rgba(252, 165, 165, 0.4)', badge: '#b91c1c' },
  orange:  { bg: 'rgba(255, 247, 237, 0.1)', border: 'rgba(253, 186, 116, 0.4)', badge: '#c2410c' },
  blue:    { bg: 'rgba(239, 246, 255, 0.1)', border: 'rgba(147, 197, 253, 0.4)', badge: '#1d4ed8' },
};

const ZoneCard = memo(({ zone, completedQuests, onOpenZone }) => {
  const { t } = useTranslation();
  const colors   = COLOR_MAP[zone.color] ?? COLOR_MAP.sky;
  const total    = zone.quests.length;
  const done     = zone.quests.filter((q) => completedQuests.has(q.id)).length;
  const pct      = total ? Math.round((done / total) * 100) : 0;
  const allDone  = done === total;

  return (
    <div
      onClick={() => { AudioManager.getInstance().play('open'); onOpenZone(zone); }}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        border: `1px solid ${allDone ? 'var(--success)' : 'var(--glass-border)'}`,
        borderRadius: 20,
        padding: '20px 16px',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: 'var(--shadow-md)',
        direction: 'rtl',
        position: 'relative',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
    >
      {allDone && (
        <div style={{ position: 'absolute', top: 10, left: 12, background: 'var(--success-light)', color: 'var(--success)', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 99, zIndex: 2, border: '1px solid var(--success)' }}>
          ✅ {t('common.completed')}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, width: '100%' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: 'var(--bg-card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, border: `1px solid ${colors.border}`,
          boxShadow: 'var(--shadow-sm)',
        }}>
          {zone.emoji}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontSize: 15, 
            fontWeight: 900, 
            color: 'var(--text-primary)', 
            marginBottom: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {zone.title}
          </div>
          <div style={{ 
            fontSize: 11, 
            color: 'var(--text-secondary)', 
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {zone.desc}
          </div>
        </div>

        <div style={{
          background: colors.badge, 
          color: '#fff',
          borderRadius: 8, 
          padding: '4px 8px',
          fontSize: 10, 
          fontWeight: 900, 
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}>
          {t('common.mission')} {done}/{total}
        </div>
      </div>

      <div>
        {/* Progress bar */}
        <div style={{ height: 6, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' }}>
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
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>{t('common.progress')}</span>
          <span style={{ fontSize: 9, fontWeight: 900, color: colors.badge }}>{pct}%</span>
        </div>
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
      <DashboardCards userStats={state.userStats} completedCount={doneQuests} />

      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        borderRadius: 22,
        padding: 20,
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--glass-border)',
        direction: 'rtl',
        fontFamily: "'Cairo', sans-serif",
        lineHeight: 1.6,
        color: 'var(--text-primary)'
      }}>
        <div style={{ display: 'grid', gap: 18 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: 21,
                fontWeight: 900,
                fontFamily: "'Cairo', sans-serif",
                color: 'var(--text-primary)'
              }}>
                خريطة الطلبات والمستشفيات
              </h2>
              <p style={{
                margin: '8px 0 0',
                color: 'var(--text-secondary)',
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
        border: '1px solid var(--border)',
        background: 'var(--bg-card-2)',
        fontFamily: "'Cairo', sans-serif"
      }}>
        <div style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
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
          color: 'var(--text-primary)'
        }}>
          {filteredMarkers.length}
        </div>
        <div style={{
          marginTop: 4,
          fontSize: 12,
          color: 'var(--text-secondary)',
          fontWeight: 600,
          fontFamily: "'Cairo', sans-serif"
        }}>
          {summary.cases} حالات · {summary.hospitals} مستشفيات
        </div>
      </div>

      <div style={{
        padding: 16,
        borderRadius: 18,
        border: '1px solid var(--border)',
        background: 'var(--bg-card-2)',
        fontFamily: "'Cairo', sans-serif"
      }}>
        <div style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
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
          color: 'var(--text-primary)'
        }}>
          {nearestPlace ? `${nearestPlace.icon} ${nearestPlace.label}` : 'لا توجد علامات'}
        </div>
        <div style={{
          marginTop: 4,
          color: 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Cairo', sans-serif"
        }}>
          {nearestPlace ? nearestPlace.subtitle : 'استخدم الفلاتر لإيجاد أماكن'}
        </div>
      </div>
    </div>

    {/* Colored stats cards */}
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
      <div style={{
        padding: 16,
        borderRadius: 18,
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        fontFamily: "'Cairo', sans-serif",
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          fontSize: 14,
          color: '#f59e0b',
          fontWeight: 800,
          fontFamily: "'Cairo', sans-serif"
        }}>
          الحالات
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 28,
          fontWeight: 900,
          fontFamily: "'Cairo', sans-serif",
          color: 'var(--text-primary)'
        }}>
          {summary.cases}
        </div>
      </div>

      <div style={{
        padding: 16,
        borderRadius: 18,
        background: 'rgba(168, 85, 247, 0.12)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        fontFamily: "'Cairo', sans-serif",
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          fontSize: 14,
          color: '#a855f7',
          fontWeight: 800,
          fontFamily: "'Cairo', sans-serif"
        }}>
          المستشفيات
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 28,
          fontWeight: 900,
          fontFamily: "'Cairo', sans-serif",
          color: 'var(--text-primary)'
        }}>
          {summary.hospitals}
        </div>
      </div>

      <div style={{
        padding: 16,
        borderRadius: 18,
        background: 'rgba(59, 130, 246, 0.12)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        fontFamily: "'Cairo', sans-serif",
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          fontSize: 14,
          color: '#3b82f6',
          fontWeight: 800,
          fontFamily: "'Cairo', sans-serif"
        }}>
          إجمالي
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 28,
          fontWeight: 900,
          fontFamily: "'Cairo', sans-serif",
          color: 'var(--text-primary)'
        }}>
          {filteredMarkers.length}
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>

      <label style={{ display: 'grid', gap: 8, fontFamily: "'Cairo', sans-serif", position: 'relative' }}>
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'var(--text-secondary)',
          fontFamily: "'Cairo', sans-serif"
        }}>
          حسب المدينة
        </span>
        <div style={{ position: 'relative' }}>
          <select
            value={activeCity}
            onChange={(e) => setActiveCity(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 40px 14px 16px',
              borderRadius: 18,
              border: '1px solid var(--border)',
              fontSize: 15,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              color: 'var(--text-primary)',
              background: 'var(--bg-card-2)',
              boxShadow: 'var(--shadow-sm)',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
          >
            <option value="all" style={{
              fontSize: 13,
              fontWeight: 900,
              color: 'var(--text-primary)',
              fontFamily: "'Cairo', sans-serif",
              background: 'var(--bg-card-2)'
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
                  color: 'var(--text-primary)',
                  fontFamily: "'Cairo', sans-serif",
                  background: 'var(--bg-card-2)'
                }}
              >
                {city}
              </option>
            ))}
          </select>
          <FaChevronDown style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            pointerEvents: 'none',
          }} />
        </div>
      </label>

      <label style={{ display: 'grid', gap: 8, fontFamily: "'Cairo', sans-serif", position: 'relative' }}>
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'var(--text-secondary)',
          fontFamily: "'Cairo', sans-serif"
        }}>
          نوع العلامة
        </span>
        <div style={{ position: 'relative' }}>
          <select
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 40px 14px 16px',
              borderRadius: 18,
              border: '1px solid var(--border)',
              fontSize: 15,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              color: 'var(--text-primary)',
              background: 'var(--bg-card-2)',
              boxShadow: 'var(--shadow-sm)',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
          >
            {MAP_TYPES.map((type) => (
              <option
                key={type.id}
                value={type.id}
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  fontFamily: "'Cairo', sans-serif",
                  background: 'var(--bg-card-2)'
                }}
              >
                {type.label}
              </option>
            ))}
          </select>
          <FaChevronDown style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            pointerEvents: 'none',
          }} />
        </div>
      </label>

      <label style={{ display: 'grid', gap: 8, fontFamily: "'Cairo', sans-serif", position: 'relative' }}>
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'var(--text-secondary)',
          fontFamily: "'Cairo', sans-serif"
        }}>
          نوع الحالة
        </span>
        <div style={{ position: 'relative' }}>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 40px 14px 16px',
              borderRadius: 18,
              border: '1px solid var(--border)',
              fontSize: 15,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              color: 'var(--text-primary)',
              background: 'var(--bg-card-2)',
              boxShadow: 'var(--shadow-sm)',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
          >
            {MAP_CATEGORIES.map((category) => (
              <option
                key={category.id}
                value={category.id}
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  fontFamily: "'Cairo', sans-serif",
                  background: 'var(--bg-card-2)'
                }}
              >
                {category.label}
              </option>
            ))}
          </select>
          <FaChevronDown style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            pointerEvents: 'none',
          }} />
        </div>
      </label>

    </div>
  </div>
</div>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: mapPanelColumns, minHeight: mapAreaMinHeight }}>
          <div style={{ position: 'relative', borderRadius: 24, background: 'var(--bg-card-2)', overflow: 'hidden', border: '1px solid var(--border)', minHeight: mapAreaMinHeight }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08), transparent 30%), radial-gradient(circle at 75% 25%, rgba(16,185,129,0.08), transparent 24%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gridTemplateRows: 'repeat(6,1fr)', opacity: 0.25 }}>
              {Array.from({ length: 48 }).map((_, index) => (
                <div key={index} style={{ border: '1px solid var(--border)' }} />
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
                    background: 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  title={`${marker.label} (${marker.subtitle})`}
                >
                  <span style={{ fontSize: 18 }}>{marker.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ padding: 18, borderRadius: 24, border: '1px solid var(--border)', background: 'var(--bg-card-2)', color: 'var(--text-primary)' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>تفاصيل Marker</h3>
              {selectedMarker ? (
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{selectedMarker.icon} {selectedMarker.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selectedMarker.subtitle}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', fontSize: 12 }}>{selectedMarker.type === 'case' ? 'حالة' : 'مستشفى'}</span>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: 12 }}>{selectedMarker.categoryLabel}</span>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>اختر علامة في الخريطة لعرض المزيد من التفاصيل.</p>
              )}
            </div>

            <div style={{ padding: 18, borderRadius: 24, border: '1px solid var(--border)', background: 'var(--bg-card-2)', color: 'var(--text-primary)' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>توزيع المدن</h3>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {cityCounts.map((item) => (
                  <div key={item.city} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, color: 'var(--text-primary)', fontWeight: 700 }}>
                    <span>{item.city}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
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
            background: 'rgba(0, 0, 0, 0.75)',
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
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              borderRadius: '32px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-lg)',
              direction: 'rtl',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: -28, right: -28, width: 160, height: 160, borderRadius: '50%', background: 'rgba(59,130,246,0.1)' }} />
              <div style={{ position: 'absolute', bottom: -32, left: -24, width: 120, height: 120, borderRadius: '50%', background: 'rgba(168,85,247,0.08)' }} />
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
                    background: 'var(--bg-card-2)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border)',
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
                    <div style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700 }}>
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
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card-2)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: 'var(--text-primary)',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 16, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', fontWeight: 800, fontSize: 13 }}>
                  ⚡ {selectedZoneStats.kp} نقاط
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 16, background: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 800, fontSize: 13 }}>
                  ⭐ {selectedZoneStats.xp} خبرة
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 16, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontWeight: 800, fontSize: 13 }}>
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
                <div style={{ display: 'grid', gap: '12px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                  {selectedZone.quests.slice(0, 10).map((quest, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        background: 'var(--bg-card-2)',
                        borderRadius: '18px',
                        border: '1px solid var(--border)',
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
                          background: 'rgba(59,130,246,0.12)',
                          color: '#3b82f6',
                          fontSize: 12,
                          fontWeight: 900,
                        }}>
                          {quest.diff || 'متوسطة'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                        {quest.story || 'تحدى نفسك في هذه المهمة واجعل العالم أفضل.'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowZoneModal(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                  color: 'white',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                  boxShadow: 'var(--shadow-md)',
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
