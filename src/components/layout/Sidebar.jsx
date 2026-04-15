// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import GameEngine   from '../../services/GameEngine';
import ThemeService from '../../services/ThemeService';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import { useAuth } from '../../hooks/useAuth';
import {
  FaMapMarkedAlt,
  FaCheckCircle,
  FaCompass,
  FaCity,
  FaMapMarkerAlt,
  FaUsers,
  FaTrophy,
  FaChartBar,
  FaHeart,
  FaUser,
  FaUserFriends,
  FaBoxOpen,
  FaCog,
  FaCrown,
  FaGlasses,
  FaHatCowboy,
  FaStar,
  FaRibbon,
  FaSun,
  FaMoon,
  FaTimes,
  FaBars,
  FaCoins,
  FaPlus,
  FaBell,
} from 'react-icons/fa';
import { getAvatarImageUrl } from '../../utils/avatarProfile';



// ── Injected CSS (keyframes + class-based styles) ─────────────────────────
const SIDEBAR_CSS = `
  @keyframes sidebarSlideIn {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes logoFloat {
    0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
    33%       { transform: translateY(-5px) rotate(-4deg) scale(1.05); }
    66%       { transform: translateY(-2px) rotate(3deg) scale(1.02); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 6px rgba(251,191,36,0.5), 0 0 12px rgba(251,191,36,0.2); }
    50%       { box-shadow: 0 0 14px rgba(251,191,36,0.9), 0 0 28px rgba(251,191,36,0.4); }
  }
  @keyframes activeDotPulse {
    0%, 100% { transform: scale(1);   opacity: 1; }
    50%       { transform: scale(1.5); opacity: 0.6; }
  }
  @keyframes orbFloat1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    40%       { transform: translate(12px, -18px) scale(1.12); }
    70%       { transform: translate(-8px, 10px) scale(0.9); }
  }
  @keyframes orbFloat2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    35%       { transform: translate(-14px, 12px) scale(0.88); }
    70%       { transform: translate(10px, -14px) scale(1.1); }
  }
  @keyframes orbFloat3 {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(6px, -10px); }
  }
  @keyframes xpShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes starTwinkle {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1.2); }
  }
  @keyframes borderGlow {
    0%, 100% { border-color: rgba(29,110,216,0.3); }
    50%       { border-color: rgba(14,165,233,0.6); }
  }
  @media (max-width: 768px) {
    .sb-hamburger {
      display: flex !important;
    }
  }
  /* ── Nav Button ── */
  .sb-nav-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid transparent;
    border-radius: 14px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    font-size: 13px;
    font-weight: 700;
    text-align: right;
    direction: rtl;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: transparent;
    color: rgba(255,255,255,0.6);
    position: relative;
    overflow: hidden;
  }
  .sb-nav-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(29,110,216,0.25) 0%,
      rgba(14,165,233,0.12) 100%
    );
    border-radius: 14px;
    opacity: 0;
    transition: opacity 0.22s ease;
  }
  .sb-nav-btn:hover {
    color: #fff;
    transform: translateX(-4px);
    border-color: rgba(29,110,216,0.25);
  }
  .sb-nav-btn:hover::before {
    opacity: 1;
  }
  .sb-nav-btn:active {
    transform: scale(0.97) translateX(-2px);
  }

  /* ── Active Nav Button ── */
  .sb-nav-btn--active {
    background: linear-gradient(135deg,
      rgba(29,110,216,0.55) 0%,
      rgba(14,165,233,0.35) 100%
    ) !important;
    color: #fff !important;
    font-weight: 900 !important;
    border-color: rgba(14,165,233,0.4) !important;
    box-shadow:
      0 4px 18px rgba(29,110,216,0.35),
      inset 0 1px 0 rgba(255,255,255,0.12),
      inset 0 -1px 0 rgba(0,0,0,0.1) !important;
  }
  .sb-nav-btn--active::after {
    content: '';
    position: absolute;
    right: 0;
    top: 18%;
    height: 64%;
    width: 3px;
    background: linear-gradient(180deg, #fde68a, #fbbf24, #f59e0b);
    border-radius: 99px 0 0 99px;
    animation: glowPulse 2s ease-in-out infinite;
  }
  .sb-nav-btn--active .sb-nav-icon {
    filter: drop-shadow(0 0 5px rgba(255,255,255,0.6));
  }

  /* ── Dark Mode Toggle ── */
  .sb-dark-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    font-size: 13px;
    font-weight: 700;
    text-align: right;
    direction: rtl;
    transition: all 0.25s ease;
    margin-top: 8px;
  }
  .sb-dark-toggle:hover {
    transform: translateX(-3px);
    border-color: rgba(255,255,255,0.2);
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .sb-hamburger { display: flex !important; }
    .sb-overlay   { display: block !important; }
    .sb-aside {
      position: fixed !important;
      top: 0 !important;
      right: -260px !important;
      transition: right 0.32s cubic-bezier(0.4, 0, 0.2, 1) !important;
      z-index: 55 !important;
      min-height: 100vh !important;
      height: 100% !important;
    }
    .sb-aside--open {
      right: 0 !important;
    }
  }
`;

