// src/services/AudioManager.js
/**
 * AudioManager — Singleton OOP service for all in-game sounds.
 * Uses Web Audio API only; no external assets required.
 *
 * Usage:
 *   AudioManager.getInstance().play('click');
 *   AudioManager.getInstance().play('win');
 */

class AudioManager {
  /** @type {AudioManager|null} */
  static #instance = null;

  /** @type {AudioContext|null} */
  #ctx = null;

  /** @type {boolean} */
  #unlocked = false;

  // ── Singleton ────────────────────────────────────────────────────────────
  static getInstance() {
    if (!AudioManager.#instance) {
      AudioManager.#instance = new AudioManager();
    }
    return AudioManager.#instance;
  }

  // ── Private constructor ──────────────────────────────────────────────────
  constructor() {
    if (AudioManager.#instance) {
      throw new Error('Use AudioManager.getInstance()');
    }
  }

  // ── Lazy-init context (must be called after a user gesture) ──────────────
  #getCtx() {
    if (!this.#ctx) {
      try {
        this.#ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (this.#ctx.state === 'suspended') {
      this.#ctx.resume().catch(() => {});
    }
    return this.#ctx;
  }

  /**
   * Call once on first user gesture to unlock audio.
   * AudioManager will do nothing silently until this is called.
   */
  unlock() {
    this.#unlocked = true;
    this.#getCtx();
  }

  /** @returns {boolean} */
  get isUnlocked() { return this.#unlocked; }

  // ── Low-level oscillator builder ─────────────────────────────────────────
  /**
   * @param {number[]} freqs      – sequence of frequencies (Hz)
   * @param {number}   noteDur    – duration of each note (seconds)
   * @param {string}   type       – OscillatorType
   * @param {number}   gainPeak   – peak gain (0-1)
   */
  #playSequence(freqs, noteDur, type = 'sine', gainPeak = 0.18) {
    const ctx = this.#getCtx();
    if (!ctx || !this.#unlocked) return;

    let t = ctx.currentTime;
    freqs.forEach((freq) => {
      if (freq === 0) { t += noteDur; return; }

      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type      = type;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0,         t);
      gain.gain.linearRampToValueAtTime(gainPeak, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);

      osc.start(t);
      osc.stop(t + noteDur + 0.01);

      t += noteDur;
    });
  }

  // ── Public sound library ─────────────────────────────────────────────────

  /** Short satisfying UI click */
  playClick() {
    this.#playSequence([520, 660], 0.07, 'sine', 0.12);
  }

  /** Navigation tab switch */
  playNav() {
    this.#playSequence([440, 550], 0.06, 'triangle', 0.10);
  }

  /** Quest card open */
  playOpen() {
    this.#playSequence([330, 440, 550], 0.07, 'sine', 0.13);
  }

  /** Bonus checkbox toggle */
  playToggle() {
    this.#playSequence([600, 800], 0.05, 'square', 0.06);
  }

  /** Quest completed — cheerful jingle */
  playWin() {
    this.#playSequence(
      [523, 659, 784, 1047, 784, 1047, 1319],
      0.12,
      'sine',
      0.20,
    );
  }

  /** Level-up fanfare */
  playLevelUp() {
    this.#playSequence(
      [523, 587, 659, 698, 784, 880, 988, 1047],
      0.10,
      'sine',
      0.22,
    );
  }

  /** Daily reward claim */
  playReward() {
    this.#playSequence([659, 784, 1047, 1319], 0.11, 'sine', 0.18);
  }

  /** Error / invalid action */
  playError() {
    this.#playSequence([220, 180], 0.12, 'sawtooth', 0.08);
  }

  /**
   * Unified play by key — convenient for generic handlers.
   * @param {'click'|'nav'|'open'|'toggle'|'win'|'levelUp'|'reward'|'error'} key
   */
  play(key) {
    const map = {
      click:   () => this.playClick(),
      nav:     () => this.playNav(),
      open:    () => this.playOpen(),
      toggle:  () => this.playToggle(),
      win:     () => this.playWin(),
      levelUp: () => this.playLevelUp(),
      reward:  () => this.playReward(),
      error:   () => this.playError(),
    };
    map[key]?.();
  }
}

export default AudioManager;
