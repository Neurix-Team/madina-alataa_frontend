// src/components/layout/Layout.jsx

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardCards from '../common/DashboardCards';
import Notification from '../common/Notification';
import RocketBackground from '../common/RocketBackground';
import CanvasBackground from '../common/CanvasBackground';
import ConfettiOverlay from '../common/ConfettiOverlay';
import XpBar from '../common/XpBar';
import LevelUpModal from '../modals/LevelUpModal';
import useGameState from '../../hooks/useGameState';
import { useState } from 'react';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const [sidebarOpen, setSidebarOpen] = useState(false);


  const PATH_TO_TAB = {
    '/map': 'map',
    '/daily-tasks': 'daily',
    '/city-exploration': 'explore',
    '/badges': 'badges',
    '/activities': 'activities',
    '/levels': 'levels',
    '/profile-v2': 'profile',
  };

  const activeTab = PATH_TO_TAB[location.pathname] || 'profile';

  const handleNavClick = (id) => {
    const pathMap = {
      map: '/map',
      daily: '/daily-tasks',
      explore: '/city-exploration',
      badges: '/badges',
      activities: '/activities',
      levels: '/levels',
      profile: '/profile-v2',
    };
    const path = pathMap[id];
    if (path) {
      navigate(path);
    }
  };

  const { state, actions } = useGameState();
  const {
    userStats, avatarTheme, completedQuests,
    showLevelUp, levelUpData,
    notification,
  } = state;
  const {
    setActiveTab,
    setShowLevelUp,
  } = actions;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const completedCount = completedQuests instanceof Set
    ? completedQuests.size
    : (completedQuests?.length ?? 0);

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

  const setActiveTabWithPath = (tab) => {
    setActiveTab(tab);
    const path = TAB_TO_PATH[tab];
    if (path) {
      navigate(path);
    }
  };

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
          background: var(--bg-app);
        }

        .layout-main {
          flex: 1;
          min-width: 0;
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
          <Outlet />
        </main>
      </div>

        {/* Mobile Nav Bar */}
        <MobileNavBar activeTab={activeTab} onNavClick={handleNavClick} />

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 55,
              display: window.innerWidth <= 768 ? 'block' : 'none',
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

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
