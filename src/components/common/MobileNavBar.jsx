// src/components/common/MobileNavBar.jsx

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

export default MobileNavBar;