// ── Nav items ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'map',         label: 'خريطة المهام',    icon: FaMapMarkedAlt, condition: PERMISSIONS.VIEW_MAP },
  { id: 'profile',     label: 'البروفايل',        icon: FaUser },
  { id: 'avatar',      label: 'افاتار',           icon: FaUser },
  { id: 'cases',       label: 'الحالات',          icon: FaHeart, condition: PERMISSIONS.VIEW_CASES },
  { id: 'daily',       label: 'المهام اليومية',   icon: FaCheckCircle, condition: PERMISSIONS.VIEW_DAILY_TASKS },
  { id: 'explore',     label: 'استكشاف المدينة',  icon: FaCompass, condition: PERMISSIONS.VIEW_MAP },
  { id: 'city',        label: 'خريطة المدينة',    icon: FaCity, condition: PERMISSIONS.VIEW_MAP },
  { id: 'geo',         label: 'مهام جغرافية',     icon: FaMapMarkerAlt, condition: PERMISSIONS.VIEW_GEO_QUESTS },
  { id: 'team',        label: 'تحديات الفريق',    icon: FaUsers, condition: PERMISSIONS.VIEW_TEAM_CHALLENGES },
  { id: 'badges',      label: 'الأوسمة',          icon: FaTrophy, condition: PERMISSIONS.VIEW_BADGES },
  { id: 'leaderboard', label: 'المتصدرون',        icon: FaChartBar, condition: PERMISSIONS.VIEW_LEADERBOARD },
  { id: 'impact',      label: 'أثري',             icon: FaHeart, condition: PERMISSIONS.VIEW_IMPACT },
  { id: 'parents',     label: 'الاباء',           icon: FaUserFriends, dividerBefore: true, condition: PERMISSIONS.VIEW_PARENTS },
  { id: 'create-request', label: 'إنشاء طلب',    icon: FaPlus, condition: PERMISSIONS.CREATE_REQUEST },
  { id: 'my-donations',    label: 'تبرعاتي',        icon: FaCoins, condition: PERMISSIONS.VIEW_MY_DONATIONS },
  { id: 'orders',      label: 'الأوامر',          icon: FaBoxOpen, condition: PERMISSIONS.VIEW_ORDERS },
  { id: 'admin',       label: 'الإدارة',          icon: FaCog, condition: PERMISSIONS.VIEW_ADMIN },
  { id: 'incoming-requests', label: 'الطلبات الواردة', icon: FaBell, condition: PERMISSIONS.VIEW_ADMIN },
];

// ── Avatar ────────────────────────────────────────────────────────────────
const AvatarSVG = ({ bg, accessory }) => {
  const bgColor = `#${bg || '1d6ed8'}`;
  const accessoryMap = {
    crown:    FaCrown,
    glasses:  FaGlasses,
    hat:      FaHatCowboy,
    star:     FaStar,
    scarf:    FaRibbon,
    headband: FaRibbon,
  };
  const AccessoryIcon = accessoryMap[accessory] || FaCrown;


  
  return (
    <div style={{
      width: 54,
      height: 54,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, ${bgColor}ee, ${bgColor}88)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
      border: '2px solid rgba(255,255,255,0.25)',
      boxShadow: [
        '0 4px 18px rgba(0,0,0,0.35)',
        '0 0 0 4px rgba(29,110,216,0.2)',
        'inset 0 1px 0 rgba(255,255,255,0.25)',
      ].join(', '),
      flexShrink: 0,
      position: 'relative',
      transition: 'transform 0.3s ease',
    }}>
      <img
        src={getAvatarImageUrl()}
        alt="Saved avatar"
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1px solid rgba(255,255,255,0.28)',
          background: 'rgba(255,255,255,0.08)',
        }}
      />
      <span style={{
        position: 'absolute',
        top: -7,
        right: -5,
        fontSize: 15,
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
      }}><AccessoryIcon /></span>
    </div>
  );
};

