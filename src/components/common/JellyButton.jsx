// ═══════════════════════════════════════════════════════════════════════
// 🎮 Jelly Button Component - Clean Code Version (All-in-one)
// ═══════════════════════════════════════════════════════════════════════

import React, { useCallback } from 'react';
import AudioManager from '../../services/AudioManager';

// 🎨 Design Tokens
const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #3ba2f8, #1d6ed8)',
    color: '#fff',
    shadow: 'rgba(59,162,248,0.45)',
  },
  success: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    shadow: 'rgba(34,197,94,0.45)',
  },
  warning: {
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: '#fff',
    shadow: 'rgba(251,191,36,0.45)',
  },
  dark: {
    background: 'linear-gradient(135deg, #334155, #1e293b)',
    color: '#fff',
    shadow: 'rgba(0,0,0,0.3)',
  },
  danger: {
    background: 'linear-gradient(135deg, #f87171, #ef4444)',
    color: '#fff',
    shadow: 'rgba(239,68,68,0.4)',
  },
};

const SIZES = {
  sm: { padding: '8px 18px', fontSize: '13px', borderRadius: '12px' },
  md: { padding: '13px 24px', fontSize: '15px', borderRadius: '16px' },
  lg: { padding: '16px 32px', fontSize: '17px', borderRadius: '18px' },
};

// 🎯 Helper Functions
const getVariantStyles = (variant) => VARIANTS[variant] || VARIANTS.primary;
const getSizeStyles = (size) => SIZES[size] || SIZES.md;

const createButtonStyles = (variant, size, fullWidth, disabled, customStyle) => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: '900',
    letterSpacing: '0.01em',
    opacity: disabled ? 0.55 : 1,
    boxShadow: `0 4px 16px ${variantStyles.shadow}`,
    transition: 'box-shadow 0.2s, opacity 0.2s, transform 0.2s',
    ...variantStyles,
    ...sizeStyles,
    ...customStyle,
  };
};

// 🎯 Main Component
const JellyButton = ({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  sound = 'click',
  style = {},
  disabled = false,
}) => {
  const variantStyles = getVariantStyles(variant);
  
  const handleClick = useCallback((e) => {
    if (disabled) return;
    
    // Jelly animation
    const element = e.currentTarget;
    element.style.animation = 'none';
    requestAnimationFrame(() => {
      element.style.animation = 'jellyPress 0.4s cubic-bezier(0.36,0.07,0.19,0.97)';
    });
    
    // Play sound
    AudioManager.getInstance().play(sound);
    
    // Call onClick handler
    onClick?.(e);
  }, [disabled, sound, onClick]);
  
  const handleMouseEnter = useCallback((e) => {
    if (disabled) return;
    e.currentTarget.style.boxShadow = `0 8px 24px ${variantStyles.shadow}`;
    e.currentTarget.style.transform = 'translateY(-2px)';
  }, [disabled, variantStyles.shadow]);
  
  const handleMouseLeave = useCallback((e) => {
    e.currentTarget.style.boxShadow = `0 4px 16px ${variantStyles.shadow}`;
    e.currentTarget.style.transform = 'translateY(0)';
  }, [variantStyles.shadow]);
  
  const handleAnimationEnd = useCallback((e) => {
    e.currentTarget.style.animation = '';
  }, []);
  
  return (
    <>
      {/* Inline Keyframes */}
      <style>{`
        @keyframes jellyPress {
          0%   { transform: scale(1); }
          30%  { transform: scale(0.90) scaleX(1.08); }
          60%  { transform: scale(1.06) scaleX(0.97); }
          80%  { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
      `}</style>
      
      <button
        onClick={handleClick}
        disabled={disabled}
        style={createButtonStyles(variant, size, fullWidth, disabled, style)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onAnimationEnd={handleAnimationEnd}
        aria-disabled={disabled}
      >
        {children}
      </button>
    </>
  );
};

export default JellyButton;
