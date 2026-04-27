// src/services/GameEngine.js
/**
 * GameEngine — Pure OOP service that encapsulates all game-logic calculations.
 * Stateless: every method is a pure function operating on plain data objects.
 * Import and use directly — no instantiation needed (static methods only).
 */

export const TITLES = [
  'مبتدئ',           // level 1
  'متطوع ناشئ',      // level 2
  'صاعد بقوة',       // level 3
  'بطل العطاء',      // level 4
  'حارس المدينة',    // level 5
  'أسطورة الخير',    // level 6+
];

class GameEngine {
  // ── XP & Levelling ────────────────────────────────────────────────────────

  /**
   * Calculate XP needed for the next level.
   * Uses a gentle exponential curve.
   * @param {number} currentXpNeeded
   * @returns {number}
   */
  static nextXpThreshold(currentXpNeeded) {
    return Math.floor(currentXpNeeded * 1.3);
  }

  /**
   * Get the display title for a given level.
   * @param {number} level
   * @returns {string}
   */
  static titleForLevel(level) {
    return TITLES[Math.min(level - 1, TITLES.length - 1)] ?? TITLES[0];
  }

  /**
   * Returns the XP fill percentage (0–100).
   * @param {number} xp
   * @param {number} xpNeeded
   * @returns {number}
   */
  static xpPercent(xp, xpNeeded) {
    return Math.min(Math.round((xp / xpNeeded) * 100), 100);
  }

  // ── Quest Rewards ─────────────────────────────────────────────────────────

  /**
   * Apply quest completion to a userStats snapshot.
   * Returns a new stats object and a flag indicating whether a level-up occurred.
   *
   * @param {{ xp:number, xpNeeded:number, level:number, kp:number, impactScore:number, title:string }} stats
   * @param {{ kp:number, xp:number, impact:number }} quest
   * @param {number} bonusKP
   * @returns {{ stats: object, leveledUp: boolean }}
   */
  static applyQuestReward(stats, quest, bonusKP = 0) {
    let { xp, xpNeeded, level, kp, impactScore, title } = { ...stats };

    kp          += quest.kp + bonusKP;
    xp          += quest.xp;
    impactScore += quest.impact;

    let leveledUp = false;

    while (xp >= xpNeeded) {
      xp        -= xpNeeded;
      level     += 1;
      xpNeeded   = GameEngine.nextXpThreshold(xpNeeded);
      title      = GameEngine.titleForLevel(level);
      leveledUp  = true;
    }

    return {
      stats: { ...stats, xp, xpNeeded, level, kp, impactScore, title },
      leveledUp,
    };
  }

  // ── Bonus KP ─────────────────────────────────────────────────────────────

  /**
   * Sum bonus KP for a set of selected bonus IDs.
   * @param {{ id:string, kp:number }[]} bonuses
   * @param {Set<string>} selectedIds
   * @returns {number}
   */
  static calcBonusKP(bonuses = [], selectedIds) {
    return bonuses
      .filter((b) => selectedIds.has(b.id))
      .reduce((sum, b) => sum + b.kp, 0);
  }

  // ── Daily Reward ──────────────────────────────────────────────────────────

  /** Fixed KP awarded every day. */
  static get DAILY_REWARD_KP() { return 50; }

  // ── Confetti Particle Factory ─────────────────────────────────────────────

  /**
   * Generate a random confetti particle descriptor.
   * @param {number} id
   * @returns {{ id:number, x:number, color:string, size:number, duration:number, delay:number }}
   */
  static makeConfettiParticle(id) {
    const colors = ['#fbbf24','#f87171','#34d399','#60a5fa','#a78bfa','#fb923c','#f472b6'];
    return {
      id,
      x:        Math.random() * 100,          // vw %
      color:    colors[Math.floor(Math.random() * colors.length)],
      size:     6 + Math.random() * 8,        // px
      duration: 1.5 + Math.random() * 2,      // s
      delay:    Math.random() * 0.8,          // s
      rotation: Math.random() * 360,
    };
  }

  /** @param {number} count @returns {object[]} */
  static makeConfettiBurst(count = 60) {
    return Array.from({ length: count }, (_, i) => GameEngine.makeConfettiParticle(i));
  }
}

export default GameEngine;
