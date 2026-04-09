// src/pages/AvatarPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAvatarProfile } from '../utils/avatarProfile';

const SKIN_MAP = {
  light: 'ffd1a9',
  medium: 'd4a574',
  wheat: 'c4915c',
  olive: 'a67c52',
  brown: '8b6f47',
  dark: '6d5a3e',
};

const HAIR_COLOR_MAP = {
  black: '000000',
  brown: '5c4033',
  blonde: 'f0d478',
  red: 'c1440e',
  blue: '1e3a8a',
  purple: '7c3aed',
  pink: 'ec4899',
  green: '059669',
  silver: '9ca3af',
  gold: 'f59e0b',
};

const DEFAULT_AVATAR_PROFILE = {
  gender: 'boy',
  skinTone: 'medium',
  hairStyle: 'short',
  hairColor: 'pink',
  clothes: 'tshirt',
  background: 'gradient3',
  accessories: [],
  seed: 'madina-default-avatar',
};

const BG_MAP = {
  gradient1: '3b82f6,b6e3f4',
  gradient2: 'ec4899,db2777',
  gradient3: '10b981,059669',
  gradient4: 'f59e0b,d97706',
  gradient5: '8b5cf6,7c3aed',
  stars: '1e293b,0f172a',
  rainbow: 'ec4899,8b5cf6,3b82f6',
};

const ACCESSORIES_MAP_OPENPEEPS = {
  glasses: 'glasses',
  sunglasses: 'sunglasses',
  hat: 'glasses2',
  crown: 'glasses3',
  mask: 'eyepatch',
  flower: 'glasses4',
  bow: 'glasses5',
  headband: 'sunglasses2',
};

const HEAD_MAP = {
  boy: {
    short: 'short1',
    medium: 'short2',
    long: 'mediumStraight',
    curly: 'afro',
    wavy: 'mediumStraight',
    braid: 'twists',
    bun: 'bun',
    ponytail: 'long',
  },
  girl: {
    short: 'short1',
    medium: 'mediumStraight',
    long: 'long',
    curly: 'afro',
    wavy: 'mediumStraight',
    braid: 'braids',
    bun: 'bun',
    ponytail: 'long',
  },
};

const FACE_MAP = {
  boy: 'smile',
  girl: 'smileBig',
};

const CLOTHING_COLOR_MAP = {
  tshirt: '8fa7df',
  hoodie: '4b5563',
  jacket: '1e40af',
  dress: 'ec4899',
  superhero: 'dc2626',
  wizard: '7c3aed',
};

export function buildAvatarUrlFromProfile(profile) {
  const p = { ...DEFAULT_AVATAR_PROFILE, ...profile };

  const skinColor = SKIN_MAP[p.skinTone] || SKIN_MAP.medium;
  const bgColors = BG_MAP[p.background] || BG_MAP.gradient3;

  const stableSeed = p.seed || p.name || 'madina-default-avatar';
  const visualSignature = [
    p.gender,
    p.skinTone,
    p.hairStyle,
    p.hairColor,
    p.clothes,
    p.background,
    ...(p.accessories || []),
  ].join('-');

  const head =
    HEAD_MAP[p.gender]?.[p.hairStyle] ||
    (p.gender === 'girl' ? 'long' : 'short1');

  const accessory = (p.accessories || [])
    .map((id) => ACCESSORIES_MAP_OPENPEEPS[id])
    .filter(Boolean)
    .slice(0, 1);

  const params = new URLSearchParams({
    seed: `${stableSeed}-${visualSignature}`,
    size: '256',
    backgroundColor: bgColors,
    backgroundType: 'gradientLinear',
    skinColor,
    head,
    face: FACE_MAP[p.gender] || 'smile',
    clothingColor: CLOTHING_COLOR_MAP[p.clothes] || '8fa7df',
    scale: '95',
  });

  if (accessory.length) {
    params.set('accessories', accessory.join(','));
    params.set('accessoriesProbability', '100');
  } else {
    params.set('accessoriesProbability', '0');
  }

  return `https://api.dicebear.com/9.x/open-peeps/svg?${params.toString()}`;
}

