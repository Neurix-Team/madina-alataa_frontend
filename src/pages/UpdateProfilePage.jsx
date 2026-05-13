import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaStar,
  FaChartLine,
  FaImage,
  FaArrowUp,
  FaSave,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEdit,
  FaMedal,
  FaHandHoldingHeart,
  FaHandsHelping,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTags,
} from 'react-icons/fa';
import { profilesService } from '../services/profilesService';
import { avatarService } from '../services/avatarService';
import { buildAvatarProfileFromApiAvatar, buildAvatarUrlFromProfile } from '../utils/avatarProfile';
import { useAuth } from '../hooks/useAuth';
import { userBadgesService } from '../services/userBadgesService';
import { userLevelsService } from '../services/userLevelsService';
import { certificatesService } from '../services/certificatesService';

const UpdateProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 0,
    impact: 0,
    avatarId: '',
    levelId: '',
  });
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [avatarData, setAvatarData] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userBadges, setUserBadges] = useState([]);
  const [userBadgesLoading, setUserBadgesLoading] = useState(false);
  const [userBadgesError, setUserBadgesError] = useState(null);
  const [myLevelData, setMyLevelData] = useState(null);
  const [myLevelRaw, setMyLevelRaw] = useState(null);
  const [myLevelLoading, setMyLevelLoading] = useState(false);
  const [myLevelError, setMyLevelError] = useState(null);
  const [myCertificates, setMyCertificates] = useState([]);
  const [myCertificatesRaw, setMyCertificatesRaw] = useState(null);
  const [myCertificatesLoading, setMyCertificatesLoading] = useState(false);
  const [myCertificatesError, setMyCertificatesError] = useState(null);
  const [myProfileData, setMyProfileData] = useState(null);
  const avatarPreviewUrl = avatarData
    ? buildAvatarUrlFromProfile(buildAvatarProfileFromApiAvatar(avatarData))
    : '';
  const isAdmin = Array.isArray(user?.roles)
    ? user.roles.some((role) => String(role).toLowerCase() === 'admin')
    : String(user?.roles || '').toLowerCase() === 'admin';
  const roleList = useMemo(
    () => (Array.isArray(user?.roles) ? user.roles.map((role) => String(role).toLowerCase()) : [String(user?.roles || '').toLowerCase()]).filter(Boolean),
    [user]
  );
  const hasDonorRole = roleList.includes('donor');
  const hasVolunteerRole = roleList.includes('volunteer');
  const donorData = myProfileData?.donor && typeof myProfileData.donor === 'object' ? myProfileData.donor : null;
  const volunteerData = myProfileData?.volunteer && typeof myProfileData.volunteer === 'object' ? myProfileData.volunteer : null;
  const donorSummaryItems = useMemo(
    () =>
      [
        { icon: FaTags, label: 'الفئة المفضلة', value: donorData?.preferredCategory },
        { icon: FaHandHoldingHeart, label: 'إجمالي التبرعات', value: donorData?.totalDonated ?? donorData?.totalDonation },
      ].filter((item) => item.value !== null && item.value !== undefined && item.value !== '' && !['id', 'userId', 'profileId', 'avatarId', 'levelId'].includes(item.label.toLowerCase())),
    [donorData]
  );
  const volunteerSummaryItems = useMemo(
    () =>
      [
        { icon: FaUser, label: 'الاسم الكامل', value: volunteerData?.fullName || volunteerData?.name || volunteerData?.userName },
        { icon: FaEnvelope, label: 'البريد الإلكتروني', value: volunteerData?.email },
        { icon: FaCalendarAlt, label: 'تاريخ الميلاد', value: volunteerData?.birthDay || volunteerData?.birthDate },
        { icon: FaPhone, label: 'رقم الهاتف', value: volunteerData?.phoneNumber || volunteerData?.phone },
        { icon: FaMapMarkerAlt, label: 'المدينة', value: volunteerData?.city || volunteerData?.address },
        { icon: FaHandsHelping, label: 'المهارات', value: Array.isArray(volunteerData?.skills) ? volunteerData.skills.join('، ') : volunteerData?.skills },
      ].filter((item) => item.value !== null && item.value !== undefined && item.value !== '' && !['id', 'userId', 'profileId', 'avatarId', 'levelId'].includes(item.label.toLowerCase())),
    [volunteerData]
  );
  const compactProfileItems = useMemo(
    () =>
      [
        { icon: FaStar, label: 'التقييم', value: myProfileData?.rating ?? 0 },
        { icon: FaChartLine, label: 'التأثير', value: myProfileData?.impact ?? 0 },
        { icon: FaUser, label: 'الدور', value: hasDonorRole ? 'متبرع' : hasVolunteerRole ? 'متطوع' : 'مستخدم' },
      ],
    [myProfileData, hasDonorRole, hasVolunteerRole]
  );
  const avatarTraits = useMemo(
    () =>
      avatarData
        ? [
            { label: 'لون البشرة', value: avatarData.skinColor || '#fbbf24', icon: '🎨' },
            { label: 'لون الشعر', value: avatarData.hairColor || '#000000', icon: '💇' },
            { label: 'تسريحة الشعر', value: avatarData.hairStyle || 'short', icon: '✂️' },
            { label: 'لون الملابس', value: avatarData.clothesColor || '#3b82f6', icon: '👕' },
          ]
        : [],
    [avatarData]
  );

  const canSubmit =
  !saving &&
  !!String(profileId || '').trim();

  const navigate = useNavigate();

 

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get from localStorage
        const storedProfileId = profilesService.getStoredProfileId();
        const storedProfile = profilesService.getProfileFromStorage();
        const storedAvatarId = profilesService.getStoredAvatarId();

        console.log('Stored profile data:', { storedProfileId, storedProfile, storedAvatarId });
        

        if (storedProfile) {
          const currentProfileId = storedProfile.id || storedProfile.profileId || storedProfile.profile?.id || storedProfileId;
          setProfileId(currentProfileId);
          setFormData({
            rating: storedProfile.rating ?? 0,
            impact: storedProfile.impact ?? 0,
            avatarId: storedAvatarId || storedProfile.avatarId || '',
            levelId: storedProfile.levelId || '',
          });
          setMyProfileData(storedProfile);
        }

        try {
          const profileData = await profilesService.fetchMyProfile();
          console.log('UPDATE PROFILE /api/Profiles/my RESPONSE ITEMS:', profileData);

          profilesService.saveProfileToStorage(profileData);

          const currentProfileId = profileData.id || profileData.profileId || profileData.profile?.id || storedProfileId;
          setProfileId(currentProfileId);
          setMyProfileData(profileData);

          setFormData({
            rating: profileData.rating ?? 0,
            impact: profileData.impact ?? 0,
            avatarId: profileData.avatarId || storedAvatarId || '',
            levelId: profileData.levelId || '',
          });

          if (!currentProfileId) {
            console.warn('Profile ID is missing from API response:', profileData);
          }

          // Load avatar data if avatarId exists
          if (profileData.avatarId) {
            try {
              setAvatarLoading(true);
              const avatarResponse = await avatarService.getAvatarById(profileData.avatarId);
              console.log('Avatar data loaded:', avatarResponse);
              setAvatarData(avatarResponse);
            } catch (avatarErr) {
              console.warn('Could not fetch avatar:', avatarErr);
            } finally {
              setAvatarLoading(false);
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch profile:', fetchErr);
          if (!storedProfile) {
            setError(fetchErr.message || 'فشل في تحميل بيانات الملف الشخصي');
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('فشل في تحميل بيانات الملف الشخصي');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      setUserBadges([]);
      setUserBadgesError(null);
      return;
    }

    const loadUserBadges = async () => {
      try {
        setUserBadgesLoading(true);
        setUserBadgesError(null);
        const response = await userBadgesService.getMyBadges();
        console.log('USER BADGES PROFILE RESPONSE ITEMS:', response.items);
        console.log('USER BADGES PROFILE RAW RESPONSE:', response.raw);
        setUserBadges(response.items);
      } catch (err) {
        console.error('Failed to fetch user badges for profile page:', err);
        setUserBadgesError('فشل في تحميل شارات المستخدم.');
      } finally {
        setUserBadgesLoading(false);
      }
    };

    loadUserBadges();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      setMyLevelData(null);
      setMyLevelRaw(null);
      setMyLevelError(null);
      return;
    }

    const loadMyLevel = async () => {
      try {
        setMyLevelLoading(true);
        setMyLevelError(null);
        const response = await userLevelsService.getMyLevel();
        console.log('USER LEVEL PROFILE RESPONSE ITEM:', response.item);
        console.log('USER LEVEL PROFILE RAW RESPONSE:', response.raw);
        setMyLevelData(response.item);
        setMyLevelRaw(response.raw);
      } catch (err) {
        console.error('Failed to fetch user level for profile page:', err);
        setMyLevelError('فشل في تحميل بيانات المستوى.');
      } finally {
        setMyLevelLoading(false);
      }
    };

    loadMyLevel();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      setMyCertificates([]);
      setMyCertificatesRaw(null);
      setMyCertificatesError(null);
      return;
    }

    const loadMyCertificates = async () => {
      try {
        setMyCertificatesLoading(true);
        setMyCertificatesError(null);
        const response = await certificatesService.getMyCertificates({ pageNumber: 1, pageSize: 1 });
        console.log('PROFILE CERTIFICATES RESPONSE ITEMS:', response.items);
        console.log('PROFILE CERTIFICATES RAW RESPONSE:', response.raw);
        setMyCertificates(response.items);
        setMyCertificatesRaw(response.raw);
      } catch (err) {
        console.error('Failed to fetch profile certificates:', err);
        setMyCertificatesError('فشل في تحميل الشهادات.');
      } finally {
        setMyCertificatesLoading(false);
      }
    };

    loadMyCertificates();
  }, [isAdmin]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    setSuccess(false);
    setError(null);
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!profileId) {
//       setError('معرف الملف الشخصي غير متوفر. يرجى إعادة تسجيل الدخول.');
//       return;
//     }

//     setSaving(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       // console.log('Updating profile:', profileId, formData);
//       // const result = await profilesService.updateProfile(profileId, formData);
//      const payload = {
//   rating: Number(formData.rating) || 0,
//   impact: Number(formData.impact) || 0,
//   avatarId: String(formData.avatarId || '').trim(),
//   levelId: String(formData.levelId || '').trim(),
// };

// console.log('Updating profile:', profileId, payload);

// const result = await profilesService.updateProfile(profileId, payload);
//       console.log('Profile updated successfully:', result);

//       // Update localStorage with new data
//       const updatedProfile = {
//         ...profilesService.getProfileFromStorage(),
//         ...formData,
//         id: profileId,
//       };
//       profilesService.saveProfileToStorage(updatedProfile);

//       setSuccess(true);
//     } catch (err) {
//       console.error('Error updating profile:', err);
//       setError(err.message || 'فشل في تحديث الملف الشخصي');
//     } finally {
//       setSaving(false);
//     }
//   };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!String(profileId || '').trim()) {
    setError('معرف الملف الشخصي غير متوفر. يرجى إعادة تحميل الصفحة.');
    return;
  }

  setSaving(true);
  setError(null);
  setSuccess(false);

  try {
    const payload = {
      rating: Number(formData.rating) || 0,
      impact: Number(formData.impact) || 0,
      avatarId: String(formData.avatarId || myProfileData?.avatarId || '').trim(),
      levelId: String(formData.levelId || myProfileData?.levelId || '').trim(),
    };

    console.log('Updating profile:', profileId, payload);

    const result = await profilesService.updateProfile(profileId, payload);

    console.log('Profile updated successfully:', result);

    const updatedProfile = {
      ...profilesService.getProfileFromStorage(),
      ...payload,
      id: profileId,
    };

    profilesService.saveProfileToStorage(updatedProfile);

    setSuccess(true);
  } catch (err) {
    console.error('Error updating profile:', err);
    setError(err.message || 'فشل في تحديث الملف الشخصي');
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="update-profile-page min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
          <FaSpinner className="animate-spin" style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '16px' }} />
          <p style={{ color: '#64748b' }}>جاري تحميل بيانات الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="update-profile-page min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 md:p-6">
      <div className="pro-container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-header border border-sky-100  shadow-2xl shadow-sky-100/70"
          style={{
            marginBottom: '24px',
            borderRadius: '30px',
            padding: '24px',
          }}
        >
          <div className="pro-header-left bg-white/90">
            <div className="pro-header-icon" style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}>
              <FaUser />
            </div>
            <div>
              <h2 className="pro-header-title text-slate-950">تحديث الملف الشخصي</h2>
              <p className="pro-header-subtitle text-slate-600">واجهة مرتبة لتعديل بيانات الحساب وعرض معلومات البروفايل بشكل أوضح.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pro-card border border-sky-100 bg-white shadow-xl shadow-sky-100/60"
          style={{
            marginBottom: '24px',
            borderRadius: '28px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaImage style={{ color: 'var(--primary)' }} />
              الصورة الرمزية
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsEditOpen((current) => !current)}
              className="pro-btn pro-btn-secondary border border-sky-100 bg-sky-50 text-sky-700 shadow-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaEdit />
              <span>{isEditOpen ? 'إخفاء تعديل الحساب' : 'تعديل الحساب'}</span>
            </motion.button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '20px', borderRadius: '22px' }}>
              {avatarLoading ? (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #dbeafe'
                }}>
                  <FaSpinner className="animate-spin" />
                </div>
              ) : avatarData ? (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${avatarData.skinColor || '#fbbf24'}, ${avatarData.clothesColor || '#3b82f6'})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid var(--primary)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ fontSize: '32px', color: avatarData.hairColor || '#000' }}>
                    {avatarData.gender === 1 ? '👨' : '👩'}
                  </div>
                  {avatarData.characterName && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-5px',
                      right: '-5px',
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      {avatarData.characterName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #bae6fd',
                  color: '#64748b'
                }}>
                  <FaUser size={24} />
                </div>
              )}

              <div>
                <p style={{ color: '#0f172a', fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>
                  {avatarData ? avatarData.characterName || 'الأفاتار الخاص بك' : 'لا يوجد أفاتار'}
                </p>
                {!avatarData && (
                  <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
                    اضغط على تعديل الحساب لإنشاء أو تعديل الأافاتار الخاص بك.
                  </p>
                )}
                <button
                  type="button"
                  className="pro-btn pro-btn-primary"
                  style={{ marginTop: '14px' }}
                  onClick={() => navigate('/avatar')}
                >
                  <FaImage />
                  <span>تعديل الأافاتار</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pro-alert"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--danger)',
            }}
          >
            <FaExclamationTriangle />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pro-alert"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--success)',
            }}
          >
            <FaCheckCircle />
            <span>تم تحديث الملف الشخصي بنجاح!</span>
          </motion.div>
        )}

        {myProfileData && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="pro-card border border-sky-100 bg-white shadow-xl shadow-sky-100/60"
            style={{
              maxWidth: '1100px',
              marginBottom: '24px',
              borderRadius: '28px',
              border: '1px solid #e0f2fe',
              background: '#ffffff',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaUser style={{ color: 'var(--primary)' }} />
              <h3 style={{ color: '#0f172a', margin: 0 }}>ملخص البروفايل</h3>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '12px', 
              marginBottom: (hasDonorRole || hasVolunteerRole || donorData || volunteerData) ? '20px' : 0 
            }}>
              {compactProfileItems.map((item) => (
                <SummaryMetric key={item.label} icon={item.icon} label={item.label} value={item.value} />
              ))}
            </div>

            {(hasDonorRole || donorData) && !isAdmin && (
              <RoleSection
                title="بيانات المتبرع"
                subtitle="معلومات العضوية والمساهمات الخاصة بالمتبرع"
                icon={FaHandHoldingHeart}
                accent="#f59e0b"
                items={donorSummaryItems}
                emptyMessage="لا توجد بيانات متبرع متاحة حاليًا."
              />
            )}

            {(hasVolunteerRole || volunteerData) && !isAdmin && (
              <RoleSection
                title="بيانات المتطوع"
                subtitle="معلومات المهارات والمشاركات الخاصة بالمتطوع"
                icon={FaHandsHelping}
                accent="#38bdf8"
                items={volunteerSummaryItems}
                emptyMessage="لا توجد بيانات متطوع متاحة حاليًا."
              />
            )}
          </motion.div>
        )}

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="pro-card border border-sky-100 bg-white shadow-xl shadow-sky-100/60"
            style={{
              maxWidth: '1100px',
              marginBottom: '24px',
              borderRadius: '20px',
              border: '1px solid #e6eefb',
              background: '#ffffff',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FaMapMarkerAlt style={{ color: 'var(--primary)' }} />
              <h4 style={{ color: '#0f172a', margin: 0, fontSize: '16px', fontWeight: 700 }}>تفاصيل العنوان وتفاصيل المهام</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #eef6ff', background: '#fcfeff' }}>
                <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>تفاصيل العنوان</div>
                <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>{myProfileData?.address || 'لا يوجد عنوان مسجل'}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="pro-btn pro-btn-secondary" style={{ padding: '10px 12px' }}>تحديث العنوان</button>
                  <button className="pro-btn" style={{ padding: '10px 12px' }}>إضافة عنوان</button>
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #eef6ff', background: '#fcfeff' }}>
                <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>تفاصيل المهام</div>
                <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>{(myProfileData?.tasks || []).length ? (myProfileData.tasks.join('، ')) : 'لا توجد مهام مسجلة'}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="pro-btn pro-btn-secondary" style={{ padding: '10px 12px' }}>تحديث المهام</button>
                  <button className="pro-btn" style={{ padding: '10px 12px' }}>إضافة مهام</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-start' }}>
              <button className="pro-btn pro-btn-primary" style={{ padding: '10px 14px' }}>إضافة طلب تبرع</button>
            </div>
          </motion.div>
        )}

        {isEditOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pro-card border border-sky-100 bg-white shadow-xl shadow-sky-100/60"
            style={{
              maxWidth: '680px',
              borderRadius: '28px',
              border: '1px solid #e0f2fe',
              background: '#ffffff',
              padding: '24px',
            }}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaStar style={{ color: 'var(--warning)' }} />
                  <label style={{ fontWeight: '600', color: '#0f172a' }}>التقييم (Rating)</label>
                </div>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="pro-input border border-slate-200 bg-white text-slate-900 shadow-sm focus:border-sky-400 focus:bg-sky-50 focus:ring-4 focus:ring-sky-100"
                  placeholder="أدخل التقييم"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaChartLine style={{ color: 'var(--info)' }} />
                  <label style={{ fontWeight: '600', color: '#0f172a' }}>التأثير (Impact)</label>
                </div>
                <input
                  type="number"
                  name="impact"
                  value={formData.impact}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="pro-input border border-slate-200 bg-white text-slate-900 shadow-sm focus:border-sky-400 focus:bg-sky-50 focus:ring-4 focus:ring-sky-100"
                  placeholder="أدخل قيمة التأثير"
                />
              </div>

              <div style={{ marginBottom: '20px', display: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaImage style={{ color: 'var(--accent)' }} />
                  <label style={{ fontWeight: '600', color: '#0f172a' }}>معرف الصورة الرمزية (Avatar ID)</label>
                </div>
                <input
                  type="text"
                  name="avatarId"
                  value={formData.avatarId}
                  onChange={handleInputChange}
                  className="pro-input"
                  placeholder="أدخل معرف الصورة الرمزية"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={canSubmit ? { scale: 1.02 } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
                disabled={!canSubmit}
                className="pro-btn pro-btn-primary bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-100"
                style={{
                  width: '100%',
                  opacity: canSubmit ? 1 : 0.5,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>حفظ التغييرات</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="pro-card border border-sky-100 bg-white shadow-xl shadow-sky-100/60"
            style={{ maxWidth: '900px', marginTop: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaArrowUp style={{ color: 'var(--success)' }} />
              <h3 style={{ color: '#0f172a', margin: 0 }}>بيانات المستوى</h3>
            </div>

            {myLevelLoading ? (
              <div style={{ color: '#64748b' }}>جاري تحميل بيانات المستوى...</div>
            ) : myLevelError ? (
              <div style={{ color: 'var(--danger)' }}>{myLevelError}</div>
            ) : myLevelData ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
       
                  <div style={{ padding: '14px', borderRadius: '14px', border: '1px solid #e0f2fe', background: '#f8fafc' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>XP</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{myLevelData.xp ?? 0}</div>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '14px', border: '1px solid #e0f2fe', background: '#f8fafc' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>KP</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{myLevelData.kp ?? 0}</div>
                  </div>
                </div>

                {/* Level details could go here */}
              </div>
            ) : (
              <div style={{ color: '#64748b' }}>لا توجد بيانات مستوى متاحة.</div>
            )}
          </motion.div>
        )}

        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23 }}
            className="pro-card border border-sky-100 bg-white shadow-xl shadow-sky-100/60"
            style={{ maxWidth: '900px', marginTop: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaMedal style={{ color: '#d97706' }} />
              <h3 style={{ color: '#0f172a', margin: 0 }}>شهاداتي</h3>
            </div>

            {myCertificatesLoading ? (
              <div style={{ color: '#64748b' }}>جاري تحميل الشهادات...</div>
            ) : myCertificatesError ? (
              <div style={{ color: 'var(--danger)' }}>{myCertificatesError}</div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {myCertificates.length === 0 ? (
                  <div style={{ color: '#64748b' }}>لا توجد شهادات متاحة.</div>
                ) : (
                  myCertificates.map((certificate, index) => (
                    <div
                      key={certificate.id || `profile-certificate-${index}`}
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        border: '1px solid #e0f2fe',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ color: '#0f172a', fontWeight: 800, marginBottom: 8 }}>
                        {certificate.title || 'Certificate'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 14, marginBottom: 6 }}>
                        {certificate.description || 'لا يوجد وصف'}
                      </div>
                      {certificate.issuedAt ? (
                        <div style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaCalendarAlt size={11} />
                          <span>تاريخ الإصدار: {certificate.issuedAt}</span>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}

              </div>
            )}
          </motion.div>
        )}

        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pro-card border border-sky-100 bg-white shadow-xl shadow-sky-100/60"
            style={{
              maxWidth: '900px',
              marginTop: '24px',
              borderRadius: '28px',
              border: '1px solid #e0f2fe',
              background: '#ffffff',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaMedal style={{ color: '#f59e0b' }} />
              <h3 style={{ color: '#0f172a', margin: 0 }}>شارات المستخدم</h3>
            </div>

            {userBadgesLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                <FaSpinner className="animate-spin" />
                <span>جاري تحميل الشارات...</span>
              </div>
            ) : userBadgesError ? (
              <div style={{ color: 'var(--danger)', padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)' }}>{userBadgesError}</div>
            ) : userBadges.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '20px', border: '1px dashed #bae6fd', borderRadius: '18px' }}>لا توجد شارات متاحة لهذا المستخدم.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                {userBadges.map((badge, index) => {
                  const badgeId = badge.badgeId || badge.id || `badge-${index}`;
                  return (
                    <motion.div
                      key={badgeId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5, boxShadow: '0 14px 30px rgba(14,165,233,0.14)' }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '16px',
                        borderRadius: '20px',
                        border: '1px solid #e0f2fe',
                        background: 'linear-gradient(135deg, #ffffff, #f0f9ff)',
                        textAlign: 'center',
                      }}
                    >
                      {badge.imageUrl ? (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={badge.imageUrl}
                            alt={badge.name}
                            style={{ width: '60px', height: '60px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--primary)' }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            display: 'grid',
                            placeItems: 'center',
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))',
                            color: '#f59e0b',
                            fontSize: '24px',
                            border: '1px solid rgba(245,158,11,0.3)',
                          }}
                        >
                          <FaMedal />
                        </div>
                      )}
                      <div style={{ width: '100%' }}>
                        <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '14px', marginBottom: '2px' }}>{badge.name || badge.badgeName || 'شارة جديدة'}</div>
                        <div style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: 600, opacity: 0.8 }}>{badge.category || badge.badgeCategory || 'إنجاز'}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

function SummaryMetric({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '16px',
        border: '1px solid #e0f2fe',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>
        <Icon style={{ color: '#38bdf8' }} />
        <span>{label}</span>
      </div>
      <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>{value}</div>
    </div>
  );
}

function RoleSection({ title, subtitle, icon: Icon, accent, items, emptyMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        padding: '20px',
        borderRadius: '24px',
        border: '1px solid #e0f2fe',
        background: '#f8fafc',
        marginTop: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${accent}22`,
            color: accent,
            fontSize: '20px',
            boxShadow: `0 8px 20px ${accent}15`,
          }}
        >
          <Icon />
        </div>
        <div>
          <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>{title}</div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>{subtitle}</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '14px', marginTop: '14px', textAlign: 'center', padding: '20px', border: '1px dashed #bae6fd', borderRadius: '16px' }}>{emptyMessage}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {items.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, backgroundColor: '#eff6ff' }}
              style={{
                padding: '16px',
                borderRadius: '18px',
                border: '1px solid #dbeafe',
                background: '#ffffff',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px', marginBottom: '8px' }}>
                <item.icon style={{ color: accent, fontSize: '14px' }} />
                <span>{item.label}</span>
              </div>
              <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '15px', wordBreak: 'break-word' }}>{String(item.value)}</div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default UpdateProfilePage;
