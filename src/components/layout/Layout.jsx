// src/components/layout/Layout.jsx

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Notification from '../common/Notification';
import GlobalLoadingHost from '../common/GlobalLoadingHost';
import RocketBackground from '../common/RocketBackground';
import CanvasBackground from '../common/CanvasBackground';
import ConfettiOverlay from '../common/ConfettiOverlay';
import LevelUpModal from '../modals/LevelUpModal';
import useGameState from '../../hooks/useGameState';
import { useState, useEffect } from 'react';
import { userLevelsService } from '../../services/userLevelsService';
import { profilesService } from '../../services/profilesService';
import { useAuth } from '../../hooks/useAuth';
import GameEngine from '../../services/GameEngine';

const TAB_TO_PATH = {
  map: '/map',
  profile: '/profile-v2',
  avatar: '/avatar',
  cases: '/cases',
  daily: '/daily-tasks',
  explore: '/city-exploration',
  city: '/city-map',
  geo: '/geo-quests',
  team: '/team-challenges',
  badges: '/badges',
  certificates: '/certificates',
  leaderboard: '/leaderboard',
  impact: '/impact',
  parents: '/parents',
  'create-request': '/create-request',
  'my-donations': '/my-donations',
  orders: '/orders',
  'available-missions': '/available-missions',
  locations: '/locations',
  activities: '/activities',
  levels: '/levels',
  missions: '/missions',
  admin: '/admin',
  'incoming-requests': '/incoming-requests',
  'my-children': '/my-children',
  'volunteer-requests': '/volunteer-requests',
  'volunteer-orders': '/volunteer-orders',
  'donation-orders-donor': '/approved-donation-requests',
  'my-donation-orders': '/my-donation-orders',
  'donation-orders': '/donation-orders',
  notifications: '/notifications',
};

const PATH_TO_TAB = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([tab, path]) => [path, tab])
);

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeTab = PATH_TO_TAB[location.pathname] || '';

  const handleNavClick = (id) => {
    const path = TAB_TO_PATH[id];
    if (path) {
      navigate(path);
    }
  };

  const { state, actions } = useGameState();
  const {
    userStats, avatarTheme,
    showLevelUp, levelUpData,
    notification,
  } = state;
  const {
    setActiveTab,
    setShowLevelUp,
    syncUserStats,
  } = actions;

  const { user } = useAuth();

  // Initial name sync from auth
  useEffect(() => {
    if (user && userStats.name === 'جاري التحميل...') {
      syncUserStats({ name: user.name || user.fullName || user.userName });
    }
  }, [user, userStats.name, syncUserStats]);

  // Sync user stats from backend
  useEffect(() => {
    const fetchAndSyncStats = async () => {
      if (!user) return;
      
      const isAdmin = user.roles?.includes('admin');
      if (isAdmin) return;

      try {
        const response = await userLevelsService.getMyLevel();
        if (response && response.item) {
           const item = response.item;
           
           // Also fetch profile for name if needed
           let name = user.name || user.fullName || user.userName || userStats.name;
           try {
             const profile = await profilesService.fetchMyProfile();
             if (profile && profile.name) name = profile.name;
           } catch (pErr) {
             console.warn('Could not fetch profile name in Layout sync:', pErr);
           }

           syncUserStats({
             xp: item.xp ?? item.currentXP ?? 0,
             xpNeeded: item.xpNeeded ?? item.nextLevelXP ?? 1000,
             level: item.level ?? item.currentLevel ?? 1,
             kp: item.kp ?? 0,
             title: GameEngine.titleForLevel(item.level ?? item.currentLevel ?? 1),
             name: name,
           });
         }
      } catch (err) {
        console.error('Error syncing user stats in Layout:', err);
      }
    };

    fetchAndSyncStats();
     
     // Refresh stats periodically or on focus
     const interval = setInterval(fetchAndSyncStats, 60000); // every minute
     window.addEventListener('focus', fetchAndSyncStats);
     window.addEventListener('sync-user-stats', fetchAndSyncStats);

     return () => {
       clearInterval(interval);
       window.removeEventListener('focus', fetchAndSyncStats);
       window.removeEventListener('sync-user-stats', fetchAndSyncStats);
     };
   }, [user, syncUserStats]);

  // ── Mobile Nav ────────────────────────────────────────────────────────────
  const MOBILE_NAV = [
    { id: 'map',     label: 'الخريطة',  icon: '🗺️' },
    { id: 'daily',   label: 'يومي',     icon: '✅' },
    { id: 'explore', label: 'استكشاف', icon: '🧭' },
    { id: 'badges',  label: 'الأوسمة',  icon: '🏆' },
    { id: 'profile', label: 'ملفي',     icon: '👤' },
  ];

  const MobileNavBar = ({ activeTab, onNavClick }) => (
    <nav
      className="mobile-nav"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-card)',
        borderTop: '1.5px solid var(--border)',
        zIndex: 80,
        paddingBottom: 'env(safe-area-inset-bottom)',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      {MOBILE_NAV.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavClick(item.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '6px 4px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            fontSize: 10,
            fontWeight: activeTab === item.id ? 900 : 600,
            color: activeTab === item.id ? '#1d6ed8' : 'var(--text-secondary)',
            transition: 'color 0.18s',
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(12px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .tab-enter {
          animation: slideUp 0.3s ease-out;
        }
        @media (max-width: 768px) {
          .mobile-nav { display: flex !important; }
          .main-content { padding-bottom: 72px !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        position: 'relative',
        transition: 'background 0.4s ease',
      }}>
        {/* Background layers */}
        <CanvasBackground />
        <RocketBackground />

        <style>{`
        .layout-shell {
          display: flex;
          gap: 16px;
          min-height: 100vh;
          padding: 16px;
          position: relative;
          z-index: 1;
        }

        .layout-main {
          flex: 1;
          min-width: 0;
          position: relative;
        }

        @media (max-width: 768px) {
          .layout-shell {
            padding: 12px;
          }

          .layout-main {
            padding-top: 60px; /* علشان زر الهامبرجر */
          }
        }
      `}</style>

      <div className="layout-shell">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userStats={userStats}
          avatarTheme={avatarTheme}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="layout-main">
          <GlobalLoadingHost contained />
          <Outlet />
        </main>
      </div>

        {/* Mobile Nav Bar */}
        <MobileNavBar activeTab={activeTab} onNavClick={handleNavClick} />

        {/* Modals and overlays */}
        {showLevelUp && (
          <LevelUpModal
            level={levelUpData.level}
            title={levelUpData.title}
            onClose={() => setShowLevelUp(false)}
          />
        )}
        <ConfettiOverlay active={showLevelUp} />
        <Notification message={notification} />
      </div>
    </>
  );
};

export default Layout;
