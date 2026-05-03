import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaSave, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { avatarService } from '../services/avatarService';
import { profilesService } from '../services/profilesService';
import { syncAvatarProfileFromApiAvatar } from '../utils/avatarProfile';

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

        // Get profile data first to get avatarId
        const profileData = await profilesService.fetchMyProfile();
        console.log('Profile data for avatar:', profileData);

        if (!profileData.avatarId) {
          setError('لا يوجد معرف أفاتار. يرجى إنشاء أفاتار أولاً.');
          return;
        }

        setAvatarId(profileData.avatarId);

        // Load avatar data
        const avatarResponse = await avatarService.getAvatarById(profileData.avatarId);
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
        background: `linear-gradient(135deg, ${avatarData.skinColor}, ${avatarData.clothesColor})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid var(--primary)',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto 24px'
      }}>
        <div style={{
          fontSize: '48px',
          color: avatarData.hairColor,
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
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
