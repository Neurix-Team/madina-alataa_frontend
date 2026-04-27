

import zonesData from '../data/zonesData';

// ── Zone → Quest mapping (built once at module load) ──────────────────────
const QUEST_TO_ZONE = new Map();
zonesData.forEach((zone) => {
  zone.quests.forEach((q) => QUEST_TO_ZONE.set(q.id, zone.id));
});

// ── Badge condition definitions ───────────────────────────────────────────
/**
 * Each entry maps a badge ID to a predicate function.
 * Predicate receives: (completedQuests: Set, userStats: object, orders: array)
 * Returns: boolean
 */
const BADGE_CONDITIONS = {
  badge1: (cq) => cq.size >= 5,

  badge2: (_, stats) => stats.kp >= 500,

  badge3: (cq) => BadgesEngine.uniqueZonesVisited(cq) >= 3,

  badge4: (cq) => {
    const readingQuests = ['q1', 'q4', 'q12'];
    return readingQuests.filter((id) => cq.has(id)).length >= 2;
  },

  badge5: (cq) => cq.has('q8'),

  badge6: (cq) => cq.has('q11'),

  badge7: (cq) => ['q1', 'q2', 'q3'].some((id) => cq.has(id)),

  badge8: (_, stats) => stats.level >= 5,


  badge_donor: (_, __, orders) =>
    orders.some((o) => o.type === 'DonationOrder'),

  badge_orphans: (cq) => cq.has('q4'),

  badge_hard: (cq) => cq.has('q13'),

  badge_active: (cq) => cq.size >= 10,
};

// ── BadgesEngine ──────────────────────────────────────────────────────────
class BadgesEngine {
  /**
   * Compute the full set of earned badge IDs for the current game state.
   *
   * @param {Set<string>}  completedQuests
   * @param {object}       userStats        — { kp, xp, level, impactScore, … }
   * @param {object[]}     orders           — array of VolunteerOrder | DonationOrder | ServiceRequest
   * @returns {Set<string>}                 — set of earned badge IDs
   */
  static computeEarnedBadges(completedQuests, userStats, orders = []) {
    const earned = new Set();

    for (const [badgeId, condition] of Object.entries(BADGE_CONDITIONS)) {
      try {
        if (condition(completedQuests, userStats, orders)) {
          earned.add(badgeId);
        }
      } catch (_) {
        // Silently skip malformed conditions
      }
    }

    return earned;
  }

  /**
   * Check if a single badge is earned.
   *
   * @param {string}       badgeId
   * @param {Set<string>}  completedQuests
   * @param {object}       userStats
   * @param {object[]}     orders
   * @returns {boolean}
   */
  static isBadgeEarned(badgeId, completedQuests, userStats, orders = []) {
    const condition = BADGE_CONDITIONS[badgeId];
    if (!condition) return false;
    try {
      return condition(completedQuests, userStats, orders);
    } catch (_) {
      return false;
    }
  }

  /**
   * Count how many unique zones the user has visited
   * based on their completed quests.
   *
   * @param {Set<string>} completedQuests
   * @returns {number}
   */
  static uniqueZonesVisited(completedQuests) {
    const zones = new Set();
    completedQuests.forEach((questId) => {
      const zoneId = QUEST_TO_ZONE.get(questId);
      if (zoneId) zones.add(zoneId);
    });
    return zones.size;
  }

  /**
   * Get progress info for a badge (how close the user is to earning it).
   *
   * @param {string}      badgeId
   * @param {Set<string>} completedQuests
   * @param {object}      userStats
   * @returns {{ current: number, target: number, pct: number }}
   */
  static getBadgeProgress(badgeId, completedQuests, userStats) {
    switch (badgeId) {
      case 'badge1':
        return { current: completedQuests.size, target: 5,   pct: Math.min(100, Math.round((completedQuests.size / 5)   * 100)) };
      case 'badge2':
        return { current: userStats.kp,         target: 500, pct: Math.min(100, Math.round((userStats.kp / 500)         * 100)) };
      case 'badge3': {
        const zones = BadgesEngine.uniqueZonesVisited(completedQuests);
        return { current: zones, target: 3, pct: Math.min(100, Math.round((zones / 3) * 100)) };
      }
      case 'badge8':
        return { current: userStats.level, target: 5, pct: Math.min(100, Math.round((userStats.level / 5) * 100)) };
      default:
        return { current: 0, target: 1, pct: 0 };
    }
  }
}

export default BadgesEngine;
