import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaMap,
  FaMoneyBillWave,
  FaCog,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaStar,
  FaBolt,
  FaGem,
  FaHeart,
  FaUsers,
  FaTrophy,
  FaSmile,
  FaSync,
  FaCalendarCheck,
  FaCheckCircle,
  FaMedal,
  FaRocket,
  FaTimes,
} from 'react-icons/fa';
import { createToken, decodeToken } from '../utils/jwt';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #071226 0%, #0a1c3a 50%, #0f2246 100%)',
    color: '#fff',
    fontFamily: "'Cairo', sans-serif",
    direction: 'rtl',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: 240,
    height: '100vh',
    background: 'linear-gradient(180deg, rgba(5,12,28,0.96), rgba(8,17,36,0.96))',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.25)',
    padding: '24px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    zIndex: 5,
  },
  logoWrap: { marginBottom: 10, textAlign: 'center' },
  logo: { fontSize: 28, fontWeight: 900, color: '#4A90D9', marginBottom: 3 },
  subtitle: { fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.72)', fontWeight: 700 },
  miniProfile: {
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(74, 144, 217, 0.08)',
    padding: 12,
    cursor: 'pointer',
    textAlign: 'center',
    transition: '0.2s ease',
  },
  miniAvatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    margin: '0 auto 8px',
    background: 'linear-gradient(135deg,#4A90D9,#7c3aed)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 24,
    fontWeight: 900,
  },
  miniName: { fontSize: 15, fontWeight: 800, marginBottom: 2 },
  miniLink: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
  navBtn: {
    width: '100%',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    background: 'transparent',
    color: '#e4ecff',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
  },
  main: {
    marginRight: 240,
    padding: 24,
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.04)',
    boxShadow: '0 18px 35px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(6px)',
  },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    padding: 20,
    minHeight: 320,
    background: 'linear-gradient(135deg,#0a1633,#1c1040)',
  },
  heroAvatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    margin: '12px auto 10px',
    background: 'linear-gradient(135deg,#4A90D9,#7c3aed)',
    border: '2px solid rgba(255,255,255,0.45)',
    boxShadow: '0 0 0 0 rgba(124,58,237,0.55)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 900,
    fontSize: 34,
    cursor: 'pointer',
    animation: 'avatarPulse 2.2s infinite',
  },
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0,1fr))',
    gap: 12,
  },
};

const navItems = [
  { id: 'profile', label: 'الملف الشخصي', icon: FaUser },
  { id: 'roadmap', label: 'خريطة المهام', icon: FaMap },
  { id: 'donations', label: 'سجل التبرعات', icon: FaMoneyBillWave },
  { id: 'settings', label: 'الإعدادات', icon: FaCog },
];

const badges = [
  { title: 'المتبرع الكبير', desc: 'تبرعات كبيرة', icon: FaHeart, color: '#f59e0b', unlocked: true },
  { title: 'أعمال متعددة', desc: 'نشاط مستمر', icon: FaUsers, color: '#3b82f6', unlocked: true },
  { title: 'الفائز الأول', desc: 'إنجاز مبكر', icon: FaTrophy, color: '#a855f7', unlocked: true },
  { title: 'مُلهم', desc: 'تحفيز الآخرين', icon: FaSmile, color: '#22c55e', unlocked: true },
  { title: 'عطاء شهري', desc: 'عطاء كل شهر', icon: FaSync, color: '#06b6d4', unlocked: false },
  { title: 'منظم حدث', desc: 'أنشأ حملة', icon: FaCalendarCheck, color: '#f97316', unlocked: false },
];

const initialDonations = [
  { id: 1, child: 'أحمد محمد', date: '2026-01-11', amount: '250 ج.م', status: 'مكتمل' },
  { id: 2, child: 'سارة علي', date: '2026-02-02', amount: '100 ج.م', status: 'معلق' },
  { id: 3, child: 'محمود حسن', date: '2026-02-15', amount: '200 ج.م', status: 'مكتمل' },
];

function buildNearbyPlaces(city, lat, lng) {
  const base = city || 'منطقتك';
  const coordText = lat && lng ? `(${lat}, ${lng})` : '';
  return [
    { name: `جمعية نور العطاء - ${base}`, distance: '0.9 كم', note: `نقطة توزيع تبرعات ${coordText}`.trim() },
    { name: `مركز دعم الأطفال - ${base}`, distance: '1.6 كم', note: 'يقبل التبرعات العينية والنقدية' },
    { name: `مبادرة الخير الدورية - ${base}`, distance: '2.3 كم', note: 'متاح يوميًا من 10ص إلى 8م' },
  ];
}

