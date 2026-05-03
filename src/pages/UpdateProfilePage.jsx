import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaStar, FaChartLine, FaImage, FaArrowUp, FaSave, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaEdit } from 'react-icons/fa';
import { profilesService } from '../services/profilesService';
import { avatarService } from '../services/avatarService';
import { buildAvatarProfileFromApiAvatar, buildAvatarUrlFromProfile } from '../utils/avatarProfile';

const UpdateProfilePage = () => {
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
  const avatarPreviewUrl = avatarData
    ? buildAvatarUrlFromProfile(buildAvatarProfileFromApiAvatar(avatarData))
    : '';

  const canSubmit =
  !saving &&
  !!String(formData.avatarId || '').trim() &&
  !!String(formData.levelId || '').trim();

 

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
        } else {
          try {
            const profileData = await profilesService.fetchMyProfile();
            console.log('Fetched profile data:', profileData);

            profilesService.saveProfileToStorage(profileData);

            const currentProfileId = profileData.id || profileData.profileId || profileData.profile?.id;
            setProfileId(currentProfileId);

            setFormData({
              rating: profileData.rating ?? 0,
              impact: profileData.impact ?? 0,
              avatarId: profileData.avatarId || '',
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
            // Use stored IDs if available
            // if (storedProfileId) {
            //   setProfileId(storedProfileId);
            // }
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

  if (!String(formData.avatarId || '').trim()) {
    setError('معرف الصورة الرمزية غير متوفر.');
    return;
  }

  if (!String(formData.levelId || '').trim()) {
    setError('معرف المستوى غير متوفر.');
    return;
  }

  setSaving(true);
  setError(null);
  setSuccess(false);

  try {
    const payload = {
      rating: Number(formData.rating) || 0,
      impact: Number(formData.impact) || 0,
      avatarId: String(formData.avatarId || '').trim(),
      levelId: String(formData.levelId || '').trim(),
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
      <div className="update-profile-page" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
          <FaSpinner className="animate-spin" style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>جاري تحميل بيانات الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="update-profile-page" style={{ padding: '24px' }}>
      <div className="pro-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-header"
        >
          <div className="pro-header-left">
            <div className="pro-header-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <FaUser />
            </div>
            <div>
              <h2 className="pro-header-title">تحديث الملف الشخصي</h2>
              <p className="pro-header-subtitle">تعديل بيانات التقييم والتأثير والمستوى</p>
            </div>
          </div>
        </motion.div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pro-card"
          style={{ marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaImage style={{ color: 'var(--primary)' }} />
              الصورة الرمزية
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/avatar'}
              className="pro-btn pro-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaEdit />
              <span>تعديل الحساب</span>
            </motion.button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {avatarLoading ? (
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--border)'
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
                <div style={{
                  fontSize: '32px',
                  color: avatarData.hairColor || '#000'
                }}>
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
                border: '2px dashed var(--border)',
                color: 'var(--text-muted)'
              }}>
                <FaUser size={24} />
              </div>
            )}

            {/* Avatar Info from API */}
            {avatarData && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '12px',
                color: 'var(--text)'
              }}>
                <div style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <img
                      src={avatarPreviewUrl}
                      alt={avatarData.characterName || 'Avatar preview'}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--primary)',
                        background: '#fff',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: avatarData.skinColor || '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        fontSize: '8px',
                        color: avatarData.hairColor || '#000'
                      }}>
                        {avatarData.gender === 1 ? '👨' : '👩'}
                      </div>
                    </div>
                    <span>اللون البشرة: {avatarData.skinColor || '#fbbf24'}</span>
                    <span>لون الشعر: {avatarData.hairColor || '#000000'}</span>
                    <span>تسريحة الشعر: {avatarData.hairStyle || 'short'}</span>
                    <span>لون الملابس: {avatarData.clothesColor || '#3b82f6'}</span>
                    <span>اسم الشخصية: {avatarData.characterName || 'غير محدد'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Avatar Info from API */}
            {avatarData && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '12px',
                color: 'var(--text)'
              }}>
                <div style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: avatarData.skinColor || '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        fontSize: '8px',
                        color: avatarData.hairColor || '#000'
                      }}>
                        {avatarData.gender === 1 ? '👨' : '👩'}
                      </div>
                    </div>
                    <span>اللون البشرة: {avatarData.skinColor || '#fbbf24'}</span>
                    <span>لون الشعر: {avatarData.hairColor || '#000000'}</span>
                    <span>تسريحة الشعر: {avatarData.hairStyle || 'short'}</span>
                    <span>لون الملابس: {avatarData.clothesColor || '#3b82f6'}</span>
                    <span>اسم الشخصية: {avatarData.characterName || 'غير محدد'}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <p style={{ color: 'var(--text)', fontWeight: '600', marginBottom: '4px' }}>
                {avatarData ? avatarData.characterName || 'الأفاتار الخاص بك' : 'لا يوجد أفاتار'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {avatarData ? `معرف: ${formData.avatarId}` : 'اضغط على تعديل الحساب لإنشاء أفاتار'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
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

        {/* Success Message */}
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

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pro-card"
          style={{ maxWidth: '600px' }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaStar style={{ color: 'var(--warning)' }} />
                <label style={{ fontWeight: '600', color: 'var(--text)' }}>التقييم (Rating)</label>
              </div>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="pro-input"
                placeholder="أدخل التقييم"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaChartLine style={{ color: 'var(--info)' }} />
                <label style={{ fontWeight: '600', color: 'var(--text)' }}>التأثير (Impact)</label>
              </div>
              <input
                type="number"
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="pro-input"
                placeholder="أدخل قيمة التأثير"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaImage style={{ color: 'var(--accent)' }} />
                <label style={{ fontWeight: '600', color: 'var(--text)' }}>معرف الصورة الرمزية (Avatar ID)</label>
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

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaArrowUp style={{ color: 'var(--success)' }} />
                <label style={{ fontWeight: '600', color: 'var(--text)' }}>معرف المستوى (Level ID)</label>
              </div>
              <input
                type="text"
                name="levelId"
                value={formData.levelId}
                onChange={handleInputChange}
                className="pro-input"
                placeholder="أدخل معرف المستوى"
              />
            </div>

            {/* <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving || !profileId}
              className="pro-btn pro-btn-primary"
              style={{ width: '100%' }}
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
            </motion.button> */}
<motion.button
  type="submit"
  whileHover={canSubmit ? { scale: 1.02 } : {}}
  whileTap={canSubmit ? { scale: 0.98 } : {}}
  disabled={!canSubmit}
  className="pro-btn pro-btn-primary"
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

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pro-card"
          style={{ maxWidth: '600px', marginTop: '24px' }}
        >
          <h3 style={{ color: 'var(--text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUser style={{ color: 'var(--primary)' }} />
            معلومات الملف الشخصي المخزنة
          </h3>
          <div style={{ display: 'grid', gap: '12px', color: 'var(--text-muted)' }}>
            {/* <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span>Profile ID:</span>
              <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{profileId || 'غير متوفر'}</span>
            </div> */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span>Avatar ID:</span>
              <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{formData.avatarId || 'غير محدد'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span>Level ID:</span>
              <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{formData.levelId || 'غير محدد'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UpdateProfilePage;
