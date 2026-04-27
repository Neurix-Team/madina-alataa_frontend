// ═══════════════════════════════════════════════════════════════════════
// 🎨 Design System - Typography Token
// ═══════════════════════════════════════════════════════════════════════

export const typography = {
  // Font Families
  fontFamily: {
    primary: "'Cairo', sans-serif",
    secondary: "'Tajawal', sans-serif",
    monospace: "'Courier New', monospace",
  },

  // Font Sizes
  fontSize: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text Styles Presets
  styles: {
    h1: {
      fontSize: '48px',
      fontWeight: 900,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '36px',
      fontWeight: 800,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '30px',
      fontWeight: 800,
      lineHeight: 1.3,
      letterSpacing: '0',
    },
    h4: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '0',
    },
    h5: {
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    h6: {
      fontSize: '18px',
      fontWeight: 700,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    body: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0',
    },
    bodySmall: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    caption: {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
    overline: {
      fontSize: '10px',
      fontWeight: 700,
      lineHeight: 1.5,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    button: {
      fontSize: '15px',
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: '0.01em',
    },
    label: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0',
    },
  },
};

export default typography;