export default function ProfileV2Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [activePanel, setActivePanel] = useState('profile');
  const [levelCount, setLevelCount] = useState(0);
  const [pointsCount, setPointsCount] = useState(0);
  const [progressFill, setProgressFill] = useState(0);
  const [donations, setDonations] = useState(initialDonations);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  const safeUser = useMemo(() => {
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    })();

    const token = localStorage.getItem('token');
    const decoded = token ? decodeToken(token) : null;
    return {
      heroName: decoded?.heroName || user?.heroName || 'البطل',
      role: decoded?.role || user?.role || 'donor',
      city: decoded?.city || 'القاهرة',
      email: decoded?.email || user?.email || '',
      address: decoded?.address || user?.address || '',
      lat: decoded?.lat ?? null,
      lng: decoded?.lng ?? null,
    };
  }, []);

  const [settingsForm, setSettingsForm] = useState({
    fullName: safeUser.heroName,
    email: safeUser.email,
    city: safeUser.city,
    address: safeUser.address,
    lat: safeUser.lat,
    lng: safeUser.lng,
  });

  useEffect(() => {
    if (safeUser.lat && safeUser.lng) {
      setMapEmbedUrl(`https://maps.google.com/maps?q=${safeUser.lat},${safeUser.lng}&z=15&output=embed`);
      setNearbyPlaces(buildNearbyPlaces(safeUser.city, safeUser.lat, safeUser.lng));
    }
  }, [safeUser]);

  useEffect(() => {
    setMounted(true);
    let l = 0;
    let p = 0;
    const maxL = 5;
    const maxP = 550;
    const interval = setInterval(() => {
      l = Math.min(maxL, l + 1);
      p = Math.min(maxP, p + 25);
      setLevelCount(l);
      setPointsCount(p);
      if (l === maxL && p === maxP) clearInterval(interval);
    }, 55);

    setTimeout(() => setProgressFill(55), 200);
    return () => clearInterval(interval);
  }, []);

  const roleText = safeUser.role === 'parent' ? 'ولي أمر' : 'متبرع';

  const goToProfile = () => {
    if (location.pathname === '/profile') return;
    navigate('/profile');
  };

  const doLogout = () => {
    navigate('/auth');
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setMapEmbedUrl(`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`);
        setSettingsForm((prev) => ({
          ...prev,
          lat,
          lng,
          address: prev.address || `إحداثيات: ${lat}, ${lng}`,
        }));
      },
      () => alert('تعذر تحديد الموقع الحالي'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveSettings = () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      alert('لا يوجد جلسة مستخدم نشطة');
      return;
    }

    const decoded = decodeToken(currentToken);
    if (!decoded) {
      alert('تعذر قراءة بيانات المستخدم الحالية');
      return;
    }

    const updatedPayload = {
      ...decoded,
      heroName: settingsForm.fullName || decoded.heroName,
      city: settingsForm.city || decoded.city,
      address: settingsForm.address || decoded.address || '',
      lat: settingsForm.lat ?? decoded.lat ?? null,
      lng: settingsForm.lng ?? decoded.lng ?? null,
    };

    const newToken = createToken(updatedPayload);

    let accounts = [];
    try {
      accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    } catch {
      accounts = [];
    }

    const idx = accounts.findIndex((acc) => acc === currentToken);
    if (idx >= 0) accounts[idx] = newToken;
    else accounts.push(newToken);

    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({
      email: updatedPayload.email,
      heroName: updatedPayload.heroName,
      role: updatedPayload.role,
      city: updatedPayload.city,
      address: updatedPayload.address,
      lat: updatedPayload.lat,
      lng: updatedPayload.lng,
    }));

    setNearbyPlaces(buildNearbyPlaces(updatedPayload.city, updatedPayload.lat, updatedPayload.lng));
    alert('تم حفظ التغييرات بنجاح');
  };

  const completeDonation = () => {
    if (!selectedDonation) return;
    setDonations((prev) =>
      prev.map((d) => (d.id === selectedDonation.id ? { ...d, status: 'مكتمل' } : d))
    );
    setSelectedDonation(null);
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        @keyframes slideUp { from { opacity:0; transform: translateY(18px);} to { opacity:1; transform: translateY(0);} }
        @keyframes popIn { from { opacity:0; transform: scale(.85);} to { opacity:1; transform: scale(1);} }
        @keyframes avatarPulse { 0% { box-shadow: 0 0 0 0 rgba(124,58,237,.55);} 70% { box-shadow: 0 0 0 16px rgba(124,58,237,0);} 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0);} }
        @keyframes starFloat { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-8px);} }
        @keyframes rocketFly { 0%,100% { transform: translateY(0) rotate(-8deg);} 50% { transform: translateY(-10px) rotate(-2deg);} }
        @keyframes panelSlide { from {opacity:0; transform: translateY(14px);} to {opacity:1; transform: translateY(0);} }
      `}</style>

      <aside style={styles.sidebar}>
        <div style={styles.logoWrap}>
          <div style={styles.logo}>بطل العطاء</div>
          <div style={styles.subtitle}>MADINA AL-ATAA</div>
        </div>

        <button
          style={{ ...styles.navBtn, marginBottom: 8, background: 'rgba(74,144,217,0.12)' }}
          onClick={() => navigate('/map')}
          title="الرجوع للخريطة"
        >
          <span>الرئيسية</span>
          <span>🏠</span>
        </button>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              style={{
                ...styles.navBtn,
                background: active ? 'rgba(74,144,217,0.16)' : 'transparent',
                color: active ? '#74b7ff' : '#e4ecff',
                borderLeft: active ? '4px solid #4A90D9' : '4px solid transparent',
              }}
            >
              <span>{item.label}</span>
              <Icon />
            </button>
          );
        })}
      </aside>

      <main style={styles.main}>
        <div style={{ ...styles.topRow, animation: mounted ? 'slideUp .5s ease both' : 'none' }}>
          <div style={{ ...styles.card, ...styles.heroCard }}>
            <FaStar style={{ position: 'absolute', top: 16, left: 20, color: '#facc15', animation: 'starFloat 2.4s ease-in-out infinite' }} />
            <FaStar style={{ position: 'absolute', top: 52, right: 24, color: '#fcd34d', animation: 'starFloat 2.8s ease-in-out infinite' }} />
            <FaStar style={{ position: 'absolute', bottom: 72, left: 30, color: '#fde68a', animation: 'starFloat 2.2s ease-in-out infinite' }} />
            <FaRocket style={{ position: 'absolute', top: 26, right: 64, color: '#93c5fd', animation: 'rocketFly 3s ease-in-out infinite' }} />
            <FaRocket style={{ position: 'absolute', bottom: 28, right: 30, color: '#c4b5fd', fontSize: 12, animation: 'rocketFly 2.2s ease-in-out infinite' }} />

            <div style={styles.heroAvatar} onClick={goToProfile} title="عرض الملف الشخصي">
              {safeUser.heroName?.[0] || 'ب'}
            </div>
            <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 900 }}>{settingsForm.fullName}</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, marginBottom: 10 }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg,#4A90D9,#7c3aed)',
                display: 'grid', placeItems: 'center',
                boxShadow: '0 0 14px rgba(74,144,217,.5)',
              }}>
                <FaCheckCircle />
              </span>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <span style={{
                fontWeight: 800,
                fontSize: 13,
                borderRadius: 999,
                padding: '6px 14px',
                background: 'rgba(74,144,217,.17)',
                border: '1px solid rgba(74,144,217,.36)',
              }}>{roleText}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, color: 'rgba(230,236,255,.8)', fontWeight: 600 }}>
              <FaMapMarkerAlt />
              <span>{settingsForm.city}</span>
            </div>
            <div style={{
              marginTop: 14,
              borderRadius: 12,
              background: 'rgba(34,197,94,.15)',
              border: '1px solid rgba(34,197,94,.35)',
              padding: '9px 12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              color: '#c8f8d8',
              fontWeight: 700,
              fontSize: 13,
            }}>
              <FaShieldAlt />
              <span>حساب موثق ✓</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: 12 }}>
              <StatCard icon={FaBolt} title={`المستوى ${levelCount}`} value={levelCount} grad="linear-gradient(135deg,#7c3aed,#4f46e5)" sub="تقدم ممتاز" />
              <StatCard icon={FaGem} title={`${pointsCount} نقطة`} value={pointsCount} grad="linear-gradient(135deg,#f59e0b,#f97316)" sub="رصيد النقاط" />
              <StatCard
                icon={FaMapMarkerAlt}
                title={settingsForm.address || `${settingsForm.city}, مصر`}
                value={settingsForm.city || 'مصر'}
                grad="linear-gradient(135deg,#0ea5e9,#3b82f6)"
                sub={settingsForm.lat && settingsForm.lng ? `${settingsForm.lat}, ${settingsForm.lng}` : 'الموقع الحالي'}
              />
            </div>

            <div style={{ ...styles.card, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                <span>المستوى التالي: 1000 نقطة</span>
                <span>550 / 1000</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,.12)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progressFill}%`,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg,#4A90D9,#7c3aed)',
                  boxShadow: '0 0 12px rgba(74,144,217,.7)',
                  transition: 'width 1.5s ease',
                }} />
              </div>
            </div>
          </div>
        </div>

        <section style={{ ...styles.card, padding: 16, marginBottom: 16, animation: mounted ? 'slideUp .6s ease both' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 900 }}>
            <FaMedal style={{ color: '#fbbf24' }} />
            <span>الشارات والإنجازات</span>
          </div>
          <div style={styles.badgeGrid}>
            {badges.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  style={{
                    borderRadius: 18,
                    padding: 12,
                    textAlign: 'center',
                    border: `1px solid ${b.unlocked ? `${b.color}66` : 'rgba(255,255,255,0.15)'}`,
                    background: b.unlocked ? `linear-gradient(135deg, ${b.color}22, rgba(255,255,255,0.05))` : 'rgba(255,255,255,0.03)',
                    filter: b.unlocked ? 'none' : 'grayscale(1) opacity(.6)',
                    transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                    animation: 'popIn .35s ease both',
                    animationDelay: `${idx * 70}ms`,
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', margin: '0 auto 8px',
                    display: 'grid', placeItems: 'center',
                    background: b.unlocked ? `${b.color}33` : 'rgba(255,255,255,0.08)',
                    color: b.unlocked ? b.color : '#cfd6e4',
                  }}>
                    <Icon />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.72)', fontWeight: 600 }}>{b.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {activePanel !== 'profile' && (
          <section style={{ ...styles.card, padding: 16, animation: 'panelSlide .35s ease both' }}>
            {activePanel === 'roadmap' && <RoadmapPanel />}
            {activePanel === 'donations' && (
              <DonationsPanel donations={donations} onOpenPending={(donation) => setSelectedDonation(donation)} />
            )}
            {activePanel === 'settings' && (
              <SettingsPanel
                form={settingsForm}
                setForm={setSettingsForm}
                onSave={handleSaveSettings}
                onDetectLocation={handleDetectLocation}
                onLogout={doLogout}
                mapEmbedUrl={mapEmbedUrl}
                nearbyPlaces={nearbyPlaces}
              />
            )}
          </section>
        )}
      </main>

      {selectedDonation && (
        <DonationModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onComplete={completeDonation}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, title, sub, grad }) {
  return (
    <div style={{
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.14)',
      padding: 14,
      background: grad,
      position: 'relative',
      boxShadow: '0 12px 22px rgba(0,0,0,.28)',
      overflow: 'hidden',
      minHeight: 110,
    }}>
      <div style={{ position: 'absolute', top: -24, left: -24, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,.16)' }} />
      <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.2)' }}>
        <Icon />
      </div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: 'rgba(255,255,255,.3)' }}>
        <div style={{ width: '70%', height: '100%', borderRadius: 999, background: 'rgba(255,255,255,.82)' }} />
      </div>
      <div style={{ marginTop: 5, fontSize: 11, color: 'rgba(255,255,255,.86)', fontWeight: 600 }}>{sub}</div>
    </div>
  );
}

