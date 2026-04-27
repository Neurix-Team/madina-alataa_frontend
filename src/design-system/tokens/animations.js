// ═══════════════════════════════════════════════════════════════════════
// 🎨 Design System - Animation Token
// ═══════════════════════════════════════════════════════════════════════

export const animations = {
  // Duration
  duration: {
    fast: '150ms',
    base: '200ms',
    medium: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // Timing Functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounce: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Keyframes
  keyframes: {
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    fadeOut: `
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `,
    slideUp: `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    slideDown: `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    scaleIn: `
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
    bounce: `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `,
    pulse: `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
    `,
    shake: `
      @keyframes shake {
        0%, 100% { transform: rotate(0deg); }
        10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
        20%, 40%, 60%, 80% { transform: rotate(10deg); }
      }
    `,
    spin: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    float: `
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
    `,
    jelly: `
      @keyframes jelly {
        0% { transform: scale(1); }
        30% { transform: scale(0.90) scaleX(1.08); }
        60% { transform: scale(1.06) scaleX(0.97); }
        80% { transform: scale(0.98); }
        100% { transform: scale(1); }
      }
    `,
  },

  // Presets
  presets: {
    fadeIn: {
      animation: 'fadeIn 300ms ease-out',
    },
    fadeOut: {
      animation: 'fadeOut 300ms ease-in',
    },
    slideUp: {
      animation: 'slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    slideDown: {
      animation: 'slideDown 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    scaleIn: {
      animation: 'scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    bounce: {
      animation: 'bounce 1s infinite',
    },
    pulse: {
      animation: 'pulse 2s infinite',
    },
    shake: {
      animation: 'shake 0.6s ease',
    },
    spin: {
      animation: 'spin 1s linear infinite',
    },
    float: {
      animation: 'float 3s ease-in-out infinite',
    },
    jelly: {
      animation: 'jelly 0.4s cubic-bezier(0.36,0.07,0.19,0.97)',
    },
  },
};

export default animations;
