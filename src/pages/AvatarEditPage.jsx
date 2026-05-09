import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaSave, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { avatarService } from '../services/avatarService';
import { profilesService } from '../services/profilesService';
import { syncAvatarProfileFromApiAvatar } from '../utils/avatarProfile';

const AvatarPortrait = ({ avatarData }) => {
  const isFemale = Number(avatarData.gender) === 2;
  const skinColor = avatarData.skinColor || '#F1C27D';
  const hairColor = avatarData.hairColor || '#2f1f15';
  const clothesColor = avatarData.clothesColor || '#2563eb';

  return (
    <svg viewBox="0 0 160 160" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id="avatarPreviewBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fbff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#avatarPreviewBg)" />
      <ellipse cx="80" cy="145" rx="54" ry="34" fill={clothesColor} opacity="0.95" />
      <rect x="58" y="88" width="44" height="24" rx="14" fill={skinColor} />
      <ellipse cx="80" cy="70" rx="30" ry="34" fill={skinColor} />
      {isFemale ? (
        <>
          <path d="M44 72c0-30 18-46 36-46s36 16 36 46v20c-7-16-19-24-36-24s-29 8-36 24V72z" fill={hairColor} />
          <path d="M52 66c4-18 16-28 28-28s24 10 28 28c-9-8-18-12-28-12S61 58 52 66z" fill={hairColor} />
        </>
      ) : (
        <>
          <path d="M50 66c2-22 18-34 30-34s28 12 30 34c-10-9-20-13-30-13S60 57 50 66z" fill={hairColor} />
          <path d="M54 54c6-10 14-16 26-16 11 0 20 6 26 16-9-4-17-6-26-6-10 0-18 2-26 6z" fill={hairColor} opacity="0.92" />
        </>
      )}
      <circle cx="69" cy="72" r="3" fill="#1f2937" />
      <circle cx="91" cy="72" r="3" fill="#1f2937" />
      <path d="M71 88c4 5 14 5 18 0" fill="none" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

const AvatarEditPage = () => {
  const [avatarData, setAvatarData] = useState({
    gender: 1,
    skinColor: '',
    hairColor: '',
    hairStyle: '',
    clothesColor: '',
    characterName: ''
  });
  const [avatarId, setAvatarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Avatar customization options
  const skinColors = [
    '#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524',
    '#FFE4E1', '#FFDAB9', '#FFE4B5', '#FFDEAD', '#D2B48C'
  ];

  const hairColors = [
    '#000000', '#4B3621', '#8B4513', '#D2691E', '#FFD700',
    '#DC143C', '#8B008B', '#4169E', '#FFFFFF', '#808080'
  ];

  const hairStyles = [
    'short', 'long', 'curly', 'straight', 'wavy', 'bald', 'ponytail', 'bun'
  ];

  const clothesColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
    '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#000000'
  ];

  const canSubmit = !saving && avatarData.characterName.trim() && avatarId;

  // Load avatar data on mount
  useEffect(() => {
    const loadAvatarData = async () => {
      try {
        setLoading(true);
        setError(null);

        let resolvedAvatarId = avatarService.getStoredAvatarId();
        try {
          if (!resolvedAvatarId) {
            const profileData = await profilesService.fetchMyProfile();
            console.log('Profile data for avatar:', profileData);
            if (profileData?.avatarId) {
              resolvedAvatarId = profileData.avatarId;
            }
          }
        } catch (profileError) {
          console.warn('AvatarEditPage profile fallback:', profileError);
        }

        if (!resolvedAvatarId) {
          setError('لا يوجد معرف أفاتار. يرجى إنشاء أفاتار أولاً.');
          return;
        }

        setAvatarId(resolvedAvatarId);

        // Load avatar data
        const avatarResponse = await avatarService.getAvatarById(resolvedAvatarId);
        console.log('Avatar data loaded:', avatarResponse);
        avatarService.saveAvatarToStorage(avatarResponse);
        syncAvatarProfileFromApiAvatar(avatarResponse);

        setAvatarData({
          gender: avatarResponse.gender || 1,
          skinColor: avatarResponse.skinColor || skinColors[0],
          hairColor: avatarResponse.hairColor || hairColors[0],
          hairStyle: avatarResponse.hairStyle || hairStyles[0],
          clothesColor: avatarResponse.clothesColor || clothesColors[0],
          characterName: avatarResponse.characterName || ''
        });

      } catch (err) {
        console.error('Error loading avatar data:', err);
        setError('فشل في تحميل بيانات الأفاتار');
      } finally {
        setLoading(false);
      }
    };

    loadAvatarData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setAvatarData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleColorSelect = (field, color) => {
    setAvatarData((prev) => ({
      ...prev,
      [field]: color
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatarId) {
      setError('معرف الأفاتار غير متوفر. يرجى إعادة تحميل الصفحة.');
      return;
    }

    if (!avatarData.characterName.trim()) {
      setError('اسم الشخصية مطلوب.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await avatarService.updateAvatar(avatarId, avatarData);
      const refreshedAvatar = await avatarService.getAvatarById(avatarId);
      console.log('Avatar updated successfully:', refreshedAvatar);
      avatarService.saveAvatarToStorage(refreshedAvatar);
      syncAvatarProfileFromApiAvatar(refreshedAvatar);

      setAvatarData({
        gender: refreshedAvatar.gender || 1,
        skinColor: refreshedAvatar.skinColor || skinColors[0],
        hairColor: refreshedAvatar.hairColor || hairColors[0],
        hairStyle: refreshedAvatar.hairStyle || hairStyles[0],
        clothesColor: refreshedAvatar.clothesColor || clothesColors[0],
        characterName: refreshedAvatar.characterName || ''
      });

      setSuccess(true);
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(err.message || 'فشل في تحديث الأفاتار');
    } finally {
      setSaving(false);
    }
  };

  const renderAvatarPreview = () => {
    return (
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid var(--primary)',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto 24px'
      }}>
        <div style={{
          position: 'absolute',
          inset: '10px',
          zIndex: 1
        }}>
          <AvatarPortrait avatarData={avatarData} />
        </div>
        <div style={{
          fontSize: '48px',
          color: avatarData.hairColor,
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          opacity: 0
        }}>
          {avatarData.gender === 1 ? '👨' : '👩'}
        </div>
        {avatarData.characterName && (
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            right: '-8px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid white'
          }}>
            {avatarData.characterName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="avatar-edit-page" style={{ padding: '24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="animate-spin" size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text)' }}>جاري تحميل بيانات الأفاتار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-edit-page" style={{ padding: '24px', minHeight: '100vh' }}>
      <div className="pro-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-header"
          style={{ marginBottom: '24px' }}
        >
          <div className="pro-header-left">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="pro-btn pro-btn-secondary"
              style={{ marginRight: '16px', padding: '8px 16px' }}
            >
              <FaArrowLeft />
            </motion.button>
            <div className="pro-header-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <FaUser />
            </div>
            <div>
              <h2 className="pro-header-title">تخصيص الأفاتار</h2>
              <p className="pro-header-subtitle">تعديل مظهر وشخصية الأفاتار الخاص بك</p>
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
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
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
            <span>تم تحديث الأفاتار بنجاح!</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-card"
        >
          <form onSubmit={handleSubmit}>
            {/* Avatar Preview */}
            {renderAvatarPreview()}

            {/* Gender Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                الجنس
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ flex: 1 }}>
                  <input
                    type="radio"
                    name="gender"
                    value={1}
                    checked={avatarData.gender === 1}
                    onChange={handleInputChange}
                    style={{ marginLeft: '8px' }}
                  />
                  ذكر
                </label>
                <label style={{ flex: 1 }}>
                  <input
                    type="radio"
                    name="gender"
                    value={2}
                    checked={avatarData.gender === 2}
                    onChange={handleInputChange}
                    style={{ marginLeft: '8px' }}
                  />
                  أنثى
                </label>
              </div>
            </div>

            {/* Character Name */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                اسم الشخصية
              </label>
              <input
                type="text"
                name="characterName"
                value={avatarData.characterName}
                onChange={handleInputChange}
                className="pro-input"
                placeholder="أدخل اسم الشخصية"
                required
              />
            </div>

            {/* Skin Color */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                لون البشرة
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {skinColors.map((color) => (
                  <motion.button
                    key={color}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleColorSelect('skinColor', color)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: avatarData.skinColor === color ? '3px solid var(--primary)' : '2px solid var(--border)',
                      background: color,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                لون الشعر
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {hairColors.map((color) => (
                  <motion.button
                    key={color}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleColorSelect('hairColor', color)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: avatarData.hairColor === color ? '3px solid var(--primary)' : '2px solid var(--border)',
                      background: color,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                تسريحة الشعر
              </label>
              <select
                name="hairStyle"
                value={avatarData.hairStyle}
                onChange={handleInputChange}
                className="pro-input"
              >
                {hairStyles.map((style) => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Clothes Color */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '12px' }}>
                لون الملابس
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {clothesColors.map((color) => (
                  <motion.button
                    key={color}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleColorSelect('clothesColor', color)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: avatarData.clothesColor === color ? '3px solid var(--primary)' : '2px solid var(--border)',
                      background: color,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
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
      </div>
    </div>
  );
};

export default AvatarEditPage;