function RoadmapPanel() {
  const tasks = [
    { text: 'أكمل بيانات الملف الشخصي', done: true },
    { text: 'قدم تبرعك الأول', done: true },
    { text: 'شارك في حملة', done: false },
    { text: 'ادعو صديق للمنصة', done: false },
    { text: 'تبرع لـ 5 أطفال مختلفين', done: false },
  ];
  return (
    <div>
      <h3 style={{ marginBottom: 12, fontWeight: 900 }}>خريطة المهام</h3>
      {tasks.map((t, i) => (
        <div key={t.text} style={{
          animation: 'slideUp .35s ease both',
          animationDelay: `${i * 90}ms`,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,.1)',
          background: t.done ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.04)',
          marginBottom: 8,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
        }}>
          <span style={{ textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.82 : 1 }}>{t.text}</span>
          <span>{t.done ? <FaCheckCircle color="#4ade80" /> : '⭕'}</span>
        </div>
      ))}
    </div>
  );
}

function DonationsPanel({ donations, onOpenPending }) {
  return (
    <div>
      <h3 style={{ marginBottom: 12, fontWeight: 900 }}>سجل التبرعات</h3>
      {donations.map((r, idx) => {
        const isPending = r.status === 'معلق';
        return (
          <div
            key={r.id}
            onClick={() => isPending && onOpenPending(r)}
            style={{
              borderRadius: 12,
              padding: '10px 12px',
              marginBottom: 8,
              border: '1px solid rgba(255,255,255,.1)',
              background: idx % 2 ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.025)',
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: 10,
              alignItems: 'center',
              cursor: isPending ? 'pointer' : 'default',
            }}
          >
            <div style={{ fontWeight: 700 }}>{r.child} • {r.date}</div>
            <div style={{ fontWeight: 800, color: '#86efac' }}>{r.amount}</div>
            <div style={{
              fontWeight: 700,
              fontSize: 12,
              color: r.status === 'مكتمل' ? '#4ade80' : '#fde047',
            }}>{r.status}</div>
          </div>
        );
      })}
    </div>
  );
}

