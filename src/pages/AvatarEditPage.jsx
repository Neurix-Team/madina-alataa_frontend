import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCut,
  FaExclamationTriangle,
  FaImage,
  FaMars,
  FaPalette,
  FaSave,
  FaSignature,
  FaSpinner,
  FaTshirt,
  FaUser,
  FaVenus,
} from 'react-icons/fa';
import { avatarService } from '../services/avatarService';
import { profilesService } from '../services/profilesService';
import {
  buildAvatarUrlFromProfile,
  syncAvatarProfileFromApiAvatar,
} from '../utils/avatarProfile';
import { showAppAlert } from '../utils/appAlerts';

const skinColors = [
  { value: '#FDBCB4', label: 'فاتح' },
  { value: '#F1C27D', label: 'قمحي' },
  { value: '#E0AC69', label: 'حنطي' },
  { value: '#C68642', label: 'دافئ' },
  { value: '#8D5524', label: 'داكن' },
  { value: '#FFE4E1', label: 'وردي' },
  { value: '#FFDAB9', label: 'خوخي' },
  { value: '#FFE4B5', label: 'عسلي' },
  { value: '#FFDEAD', label: 'بيج' },
  { value: '#D2B48C', label: 'رملي' },
];

const hairColors = [
  { value: '#000000', label: 'أسود' },
  { value: '#4B3621', label: 'بني غامق' },
  { value: '#8B4513', label: 'بني' },
  { value: '#D2691E', label: 'نحاسي' },
  { value: '#FFD700', label: 'أشقر' },
  { value: '#DC143C', label: 'أحمر' },
  { value: '#8B008B', label: 'بنفسجي' },
  { value: '#4169E1', label: 'أزرق' },
  { value: '#FFFFFF', label: 'أبيض' },
  { value: '#808080', label: 'رمادي' },
];

const hairStyles = [
  { value: 'short', label: 'قصير' },
  { value: 'long', label: 'طويل' },
  { value: 'curly', label: 'كيرلي' },
  { value: 'straight', label: 'ناعم' },
  { value: 'wavy', label: 'مموّج' },
  { value: 'bald', label: 'أصلع' },
  { value: 'ponytail', label: 'ذيل حصان' },
  { value: 'bun', label: 'كعكة' },
];

const clothesColors = [
  { value: '#FF0000', label: 'أحمر' },
  { value: '#00FF00', label: 'أخضر' },
  { value: '#0000FF', label: 'أزرق' },
  { value: '#FFFF00', label: 'أصفر' },
  { value: '#FF00FF', label: 'وردي قوي' },
  { value: '#00FFFF', label: 'تركواز' },
  { value: '#FFA500', label: 'برتقالي' },
  { value: '#800080', label: 'موف' },
  { value: '#FFC0CB', label: 'وردي' },
  { value: '#000000', label: 'أسود' },
];

const GENDER_OPTIONS = [
  {
    value: 1,
    label: 'ولد',
    subtitle: 'مظهر أكثر حدة',
    accent: '#2563eb',
    Icon: FaMars,
  },
  {
    value: 2,
    label: 'بنت',
    subtitle: 'مظهر أكثر نعومة',
    accent: '#db2777',
    Icon: FaVenus,
  },
];

const previewBackgrounds = {
  1: 'linear-gradient(145deg, #eff6ff, #dbeafe 55%, #bfdbfe)',
  2: 'linear-gradient(145deg, #fdf2f8, #f5d0fe 55%, #e9d5ff)',
};

const sectionIconWrap = {
  width: 38,
  height: 38,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(59,130,246,0.08)',
  color: '#2563eb',
  flexShrink: 0,
};