// ── NavBtn ────────────────────────────────────────────────────────────────
const NavBtn = ({ item, active, onClick }) => (
  <button
  type='button'
    onClick={() => onClick(item.id)}
    title={item.label}
    className={`sb-nav-btn${active ? ' sb-nav-btn--active' : ''}`}
  >
    <span className="sb-nav-icon" style={{ fontSize: 18, flexShrink: 0, transition: 'filter 0.2s', display: 'inline-flex' }}>
      <item.icon />
    </span>
    <span style={{ flex: 1 }}>{item.label}</span>
    {active && (
      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: '#fbbf24',
        flexShrink: 0,
        animation: 'activeDotPulse 1.8s ease-in-out infinite',
        boxShadow: '0 0 8px rgba(251,191,36,0.9)',
      }} />
    )}
  </button>
);

// ── Dark Mode Toggle ──────────────────────────────────────────────────────
const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(
    () => ThemeService.getInstance().isDark
  );

  useEffect(() => {
    const unsub = ThemeService.getInstance().subscribe((dark) => setIsDark(dark));
    return unsub;
  }, []);

  const toggle = () => ThemeService.getInstance().toggle();

  return (
    <button
      onClick={toggle}
      title={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      className="sb-dark-toggle"
      style={{
        background: isDark
          ? 'rgba(251,191,36,0.1)'
          : 'rgba(255,255,255,0.05)',
        color: isDark ? '#fbbf24' : 'rgba(255,255,255,0.65)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark
          ? 'rgba(251,191,36,0.2)'
          : 'rgba(255,255,255,0.1)';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark
          ? 'rgba(251,191,36,0.1)'
          : 'rgba(255,255,255,0.05)';
        e.currentTarget.style.color = isDark ? '#fbbf24' : 'rgba(255,255,255,0.65)';
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>
        {isDark ? <FaSun /> : <FaMoon />}
      </span>
      <span style={{ flex: 1 }}>
        {isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
      </span>
      {/* Toggle pill */}
      <span style={{
        width: 38,
        height: 21,
        borderRadius: 99,
        background: isDark
          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
          : 'rgba(255,255,255,0.15)',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.25s',
        boxShadow: isDark ? '0 0 10px rgba(251,191,36,0.5)' : 'none',
        display: 'inline-block',
      }}>
        <span style={{
          position: 'absolute',
          top: 3,
          left: isDark ? 3 : 18,
          width: 15,
          height: 15,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 1px 5px rgba(0,0,0,0.3)',
        }} />
      </span>
    </button>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────
export default function Sidebar({
  activeTab,
  setActiveTab,
  userStats,
  avatarTheme,
  sidebarOpen,
  setSidebarOpen,
}) {
  const { logout } = useAuth();
  const xpPct = GameEngine.xpPercent(userStats.xp, userStats.xpNeeded);

  const navigate = useNavigate();
const location = useLocation();


const handleNavClick = (id) => {
  const pathMap = {
    profile: '/profile-v2',
    avatar: '/avatar',
    impact: '/impact',
    map: '/map',
    badges: '/badges',
    leaderboard: '/leaderboard',
    orders: '/orders',
    daily: '/daily-tasks',
    explore: '/city-exploration',
    city: '/city-map',
    geo: '/geo-quests',
    team: '/team-challenges',
    'my-donations': '/my-donations',
    notifications: '/notifications',
    parents: '/parents',
    admin: '/admin',
    cases: '/cases',
    'create-request': '/create-request',
    'incoming-requests': '/incoming-requests',
  };

  const path = pathMap[id] || '/profile-v2';

  setActiveTab?.(id);
  setSidebarOpen(false);
  navigate(path);
};

const { can } = usePermissions();
const { user } = useAuth();
const isAdmin = user?.roles?.includes('admin');

const visibleItems = NAV_ITEMS.filter((item) => {
  if (isAdmin && (item.id === 'parents' || item.id === 'create-request')) {
    return false;
  }
  return !item.condition || can(item.condition);
});

  return (
    <>
      <style>{SIDEBAR_CSS}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="sb-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 49,
            display: 'none',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Hamburger (mobile) */}
      <button
       type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="sb-hamburger"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 60,
          background: 'linear-gradient(135deg, rgba(29,110,216,0.85), rgba(14,165,233,0.7))',
          border: '1.5px solid rgba(255,255,255,0.2)',
          borderRadius: 12,
          width: 44,
          height: 44,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 20,
          color: '#fff',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 18px rgba(29,110,216,0.45)',
          transition: 'all 0.2s',
        }}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* ── Sidebar Panel ── */}
      <aside
        className={`sb-aside${sidebarOpen ? ' sb-aside--open' : ''}`}
        style={{
          width: 240,
          minHeight: '100vh',
          /* Rich deep-navy gradient matching the app's blue palette */
          background: 'linear-gradient(180deg, #060f1e 0%, #0a1a30 20%, #0d2040 50%, #0f2744 75%, #122d52 100%)',
          border: '1px solid rgba(29,110,216,0.22)',
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 12px',
          gap: 4,
          overflowX: 'hidden',
          flexShrink: 0,
          direction: 'rtl',
          zIndex: 50,
          margin: '0',
          animation: 'sidebarSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: [
            '0 8px 40px rgba(0,0,0,0.45)',
            '0 0 0 1px rgba(29,110,216,0.15)',
            'inset 0 1px 0 rgba(255,255,255,0.06)',
          ].join(', '),
        }}
      >
        {/* ── Decorative background orbs ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          {/* Orb 1 — top right */}
          <div style={{
            position: 'absolute',
            top: '5%',
            right: '-20%',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,110,216,0.18) 0%, transparent 70%)',
            animation: 'orbFloat1 9s ease-in-out infinite',
          }} />
          {/* Orb 2 — middle left */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '-30%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
            animation: 'orbFloat2 11s ease-in-out infinite',
          }} />
          {/* Orb 3 — bottom */}
          <div style={{
            position: 'absolute',
            bottom: '8%',
            right: '-10%',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
            animation: 'orbFloat3 7s ease-in-out infinite',
          }} />
          {/* Subtle grid lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(29,110,216,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(29,110,216,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }} />
        </div>

        {/* ── All content above orbs ── */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>

          {/* ── Logo ── */}
          <div style={{
            textAlign: 'center',
            marginBottom: 18,
            paddingBottom: 16,
            borderBottom: '1px solid rgba(29,110,216,0.2)',
          }}>
            {/* Glow ring behind logo */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 6 }}>
              <div style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
                animation: 'glowPulse 3s ease-in-out infinite',
              }} />
              <div
  style={{
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'logoFloat 4s ease-in-out infinite',
    boxShadow: '0 0 18px rgba(251,191,36,0.35)',
  }}
