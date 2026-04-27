// src/components/common/DashboardCards.jsx
/**
 * DashboardCards — Four vivid animated stat cards.
 *
 * Each card has:
 *   • Unique gradient + colour palette
 *   • Dedicated Canvas micro-animation (wave / rings / bars / constellation)
 *   • Shine sweep on hover
 *   • Count-up animation when value changes
 *   • Responsive 4→2→2 grid
 *
 * Cards:
 *   1. نقاط العطاء   (KP)            — Warm Gold
 *   2. المستوى                        — Royal Purple
 *   3. المهام المكتملة                 — Emerald Green
 *   4. نقاط التأثير                    — Ocean Blue
 */
import React, { useRef, useEffect, memo, useMemo } from 'react';
import GameEngine from '../../services/GameEngine';

// ─────────────────────────────────────────────────────────────────────────────
// Canvas Renderers — one class per animation style
// ─────────────────────────────────────────────────────────────────────────────

/** Parse "#rrggbb" → [r, g, b] */
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ── Wave renderer (KP card) ───────────────────────────────────────────────
class WaveRenderer {
  constructor(canvas, hex) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.rgb    = hexToRgb(hex);
    this.t      = 0;
    this.raf    = null;
  }

  #size() {
    const dpr = window.devicePixelRatio || 1;
    const r   = this.canvas.getBoundingClientRect();
    this.canvas.width  = r.width  * dpr;
    this.canvas.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = r.width;
    this.H = r.height;
  }

  #draw = () => {
    const { ctx, W, H } = this;
    const [r, g, b] = this.rgb;
    this.t += 0.016;
    ctx.clearRect(0, 0, W, H);

    // 3 layered waves
    [[0.52, 0.032, 0.20, 0.18], [0.62, 0.048, 0.15, 0.11], [0.72, 0.028, 0.10, 0.07]].forEach(([base, freq, amp, alpha], i) => {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x++) {
        const y = H * base + Math.sin(x * freq + this.t * (1 + i * 0.4)) * H * amp
                           + Math.sin(x * freq * 1.7 + this.t * 1.2 + i) * H * amp * 0.4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    });

    // Sparkle dots on wave crest
    for (let i = 0; i < 5; i++) {
      const x  = (i / 5 + this.t * 0.04) % 1 * W;
      const y  = H * 0.5 + Math.sin(x * 0.032 + this.t) * H * 0.20;
      const op = 0.18 + Math.abs(Math.sin(this.t * 2 + i)) * 0.18;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${op})`;
      ctx.fill();
    }

    this.raf = requestAnimationFrame(this.#draw);
  };

  start() { this.#size(); this.raf = requestAnimationFrame(this.#draw); }
  stop()  { cancelAnimationFrame(this.raf); }
}

// ── Rings renderer (Level card) ───────────────────────────────────────────
class RingsRenderer {
  constructor(canvas, hex) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.rgb    = hexToRgb(hex);
    this.t      = 0;
    this.raf    = null;
  }

  #size() {
    const dpr = window.devicePixelRatio || 1;
    const r   = this.canvas.getBoundingClientRect();
    this.canvas.width  = r.width  * dpr;
    this.canvas.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = r.width;
    this.H = r.height;
  }

  #draw = () => {
    const { ctx, W, H } = this;
    const [r, g, b] = this.rgb;
    this.t += 0.018;
    ctx.clearRect(0, 0, W, H);

    const cx = W * 0.78, cy = H * 0.30;

    // Expanding rings from top-right corner
    for (let i = 0; i < 4; i++) {
      const progress = ((this.t * 0.4 + i * 0.25) % 1);
      const radius   = 14 + progress * 55;
      const alpha    = (1 - progress) * 0.22;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth   = 2.5;
      ctx.stroke();
    }

    // Static glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, 10 + Math.sin(this.t * 2) * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},0.20)`;
    ctx.fill();

    // Orbiting star
    const ox = cx + Math.cos(this.t) * 30;
    const oy = cy + Math.sin(this.t) * 15;
    ctx.beginPath();
    ctx.arc(ox, oy, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,0.28)`;
    ctx.fill();

    // Bottom soft glow fill
    const grad = ctx.createLinearGradient(0, H * 0.6, 0, H);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.10)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0.00)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);

    this.raf = requestAnimationFrame(this.#draw);
  };

  start() { this.#size(); this.raf = requestAnimationFrame(this.#draw); }
  stop()  { cancelAnimationFrame(this.raf); }
}

// ── Bars renderer (Quests card) ───────────────────────────────────────────
class BarsRenderer {
  constructor(canvas, hex) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.rgb    = hexToRgb(hex);
    this.t      = 0;
    this.raf    = null;
  }

  #size() {
    const dpr = window.devicePixelRatio || 1;
    const r   = this.canvas.getBoundingClientRect();
    this.canvas.width  = r.width  * dpr;
    this.canvas.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = r.width;
    this.H = r.height;
  }

  #draw = () => {
    const { ctx, W, H } = this;
    const [r, g, b] = this.rgb;
    this.t += 0.016;
    ctx.clearRect(0, 0, W, H);

    const N  = 10;
    const bw = W / N;

    for (let i = 0; i < N; i++) {
      const phase  = this.t * 0.9 + i * 0.55;
      const height = H * (0.22 + Math.abs(Math.sin(phase)) * 0.52);
      const alpha  = 0.10 + (i / N) * 0.12;

      // Gradient bar
      const grad = ctx.createLinearGradient(0, H - height, 0, H);
      grad.addColorStop(0, `rgba(${r},${g},${b},${alpha + 0.08})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},${alpha * 0.4})`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(i * bw + 3, H - height, bw - 6, height, [5, 5, 0, 0]);
      ctx.fill();

      // Top glint
      if (Math.abs(Math.sin(phase)) > 0.7) {
        ctx.fillStyle = `rgba(255,255,255,0.18)`;
        ctx.beginPath();
        ctx.roundRect(i * bw + 3, H - height, bw - 6, 4, 3);
        ctx.fill();
      }
    }

    this.raf = requestAnimationFrame(this.#draw);
  };

  start() { this.#size(); this.raf = requestAnimationFrame(this.#draw); }
  stop()  { cancelAnimationFrame(this.raf); }
}

// ── Constellation renderer (Impact card) ─────────────────────────────────
class ConstellationRenderer {
  constructor(canvas, hex) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.rgb    = hexToRgb(hex);
    this.t      = 0;
    this.raf    = null;
    this.stars  = [];
  }

  #size() {
    const dpr = window.devicePixelRatio || 1;
    const r   = this.canvas.getBoundingClientRect();
    this.canvas.width  = r.width  * dpr;
    this.canvas.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = r.width;
    this.H = r.height;

    this.stars = Array.from({ length: 14 }, () => ({
      x:     Math.random() * this.W,
      y:     Math.random() * this.H,
      r:     1 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.01,
    }));
  }

  #draw = () => {
    const { ctx, W, H } = this;
    const [r, g, b] = this.rgb;
    this.t += 0.014;
    ctx.clearRect(0, 0, W, H);

    // Subtle gradient base
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.7);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.07)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0.00)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Draw connections between close stars
    for (let i = 0; i < this.stars.length; i++) {
      for (let j = i + 1; j < this.stars.length; j++) {
        const dx   = this.stars[i].x - this.stars[j].x;
        const dy   = this.stars[i].y - this.stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 70) {
          const alpha = (1 - dist / 70) * 0.14;
          ctx.beginPath();
          ctx.moveTo(this.stars[i].x, this.stars[i].y);
          ctx.lineTo(this.stars[j].x, this.stars[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw + pulse stars
    for (const s of this.stars) {
      s.phase += s.speed;
      const pulse = 0.5 + 0.5 * Math.sin(s.phase);
      const alpha = 0.18 + pulse * 0.28;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.8 + pulse * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }

    this.raf = requestAnimationFrame(this.#draw);
  };

  start() { this.#size(); this.raf = requestAnimationFrame(this.#draw); }
  stop()  { cancelAnimationFrame(this.raf); }
}

// ─────────────────────────────────────────────────────────────────────────────
// useCardCanvas hook — mounts the right renderer to a canvas element
// ─────────────────────────────────────────────────────────────────────────────

const RENDERER_MAP = {
  wave:          WaveRenderer,
  rings:         RingsRenderer,
  bars:          BarsRenderer,
  constellation: ConstellationRenderer,
};

function useCardCanvas(hex, type) {
  const canvasRef  = useRef(null);
  const rendRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const Cls      = RENDERER_MAP[type] ?? WaveRenderer;
    const renderer = new Cls(canvas, hex);
    rendRef.current = renderer;
    renderer.start();

    return () => renderer.stop();
  }, [hex, type]);

  return canvasRef;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes cardIn {
    0%   { opacity:0; transform:translateY(14px) scale(0.94); }
    100% { opacity:1; transform:translateY(0)    scale(1);    }
  }
  @keyframes shineSwipe {
    0%   { transform: translateX(-120%) skewX(-18deg); }
    100% { transform: translateX(220%)  skewX(-18deg); }
  }
  @keyframes countPop {
    0%   { transform: scale(0.8); opacity:0; }
    70%  { transform: scale(1.08); }
    100% { transform: scale(1);   opacity:1; }
  }

  .db-card {
    position:relative; border-radius:22px; padding:20px 20px 16px;
    overflow:hidden; cursor:default;
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s;
    animation: cardIn 0.45s ease-out backwards;
  }
  .db-card:hover { transform: translateY(-6px) scale(1.025); }
  .db-card:hover .db-shine { animation: shineSwipe 0.5s ease-in-out; }

  .db-canvas {
    position:absolute; inset:0; width:100%; height:100%; pointer-events:none;
  }
  .db-shine {
    position:absolute; top:0; left:-60%;
    width:45%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent);
    transform: skewX(-18deg);
    pointer-events:none;
  }
  .db-icon-bg {
    position:absolute; bottom:-8px; left:-4px;
    font-size:58px; opacity:0.13; pointer-events:none; line-height:1;
    filter: blur(1px);
  }
  .db-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:10px; font-weight:900;
    padding:2px 9px; border-radius:99px;
    background:rgba(255,255,255,0.22); color:#fff;
    font-family:'Cairo',sans-serif; margin-bottom:8px;
  }
  .db-label {
    font-size:11px; font-weight:700; opacity:0.80;
    font-family:'Cairo',sans-serif; color:#fff; margin-bottom:4px;
  }
  .db-value {
    font-size:32px; font-weight:900; line-height:1;
    font-family:'Cairo',sans-serif; color:#fff;
    animation: countPop 0.4s ease-out;
    position:relative; z-index:1;
  }
  .db-sub {
    font-size:11px; font-weight:700; color:rgba(255,255,255,0.75);
    font-family:'Cairo',sans-serif; margin-top:6px;
    position:relative; z-index:1;
  }

  .db-grid {
    display:grid;
    grid-template-columns: repeat(4,1fr);
    gap:14px;
    margin-bottom:0;
  }
  @media (max-width:960px)  { .db-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:480px)  { .db-grid { gap:10px; } .db-value { font-size:26px; } }
`;

