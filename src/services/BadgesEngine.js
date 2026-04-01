// src/services/BadgesEngine.js
/**
 * BadgesEngine — Pure stateless service that computes which badges
 * a user has earned based on their current game state.
 *
 * Domain Relationship: Content → gives → Rewards (Badge, Level, Points)
 *
 * All methods are pure functions — no side effects, no state.
 */

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
  // قلب الذهب — أكمل 5 مهام
  badge1: (cq) => cq.size >= 5,

  // نجم الخير — احصل على 500 KP
  badge2: (_, stats) => stats.kp >= 500,

  // صديق الجميع — زيارة 3 مناطق مختلفة
  badge3: (cq) => BadgesEngine.uniqueZonesVisited(cq) >= 3,

  // عاشق القراءة — أكمل 2 مهمة قراءة (q1 رسالة من حفيد, q4 صندوق الألعاب)
  badge4: (cq) => {
    const readingQuests = ['q1', 'q4', 'q12'];
    return readingQuests.filter((id) => cq.has(id)).length >= 2;
  },

  // صديق البيئة — نظف الحديقة العامة (q8)
  badge5: (cq) => cq.has('q8'),

  // طبيب الروح — زيارة المستشفى (q11)
  badge6: (cq) => cq.has('q11'),

  // حفيد بار — ساعد في دار المسنين (أي مهمة في z1)
  badge7: (cq) => ['q1', 'q2', 'q3'].some((id) => cq.has(id)),

  // بطل صاعد — ارتق للمستوى 5
  badge8: (_, stats) => stats.level >= 5,

  // ── Extra badges (يمكن إضافتها لـ badgesData لاحقاً) ──────────────────

  // متبرع كريم — تبرع مرة واحدة على الأقل
  badge_donor: (_, __, orders) =>
    orders.some((o) => o.type === 'DonationOrder'),

  // بطل الأطفال — أكمل مهمة في دار الأيتام (z2)
  badge_orphans: (cq) => cq.has('q4'),

  // محارب الفقر — أكمل مهمة صعبة جداً (q13)
  badge_hard: (cq) => cq.has('q13'),

  // متطوع نشيط — أكمل 10 مهام
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
