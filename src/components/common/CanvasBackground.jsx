// src/components/common/CanvasBackground.jsx
/**
 * CanvasBackground — Full-screen animated HTML5 Canvas.
 * Renders a living constellation of particles with connecting lines,
 * slow drift, pulsing alpha, and a subtle colour-tinted glow.
 *
 * OOP design:
 *   Particle      — data + behaviour per dot
 *   CanvasRenderer — owns the RAF loop, resize handling, and draw pipeline
 */
import React, { useEffect, useRef, memo } from 'react';

// ── Particle ──────────────────────────────────────────────────────────────

class Particle {
  /** @param {number} w @param {number} h */
  constructor(w, h) {
    this.#init(w, h);
  }

  #init(w, h) {
    this.x     = Math.random() * w;
    this.y     = Math.random() * h;
    this.vx    = (Math.random() - 0.5) * 0.40;
    this.vy    = (Math.random() - 0.5) * 0.40;
    this.r     = 1.2 + Math.random() * 2.2;
    this.alpha = 0.12 + Math.random() * 0.28;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.012 + Math.random() * 0.018;
  }

  /** @param {number} w @param {number} h */
  update(w, h) {
    this.x     += this.vx;
    this.y     += this.vy;
    this.phase += this.speed;

    // Wrap around canvas edges
    if (this.x < -8)    this.x = w + 8;
    if (this.x > w + 8) this.x = -8;
    if (this.y < -8)    this.y = h + 8;
    if (this.y > h + 8) this.y = -8;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    const pulse  = 0.5 + 0.5 * Math.sin(this.phase);
    const radius = this.r * (0.82 + pulse * 0.36);
    const alpha  = this.alpha * (0.55 + pulse * 0.45);

    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }
}

// ── CanvasRenderer ────────────────────────────────────────────────────────

class CanvasRenderer {
  static COUNT    = 60;
  static MAX_DIST = 115;

  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.particles = [];
    this.rafId     = null;
    this.W         = 0;
    this.H         = 0;
  }

  /** Resize canvas to match CSS size at device pixel ratio. */
  resize() {
    const dpr  = window.devicePixelRatio ?? 1;
    const rect = this.canvas.getBoundingClientRect();
    this.W = rect.width;
    this.H = rect.height;
    this.canvas.width  = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Spawn all particles. */
  init() {
    this.resize();
    this.particles = Array.from(
      { length: CanvasRenderer.COUNT },
      () => new Particle(this.W, this.H),
    );
  }

  /** Draw edges between close particles. */
  #drawEdges() {
    const { ctx, particles } = this;
    const MAX = CanvasRenderer.MAX_DIST;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / MAX) * 0.10})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  /** Single animation frame. */
  #frame = () => {
    const { ctx, W, H, particles } = this;
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.update(W, H);
      p.draw(ctx);
    }
    this.#drawEdges();

    this.rafId = requestAnimationFrame(this.#frame);
  };

  start() {
    this.rafId = requestAnimationFrame(this.#frame);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  destroy() {
    this.stop();
    this.particles = [];
  }
}

// ── React component ───────────────────────────────────────────────────────

const CanvasBackground = memo(() => {
  const canvasRef   = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const canvas   = canvasRef.current;
    if (!canvas) return;

    const renderer       = new CanvasRenderer(canvas);
    rendererRef.current  = renderer;
    renderer.init();
    renderer.start();

    const onResize = () => {
      renderer.resize();
      renderer.particles = Array.from(
        { length: CanvasRenderer.COUNT },
        () => new Particle(renderer.W, renderer.H),
      );
    };

    window.addEventListener('resize', onResize);
    return () => {
      renderer.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        0,
        opacity:       0.65,
      }}
    />
  );
});

export default CanvasBackground;
