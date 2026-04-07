// // src/App.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
// import useGameState       from './hooks/useGameState';
// import GameEngine         from './services/GameEngine';
// import AudioManager       from './services/AudioManager';
// import ThemeService       from './services/ThemeService';
// import OrderService       from './services/OrderService';

// // Layout & common
// import Sidebar            from './components/layout/Sidebar';
// import DashboardCards     from './components/common/DashboardCards';
// import Notification       from './components/common/Notification';
// import RocketBackground   from './components/common/RocketBackground';
// import CanvasBackground   from './components/common/CanvasBackground';
// import ConfettiOverlay    from './components/common/ConfettiOverlay';

// // Auth
// import AuthScreen         from './components/auth/AuthScreen';

// // Modals
// import LevelUpModal       from './components/modals/LevelUpModal';
// import TutorialModal      from './components/modals/TutorialModal';
// import DailyRewardModal   from './components/modals/DailyRewardModal';
// import ZoneDetailModal    from './components/modals/ZoneDetailModal';
// import QuestModal         from './components/modals/QuestModal';

// // Tabs
// import MapTab             from './components/tabs/MapTab';
// import BadgesTab          from './components/tabs/BadgesTab';
// import LeaderboardTab     from './components/tabs/LeaderboardTab';
// import ImpactTab          from './components/tabs/ImpactTab';
// import ProfileTab         from './components/tabs/ProfileTab';
// // import ParentsTab         from './components/tabs/ParentsTab';
// import MyDonationsPage from './pages/MyDonationsPage';
// import MyChildrenPage from './pages/MyChildrenPage';
// import ParentsPage from './pages/ParentsPage';
// import ParentsTab from './components/tabs/ParentsTab';
// // import MyChildrenPage from './pages/MyChildrenPage';
// import CityMapTab         from './components/tabs/CityMapTab';
// import GeoQuestsTab       from './components/tabs/GeoQuestsTab';
// import TeamChallengesTab  from './components/tabs/TeamChallengesTab';
// import CityExplorationTab from './components/tabs/CityExplorationTab';
// import DailyTasksTab      from './components/tabs/DailyTasksTab';
// import OrdersTab          from './components/tabs/OrdersTab';
// import AdminTab           from './components/tabs/AdminTab';
// import ProfileV2Page      from './pages/ProfileV2Page';
// import CasesPage          from './pages/CasesPage/CasesPage';
// import CaseDetailsPage    from './pages/CaseDetailsPage';
// import DonationCheckoutPage from './pages/DonationCheckoutPage';
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import useGameState from './hooks/useGameState';
import GameEngine from './services/GameEngine';
import AudioManager from './services/AudioManager';
import ThemeService from './services/ThemeService';
import OrderService from './services/OrderService';

// Layout & common
import Sidebar from './components/layout/Sidebar';
import DashboardCards from './components/common/DashboardCards';
import Notification from './components/common/Notification';
import RocketBackground from './components/common/RocketBackground';
import CanvasBackground from './components/common/CanvasBackground';
import ConfettiOverlay from './components/common/ConfettiOverlay';

// Auth
import AuthScreen from './components/auth/AuthScreen';

// Modals
import LevelUpModal from './components/modals/LevelUpModal';
import TutorialModal from './components/modals/TutorialModal';
import DailyRewardModal from './components/modals/DailyRewardModal';
import ZoneDetailModal from './components/modals/ZoneDetailModal';
import QuestModal from './components/modals/QuestModal';
// import ThemeService from './services/ThemeService';

// Tabs
import MapTab from './components/tabs/MapTab';
import BadgesTab from './components/tabs/BadgesTab';
import LeaderboardTab from './components/tabs/LeaderboardTab';
import ImpactTab from './components/tabs/ImpactTab';
import ProfileTab from './components/tabs/ProfileTab';
import ParentsTab from './components/tabs/ParentsTab';
import CityMapTab from './components/tabs/CityMapTab';
import GeoQuestsTab from './components/tabs/GeoQuestsTab';
import TeamChallengesTab from './components/tabs/TeamChallengesTab';
import CityExplorationTab from './components/tabs/CityExplorationTab';
import DailyTasksTab from './components/tabs/DailyTasksTab';
import OrdersTab from './components/tabs/OrdersTab';
import AdminTab from './components/tabs/AdminTab';

// Pages
import ProfileV2Page from './pages/ProfileV2Page';
import CasesPage from './pages/CasesPage/CasesPage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import DonationCheckoutPage from './pages/DonationCheckoutPage';
import MyDonationsPage from './pages/MyDonationsPage';
import MyChildrenPage from './pages/MyChildrenPage';


const isStandalonePage = (pathname) =>
  pathname === '/profile-v2' ||
  pathname === '/my-donations' ||
  pathname === '/my-children' ||
  pathname === '/parents' ||
  pathname === '/cases' ||
  pathname.startsWith('/cases/') ||
  pathname.startsWith('/donate/');

