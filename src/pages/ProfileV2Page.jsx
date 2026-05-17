import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { axiosClient } from '../services/axiosClient';
import { userLevelsService } from '../services/userLevelsService';
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
  FaHome,
  FaLocationArrow,
  FaHandsHelping,
  FaStarAndCrescent,
  FaTrash,
} from 'react-icons/fa';
import secureStorage from '../utils/secureStorage';
import { AVATAR_PROFILE_UPDATED_EVENT, getAvatarImageUrl } from '../utils/avatarProfile';
import UserGeoQuestsPanel from '../components/userGeoQuests/UserGeoQuestsPanel';

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
    width: 260,
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #060f1e 0%, #0a1a30 20%, #0d2040 50%, #0f2744 75%, #122d52 100%)',
    border: '1px solid rgba(29,110,216,0.22)',
    borderRadius: 24,
    boxShadow: '0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(29,110,216,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    zIndex: 5,
    overflow: 'hidden',
  },
  logoWrap: {
    marginBottom: 8,
    textAlign: 'center',
    paddingBottom: 12,
    borderBottom: '1px solid rgba(29,110,216,0.2)',
  },
  logo: { fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 4 },
  subtitle: { fontSize: 10, letterSpacing: 2, color: 'rgba(14,165,233,0.8)', fontWeight: 700, textTransform: 'uppercase' },
  miniProfile: {
    borderRadius: 18,
    border: '1px solid rgba(29,110,216,0.3)',
    background: 'linear-gradient(135deg, rgba(29,110,216,0.22) 0%, rgba(14,165,233,0.12) 100%)',
    padding: 12,
    cursor: 'pointer',
    textAlign: 'center',
    transition: '0.2s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
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
  miniLink: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 8 },
  navBtn: {
    width: '100%',
    border: '1px solid transparent',
    borderRadius: 14,
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 900,
    transition: 'all .25s ease',
  },
  main: {
    marginRight: 260,
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

const getNavItems = (t) => [
  { id: 'profile', label: t('sidebar.profile'), icon: FaUser },
  { id: 'roadmap', label: t('sidebar.map'), icon: FaMap },
  { id: 'donations', label: t('sidebar.my-donations'), icon: FaMoneyBillWave },
  { id: 'settings', label: t('sidebar.admin'), icon: FaCog },
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

const buildGoogleMapEmbedUrl = (lat, lng) => {
  if (lat == null || lng == null) return '';
  const url = new URL('https://maps.google.com/maps');
  url.searchParams.set('q', `${lat},${lng}`);
  url.searchParams.set('z', '15');
  url.searchParams.set('output', 'embed');
  return url.toString();
};

export default function ProfileV2Page() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { t } = useTranslation();
  const navItems = getNavItems(t);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, fetchMe } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activePanel, setActivePanel] = useState('profile');
  const [levelCount, setLevelCount] = useState(0);
  const [pointsCount, setPointsCount] = useState(0);
  const [kpCount, setKpCount] = useState(0);
  const [levelName, setLevelName] = useState('مبتدئ');
  const [levelData, setLevelData] = useState(null);
  const [progressFill, setProgressFill] = useState(0);
  const [donations, setDonations] = useState(initialDonations);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(getAvatarImageUrl());
  const [avatarKey, setAvatarKey] = useState(0);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Donor profile state
  const [donorProfile, setDonorProfile] = useState(null);
  const [donorProfileLoading, setDonorProfileLoading] = useState(false);
  const [donorProfileError, setDonorProfileError] = useState(null);
  const [editingDonorProfile, setEditingDonorProfile] = useState(false);
  const [donorForm, setDonorForm] = useState({
    preferredCategory: '',
    totalDonated: ''
  });
  const [updatingDonorProfile, setUpdatingDonorProfile] = useState(false);
  const [updateDonorError, setUpdateDonorError] = useState(null);
  const [updateDonorSuccess, setUpdateDonorSuccess] = useState(false);

  const safeUser = useMemo(() => {
    return {
      heroName: user?.name || 'البطل',
      role: user?.roles?.[0] || 'donor',
      city: user?.city || 'القاهرة',
      email: user?.email || '',
      address: user?.address || '',
      lat: user?.lat ?? null,
      lng: user?.lng ?? null,
    };
  }, [user]);

  const [settingsForm, setSettingsForm] = useState({
    fullName: safeUser.heroName,
    email: safeUser.email,
    city: safeUser.city,
    address: safeUser.address,
    lat: safeUser.lat,
    lng: safeUser.lng,
  });

  // Sync settings form when safeUser changes (after fetchMe)
  useEffect(() => {
    setSettingsForm({
      fullName: safeUser.heroName,
      email: safeUser.email,
      city: safeUser.city,
      address: safeUser.address,
      lat: safeUser.lat,
      lng: safeUser.lng,
    });
  }, [safeUser]);

  useEffect(() => {
    // Fetch latest user data when profile is mounted
    fetchMe();
    // Fetch level data
    fetchLevelData();
    // Fetch donor profile if user is a donor
    if (user?.roles?.includes('donor') || user?.roles?.includes('donor')) {
      fetchDonorProfile();
    }
  }, []);

  // Fetch donor profile function
  const fetchDonorProfile = async () => {
    setDonorProfileLoading(true);
    setDonorProfileError(null);

    try {
      console.log('FETCH DONOR PROFILE API CALL');
      const resp = await axiosClient.get('/api/donor/me');
      console.log('FETCH DONOR PROFILE API RESPONSE:', resp.data);
      setDonorProfile(resp.data);
      
      // Populate form with current data
      setDonorForm({
        preferredCategory: resp.data.preferredCategory || '',
        totalDonated: resp.data.totalDonated || ''
      });
    } catch (err) {
      console.error('Failed to fetch donor profile:', err.response?.data || err.message);
      
      const serverData = err.response?.data;
      let errorMsg = 'فشل في جلب بيانات المتبرع.';
      
      if (serverData) {
        if (typeof serverData === 'string') errorMsg = serverData;
        else if (serverData.message) errorMsg = serverData.message;
        else if (serverData.error) errorMsg = serverData.error;
      }

      setDonorProfileError(errorMsg);
    } finally {
      setDonorProfileLoading(false);
    }
  };

  // Update donor profile function
  const updateDonorProfile = async (e) => {
    e.preventDefault();
    setUpdatingDonorProfile(true);
    setUpdateDonorError(null);
    setUpdateDonorSuccess(false);

    try {
      // Create DTO object as expected by API
      const donorDto = {
        preferredCategory: donorForm.preferredCategory || null,
        totalDonated: donorForm.totalDonated || null
      };
      
      console.log('UPDATE DONOR PROFILE API CALL:', donorDto);
      const resp = await axiosClient.put('/api/donor/me', donorDto);
      console.log('UPDATE DONOR PROFILE API RESPONSE:', resp.data);
      
      setUpdateDonorSuccess(true);
      setDonorProfile(resp.data);
      setEditingDonorProfile(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateDonorSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to update donor profile:', err.response?.data || err.message);
      
      const serverData = err.response?.data;
      let errorMsg = 'فشل في تحديث بيانات المتبرع.';
      
      if (serverData) {
        // Handle validation errors specifically
        if (serverData.errors) {
          const validationErrors = [];
          Object.keys(serverData.errors).forEach(key => {
            if (Array.isArray(serverData.errors[key])) {
              validationErrors.push(...serverData.errors[key]);
            } else {
              validationErrors.push(serverData.errors[key]);
            }
          });
          errorMsg = validationErrors.join(', ');
        } else if (typeof serverData === 'string') {
          errorMsg = serverData;
        } else if (serverData.message) {
          errorMsg = serverData.message;
        } else if (serverData.error) {
          errorMsg = serverData.error;
        }
      }

      setUpdateDonorError(errorMsg);
    } finally {
      setUpdatingDonorProfile(false);
    }
  };

  const fetchLevelData = async () => {
    try {
      const data = await userLevelsService.getMyLevel();
      if (data) {
        setLevelData(data);
        setLevelCount(data.level?.levelNumber || 0);
        setPointsCount(data.xp || 0);
        setKpCount(data.kp || 0);
        setLevelName(data.level?.name || 'مبتدئ');
        
        // Calculate progress based on next level XP if available
        if (data.level?.nextLevelXpRequired) {
          const progress = Math.min(100, Math.round((data.xp / data.level.nextLevelXpRequired) * 100));
          setProgressFill(progress);
        } else {
          setProgressFill(100);
        }
      }
    } catch (err) {
      console.error('Failed to fetch level data:', err);
      // في حالة 404 نترك القيم الافتراضية كما هي (مبتدئ، مستوى 0)
      if (err.response?.status === 404) {
        setLevelData(null);
      }
    }
  };

  useEffect(() => {
    if (safeUser.lat != null && safeUser.lng != null) {
      setMapEmbedUrl(buildGoogleMapEmbedUrl(safeUser.lat, safeUser.lng));
      setNearbyPlaces(buildNearbyPlaces(safeUser.city, safeUser.lat, safeUser.lng));
    }
  }, [safeUser]);

  useEffect(() => {
    setMounted(true);
    setAvatarUrl(getAvatarImageUrl());
    
    // الأنميشن يكون فقط إذا لم تكن البيانات قد وصلت بعد
    if (!levelData) {
      let l = 0;
      let p = 0;
      const maxL = 1;
      const maxP = 0;
      const interval = setInterval(() => {
        l = Math.min(maxL, l + 1);
        p = Math.min(maxP, p + 25);
        setLevelCount(l);
        setPointsCount(p);
        if (l === maxL && p === maxP) clearInterval(interval);
      }, 55);

      setTimeout(() => setProgressFill(10), 200);
      return () => clearInterval(interval);
    }
  }, [location, levelData]);

  useEffect(() => {
    const refreshAvatar = () => {
      setAvatarUrl(getAvatarImageUrl());
      setAvatarKey((prev) => prev + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(AVATAR_PROFILE_UPDATED_EVENT, refreshAvatar);
      window.addEventListener('storage', refreshAvatar);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(AVATAR_PROFILE_UPDATED_EVENT, refreshAvatar);
        window.removeEventListener('storage', refreshAvatar);
      }
    };
  }, []);

  const roleText = safeUser.role === 'parent' ? 'ولي أمر' : 'متبرع';

  const goToProfile = () => {
    navigate('/avatar');
  };

  const doLogout = () => {
    logout();
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
        setMapEmbedUrl(buildGoogleMapEmbedUrl(lat, lng));
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
    // TODO: Implement save settings to API
    alert('سيتم حفظ الإعدادات قريباً');
  };

  // Delete account functions
  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError(null);

    try {
      // Debug: Check what token we have
      const token = localStorage.getItem('auth_token') || 
                    localStorage.getItem('madina_access_token') || 
                    localStorage.getItem('accessToken');
      console.log('DELETE ACCOUNT - Token available:', !!token);
      console.log('DELETE ACCOUNT - Token:', token ? token.substring(0, 20) + '...' : 'none');
      
      console.log('DELETE ACCOUNT API CALL');
      const resp = await axiosClient.delete('/api/user/me');
      console.log('DELETE ACCOUNT API RESPONSE:', resp.data);

      // Clear local storage and logout
      localStorage.clear();
      sessionStorage.clear();
      logout();
      navigate('/auth');
    } catch (err) {
      console.error('Failed to delete account:', err.response?.data || err.message);
      console.error('Full error:', err);
      
      // If it's a 401, the token is invalid/expired
      if (err.response?.status === 401) {
        setDeleteError('جلسة انتهت صلاحيتها. يرجى تسجيل الدخول مرة أخرى ثم المحاولة.');
        // Auto logout after a delay
        setTimeout(() => {
          logout();
          navigate('/auth');
        }, 2000);
      } else {
        const serverData = err.response?.data;
        let errorMsg = 'فشل في حذف الحساب.';
        
        if (serverData) {
          if (typeof serverData === 'string') errorMsg = serverData;
          else if (serverData.message) errorMsg = serverData.message;
          else if (serverData.error) errorMsg = serverData.error;
        }

        setDeleteError(errorMsg);
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const openDeleteConfirm = () => {
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  const completeDonation = () => {
    if (!selectedDonation) return;
    setDonations((prev) =>
      prev.map((d) => (d.id === selectedDonation.id ? { ...d, status: 'مكتمل' } : d))
    );
    setSelectedDonation(null);
  };

  return (
    <div style={styles.page} className="profile-v2-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        @keyframes slideUp { from { opacity:0; transform: translateY(18px);} to { opacity:1; transform: translateY(0);} }
        @keyframes popIn { from { opacity:0; transform: scale(.85);} to { opacity:1; transform: scale(1);} }
        @keyframes avatarPulse { 0% { box-shadow: 0 0 0 0 rgba(124,58,237,.55);} 70% { box-shadow: 0 0 0 16px rgba(124,58,237,0);} 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0);} }
        @keyframes starFloat { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-8px);} }
        @keyframes rocketFly { 0%,100% { transform: translateY(0) rotate(-8deg);} 50% { transform: translateY(-10px) rotate(-2deg);} }
        @keyframes panelSlide { from {opacity:0; transform: translateY(14px);} to {opacity:1; transform: translateY(0);} }
        @keyframes emojiFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: .25; }
          50% { transform: translateY(-10px) rotate(7deg); opacity: .55; }
        }

        .profile-v2-page {
          padding: 20px 24px 40px;
        }

        .profile-v2-sidebar {
          transition: all .25s ease;
        }

        .profile-v2-main {
          transition: all .25s ease;
        }

        .profile-v2-top-row {
          transition: all .25s ease;
        }

        .profile-v2-badge-grid {
          grid-template-columns: repeat(6, minmax(0,1fr));
        }

        @media (max-width: 1100px) {
          .profile-v2-page {
            padding: 18px 18px 30px;
          }
          .profile-v2-sidebar {
            width: 220px;
            padding: 18px 10px;
          }
          .profile-v2-main {
            margin-right: 220px;
            padding: 18px;
          }
          .profile-v2-top-row {
            gap: 14px;
          }
        }

        @media (max-width: 900px) {
          .profile-v2-page {
            padding: 14px 12px 22px;
          }
          .profile-v2-sidebar {
            position: relative !important;
            width: 100% !important;
            min-height: auto !important;
            top: auto !important;
            right: auto !important;
            margin-bottom: 18px;
            border-radius: 22px;
          }
          .profile-v2-main {
            margin-right: 0 !important;
            padding: 16px 0 0 0 !important;
          }
          .profile-v2-top-row {
            grid-template-columns: 1fr !important;
          }
          .profile-v2-hero-card {
            min-height: auto !important;
          }
          .profile-v2-badge-grid {
            grid-template-columns: repeat(2, minmax(0,1fr)) !important;
          }
          .profile-v2-main span[style*="position: absolute"] {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .profile-v2-page {
            padding: 12px 10px 18px;
          }
          .profile-v2-sidebar {
            padding: 16px 12px;
          }
          .profile-v2-sidebar button,
          .profile-v2-sidebar .profile-v2-mini-profile {
            font-size: 13px;
          }
          .profile-v2-top-row {
            gap: 12px;
          }
          .profile-v2-badge-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-v2-main {
            padding: 0 !important;
          }
          .profile-v2-sidebar {
            border-radius: 18px;
          }
        }
      `}</style>

      <aside style={styles.sidebar} className="profile-v2-sidebar">
        <div style={styles.logoWrap}>
          <div style={{ fontSize: 30, filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }}><FaStar /></div>
          <div style={styles.logo}>بطل العطاء</div>
          <div style={styles.subtitle}>MADINA AL-ATAA</div>
        </div>

        <button style={styles.miniProfile} onClick={goToProfile} title="الذهاب إلى صفحة البروفايل">
          <div style={styles.miniAvatar}>
            <img
              key={`sidebar-${avatarKey}`}
              src={avatarUrl}
              alt="Saved avatar"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          </div>
          <div  style={styles.miniName}>{settingsForm.fullName}</div>
          <div  style={styles.miniLink}>فتح صفحة البروفايل</div>
        </button>

        <button
          style={{
            ...styles.navBtn,
            marginBottom: 8,
            background: 'linear-gradient(135deg, rgba(29,110,216,0.55) 0%, rgba(14,165,233,0.35) 100%)',
            color: '#fff',
            border: '1px solid rgba(14,165,233,0.4)',
            transform: 'translateX(-2px)',
          }}
          onClick={() => navigate('/map')}
          title="الرجوع للخريطة"
        >
          <span>الرئيسية</span>
          <span><FaHome /></span>
        </button>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'donations') {
                  navigate('/my-donations', { replace: false });
                  return;
                }

                setActivePanel(item.id);

                if (item.id === 'profile') {
                  navigate('/profile-v2', { replace: false });
                }
              }}
              style={{
                ...styles.navBtn,
                background: active ? 'linear-gradient(135deg, rgba(29,110,216,0.55) 0%, rgba(14,165,233,0.35) 100%)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                border: active ? '1px solid rgba(14,165,233,0.4)' : '1px solid transparent',
                transform: active ? 'translateX(-2px)' : 'none',
              }}
            >
              <span>{item.label}</span>
              <Icon />
            </button>
          );
        })}
      </aside>

      <main style={{ ...styles.main, position: 'relative', overflow: 'hidden' }} className="profile-v2-main">
        <span style={{ position: 'absolute', top: 16, left: 18, fontSize: 24, animation: 'emojiFloat 4.2s ease-in-out infinite', zIndex: 1 }}><FaHeart /></span>
        <span style={{ position: 'absolute', top: 64, left: 90, fontSize: 20, animation: 'emojiFloat 5s ease-in-out infinite', zIndex: 1 }}><FaStar /></span>
        <span style={{ position: 'absolute', top: 130, right: 18, fontSize: 22, animation: 'emojiFloat 4.6s ease-in-out infinite', zIndex: 1 }}><FaStarAndCrescent /></span>
        <span style={{ position: 'absolute', bottom: 40, left: 42, fontSize: 24, animation: 'emojiFloat 5.4s ease-in-out infinite', zIndex: 1 }}><FaHandsHelping /></span>

        <div style={{ ...styles.topRow, animation: mounted ? 'slideUp .5s ease both' : 'none', position: 'relative', zIndex: 2 }} className="profile-v2-top-row">
          <div style={{ ...styles.card, ...styles.heroCard }} className="profile-v2-hero-card">
            <FaStar style={{ position: 'absolute', top: 16, left: 20, color: '#facc15', animation: 'starFloat 2.4s ease-in-out infinite' }} />
            <FaStar style={{ position: 'absolute', top: 52, right: 24, color: '#fcd34d', animation: 'starFloat 2.8s ease-in-out infinite' }} />
            <FaStar style={{ position: 'absolute', bottom: 72, left: 30, color: '#fde68a', animation: 'starFloat 2.2s ease-in-out infinite' }} />
            <FaRocket style={{ position: 'absolute', top: 26, right: 64, color: '#93c5fd', animation: 'rocketFly 3s ease-in-out infinite' }} />
            <FaRocket style={{ position: 'absolute', bottom: 28, right: 30, color: '#c4b5fd', fontSize: 12, animation: 'rocketFly 2.2s ease-in-out infinite' }} />

            <div style={styles.heroAvatar} onClick={goToProfile} title="عرض الملف الشخصي">
              <img
                key={`hero-${avatarKey}`}
                src={avatarUrl}
                alt="Saved avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
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
              <span>{t('profile.verified_account')} ✓</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: 12 }}>
              <StatCard icon={FaBolt} title={levelName} value={`المستوى ${levelCount}`} grad="linear-gradient(135deg,#7c3aed,#4f46e5)" sub={`${pointsCount} XP`} />
              <StatCard icon={FaGem} title={`${kpCount} KP`} value={kpCount} grad="linear-gradient(135deg,#f59e0b,#f97316)" sub="نقاط الكرم" />
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
                <span>{levelData?.level?.nextLevelName ? `المستوى التالي: ${levelData.level.nextLevelName}` : 'أعلى مستوى وصلته!'}</span>
                <span>{pointsCount} / {levelData?.level?.nextLevelXpRequired || pointsCount} XP</span>
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
          <div style={styles.badgeGrid} className="profile-v2-badge-grid">
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
                openDeleteConfirm={openDeleteConfirm}
              />
            )}
          </section>
        )}

        {/* Donor Profile Section - Show for donor users */}
        {(user?.roles?.includes('donor') || user?.roles?.includes('donor')) && (
          <section style={{ ...styles.card, padding: 16, animation: mounted ? 'slideUp .7s ease both' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 900 }}>
              <FaHeart style={{ color: '#ef4444' }} />
              <span>ملف المتبرع</span>
            </div>
            
            {donorProfileLoading && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                جاري تحميل بيانات المتبرع...
              </div>
            )}
            
            {donorProfileError && (
              <div style={{
                padding: '12px',
                borderRadius: 12,
                background: 'rgba(239,68,68,.15)',
                color: '#fca5a5',
                fontSize: 13,
                fontWeight: 800,
                textAlign: 'center',
                marginBottom: 12
              }}>
                {donorProfileError}
              </div>
            )}
            
            {donorProfile && (
              <div style={{ display: 'grid', gap: 12 }}>
                {/* Edit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button
                    onClick={() => setEditingDonorProfile(!editingDonorProfile)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: editingDonorProfile ? '#f87171' : '#3b82f6',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {editingDonorProfile ? 'إلغاء' : 'تعديل'}
                  </button>
                </div>

                {/* Update Success Message */}
                {updateDonorSuccess && (
                  <div style={{
                    padding: '12px',
                    borderRadius: 12,
                    background: 'rgba(34,197,94,.15)',
                    color: '#16a34a',
                    fontSize: 13,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 12
                  }}>
                    تم تحديث بيانات المتبرع بنجاح!
                  </div>
                )}

                {/* Update Error Message */}
                {updateDonorError && (
                  <div style={{
                    padding: '12px',
                    borderRadius: 12,
                    background: 'rgba(239,68,68,.15)',
                    color: '#dc2626',
                    fontSize: 13,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 12
                  }}>
                    {updateDonorError}
                  </div>
                )}

                {/* Edit Form */}
                {editingDonorProfile && (
                  <form onSubmit={updateDonorProfile} style={{ display: 'grid', gap: 12 }}>
                    <div style={{
                      padding: '16px',
                      borderRadius: 12,
                      background: 'rgba(59,130,246,.15)',
                      border: '1px solid rgba(59,130,246,.35)',
                      display: 'grid',
                      gap: 12
                    }}>
                      <div>
                        <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>
                          الفئة المفضلة
                        </label>
                        <input
                          type="text"
                          value={donorForm.preferredCategory}
                          onChange={(e) => setDonorForm({...donorForm, preferredCategory: e.target.value})}
                          placeholder="أدخل الفئة المفضلة"
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            fontSize: 14,
                            background: '#fff'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>
                          إجمالي التبرعات
                        </label>
                        <input
                          type="text"
                          value={donorForm.totalDonated}
                          onChange={(e) => setDonorForm({...donorForm, totalDonated: e.target.value})}
                          placeholder="أدخل إجمالي التبرعات"
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            fontSize: 14,
                            background: '#fff'
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={updatingDonorProfile}
                        style={{
                          padding: '12px',
                          borderRadius: 8,
                          border: 'none',
                          background: updatingDonorProfile ? '#94a3b8' : '#10b981',
                          color: '#fff',
                          cursor: updatingDonorProfile ? 'not-allowed' : 'pointer',
                          fontSize: 14,
                          fontWeight: 900
                        }}
                      >
                        {updatingDonorProfile ? 'جاري التحديث...' : 'حفظ التغييرات'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Display Data */}
                {!editingDonorProfile && (
                  <>
                    <div style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: 'rgba(34,197,94,.15)',
                      border: '1px solid rgba(34,197,94,.35)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 8
                    }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>إجمالي التبرعات</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>
                          {donorProfile.totalDonations || donorProfile.totalDonated || 0} ج.م
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>عدد التبرعات</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>
                          {donorProfile.donationCount || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Preferred Category */}
                    {donorProfile.preferredCategory && (
                      <div style={{
                        padding: '12px',
                        borderRadius: 12,
                        background: 'rgba(168,85,247,.15)',
                        border: '1px solid rgba(168,85,247,.35)'
                      }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>الفئة المفضلة</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#a855f7' }}>
                          {donorProfile.preferredCategory}
                        </div>
                      </div>
                    )}
                    
                    {donorProfile.lastDonation && (
                      <div style={{
                        padding: '12px',
                        borderRadius: 12,
                        background: 'rgba(59,130,246,.15)',
                        border: '1px solid rgba(59,130,246,.35)'
                      }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>آخر تبرع</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>
                          {donorProfile.lastDonation.amount || 0} ج.م - {donorProfile.lastDonation.date || 'غير متوفر'}
                        </div>
                      </div>
                    )}
                    
                    {donorProfile.favoriteCause && (
                      <div style={{
                        padding: '12px',
                        borderRadius: 12,
                        background: 'rgba(251,191,36,.15)',
                        border: '1px solid rgba(251,191,36,.35)'
                      }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>القضية المفضلة</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>
                          {donorProfile.favoriteCause}
                        </div>
                      </div>
                    )}
                    
                    {donorProfile.memberSince && (
                      <div style={{
                        padding: '12px',
                        borderRadius: 12,
                        background: 'rgba(251,146,60,.15)',
                        border: '1px solid rgba(251,146,60,.35)'
                      }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>عضو منذ</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fb923c' }}>
                          {donorProfile.memberSince}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        )}

        <section style={{ ...styles.card, padding: 16, animation: mounted ? 'slideUp .8s ease both' : 'none' }}>
          <UserGeoQuestsPanel
            mode="profile"
            isAdmin={(user?.roles || []).some((role) => String(role).toLowerCase() === 'admin')}
            targetUser={user}
            title="مهام المستخدم الجغرافية"
          />
        </section>
      </main>

      {selectedDonation && (
        <DonationModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onComplete={completeDonation}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.8)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
          padding: 16,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 460,
            borderRadius: 18,
            border: '1px solid rgba(239,68,68,.3)',
            background: 'linear-gradient(180deg, rgba(127,29,29,0.98), rgba(153,27,27,0.98))',
            boxShadow: '0 18px 40px rgba(0,0,0,.6)',
            padding: 20,
            textAlign: 'center',
            direction: 'rtl'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239,68,68,.2)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
              color: '#f87171'
            }}>
              <FaTrash size={32} />
            </div>
            
            <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 900, color: '#fff' }}>تأكيد حذف الحساب</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              هل أنت متأكد من حذف حسابك نهائياً؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه وسيؤدي إلى فقدان جميع بياناتك.
            </p>

            {deleteError && (
              <div style={{
                padding: '12px',
                borderRadius: 12,
                background: 'rgba(239,68,68,.3)',
                color: '#fca5a5',
                fontSize: 13,
                fontWeight: 800,
                textAlign: 'center',
                marginBottom: 16
              }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px',
                  fontWeight: 800,
                  cursor: deletingAccount ? 'not-allowed' : 'pointer',
                  color: '#fff',
                  background: deletingAccount ? 'rgba(239,68,68,.5)' : 'linear-gradient(90deg,#ef4444,#dc2626)',
                }}
              >
                {deletingAccount ? 'جاري الحذف...' : 'نعم، احذف حسابي'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingAccount}
                style={{
                  flex: 1,
                  border: '1px solid rgba(255,255,255,.2)',
                  borderRadius: 12,
                  padding: '12px',
                  fontWeight: 800,
                  cursor: deletingAccount ? 'not-allowed' : 'pointer',
                  color: '#fff',
                  background: 'rgba(255,255,255,.1)',
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
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

function SettingsPanel({ form, setForm, onSave, onDetectLocation, onLogout, mapEmbedUrl, nearbyPlaces, openDeleteConfirm }) {
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
          <FaLocationArrow style={{ marginLeft: 8 }} /> تحديد اللوكيشن
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
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-popups"
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
          onClick={openDeleteConfirm}
          style={{
            border: '1px solid rgba(239,68,68,.45)',
            borderRadius: 12,
            padding: '10px 12px',
            fontWeight: 800,
            color: '#fca5a5',
            background: 'rgba(239,68,68,.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <FaTrash /> حذف الحساب
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
