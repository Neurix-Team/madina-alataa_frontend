// src/pages/AvatarPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('avatar-profile');
    return saved ? JSON.parse(saved) : DEFAULT_AVATAR_PROFILE;
  });

  const [savedStatus, setSavedStatus] = useState(false);

  const update = (key, val) => {
    setProfile(prev => ({ ...prev, [key]: val }));
    setSavedStatus(false);
  };

  const toggleAccessory = (acc) => {
    setProfile(prev => {
      const list = prev.accessories.includes(acc)
        ? prev.accessories.filter(a => a !== acc)
        : [...prev.accessories, acc];
      return { ...prev, accessories: list };
    });
    setSavedStatus(false);
  };

  const handleSave = () => {
    localStorage.setItem('avatar-profile', JSON.stringify(profile));
    saveAvatarProfile(profile);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  const avatarUrl = buildAvatarUrlFromProfile(profile);

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Cairo', sans-serif",
      color: 'var(--text-primary)',
    }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {t('avatar.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
          {t('avatar.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left: Preview */}
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          borderRadius: '32px',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'sticky',
          top: '24px',
        }}>
          <div style={{
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '8px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '32px',
            background: 'var(--bg-card-2)',
          }}>
            <img 
              src={avatarUrl} 
              alt="Avatar Preview" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <button
            onClick={handleSave}
            style={{
              padding: '16px 40px',
              borderRadius: '20px',
              border: 'none',
              background: savedStatus ? 'var(--success)' : 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {savedStatus ? t('avatar.success') : t('avatar.save')}
          </button>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Gender */}
          <Section title={t('avatar.gender')}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => update('gender', 'boy')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '20px',
                  border: profile.gender === 'boy' ? '3px solid var(--primary)' : '1px solid var(--border)',
                  background: profile.gender === 'boy' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card-2)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: 32 }}>👦</span>
                <span style={{ fontWeight: 800 }}>{t('avatar.boy')}</span>
              </button>
              <button
                onClick={() => update('gender', 'girl')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '20px',
                  border: profile.gender === 'girl' ? '3px solid #ec4899' : '1px solid var(--border)',
                  background: profile.gender === 'girl' ? 'rgba(236, 72, 153, 0.1)' : 'var(--bg-card-2)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: 32 }}>👧</span>
                <span style={{ fontWeight: 800 }}>{t('avatar.girl')}</span>
              </button>
            </div>
          </Section>

          {/* Skin Tone */}
          <Section title={t('avatar.skin_tone')}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.keys(SKIN_MAP).map(tone => (
                <div
                  key={tone}
                  onClick={() => update('skinTone', tone)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `#${SKIN_MAP[tone]}`,
                    cursor: 'pointer',
                    border: profile.skinTone === tone ? '4px solid var(--primary)' : '2px solid var(--border)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          </Section>

          {/* Hair Style */}
          <Section title={t('avatar.hair_style')}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {Object.keys(HEAD_MAP[profile.gender]).map(style => (
                <OptionBtn key={style} active={profile.hairStyle === style} onClick={() => update('hairStyle', style)}>
                  {style}
                </OptionBtn>
              ))}
            </div>
          </Section>

          {/* Hair Color */}
          <Section title={t('avatar.hair_color')}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {Object.keys(HAIR_COLOR_MAP).map(color => (
                <div
                  key={color}
                  onClick={() => update('hairColor', color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `#${HAIR_COLOR_MAP[color]}`,
                    cursor: 'pointer',
                    border: profile.hairColor === color ? '3px solid var(--primary)' : '1px solid var(--border)',
                  }}
                />
              ))}
            </div>
          </Section>

          {/* Clothing */}
          <Section title={t('avatar.clothing')}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {Object.keys(CLOTHING_COLOR_MAP).map(item => (
                <OptionBtn key={item} active={profile.clothes === item} onClick={() => update('clothes', item)}>
                  {item}
                </OptionBtn>
              ))}
            </div>
          </Section>

          {/* Background */}
          <Section title={t('avatar.background')}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {Object.keys(BG_MAP).map(bg => (
                <div
                  key={bg}
                  onClick={() => update('background', bg)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, #${BG_MAP[bg].split(',')[0]}, #${BG_MAP[bg].split(',')[1]})`,
                    cursor: 'pointer',
                    border: profile.background === bg ? '4px solid var(--primary)' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
          </Section>

          {/* Accessories */}
          <Section title={t('avatar.accessories')}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {Object.keys(ACCESSORIES_MAP_OPENPEEPS).map(acc => (
                <OptionBtn 
                  key={acc} 
                  active={profile.accessories.includes(acc)} 
                  onClick={() => toggleAccessory(acc)}
                >
                  {acc}
                </OptionBtn>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '12px' }}>{title}</h3>
      {children}
    </div>
  );
}

function OptionBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: '14px',
        border: active ? '3px solid var(--primary)' : '1.5px solid var(--border)',
        background: active ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card-2)',
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
        fontWeight: 800,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}