// ─────────────────────────────────────────────────────────────────────────────
// StatCard component
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = memo(({
  gradient, shadow, hex, canvasType,
  icon, tag, label, value, sub,
  animDelay = 0,
}) => {
  const canvasRef = useCardCanvas(hex, canvasType);

  return (
    <div
      className="db-card"
      style={{ background: gradient, boxShadow: `0 10px 32px ${shadow}`, animationDelay: `${animDelay}s` }}
    >
      <canvas ref={canvasRef} className="db-canvas" />
      <div className="db-shine" />
      <span className="db-icon-bg">{icon}</span>

      <div style={{ position:'relative', zIndex:1 }}>
        <div className="db-tag">{tag}</div>
        <div className="db-label">{label}</div>
        <div className="db-value" key={value}>
          {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        </div>
        <div className="db-sub">{sub}</div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Card configs
// ─────────────────────────────────────────────────────────────────────────────

const CARDS = [
  {
    key:        'kp',
    gradient:   'linear-gradient(145deg, #f59e0b 0%, #d97706 60%, #b45309 100%)',
    shadow:     'rgba(245,158,11,0.42)',
    hex:        '#fbbf24',
    canvasType: 'wave',
    icon:       '⭐',
    tag:        (s)     => s.kp >= 200 ? '🔥 محترف' : s.kp >= 50 ? '✨ نشيط' : '🌱 مبتدئ',
    label:      'نقاط العطاء',
    getValue:   (s)     => s.kp,
    getSub:     (s)     => `+${Math.floor(s.kp * 0.12)} هذا الأسبوع`,
  },
  {
    key:        'level',
    gradient:   'linear-gradient(145deg, #7c3aed 0%, #5b21b6 60%, #4c1d95 100%)',
    shadow:     'rgba(124,58,237,0.42)',
    hex:        '#a78bfa',
    canvasType: 'rings',
    icon:       '🏆',
    tag:        (s)     => GameEngine.titleForLevel(s.level),
    label:      'المستوى الحالي',
    getValue:   (s)     => s.level,
    getSub:     (s)     => `${s.xp} / ${s.xpNeeded} XP للمستوى التالي`,
  },
  {
    key:        'quests',
    gradient:   'linear-gradient(145deg, #059669 0%, #047857 60%, #065f46 100%)',
    shadow:     'rgba(5,150,105,0.42)',
    hex:        '#34d399',
    canvasType: 'bars',
    icon:       '✅',
    tag:        (_s, c) => c > 0 ? `${c} إنجاز` : 'ابدأ الآن!',
    label:      'المهام المكتملة',
    getValue:   (_s, c) => c,
    getSub:     (_s, c) => c === 0 ? 'لا تتأخر، المدينة تنتظرك!' : `رائع! أكملت ${c} مهمة`,
  },
  {
    key:        'impact',
    gradient:   'linear-gradient(145deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)',
    shadow:     'rgba(37,99,235,0.42)',
    hex:        '#60a5fa',
    canvasType: 'constellation',
    icon:       '🌍',
    tag:        (s)     => s.impactScore > 30 ? '💪 مؤثر كبير' : s.impactScore > 0 ? '🌱 يتطور' : '🕊️ ابدأ',
    label:      'نقاط التأثير',
    getValue:   (s)     => s.impactScore,
    getSub:     (s)     => s.impactScore > 0 ? 'أثّرت في حياة الناس!' : 'كل عمل خير له أثر',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DashboardCards
// ─────────────────────────────────────────────────────────────────────────────

const DashboardCards = memo(({ userStats, completedCount }) => (
  <>
    <style>{CSS}</style>
    <div className="db-grid">
      {CARDS.map((cfg, i) => (
        <StatCard
          key={cfg.key}
          gradient={cfg.gradient}
          shadow={cfg.shadow}
          hex={cfg.hex}
          canvasType={cfg.canvasType}
          icon={cfg.icon}
          tag={cfg.tag(userStats, completedCount)}
          label={cfg.label}
          value={cfg.getValue(userStats, completedCount)}
          sub={cfg.getSub(userStats, completedCount)}
          animDelay={i * 0.08}
        />
      ))}
    </div>
  </>
));

export default DashboardCards;