function hexToRgba(hex, alpha) {
  const cleaned = String(hex || '').replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `rgba(15,23,42,${alpha})`;
  }

  const red = Number.parseInt(cleaned.slice(0, 2), 16);
  const green = Number.parseInt(cleaned.slice(2, 4), 16);
  const blue = Number.parseInt(cleaned.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getContrastColor(hex) {
  const cleaned = String(hex || '').replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return '#0f172a';

  const red = Number.parseInt(cleaned.slice(0, 2), 16);
  const green = Number.parseInt(cleaned.slice(2, 4), 16);
  const blue = Number.parseInt(cleaned.slice(4, 6), 16);
  const luminance = (0.299 * red) + (0.587 * green) + (0.114 * blue);

  return luminance > 160 ? '#0f172a' : '#f8fafc';
}

function renderHairShape(hairStyle, hairColor, isFemale) {
  switch (hairStyle) {
    case 'bald':
      return null;
    case 'long':
      return (
        <>
          <path d="M18 41c0-17 13-28 31-28s31 11 31 28v17c-8-9-15-14-31-14S26 49 18 58V41z" fill={hairColor} />
          <path d="M24 32c4-10 14-16 25-16 12 0 21 6 25 16-8-4-16-6-25-6-10 0-18 2-25 6z" fill={hairColor} opacity="0.92" />
        </>
      );
    case 'curly':
      return (
        <path
          d="M18 44c0-14 9-23 20-23 5 0 9 2 12 5 3-4 8-6 13-6 12 0 19 10 19 24-7-7-14-10-21-10-4 0-7 1-10 2-3-2-7-3-11-3-8 0-15 4-22 11z"
          fill={hairColor}
        />
      );
    case 'straight':
      return (
        <>
          <path d="M20 42c0-17 11-28 29-28s29 11 29 28v14c-6-8-15-13-29-13S26 48 20 56V42z" fill={hairColor} />
          <rect x="24" y="25" width="50" height="7" rx="3.5" fill={hairColor} opacity="0.88" />
        </>
      );
    case 'wavy':
      return (
        <path
          d="M18 42c2-18 14-29 31-29s29 10 31 29c-5-4-9-7-14-7-5 0-7 4-12 4s-8-4-13-4c-8 0-14 5-23 14V42z"
          fill={hairColor}
        />
      );
    case 'ponytail':
      return (
        <>
          <path d="M20 42c0-17 11-28 29-28s29 11 29 28c-7-7-15-10-29-10s-22 3-29 10z" fill={hairColor} />
          <path d="M70 43c8 2 12 8 12 16 0 8-5 14-12 18 2-5 3-10 3-17s-1-11-3-17z" fill={hairColor} />
          <rect x="63" y="38" width="8" height="7" rx="3.5" fill={isFemale ? '#f59e0b' : '#2563eb'} />
        </>
      );
    case 'bun':
      return (
        <>
          <circle cx="50" cy="15" r="10" fill={hairColor} />
          <path d="M20 42c0-17 11-28 29-28s29 11 29 28c-7-7-15-10-29-10s-22 3-29 10z" fill={hairColor} />
        </>
      );
    case 'short':
    default:
      return (
        <>
          <path d="M20 42c1-15 12-25 29-25s28 10 29 25c-7-6-15-9-29-9s-22 3-29 9z" fill={hairColor} />
          <path d="M24 31c5-9 13-13 25-13 11 0 19 4 25 13-8-3-16-4-25-4-10 0-18 1-25 4z" fill={hairColor} opacity="0.9" />
        </>
      );
  }
}

function MiniAvatarGlyph({ gender, skinColor, hairColor, clothesColor, hairStyle }) {
  const isFemale = Number(gender) === 2;

  return (
    <svg viewBox="0 0 100 100" width="62" height="62" aria-hidden="true">
      <path d="M25 94c2-18 12-30 25-30s23 12 25 30H25z" fill={clothesColor} opacity="0.94" />
      <rect x="39" y="53" width="22" height="14" rx="7" fill={skinColor} />
      <ellipse cx="50" cy="40" rx="21" ry="23" fill={skinColor} />
      {renderHairShape(hairStyle, hairColor, isFemale)}
      <circle cx="42" cy="39" r="2.6" fill="#0f172a" />
      <circle cx="58" cy="39" r="2.6" fill="#0f172a" />
      <path d="M43 51c3 4 11 4 14 0" fill="none" stroke="#7c2d12" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function SectionBlock({ icon: Icon, title, subtitle, children }) {
  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid rgba(148,163,184,0.2)',
        borderRadius: 24,
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={sectionIconWrap}>
          <Icon size={16} />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>{title}</div>
          {subtitle ? (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginTop: 2 }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function ChoiceCard({ active, accent, onClick, children }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        width: '100%',
        borderRadius: 20,
        border: active ? `1px solid ${hexToRgba(accent, 0.5)}` : '1px solid rgba(148,163,184,0.22)',
        background: active ? hexToRgba(accent, 0.08) : '#f8fafc',
        boxShadow: active ? `0 20px 36px ${hexToRgba(accent, 0.15)}` : 'none',
        padding: 16,
        cursor: 'pointer',
        textAlign: 'right',
      }}
    >
      {children}
    </motion.button>
  );
}

function ColorSwatch({ color, label, active, kind, onClick }) {
  const iconColor = getContrastColor(color);

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        border: active ? `1px solid ${hexToRgba(color, 0.55)}` : '1px solid rgba(148,163,184,0.22)',
        borderRadius: 20,
        background: active ? hexToRgba(color, 0.12) : '#f8fafc',
        padding: 12,
        cursor: 'pointer',
        minHeight: 104,
        display: 'grid',
        placeItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: kind === 'skin' ? 'linear-gradient(145deg, #fff7ed, #fefce8)' : '#ffffff',
          display: 'grid',
          placeItems: 'center',
          boxShadow: 'inset 0 0 0 1px rgba(148,163,184,0.16)',
          position: 'relative',
        }}
      >
        {kind === 'skin' ? (
          <svg viewBox="0 0 56 56" width="40" height="40" aria-hidden="true">
            <circle cx="28" cy="22" r="12" fill={color} />
            <path d="M14 50c2-10 8-16 14-16s12 6 14 16H14z" fill={color} opacity="0.92" />
          </svg>
        ) : null}

        {kind === 'hair' ? (
          <svg viewBox="0 0 56 56" width="42" height="42" aria-hidden="true">
            <circle cx="28" cy="28" r="11" fill="#f5d0a9" />
            <path d="M14 29c1-11 7-18 14-18s13 7 14 18c-4-4-8-5-14-5s-10 1-14 5z" fill={color} />
            <path d="M18 21c3-6 7-9 10-9s7 3 10 9c-3-1-6-2-10-2s-7 1-10 2z" fill={color} opacity="0.92" />
          </svg>
        ) : null}

        {kind === 'clothes' ? (
          <svg viewBox="0 0 56 56" width="42" height="42" aria-hidden="true">
            <path
              d="M19 17c2 3 5 5 9 5s7-2 9-5l8 7-4 6-4-2v17H19V28l-4 2-4-6 8-7z"
              fill={color}
            />
            <path d="M24 17c1 2 2 4 4 4s3-2 4-4" fill="none" stroke={iconColor} strokeWidth="1.3" opacity="0.35" />
          </svg>
        ) : null}

        {active ? (
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: -4,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: color,
              color: iconColor,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 8px 18px rgba(15,23,42,0.14)',
              fontSize: 12,
            }}
          >
            <FaCheckCircle size={12} />
          </div>
        ) : null}
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: '#334155' }}>{label}</span>
    </motion.button>
  );
}