>
  <FaStar
    style={{
      color: '#ffffff',
      fontSize: 26,
      filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.45))',
    }}
  />
</div>
            </div>
            <div style={{
              fontSize: 16,
              fontWeight: 900,
              color: '#fff',
              fontFamily: "'Cairo', sans-serif",
              letterSpacing: '0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              بطل العطاء
            </div>
            <div style={{
              fontSize: 10,
              color: 'rgba(14,165,233,0.8)',
              fontWeight: 700,
              fontFamily: "'Cairo', sans-serif",
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>
              Madina Al-Ataa
            </div>
          </div>

          {/* ── User card ── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(29,110,216,0.22) 0%, rgba(14,165,233,0.12) 100%)',
            borderRadius: 18,
            padding: '14px 12px',
            marginBottom: 10,
            border: '1px solid rgba(29,110,216,0.3)',
            boxShadow: [
              '0 4px 20px rgba(0,0,0,0.2)',
              'inset 0 1px 0 rgba(255,255,255,0.08)',
            ].join(', '),
            animation: 'borderGlow 4s ease-in-out infinite',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Card shimmer line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }} />

            {/* Avatar + info row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
              direction: 'rtl',
            }}>
              <button
                type="button"
                onClick={() => navigate('/avatar')}
                title="تغيير الصورة الشخصية"
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  borderRadius: '50%',
                }}
              >
                <AvatarSVG bg={avatarTheme.bg} accessory={avatarTheme.accessory} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#fff',
                  fontFamily: "'Cairo', sans-serif",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}>
                  {userStats.name}
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#fbbf24',
                  fontWeight: 700,
                  fontFamily: "'Cairo', sans-serif",
                  textShadow: '0 0 8px rgba(251,191,36,0.4)',
                }}>
                  {userStats.title}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 3,
                  background: 'rgba(29,110,216,0.3)',
                  border: '1px solid rgba(29,110,216,0.4)',
                  borderRadius: 99,
                  padding: '1px 8px',
                }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontFamily: "'Cairo', sans-serif" }}>
                    المستوى
                  </span>
                  <span style={{ fontSize: 11, color: '#60a5fa', fontWeight: 900, fontFamily: "'Cairo', sans-serif" }}>
                    {userStats.level}
                  </span>
                </div>
              </div>
            </div>

            {/* XP bar */}
            <div style={{ marginBottom: 6 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 5,
              }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontFamily: "'Cairo', sans-serif" }}>
                  XP
                </span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontFamily: "'Cairo', sans-serif" }}>
                  {userStats.xp} / {userStats.xpNeeded}
                </span>
              </div>
              <div style={{
                height: 7,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 99,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  height: '100%',
                  width: `${xpPct}%`,
                  background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fde68a 100%)',
                  backgroundSize: '200% 100%',
                  borderRadius: 99,
                  transition: 'width 0.9s ease-out',
                  animation: 'xpShimmer 2.5s linear infinite',
                  boxShadow: '0 0 8px rgba(251,191,36,0.5)',
                }} />
              </div>
            </div>

            {/* KP badge */}
            <div style={{
              marginTop: 10,
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: 12,
              padding: '6px 10px',
              textAlign: 'center',
              fontFamily: "'Cairo', sans-serif",
              fontSize: 12,
              fontWeight: 900,
              color: '#fbbf24',
              boxShadow: '0 2px 8px rgba(251,191,36,0.1)',
              textShadow: '0 0 10px rgba(251,191,36,0.4)',
            }}>
              <FaCoins style={{ marginLeft: 6 }} /> {userStats.kp.toLocaleString('ar-EG')} نقطة خير
            </div>
          </div>

<nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
  {visibleItems.map((item) => (
    <React.Fragment key={item.id}>
      {item.dividerBefore && (
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(29,110,216,0.3), transparent)',
            margin: '8px 4px',
          }}
        />
      )}

      <NavBtn
        item={item}
        active={
          item.id === 'parents'
            ? location.pathname === '/parents'
            : item.id === 'profile'
            ? location.pathname === '/profile-v2'
            : item.id === 'avatar'
            ? location.pathname === '/avatar'
            : item.id === 'impact'
            ? location.pathname === '/impact'
            : item.id === 'map'
            ? location.pathname === '/map'
            : item.id === 'badges'
            ? location.pathname === '/badges'
            : item.id === 'leaderboard'
            ? location.pathname === '/leaderboard'
            : item.id === 'orders'
            ? location.pathname === '/orders'
            : item.id === 'daily'
            ? location.pathname === '/daily-tasks'
            : item.id === 'explore'
            ? location.pathname === '/city-exploration'
            : item.id === 'city'
            ? location.pathname === '/city-map'
            : item.id === 'geo'
            ? location.pathname === '/geo-quests'
            : item.id === 'team'
            ? location.pathname === '/team-challenges'
            : item.id === 'my-donations'
            ? location.pathname === '/my-donations'
            : item.id === 'notifications'
            ? location.pathname === '/notifications'
            : item.id === 'admin'
            ? location.pathname === '/admin'
            : item.id === 'cases'
            ? location.pathname === '/cases'
            : item.id === 'create-request'
            ? location.pathname === '/create-request'
            : item.id === 'incoming-requests'
            ? location.pathname === '/incoming-requests'
            : activeTab === item.id
        }
        onClick={handleNavClick}
      />
    </React.Fragment>
  ))}
</nav>

          {/* ── Dark Mode Toggle ── */}
          <DarkModeToggle />

          {/* ── Logout Button ── */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              marginTop: 8,
              padding: '10px 14px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              textAlign: 'right',
              direction: 'rtl',
              transition: 'all 0.25s ease',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,0,0,0.1)';
              e.currentTarget.style.color = '#ff6b6b';
              e.currentTarget.style.borderColor = 'rgba(255,107,107,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            تسجيل الخروج
          </button>

          {/* ── Footer ── */}
          <div style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(29,110,216,0.15)',
            textAlign: 'center',
            fontFamily: "'Cairo', sans-serif",
            fontSize: 10,
            color: 'rgba(14,165,233,0.45)',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}>
            بطل العطاء v1.0
            <span style={{
              display: 'inline-block',
              marginRight: 4,
              animation: 'starTwinkle 2s ease-in-out infinite',
            }}><FaStar /></span>
          </div>
        </div>
      </aside>
    </>
  );
}