export default function AvatarPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    gender: 'boy',
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'pink',
    clothes: 'tshirt',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [points] = useState(0); // Placeholder for points

  useEffect(() => {
    const url = buildAvatarUrlFromProfile(profile);
    setAvatarUrl(url);
  }, [profile]);

  const updateProfile = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveAvatarProfile(profile);
    navigate('/profile-v2');
  };

  const handleShare = () => {
    // Placeholder for share functionality
    alert('مشاركة الصورة');
  };

  const skinToneOptions = [
    { value: 'light', label: 'فاتح', color: '#ffd1a9' },
    { value: 'medium', label: 'متوسط', color: '#d4a574' },
    { value: 'wheat', label: 'حنطي', color: '#c4915c' },
    { value: 'olive', label: 'زيتوني', color: '#a67c52' },
    { value: 'brown', label: 'بني', color: '#8b6f47' },
    { value: 'dark', label: 'داكن', color: '#6d5a3e' },
  ];

  const hairStyleOptions = [
    { value: 'short', label: 'قصير', emoji: '✂️' },
    { value: 'medium', label: 'متوسط', emoji: '💇' },
    { value: 'long', label: 'طويل', emoji: '💇‍♀️' },
    { value: 'curly', label: 'كيرلي', emoji: '🌀' },
    { value: 'wavy', label: 'مموج', emoji: '〰️' },
    { value: 'braid', label: 'ضفيرة', emoji: '🎀' },
    { value: 'bun', label: 'كعكة', emoji: '🥯' },
    { value: 'ponytail', label: 'ذيل حصان', emoji: '🎀' },
  ];

  const hairColorOptions = [
    { value: 'black', label: 'أسود', color: '#000000' },
    { value: 'brown', label: 'بني', color: '#5c4033' },
    { value: 'blonde', label: 'أشقر', color: '#f0d478' },
    { value: 'red', label: 'أحمر', color: '#c1440e' },
    { value: 'blue', label: 'أزرق', color: '#1e3a8a' },
    { value: 'purple', label: 'بنفسجي', color: '#7c3aed' },
    { value: 'pink', label: 'وردي', color: '#ec4899' },
    { value: 'green', label: 'أخضر', color: '#059669' },
    { value: 'silver', label: 'فضي', color: '#9ca3af' },
    { value: 'gold', label: 'ذهبي', color: '#f59e0b' },
  ];

  return (
    <div style={{
      fontFamily: 'Cairo, sans-serif',
      direction: 'rtl',
      minHeight: '100vh',
      padding: '20px',
      background: 'var(--bg-app)',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-md)',
        border: '1.5px solid var(--border)',
        textAlign: 'center',
        position: 'relative',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '900',
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}>
          🎨 غرفة التجهيزات
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          fontWeight: '600',
        }}>
          خصّص مظهرك وشخصيتك بشكل احترافي!
        </p>
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '28px',
          background: 'linear-gradient(135deg, rgb(251, 191, 36), rgb(245, 158, 11))',
          color: 'rgb(120, 53, 15)',
          padding: '6px 16px',
          borderRadius: '99px',
          fontSize: '13px',
          fontWeight: '800',
          boxShadow: 'rgba(251, 191, 36, 0.3) 0px 4px 12px',
        }}>
          ✨ نقاطك: <strong>{points}</strong> KP
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        overflowX: 'auto',
        padding: '0px 4px',
      }}>
        <button
          onClick={() => setActiveTab('basic')}
          style={{
            flex: '1 0 auto',
            background: activeTab === 'basic' ? 'linear-gradient(135deg, rgb(102, 126, 234), rgb(118, 75, 162))' : 'var(--bg-card)',
            border: activeTab === 'basic' ? '2px solid rgb(118, 75, 162)' : '2px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 16px',
            cursor: 'pointer',
            transition: '0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            minWidth: '100px',
            color: activeTab === 'basic' ? 'rgb(255, 255, 255)' : 'var(--text-primary)',
            transform: activeTab === 'basic' ? 'translateY(-2px)' : 'none',
            boxShadow: activeTab === 'basic' ? 'rgba(118, 75, 162, 0.3) 0px 4px 12px' : 'none',
          }}
        >
          <span style={{ fontSize: '20px' }}>🎨</span>
          <span style={{ fontSize: '12px', fontWeight: '800' }}>🎨 أساسي</span>
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          style={{
            flex: '1 0 auto',
            background: activeTab === 'advanced' ? 'linear-gradient(135deg, rgb(102, 126, 234), rgb(118, 75, 162))' : 'var(--bg-card)',
            border: activeTab === 'advanced' ? '2px solid rgb(118, 75, 162)' : '2px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 16px',
            cursor: 'pointer',
            transition: '0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            minWidth: '100px',
            color: activeTab === 'advanced' ? 'rgb(255, 255, 255)' : 'var(--text-primary)',
            transform: activeTab === 'advanced' ? 'translateY(-2px)' : 'none',
            boxShadow: activeTab === 'advanced' ? 'rgba(118, 75, 162, 0.3) 0px 4px 12px' : 'none',
          }}
        >
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span style={{ fontSize: '12px', fontWeight: '800' }}>⚡ متقدم</span>
        </button>
        <button
          onClick={() => setActiveTab('ai-photo')}
          style={{
            flex: '1 0 auto',
            background: activeTab === 'ai-photo' ? 'linear-gradient(135deg, rgb(102, 126, 234), rgb(118, 75, 162))' : 'var(--bg-card)',
            border: activeTab === 'ai-photo' ? '2px solid rgb(118, 75, 162)' : '2px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 16px',
            cursor: 'pointer',
            transition: '0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            minWidth: '100px',
            color: activeTab === 'ai-photo' ? 'rgb(255, 255, 255)' : 'var(--text-primary)',
            transform: activeTab === 'ai-photo' ? 'translateY(-2px)' : 'none',
            boxShadow: activeTab === 'ai-photo' ? 'rgba(118, 75, 162, 0.3) 0px 4px 12px' : 'none',
          }}
        >
          <span style={{ fontSize: '20px' }}>📸</span>
          <span style={{ fontSize: '12px', fontWeight: '800' }}>📸 AI Photo</span>
        </button>
        <button
          onClick={() => setActiveTab('store')}
          style={{
            flex: '1 0 auto',
            background: activeTab === 'store' ? 'linear-gradient(135deg, rgb(102, 126, 234), rgb(118, 75, 162))' : 'var(--bg-card)',
            border: activeTab === 'store' ? '2px solid rgb(118, 75, 162)' : '2px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 16px',
            cursor: 'pointer',
            transition: '0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            minWidth: '100px',
            color: activeTab === 'store' ? 'rgb(255, 255, 255)' : 'var(--text-primary)',
            transform: activeTab === 'store' ? 'translateY(-2px)' : 'none',
            boxShadow: activeTab === 'store' ? 'rgba(118, 75, 162, 0.3) 0px 4px 12px' : 'none',
          }}
        >
          <span style={{ fontSize: '20px' }}>🛍️</span>
          <span style={{ fontSize: '12px', fontWeight: '800' }}>🛍️ المتجر</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          style={{
            flex: '1 0 auto',
            background: activeTab === 'saved' ? 'linear-gradient(135deg, rgb(102, 126, 234), rgb(118, 75, 162))' : 'var(--bg-card)',
            border: activeTab === 'saved' ? '2px solid rgb(118, 75, 162)' : '2px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 16px',
            cursor: 'pointer',
            transition: '0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            minWidth: '100px',
            color: activeTab === 'saved' ? 'rgb(255, 255, 255)' : 'var(--text-primary)',
            transform: activeTab === 'saved' ? 'translateY(-2px)' : 'none',
            boxShadow: activeTab === 'saved' ? 'rgba(118, 75, 162, 0.3) 0px 4px 12px' : 'none',
          }}
        >
          <span style={{ fontSize: '20px' }}>💾</span>
          <span style={{ fontSize: '12px', fontWeight: '800' }}>💾 المحفوظات</span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '20px',
      }}>
        {/* Left Side: Avatar Preview */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1.5px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          position: 'sticky',
          top: '20px',
          height: 'fit-content',
        }}>
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'rgba(0, 0, 0, 0.15) 0px 10px 30px',
            width: '350px',
            height: '350px',
            background: 'linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))',
          }}>
            <img
              src={avatarUrl}
              alt="Cartoon Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '16px',
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-12px',
              background: 'rgb(251, 191, 36)',
              color: 'rgb(120, 53, 15)',
              padding: '6px 20px',
              borderRadius: '99px',
              fontSize: '14px',
              fontWeight: '800',
              boxShadow: 'rgba(0, 0, 0, 0.15) 0px 4px 12px',
            }}>
              البطل
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '10px',
            width: '100%',
          }}>
            <button
              onClick={handleSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: 'auto',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
                fontWeight: '900',
                letterSpacing: '0.01em',
                opacity: 1,
                boxShadow: 'rgba(59, 162, 248, 0.45) 0px 4px 16px',
                transition: 'box-shadow 0.2s, opacity 0.2s, transform 0.2s',
                background: 'linear-gradient(135deg, rgb(59, 162, 248), rgb(29, 110, 216))',
                color: 'rgb(255, 255, 255)',
                padding: '13px 24px',
                fontSize: '15px',
                borderRadius: '16px',
                flex: 1,
                transform: 'translateY(0px)',
              }}
            >
              💾 حفظ التعديلات
            </button>
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: 'auto',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
                fontWeight: '900',
                letterSpacing: '0.01em',
                opacity: 1,
                boxShadow: 'rgba(59, 162, 248, 0.45) 0px 4px 16px',
                transition: 'box-shadow 0.2s, opacity 0.2s, transform 0.2s',
                background: 'linear-gradient(135deg, rgb(59, 162, 248), rgb(29, 110, 216))',
                color: 'rgb(255, 255, 255)',
                padding: '13px 24px',
                fontSize: '15px',
                borderRadius: '16px',
                flex: 1,
              }}
            >
              📤 مشاركة
            </button>
          </div>
        </div>

        {/* Right Side: Options */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1.5px solid var(--border)',
          maxHeight: 'calc(-200px + 100vh)',
          overflowY: 'auto',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            {/* Gender */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}>
                👤 الجنس
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                <button
                  onClick={() => updateProfile('gender', 'boy')}
                  style={{
                    background: profile.gender === 'boy' ? 'rgb(237, 233, 254)' : 'var(--bg-card-2)',
                    border: profile.gender === 'boy' ? '3px solid rgb(59, 130, 246)' : 'none',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: '0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-primary)',
                    transform: profile.gender === 'boy' ? 'scale(1.05)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '48px' }}>👦</span>
                  <span style={{ fontSize: '14px', fontWeight: '800' }}>ولد</span>
                </button>
                <button
                  onClick={() => updateProfile('gender', 'girl')}
                  style={{
                    background: profile.gender === 'girl' ? 'rgb(237, 233, 254)' : 'var(--bg-card-2)',
                    border: profile.gender === 'girl' ? '3px solid rgb(236, 72, 153)' : 'none',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: '0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span style={{ fontSize: '48px' }}>👧</span>
                  <span style={{ fontSize: '14px', fontWeight: '800' }}>بنت</span>
                </button>
              </div>
            </div>

            {/* Skin Color */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}>
                🎨 لون البشرة
              </h4>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}>
                {skinToneOptions.map(option => (
                  <button
                    key={option.value}
                    title={option.label}
                    onClick={() => updateProfile('skinTone', option.value)}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      border: profile.skinTone === option.value ? '3px solid rgb(255, 255, 255)' : '3px solid rgb(255, 255, 255)',
                      cursor: 'pointer',
                      transition: '0.2s',
                      boxShadow: profile.skinTone === option.value ? 'rgba(0, 0, 0, 0.15) 0px 2px 8px' : 'rgba(0, 0, 0, 0.15) 0px 2px 8px',
                      backgroundColor: option.color,
                      transform: profile.skinTone === option.value ? 'scale(1.15)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}>
                💇 تسريحة الشعر
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
              }}>
                {hairStyleOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateProfile('hairStyle', option.value)}
                    style={{
                      background: profile.hairStyle === option.value ? 'rgb(237, 233, 254)' : 'var(--bg-card-2)',
                      border: profile.hairStyle === option.value ? '2px solid rgb(124, 58, 237)' : '2px solid var(--border)',
                      borderRadius: '12px',
                      padding: '12px 8px',
                      cursor: 'pointer',
                      transition: '0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      position: 'relative',
                      color: 'var(--text-primary)',
                      transform: profile.hairStyle === option.value ? 'scale(1.05)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>{option.emoji}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700' }}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}>
                🌈 لون الشعر
              </h4>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}>
                {hairColorOptions.map(option => (
                  <button
                    key={option.value}
                    title={option.label}
                    onClick={() => updateProfile('hairColor', option.value)}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      border: profile.hairColor === option.value ? '3px solid rgb(255, 255, 255)' : '3px solid rgb(255, 255, 255)',
                      cursor: 'pointer',
                      transition: '0.2s',
                      boxShadow: profile.hairColor === option.value ? 'rgba(124, 58, 237, 0.4) 0px 4px 16px' : 'rgba(0, 0, 0, 0.15) 0px 2px 8px',
                      backgroundColor: option.color,
                      transform: profile.hairColor === option.value ? 'scale(1.15)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}