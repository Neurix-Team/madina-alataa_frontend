// src/components/common/RocketBackground.jsx
/**
 * RocketBackground — Full-screen decorative background layer.
 * Renders animated rockets, drifting stars, shooting stars, and twinkling stars.
 * Pure presentational, no props needed.
 */
import React, { memo } from 'react';

// ── Sub-components ────────────────────────────────────────────────────────

const Cloud = memo(({ style }) => (
  <div style={{
    position: 'absolute',
    fontSize: 60,
    pointerEvents: 'none',
    userSelect: 'none',
    ...style,
  }}>☁️</div>
));

/** Static twinkling star */
const TwinkleStar = memo(({ style }) => (
  <div style={{
    position: 'absolute',
    color: 'rgba(255,255,255,0.65)',
    pointerEvents: 'none',
    userSelect: 'none',
    animation: 'starTwinkle 3s ease-in-out infinite',
    ...style,
  }}>✦</div>
));

/** Star that drifts across the full screen (right → left) */
const DriftStar = memo(({ top, size, duration, delay, symbol }) => (
  <div style={{
    position: 'absolute',
    top,
    left: 0,
    fontSize: size,
    pointerEvents: 'none',
    userSelect: 'none',
    color: 'rgba(255,255,255,0.75)',
    filter: 'drop-shadow(0 0 6px rgba(255,255,220,0.9))',
    animation: `starDrift ${duration} linear infinite`,
    animationDelay: delay,
    willChange: 'transform',
  }}>{symbol}</div>
));

/** Shooting star — fast diagonal streak */
const ShootingStar = memo(({ top, left, duration, delay }) => (
  <div style={{
    position: 'absolute',
    top,
    left,
    width: 120,
    height: 3,
    borderRadius: 99,
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,200,0.9) 60%, rgba(255,255,255,1) 100%)',
    boxShadow: '0 0 8px 2px rgba(255,255,200,0.6)',
    pointerEvents: 'none',
    animation: `shootingStar ${duration} ease-in infinite`,
    animationDelay: delay,
    willChange: 'transform, opacity',
  }} />
));

/** Small rocket flying across the screen */
const FlyingRocket = memo(({ top, size, duration, delay, flip }) => (
  <div style={{
    position: 'absolute',
    top,
    left: 0,
    fontSize: size,
    pointerEvents: 'none',
    userSelect: 'none',
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
    animation: `rocketFlyAcross ${duration} linear infinite`,
    animationDelay: delay,
    transform: flip ? 'scaleX(-1)' : 'none',
    willChange: 'transform',
  }}>🚀</div>
));

/** Main decorative rocket — bobs in place */
const MainRocket = memo(() => (
  <div style={{
    position: 'absolute',
    bottom: '8%',
    left: '6%',
    fontSize: 80,
    pointerEvents: 'none',
    userSelect: 'none',
    animation: 'rocketBob 6s ease-in-out infinite',
    transformOrigin: 'center center',
    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
    zIndex: 0,
  }}>🚀</div>
));

// ── Decoration data ───────────────────────────────────────────────────────

const CLOUDS = [
  { top: '4%',  left: '4%',  opacity: 0.18, animation: 'cloudFloat 9s ease-in-out infinite',  animationDelay: '0s'   },
  { top: '10%', right: '5%', opacity: 0.13, animation: 'cloudFloat 11s ease-in-out infinite', animationDelay: '2s'   },
  { top: '45%', left: '1%',  opacity: 0.10, animation: 'cloudFloat 8s ease-in-out infinite',  animationDelay: '3.5s' },
  { top: '68%', right: '3%', opacity: 0.08, animation: 'cloudFloat 10s ease-in-out infinite', animationDelay: '1s'   },
];

const TWINKLE_STARS = [
  { top: '22%', left: '38%',  fontSize: 18, animationDelay: '0s'   },
  { top: '55%', left: '28%',  fontSize: 14, animationDelay: '1.2s' },
  { top: '15%', right: '18%', fontSize: 16, animationDelay: '0.6s' },
  { top: '75%', right: '12%', fontSize: 12, animationDelay: '2s'   },
  { top: '35%', left: '15%',  fontSize: 10, animationDelay: '1.8s' },
  { top: '88%', left: '55%',  fontSize: 14, animationDelay: '0.4s' },
  { top: '8%',  left: '62%',  fontSize: 16, animationDelay: '2.8s' },
  { top: '62%', left: '72%',  fontSize: 11, animationDelay: '1.5s' },
];

/** Stars that drift slowly across the full screen */
const DRIFT_STARS = [
  { top: '8%',  size: 20, duration: '14s', delay: '0s',    symbol: '⭐' },
  { top: '18%', size: 14, duration: '20s', delay: '3s',    symbol: '✦'  },
  { top: '30%', size: 22, duration: '17s', delay: '7s',    symbol: '🌟' },
  { top: '42%', size: 16, duration: '23s', delay: '1.5s',  symbol: '⭐' },
  { top: '55%', size: 12, duration: '19s', delay: '10s',   symbol: '✦'  },
  { top: '67%', size: 18, duration: '15s', delay: '5s',    symbol: '⭐' },
  { top: '78%', size: 24, duration: '21s', delay: '8.5s',  symbol: '🌟' },
  { top: '90%', size: 13, duration: '16s', delay: '12s',   symbol: '✦'  },
  { top: '3%',  size: 10, duration: '25s', delay: '4s',    symbol: '⭐' },
  { top: '50%', size: 17, duration: '18s', delay: '6s',    symbol: '✦'  },
];