function HairStyleCard({ option, active, hairColor, skinColor, clothesColor, gender, onClick }) {
  return (
    <ChoiceCard active={active} accent={hairColor} onClick={onClick}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
            {option.label}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
            شكل المعاينة سيتحدث مباشرة
          </div>
        </div>

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(148,163,184,0.14)',
          }}
        >
          <MiniAvatarGlyph
            gender={gender}
            skinColor={skinColor}
            hairColor={hairColor}
            clothesColor={clothesColor}
            hairStyle={option.value}
          />
        </div>
      </div>
    </ChoiceCard>
  );
}

const AvatarEditPage = () => {
  const [avatarData, setAvatarData] = useState({
    gender: 1,
    skinColor: '',
    hairColor: '',
    hairStyle: '',
    clothesColor: '',
    characterName: '',
  });
  const [avatarId, setAvatarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 960);

  const canSubmit = !saving && avatarData.characterName.trim() && avatarId;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadAvatarData = async () => {
      try {
        setLoading(true);
        setError(null);

        let resolvedAvatarId = avatarService.getStoredAvatarId();
        try {
          if (!resolvedAvatarId) {
            const profileData = await profilesService.fetchMyProfile();
            if (profileData?.avatarId) {
              resolvedAvatarId = profileData.avatarId;
            }
          }
        } catch (profileError) {
          console.warn('AvatarEditPage profile fallback:', profileError);
        }

        if (!resolvedAvatarId) {
          const missingAvatarMessage = 'لا يوجد معرف أفاتار. يرجى إنشاء أفاتار أولاً.';
          setError(missingAvatarMessage);
          showAppAlert({
            title: 'الأفاتار غير متوفر',
            message: missingAvatarMessage,
            type: 'warning',
          });
          return;
        }

        setAvatarId(resolvedAvatarId);

        const avatarResponse = await avatarService.getAvatarById(resolvedAvatarId);
        avatarService.saveAvatarToStorage(avatarResponse);
        syncAvatarProfileFromApiAvatar(avatarResponse);

        setAvatarData({
          gender: Number(avatarResponse.gender ?? 1),
          skinColor: avatarResponse.skinColor || skinColors[0].value,
          hairColor: avatarResponse.hairColor || hairColors[0].value,
          hairStyle: avatarResponse.hairStyle || hairStyles[0].value,
          clothesColor: avatarResponse.clothesColor || clothesColors[0].value,
          characterName: avatarResponse.characterName || '',
        });
      } catch (err) {
        const message = 'فشل في تحميل بيانات الأفاتار';
        console.error('Error loading avatar data:', err);
        setError(message);
        showAppAlert({
          title: 'فشل التحميل',
          message,
          type: 'danger',
        });
      } finally {
        setLoading(false);
      }
    };

    loadAvatarData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAvatarData((prev) => ({
      ...prev,
      [name]: name === 'gender' ? Number(value) : value,
    }));
    setSuccess(false);
  };

  const handleColorSelect = (field, color) => {
    setAvatarData((prev) => ({
      ...prev,
      [field]: color,
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatarId) {
      const message = 'معرف الأفاتار غير متوفر. يرجى إعادة تحميل الصفحة.';
      setError(message);
      showAppAlert({
        title: 'لا يمكن الحفظ',
        message,
        type: 'danger',
      });
      return;
    }

    if (!avatarData.characterName.trim()) {
      const message = 'اسم الشخصية مطلوب.';
      setError(message);
      showAppAlert({
        title: 'الاسم مطلوب',
        message,
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await avatarService.updateAvatar(avatarId, avatarData);
      const refreshedAvatar = await avatarService.getAvatarById(avatarId);
      avatarService.saveAvatarToStorage(refreshedAvatar);
      syncAvatarProfileFromApiAvatar(refreshedAvatar);

      setAvatarData({
        gender: Number(refreshedAvatar.gender ?? 1),
        skinColor: refreshedAvatar.skinColor || skinColors[0].value,
        hairColor: refreshedAvatar.hairColor || hairColors[0].value,
        hairStyle: refreshedAvatar.hairStyle || hairStyles[0].value,
        clothesColor: refreshedAvatar.clothesColor || clothesColors[0].value,
        characterName: refreshedAvatar.characterName || '',
      });

      setSuccess(true);
      showAppAlert({
        title: 'تم الحفظ',
        message: 'تم تحديث الأفاتار بنجاح.',
        type: 'success',
      });
    } catch (err) {
      const message = err.message || 'فشل في تحديث الأفاتار';
      console.error('Error updating avatar:', err);
      setError(message);
      showAppAlert({
        title: 'فشل الحفظ',
        message,
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const previewProfile = useMemo(() => ({
    gender: Number(avatarData.gender) === 2 ? 'girl' : 'boy',
    skinColor: avatarData.skinColor || skinColors[0].value,
    hairColor: avatarData.hairColor || hairColors[0].value,
    hairStyle: avatarData.hairStyle || hairStyles[0].value,
    clothesColor: avatarData.clothesColor || clothesColors[0].value,
    characterName: avatarData.characterName || '',
    name: avatarData.characterName || 'madina-avatar',
    seed: avatarId || avatarData.characterName || 'madina-avatar',
    background: Number(avatarData.gender) === 2 ? 'gradient2' : 'gradient1',
  }), [avatarData, avatarId]);

  const avatarPreviewUrl = useMemo(
    () => buildAvatarUrlFromProfile(previewProfile),
    [previewProfile]
  );

  const selectedGender = GENDER_OPTIONS.find((option) => option.value === Number(avatarData.gender)) || GENDER_OPTIONS[0];
  const selectedHairStyle = hairStyles.find((item) => item.value === avatarData.hairStyle) || hairStyles[0];

  if (loading) {
    return (
      <div
        className="avatar-edit-page"
        style={{
          padding: 24,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="animate-spin" size={44} style={{ color: '#2563eb', marginBottom: 16 }} />
          <p style={{ color: '#475569', fontWeight: 800 }}>جاري تحميل بيانات الأفاتار...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="avatar-edit-page"
      style={{
        padding: isMobile ? 16 : 24,
        minHeight: '100vh',
      }}
    >
      <div className="pro-container" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.history.back()}
              className="pro-btn pro-btn-secondary"
              style={{ width: 46, height: 46, borderRadius: 16, padding: 0 }}
              type="button"
            >
              <FaArrowLeft />
            </motion.button>

            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #8b5cf6, #2563eb)',
                display: 'grid',
                placeItems: 'center',
                color: '#f8fafc',
                boxShadow: '0 18px 32px rgba(37,99,235,0.18)',
              }}
            >
              <FaUser size={20} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? 24 : 30, fontWeight: 900, color: '#0f172a' }}>
                تخصيص الأفاتار
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 700, color: '#64748b' }}>
                عدّل الشكل، الألوان، وتسريحة الشعر من غير ما يتغير أي شيء في تكامل الباك
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                background: '#ffffff',
                border: '1px solid rgba(148,163,184,0.18)',
                fontSize: 13,
                fontWeight: 900,
                color: '#334155',
              }}
            >
              {selectedGender.label}
            </div>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                background: '#ffffff',
                border: '1px solid rgba(148,163,184,0.18)',
                fontSize: 13,
                fontWeight: 900,
                color: '#334155',
              }}
            >
              {selectedHairStyle.label}
            </div>
          </div>
        </motion.div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(254,242,242,0.98), rgba(255,247,237,0.98))',
              border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#b91c1c',
            }}
          >
            <FaExclamationTriangle />
            <span style={{ fontWeight: 800 }}>{error}</span>
          </motion.div>
        ) : null}

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(220,252,231,0.98), rgba(240,253,244,0.98))',
              border: '1px solid rgba(34,197,94,0.22)',
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#15803d',
            }}
          >
            <FaCheckCircle />
            <span style={{ fontWeight: 800 }}>تم تحديث الأفاتار بنجاح.</span>
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(330px, 400px) minmax(0, 1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <aside
            style={{
              position: isMobile ? 'static' : 'sticky',
              top: 24,
              background: '#ffffff',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: 28,
              padding: isMobile ? 18 : 22,
              boxShadow: '0 30px 60px rgba(15,23,42,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                  المعاينة الحية
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                  الصورة تتغير فوراً مع كل اختيار
                </div>
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: hexToRgba(selectedGender.accent, 0.12),
                  color: selectedGender.accent,
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {selectedGender.label}
              </div>
            </div>

            <div
              style={{
                borderRadius: 30,
                padding: 18,
                background: previewBackgrounds[Number(avatarData.gender)] || previewBackgrounds[1],
                boxShadow: `inset 0 0 0 1px ${hexToRgba(selectedGender.accent, 0.12)}`,
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 28,
                  overflow: 'hidden',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.12)',
                }}
              >
                <img
                  src={avatarPreviewUrl}
                  alt="معاينة الأفاتار"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: 12,
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.72)',
                    borderRadius: 20,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      background: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <MiniAvatarGlyph
                      gender={avatarData.gender}
                      skinColor={avatarData.skinColor || skinColors[0].value}
                      hairColor={avatarData.hairColor || hairColors[0].value}
                      clothesColor={avatarData.clothesColor || clothesColors[0].value}
                      hairStyle={avatarData.hairStyle || hairStyles[0].value}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 4 }}>
                      اسم الشخصية
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', lineHeight: 1.35 }}>
                      {avatarData.characterName || 'اكتب اسم الشخصية'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 10,
                  }}
                >
                  {[
                    { label: 'الجنس', value: selectedGender.label },
                    { label: 'التسريحة', value: selectedHairStyle.label },
                    { label: 'الألوان', value: 'مخصصة' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: 'rgba(255,255,255,0.72)',
                        borderRadius: 18,
                        padding: 12,
                        minHeight: 76,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 6 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', lineHeight: 1.5 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
            <SectionBlock
              icon={FaUser}
              title="الجنس والهوية"
              subtitle="اختيار الجنس يغيّر صياغة المعاينة والخلفية مباشرة"
            >
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                {GENDER_OPTIONS.map((option) => {
                  const Icon = option.Icon;
                  const active = avatarData.gender === option.value;

                  return (
                    <ChoiceCard
                      key={option.value}
                      active={active}
                      accent={option.accent}
                      onClick={() => {
                        setAvatarData((prev) => ({ ...prev, gender: option.value }));
                        setSuccess(false);
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                            {option.label}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                            {option.subtitle}
                          </div>
                        </div>

                        <div
                          style={{
                            width: 74,
                            height: 74,
                            borderRadius: 22,
                            background: '#ffffff',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: 'inset 0 0 0 1px rgba(148,163,184,0.16)',
                            color: option.accent,
                          }}
                        >
                          <Icon size={28} />
                        </div>
                      </div>
                    </ChoiceCard>
                  );
                })}
              </div>

              <div style={{ marginTop: 14 }}>
                <label
                  htmlFor="characterName"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#334155',
                    marginBottom: 10,
                  }}
                >
                  <FaSignature size={14} />
                  اسم الشخصية
                </label>
                <input
                  id="characterName"
                  type="text"
                  name="characterName"
                  value={avatarData.characterName}
                  onChange={handleInputChange}
                  className="pro-input"
                  placeholder="اكتب الاسم الذي سيظهر للشخصية"
                  required
                  style={{ minHeight: 50 }}
                />
              </div>
            </SectionBlock>

            <SectionBlock
              icon={FaPalette}
              title="لون البشرة"
              subtitle="كل لون يظهر كوجه حقيقي بدل دائرة لون فقط"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                  gap: 12,
                }}
              >
                {skinColors.map((item) => (
                  <ColorSwatch
                    key={item.value}
                    color={item.value}
                    label={item.label}
                    active={avatarData.skinColor === item.value}
                    kind="skin"
                    onClick={() => handleColorSelect('skinColor', item.value)}
                  />
                ))}
              </div>
            </SectionBlock>

            <SectionBlock
              icon={FaCut}
              title="لون الشعر"
              subtitle="كل خيار مرسوم كخُصلة شعر باللون نفسه"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                  gap: 12,
                }}
              >
                {hairColors.map((item) => (
                  <ColorSwatch
                    key={item.value}
                    color={item.value}
                    label={item.label}
                    active={avatarData.hairColor === item.value}
                    kind="hair"
                    onClick={() => handleColorSelect('hairColor', item.value)}
                  />
                ))}
              </div>
            </SectionBlock>

            <SectionBlock
              icon={FaImage}
              title="تسريحة الشعر"
              subtitle="كل تسريحة لها معاينة مصغرة بالشعر والملابس الحالية"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: 12,
                }}
              >
                {hairStyles.map((styleOption) => (
                  <HairStyleCard
                    key={styleOption.value}
                    option={styleOption}
                    active={avatarData.hairStyle === styleOption.value}
                    hairColor={avatarData.hairColor || hairColors[0].value}
                    skinColor={avatarData.skinColor || skinColors[0].value}
                    clothesColor={avatarData.clothesColor || clothesColors[0].value}
                    gender={avatarData.gender}
                    onClick={() =>
                      setAvatarData((prev) => ({ ...prev, hairStyle: styleOption.value }))
                    }
                  />
                ))}
              </div>
            </SectionBlock>

            <SectionBlock
              icon={FaTshirt}
              title="لون الملابس"
              subtitle="اختيار اللون يغيّر مظهر اللبس في المعاينة فوراً"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                  gap: 12,
                }}
              >
                {clothesColors.map((item) => (
                  <ColorSwatch
                    key={item.value}
                    color={item.value}
                    label={item.label}
                    active={avatarData.clothesColor === item.value}
                    kind="clothes"
                    onClick={() => handleColorSelect('clothesColor', item.value)}
                  />
                ))}
              </div>
            </SectionBlock>

            <motion.button
              type="submit"
              whileHover={canSubmit ? { y: -1 } : {}}
              whileTap={canSubmit ? { scale: 0.99 } : {}}
              disabled={!canSubmit}
              style={{
                width: '100%',
                minHeight: 56,
                border: 'none',
                borderRadius: 20,
                background: canSubmit
                  ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                  : 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
                color: '#f8fafc',
                fontSize: 16,
                fontWeight: 900,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: canSubmit ? '0 24px 40px rgba(37,99,235,0.18)' : 'none',
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