// ── Theme service singleton ───────────────────────────────────────────────
const themeSvc = ThemeService.getInstance();
// ── Global CSS ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
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
`;

// ── XP Bar ────────────────────────────────────────────────────────────────
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

// ── Mobile Nav ────────────────────────────────────────────────────────────
const MOBILE_NAV = [
  { id: 'map',     label: 'الخريطة',  icon: '🗺️' },
  { id: 'daily',   label: 'يومي',     icon: '✅' },
  { id: 'explore', label: 'استكشاف', icon: '🧭' },
  { id: 'badges',  label: 'الأوسمة',  icon: '🏆' },
  { id: 'profile', label: 'ملفي',     icon: '👤' },
];

const MobileNavBar = ({ activeTab, setActiveTab }) => (
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
        onClick={() => setActiveTab(item.id)}
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

// ── App ───────────────────────────────────────────────────────────────────
const TAB_TO_PATH = {
  map: '/map',
  daily: '/daily',
  explore: '/explore',
  city: '/city',
  geo: '/geo',
  team: '/team',
  badges: '/badges',
  leaderboard: '/leaderboard',
  impact: '/impact',
  profile: '/profile-v2',
  cases: '/cases',
  orders: '/orders',
  admin: '/admin',
};

const PATH_TO_TAB = Object.entries(TAB_TO_PATH).reduce((acc, [tab, path]) => {
  acc[path] = tab;
  return acc;
}, {});

function AppContent() {
  const { state, actions } = useGameState();
  const {
    appState, activeTab, activeZone, activeQuest,
    showTutorial, showDailyReward, showLevelUp, levelUpData,
    notification, userStats, avatarTheme, completedQuests,
    orders,
  } = state;
  const {
    login, setActiveTab,
    openZone, closeZone,
    openQuest, closeQuest,
    completeQuest, completeGeoQuest,
    finishTutorial, claimDailyReward,
    handleDonate, setShowLevelUp,
    setAvatarColor, setAvatarAccessory,
    addOrder,
  } = actions;

  // ── Order-wired handlers ──────────────────────────────────────────────
  const handleCompleteQuest = useCallback((quest) => {
    completeQuest(quest);
    const order = OrderService.createVolunteerOrder(
      'user1',
      quest?.id ?? 'unknown',
      quest?.beneficiaryId ?? null,
      { kp: quest?.reward?.kp ?? 0, xp: quest?.reward?.xp ?? 0, impact: quest?.reward?.impact ?? 0 }
    );
    addOrder(order);
  }, [completeQuest, addOrder]);

  const handleDonateWithOrder = useCallback((amount) => {
    handleDonate(amount);
    const order = OrderService.createDonationOrder('user1', amount, null);
    addOrder(order);
  }, [handleDonate, addOrder]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Subscribe to theme changes to force re-render
  const [, setThemeTick] = useState(0);
  useEffect(() => {
    const unsub = themeSvc.subscribe(() => setThemeTick((t) => t + 1));
    return unsub;
  }, []);

  const setActiveTabWithClose = useCallback((tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  }, [setActiveTab]);

  const navigate = useNavigate();
  const location = useLocation();

  // Sync URL -> activeTab
  useEffect(() => {
    if (appState === 'auth' || isStandalonePage(location.pathname)) return;

    // const tabFromPath = PATH_TO_TAB[location.pathname];
    // if (tabFromPath && tabFromPath !== activeTab) {
    //   setActiveTab(tabFromPath);
    // }
  }, [location.pathname, activeTab, setActiveTab, appState]);

  // Sync activeTab -> URL (skip while landing on explicit tab routes to avoid visual bounce)
  useEffect(() => {
    if (appState === 'auth' || isStandalonePage(location.pathname)) return;

    // const tabFromPath = PATH_TO_TAB[location.pathname];
    // if (tabFromPath && tabFromPath === activeTab) return;

    // const expectedPath = TAB_TO_PATH[activeTab] || '/map';
    // if (location.pathname !== expectedPath) {
    //   navigate(expectedPath, { replace: true });
    // }
  }, [activeTab, location.pathname, navigate, appState]);

  const completedCount = completedQuests instanceof Set
    ? completedQuests.size
    : (completedQuests?.length ?? 0);

const isGameRoute = !isStandalonePage(location.pathname);

  const gameScreen = (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        position: 'relative',
        transition: 'background 0.4s ease',
      }}>
        {/* Background layers */}
        {isGameRoute && <CanvasBackground />}
        {isGameRoute && <RocketBackground />}

        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'flex-start',
        }}>
          {/* Sidebar */}
          {isGameRoute && (
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTabWithClose}
              userStats={userStats}
              avatarTheme={avatarTheme}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          )}

          {/* Main content */}
          <main
            className="main-content"
            style={{
              flex: 1,
              padding: '20px',
              direction: 'rtl',
              minHeight: '100vh',
            }}
          >
            {/* Dashboard stat cards */}
            {isGameRoute && <DashboardCards userStats={userStats} completedCount={completedCount} />}

            {/* XP progress bar */}
            {isGameRoute && <XpBar userStats={userStats} />}

            {/* Tab content */}
            <div className="tab-enter" key={activeTab}>
              {activeTab === 'map'         && <MapTab             completedQuests={completedQuests} onOpenZone={openZone} />}
              {activeTab === 'daily'       && <DailyTasksTab />}
              {activeTab === 'explore'     && <CityExplorationTab userStats={userStats} completedQuests={completedQuests} onCompleteQuest={handleCompleteQuest} />}
              {activeTab === 'city'        && <CityMapTab         completedQuests={completedQuests} />}
              {activeTab === 'geo'         && <GeoQuestsTab       completedQuests={completedQuests} onCompleteQuest={completeGeoQuest} />}
              {activeTab === 'team'        && <TeamChallengesTab  userStats={userStats} avatarTheme={avatarTheme} />}
              {activeTab === 'badges'      && <BadgesTab completedQuests={completedQuests} userStats={userStats} orders={orders} />}
              {activeTab === 'leaderboard' && <LeaderboardTab     userKP={userStats.kp} />}
              {activeTab === 'impact'      && <ImpactTab          userStats={userStats} completedCount={completedCount} onDonate={handleDonateWithOrder} />}
              {activeTab === 'profile'     && <ProfileTab         avatarTheme={avatarTheme} onSetColor={setAvatarColor} onSetAccessory={setAvatarAccessory} />}
              {/* {activeTab === 'parents'     && <ParentsTab         userStats={userStats} />} */}
              {activeTab === 'orders'      && <OrdersTab          orders={orders} userStats={userStats} onAddOrder={addOrder} />}
              {activeTab === 'admin'       && <AdminTab           orders={orders} userStats={userStats} />}
            </div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        {isGameRoute && <MobileNavBar activeTab={activeTab} setActiveTab={setActiveTabWithClose} />}

        {/* ── Modals ── */}
        {showTutorial && (
          <TutorialModal onFinish={finishTutorial} />
        )}
        {showDailyReward && !showTutorial && (
          <DailyRewardModal onClaim={claimDailyReward} />
        )}
        {showLevelUp && (
          <LevelUpModal
            level={levelUpData.level}
            title={levelUpData.title}
            onClose={() => setShowLevelUp(false)}
          />
        )}
        {activeZone && (
          <ZoneDetailModal
            zone={activeZone}
            completedQuests={completedQuests}
            onClose={closeZone}
            onOpenQuest={(q) => { closeZone(); openQuest(q); }}
          />
        )}
        {activeQuest && (
          <QuestModal
            quest={activeQuest}
            onClose={closeQuest}
            onComplete={handleCompleteQuest}
          />
        )}

        <ConfettiOverlay active={showLevelUp} />
        <Notification message={notification} />
      </div>
    </>
  );

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          appState === 'auth'
            ? (
              <>
                <style>{GLOBAL_CSS}</style>
                <AuthScreen onLogin={login} />
              </>
            )
            : <Navigate to={TAB_TO_PATH[activeTab] || '/profile-v2'} replace />
        }
      />
      <Route
        path="/profile-v2"
        element={
          appState === 'auth'
            ? <Navigate to="/auth" replace />
            : <ProfileV2Page />
        }
      />
      <Route
        path="/cases"
        element={
          appState === 'auth'
            ? <Navigate to="/auth" replace />
            : (
              <>
                <style>{GLOBAL_CSS}</style>
                <CasesPage />
              </>
            )
        }
      />
      <Route
        path="/cases/:id"
        element={
          appState === 'auth'
            ? <Navigate to="/auth" replace />
            : (
              <>
                <style>{GLOBAL_CSS}</style>
                <CaseDetailsPage />
              </>
            )
        }
      />
      <Route
        path="/donate/:id"
        element={
          appState === 'auth'
            ? <Navigate to="/auth" replace />
            : (
              <>
                <style>{GLOBAL_CSS}</style>
                <DonationCheckoutPage />
              </>
            )
        }
      />
      {/* <Route
  path="/parents"
  element={
    appState === 'auth'
      ? <Navigate to="/auth" replace />
      : (
        <>
          <style>{GLOBAL_CSS}</style>
          <ParentsTab userStats={userStats} />
        </>
      )
  }
/> */}

<Route
  path="/parents"
  element={
    appState === 'auth'
      ? <Navigate to="/auth" replace />
      : (
        <>
          <style>{GLOBAL_CSS}</style>
          <ParentsTab userStats={userStats} />
        </>
      )
  }
/>

<Route
  path="/my-children"
  element={
    appState === 'auth'
      ? <Navigate to="/auth" replace />
      : (
        <>
          <style>{GLOBAL_CSS}</style>
          <MyChildrenPage />
        </>
      )
  }
/>

<Route
  path="/my-donations"
  element={
    appState === 'auth'
      ? <Navigate to="/auth" replace />
      : (
        <>
          <style>{GLOBAL_CSS}</style>
          <MyDonationsPage />
        </>
      )
  }
/>
      <Route
        path="*"
        element={
          appState === 'auth'
            ? <Navigate to="/auth" replace />
            : gameScreen
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
