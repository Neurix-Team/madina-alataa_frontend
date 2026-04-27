// ═══════════════════════════════════════════════════════════════════════
// 🎨 Design System - Button Component
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react';
import { colors, gradients, typography, spacing, borderRadius, shadows } from '../tokens';

// 🎯 Variant Configurations
const VARIANTS = {
  primary: {
    background: gradients.primary,
    color: colors.neutral[0],
    shadow: shadows.primary,
    hoverShadow: '0 8px 24px rgba(251, 191, 36, 0.55)',
  },
  success: {
    background: gradients.success,
    color: colors.neutral[0],
    shadow: shadows.success,
    hoverShadow: '0 8px 24px rgba(34, 197, 94, 0.55)',
  },
  warning: {
    background: gradients.warning,
    color: colors.neutral[0],
    shadow: shadows.warning,
    hoverShadow: '0 8px 24px rgba(245, 158, 11, 0.55)',
  },
  danger: {
    background: gradients.danger,
    color: colors.neutral[0],
    shadow: shadows.danger,
    hoverShadow: '0 8px 24px rgba(239, 68, 68, 0.5)',
  },
  info: {
    background: gradients.info,
    color: colors.neutral[0],
    shadow: shadows.info,
    hoverShadow: '0 8px 24px rgba(59, 162, 248, 0.55)',
  },
  outline: {
    background: 'transparent',
    color: colors.primary[500],
    border: `2px solid ${colors.primary[500]}`,
    shadow: 'none',
    hoverShadow: shadows.md,
  },
  ghost: {
    background: 'transparent',
    color: colors.neutral[700],
    shadow: 'none',
    hoverShadow: 'none',
    hoverBackground: colors.neutral[100],
  },
};

// 🎯 Size Configurations
const SIZES = {
  xs: {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: typography.fontSize.xs,
    borderRadius: borderRadius.sm,
  },
  sm: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: typography.fontSize.sm,
    borderRadius: borderRadius.md,
  },
  md: {
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: typography.fontSize.base,
    borderRadius: borderRadius.lg,
  },
  lg: {
    padding: `${spacing[4]} ${spacing[8]}`,
    fontSize: typography.fontSize.lg,
    borderRadius: borderRadius.xl,
  },
  xl: {
    padding: `${spacing[5]} ${spacing[10]}`,
    fontSize: typography.fontSize.xl,
    borderRadius: borderRadius['2xl'],
  },
};

// 🎯 Helper Functions
const getButtonStyles = (variant, size, fullWidth, disabled, isHovered, customStyle) => {
  const variantConfig = VARIANTS[variant] || VARIANTS.primary;
  const sizeConfig = SIZES[size] || SIZES.md;
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    width: fullWidth ? '100%' : 'auto',
    border: variantConfig.border || 'none',
    background: isHovered && variantConfig.hoverBackground 
      ? variantConfig.hoverBackground 
      : variantConfig.background,
    color: variantConfig.color,
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.black,
    letterSpacing: typography.letterSpacing.wide,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: isHovered ? variantConfig.hoverShadow : variantConfig.shadow,
    transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    ...sizeConfig,
    ...customStyle,
  };
};

// 🎯 Main Component
export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  leftIcon,
  rightIcon,
  loading = false,
  style = {},
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  const handleClick = useCallback((e) => {
    if (disabled || loading) return;
    onClick?.(e);
  }, [disabled, loading, onClick]);
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={getButtonStyles(variant, size, fullWidth, disabled, isHovered, style)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-disabled={disabled}
      aria-busy={loading}
      {...rest}
    >
      {loading && <span>⏳</span>}
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

export default Button;
