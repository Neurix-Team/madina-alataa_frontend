// ═══════════════════════════════════════════════════════════════════════
// 🖼️ Avatar Preview Component - Clean Code Version
// ═══════════════════════════════════════════════════════════════════════

import React from 'react';
import { AVATAR_OPTIONS } from '../../data/avatarOptions';

// 📐 Configuration Constants
const SIZE_DIMENSIONS = {
  small: 150,
  medium: 250,
  large: 350,
};

const SIZE_FONT = {
  small: 24,
  medium: 40,
  large: 56,
};

// 🎨 Inline Styles
const styles = {
  container: (dimensions, bgGradient) => ({
    position: 'relative',
    width: dimensions,
    height: dimensions,
    background: bgGradient,
    borderRadius: '20px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.3s',
    cursor: 'pointer',
  }),
  
  customAvatar: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  face: (skinColor) => ({
    width: '120px',
    height: '140px',
    borderRadius: '50%',
    backgroundColor: skinColor,
    position: 'relative',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  }),
  
  eyes: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: '45px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  
  eye: {
    width: '12px',
    height: '12px',
    background: '#000',
    borderRadius: '50%',
  },
  
  smile: {
    width: '40px',
    height: '20px',
    border: '3px solid #000',
    borderTop: 'none',
    borderRadius: '0 0 40px 40px',
    margin: '15px auto 0',
  },
  
  hair: (hairColor) => ({
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '130px',
    height: '60px',
    borderRadius: '60px 60px 0 0',
    backgroundColor: hairColor,
    zIndex: -1,
  }),
  
  accessory: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  
  aiImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '16px',
  },
  
  nameTag: {
    position: 'absolute',
    bottom: '-12px',
    background: '#fbbf24',
    color: '#78350f',
    padding: '6px 20px',
    borderRadius: '99px',
    fontSize: '14px',
    fontWeight: '800',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
};

// 🎯 Helper Functions
const getSkinColor = (skinToneId) => {
  return AVATAR_OPTIONS.skinTone.find(s => s.id === skinToneId)?.color || '#d4a574';
};

const getHairColor = (hairColorId) => {
  return AVATAR_OPTIONS.hairColor.find(h => h.id === hairColorId)?.color || '#000';
};

const getBackground = (backgroundId) => {
  const background = AVATAR_OPTIONS.backgrounds.find(b => b.id === backgroundId);
  if (!background) return '#e0f2fe';
  
  return background.colors.length > 1 
    ? `linear-gradient(135deg, ${background.colors.join(', ')})`
    : background.colors[0];
};

const getAccessory = (accId) => {
  return AVATAR_OPTIONS.accessories.find(a => a.id === accId);
};

// 🎨 Sub-Components
const AIAvatar = ({ url }) => (
  <img src={url} alt="AI Avatar" style={styles.aiImage} />
);

const CustomAvatar = ({ avatar, size }) => (
  <div style={styles.customAvatar}>
    <div style={styles.face(getSkinColor(avatar.skinTone))}>
      <div style={styles.eyes}>
        <div style={styles.eye} />
        <div style={styles.eye} />
      </div>
      <div style={styles.smile} />
    </div>
    
    <div style={styles.hair(getHairColor(avatar.hairColor))} />
    
    {avatar.accessories?.map(accId => {
      const acc = getAccessory(accId);
      if (!acc) return null;
      
      return (
        <div key={accId} style={styles.accessory}>
          <span style={{ fontSize: SIZE_FONT[size] }}>
            {acc.emoji}
          </span>
        </div>
      );
    })}
  </div>
);

const NameTag = ({ name }) => (
  <div style={styles.nameTag}>{name}</div>
);

// 🎯 Main Component
export default function AvatarPreview({ avatar, size = 'medium' }) {
  const dimensions = SIZE_DIMENSIONS[size];
  const bgGradient = getBackground(avatar.background);
  const showNameTag = avatar.name && size !== 'small';
  
  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'scale(1.02)';
  };
  
  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };
  
  return (
    <div 
      style={styles.container(dimensions, bgGradient)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {avatar.aiAvatarUrl ? (
        <AIAvatar url={avatar.aiAvatarUrl} />
      ) : (
        <CustomAvatar avatar={avatar} size={size} />
      )}
      
      {showNameTag && <NameTag name={avatar.name} />}
    </div>
  );
}