/** Shooting stars — fast diagonal streaks */
const SHOOTING_STARS = [
  { top: '12%', left: '70%', duration: '4s',  delay: '0s'   },
  { top: '35%', left: '50%', duration: '5s',  delay: '6s'   },
  { top: '60%', left: '80%', duration: '3.5s',delay: '11s'  },
  { top: '20%', left: '30%', duration: '4.5s',delay: '3s'   },
  { top: '75%', left: '60%', duration: '6s',  delay: '8s'   },
  { top: '5%',  left: '45%', duration: '3s',  delay: '14s'  },
];

/** Small rockets flying across the screen */
const FLYING_ROCKETS = [
  { top: '12%', size: 28, duration: '16s', delay: '0s',   flip: false },
  { top: '38%', size: 22, duration: '22s', delay: '6s',   flip: false },
  { top: '62%', size: 30, duration: '18s', delay: '11s',  flip: false },
  { top: '82%', size: 20, duration: '26s', delay: '3s',   flip: false },
  { top: '25%', size: 18, duration: '30s', delay: '15s',  flip: false },
];

// ── Keyframes ─────────────────────────────────────────────────────────────

const BG_KEYFRAMES = `
  /* Main rocket bobs in place */
  @keyframes rocketBob {
    0%   { transform: translateY(0px)   rotate(-35deg); }
    25%  { transform: translateY(-30px) rotate(-30deg); }
    50%  { transform: translateY(-55px) rotate(-40deg); }
    75%  { transform: translateY(-30px) rotate(-32deg); }
    100% { transform: translateY(0px)   rotate(-35deg); }
  }

  /* Clouds gently float */
  @keyframes cloudFloat {
    0%, 100% { transform: translateX(0)    translateY(0);    }
    33%       { transform: translateX(10px) translateY(-8px); }
    66%       { transform: translateX(-6px) translateY(5px);  }
  }

  /* Static stars twinkle */
  @keyframes starTwinkle {
    0%, 100% { opacity: 0.25; transform: scale(1);    }
    50%       { opacity: 0.80; transform: scale(1.4);  }
  }

  /* Drifting stars fly right → left across full screen */
  @keyframes starDrift {
    0%   { transform: translateX(110vw); opacity: 0;   }
    4%   { opacity: 1;                                  }
    92%  { opacity: 0.85;                               }
    100% { transform: translateX(-15vw); opacity: 0;   }
  }

  /* Shooting star — fast diagonal streak */
  @keyframes shootingStar {
    0%   { transform: translate(0, 0) rotate(-35deg) scaleX(0.2); opacity: 0; }
    8%   { opacity: 1; transform: translate(-40px, 20px) rotate(-35deg) scaleX(1); }
    80%  { opacity: 0.9; }
    100% { transform: translate(-320px, 160px) rotate(-35deg) scaleX(0.6); opacity: 0; }
  }

  /* Flying rockets cross the full screen right → left */
  @keyframes rocketFlyAcross {
    0%   { transform: translateX(110vw) translateY(0px)   rotate(-35deg); opacity: 0;   }
    4%   { opacity: 0.85;                                                                }
    30%  { transform: translateX(70vw)  translateY(-18px) rotate(-38deg); opacity: 0.85;}
    60%  { transform: translateX(35vw)  translateY(10px)  rotate(-32deg); opacity: 0.85;}
    90%  { transform: translateX(5vw)   translateY(-8px)  rotate(-36deg); opacity: 0.85;}
    96%  { opacity: 0.5;                                                                 }
    100% { transform: translateX(-15vw) translateY(0px)   rotate(-35deg); opacity: 0;   }
  }
`;

// ── Main component ────────────────────────────────────────────────────────

const RocketBackground = () => (
  <>
    <style>{BG_KEYFRAMES}</style>

    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {/* Floating clouds */}
      {CLOUDS.map((s, i) => <Cloud key={`cloud-${i}`} style={s} />)}

      {/* Static twinkling stars */}
      {TWINKLE_STARS.map((s, i) => <TwinkleStar key={`twinkle-${i}`} style={s} />)}

      {/* Drifting stars flying across the screen */}
      {DRIFT_STARS.map((s, i) => (
        <DriftStar
          key={`drift-${i}`}
          top={s.top}
          size={s.size}
          duration={s.duration}
          delay={s.delay}
          symbol={s.symbol}
        />
      ))}

      {/* Shooting stars */}
      {SHOOTING_STARS.map((s, i) => (
        <ShootingStar
          key={`shoot-${i}`}
          top={s.top}
          left={s.left}
          duration={s.duration}
          delay={s.delay}
        />
      ))}

      {/* Small rockets flying across the screen */}
      {FLYING_ROCKETS.map((r, i) => (
        <FlyingRocket
          key={`fly-${i}`}
          top={r.top}
          size={r.size}
          duration={r.duration}
          delay={r.delay}
          flip={r.flip}
        />
      ))}

      {/* Main decorative bobbing rocket */}
      <MainRocket />
    </div>
  </>
);

export default memo(RocketBackground);