function DonationModal({ donation, onClose, onComplete }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.6)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 60,
      padding: 16,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 460,
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,.15)',
        background: 'linear-gradient(180deg, rgba(11,23,48,0.98), rgba(16,30,60,0.98))',
        boxShadow: '0 18px 40px rgba(0,0,0,.45)',
        padding: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h4 style={{ margin: 0, fontWeight: 900 }}>تفاصيل التبرع المعلق</h4>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 }}
          >
            <FaTimes />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
          <div><strong>الطفل:</strong> {donation.child}</div>
          <div><strong>التاريخ:</strong> {donation.date}</div>
          <div><strong>المبلغ:</strong> {donation.amount}</div>
          <div><strong>الحالة:</strong> {donation.status}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button
            onClick={onComplete}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: 12,
              padding: '10px 12px',
              fontWeight: 800,
              cursor: 'pointer',
              color: '#fff',
              background: 'linear-gradient(90deg,#22c55e,#16a34a)',
            }}
          >
            إكمال التبرع
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              border: '1px solid rgba(255,255,255,.2)',
              borderRadius: 12,
              padding: '10px 12px',
              fontWeight: 800,
              cursor: 'pointer',
              color: '#fff',
              background: 'rgba(255,255,255,.08)',
            }}
          >
            لا، إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ form, setForm, onSave, onDetectLocation, onLogout, mapEmbedUrl, nearbyPlaces }) {
  return (
    <div>
      <h3 style={{ marginBottom: 12, fontWeight: 900 }}>الإعدادات</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        <Input label="الاسم الكامل" value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} />
        <Input label="البريد الإلكتروني" value={form.email} onChange={() => {}} readOnly />
        <Input label="المدينة" value={form.city} onChange={(v) => setForm((p) => ({ ...p, city: v }))} />
        <Input label="العنوان" value={form.address || ''} onChange={(v) => setForm((p) => ({ ...p, address: v }))} />

        <button
          onClick={onDetectLocation}
          style={{
            border: '1px solid rgba(59,130,246,.45)',
            borderRadius: 12,
            padding: '10px 12px',
            fontWeight: 800,
            color: '#dbeafe',
            background: 'rgba(30,64,175,.3)',
            cursor: 'pointer',
          }}
        >
          📍 تحديد اللوكيشن
        </button>

        {mapEmbedUrl && (
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.15)' }}>
            <iframe
              title="google-map-embed"
              src={mapEmbedUrl}
              width="100%"
              height="240"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        <button
          onClick={onSave}
          style={{
            border: 'none',
            borderRadius: 12,
            padding: '12px 14px',
            fontWeight: 800,
            color: '#fff',
            background: 'linear-gradient(90deg,#4A90D9,#7c3aed)',
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          حفظ التغييرات
        </button>

        {nearbyPlaces.length > 0 && (
          <div style={{
            borderRadius: 14,
            border: '1px solid rgba(74,144,217,.35)',
            background: 'rgba(74,144,217,.08)',
            padding: 12,
          }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>أماكن التبرعات القريبة منك</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {nearbyPlaces.map((p) => (
                <div key={p.name} style={{
                  borderRadius: 10,
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.12)',
                  padding: '8px 10px',
                }}>
                  <div style={{ fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{p.distance} • {p.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 1, background: 'rgba(255,255,255,.15)', margin: '8px 0' }} />

        <button
          onClick={onLogout}
          style={{
            border: '1px solid rgba(255,140,140,0.35)',
            borderRadius: 12,
            padding: '12px 14px',
            fontWeight: 800,
            color: '#ffb4b4',
            background: 'rgba(255,65,65,0.12)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FaSignOutAlt />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, readOnly = false }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
      <span>{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,.2)',
          background: readOnly ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)',
          color: '#fff',
          padding: '10px 12px',
          fontFamily: "'Cairo', sans-serif",
          fontSize: 14,
          outline: 'none',
          opacity: readOnly ? 0.8 : 1,
        }}
      />
    </label>
  );
}
