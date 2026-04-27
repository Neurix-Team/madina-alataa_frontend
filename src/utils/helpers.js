// src/utils/helpers.js
/**
 * Thin utility helpers.
 * All core game logic lives in GameEngine — import that directly when possible.
 */
import GameEngine from '../services/GameEngine';

export const AVATAR_COLORS = [
  '00bcd4', '3ba2f8', 'f59e0b',
  '10b981', 'a855f7', 'ef4444',
  'ec4899', '64748b',
];

/** @param {number} xp @param {number} xpNeeded @returns {number} 0-100 */
export const calculateXpPercentage = (xp, xpNeeded) =>
  GameEngine.xpPercent(xp, xpNeeded);

/** @param {number} level @returns {string} */
export const getTitleForLevel = (level) =>
  GameEngine.titleForLevel(level);

/** @param {number} current @returns {number} */
export const getNextXpNeeded = (current) =>
  GameEngine.nextXpThreshold(current);
