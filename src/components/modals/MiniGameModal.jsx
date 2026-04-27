// src/components/modals/MiniGameModal.jsx
/**
 * MiniGameModal — Memory Card Match Mini-Game.
 * Domain: Content → MiniGame
 *
 * A 4×3 grid (12 cards = 6 pairs) of emoji cards.
 * Player flips 2 cards at a time; matching pairs stay revealed.
 * Win = all pairs matched within 60 seconds.
 * Reward = bonus KP passed back via onWin(bonusKP).
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../../styles/minigame.css';
import AudioManager from '../../services/AudioManager';

// ── Card sets per quest theme ─────────────────────────────────────────────
const CARD_SETS = {
  elderly:     ['❤️', '📖', '🌹', '☕', '🎭', '🕊️'],
  orphans:     ['🎮', '🎨', '⚽', '🎪', '🎠', '🌈'],
  education:   ['📚', '✏️', '🎓', '🔬', '🌍', '💡'],
  community:   ['🏠', '🤝', '🌟', '🍲', '🌻', '🎁'],
  environment: ['🌲', '🌿', '♻️', '🌊', '🦋', '🌸'],
  health:      ['🩺', '💊', '🏥', '❤️‍🩹', '🌡️', '💉'],
  default:     ['⭐', '🎯', '🏆', '💎', '🚀', '🌙'],
};

const GAME_DURATION = 60; // seconds
const BONUS_KP      = 30;

// ── Helpers ───────────────────────────────────────────────────────────────
function buildDeck(theme = 'default') {
  const emojis = CARD_SETS[theme] ?? CARD_SETS.default;
  const pairs  = [...emojis, ...emojis];
  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((emoji, idx) => ({
    id:      idx,
    emoji,
    flipped: false,
    matched: false,
  }));
}

// ── MiniGameModal ─────────────────────────────────────────────────────────
const MiniGameModal = ({ theme = 'default', bonusKP = BONUS_KP, onWin, onClose }) => {
  const [cards,       setCards]       = useState(() => buildDeck(theme));
  const [flipped,     setFlipped]     = useState([]);   // indices of currently flipped (unmatched) cards
  const [moves,       setMoves]       = useState(0);
  const [timeLeft,    setTimeLeft]    = useState(GAME_DURATION);
  const [gameState,   setGameState]   = useState('playing'); // 'playing' | 'won' | 'lost'
  const [isChecking,  setIsChecking]  = useState(false);
  const timerRef = useRef(null);

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameState('lost');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // ── Check for win ──────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    const allMatched = cards.every((c) => c.matched);
    if (allMatched) {
      clearInterval(timerRef.current);
      setGameState('won');
      try { AudioManager.getInstance().play('win'); } catch (_) {}
    }
  }, [cards, gameState]);

  // ── Flip card ──────────────────────────────────────────────────────────
  const handleFlip = useCallback((idx) => {
    if (isChecking)                    return;
    if (cards[idx].matched)            return;
    if (cards[idx].flipped)            return;
    if (flipped.length >= 2)           return;
    if (gameState !== 'playing')       return;

    try { AudioManager.getInstance().play('toggle'); } catch (_) {}

    const newCards = cards.map((c, i) =>
      i === idx ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsChecking(true);

      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === a || i === b ? { ...c, matched: true } : c
            )
          );
          setFlipped([]);
          setIsChecking(false);
          try { AudioManager.getInstance().play('complete'); } catch (_) {}
        }, 500);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === a || i === b ? { ...c, flipped: false } : c
            )
          );
          setFlipped([]);
          setIsChecking(false);
        }, 900);
      }
    }
  }, [cards, flipped, isChecking, gameState]);

  // ── Restart ────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    clearInterval(timerRef.current);
    setCards(buildDeck(theme));
    setFlipped([]);
    setMoves(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    setIsChecking(false);
  }, [theme]);

  const matchedCount = cards.filter((c) => c.matched).length / 2;
  const totalPairs   = cards.length / 2;

  return (
    <div className="minigame-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="minigame-container">

        {/* ── Header ── */}
        <div className="minigame-header">
          <div className="minigame-header__title">🎮 لعبة الذاكرة</div>
          <div className="minigame-header__subtitle">
            طابق الأزواج المتشابهة قبل انتهاء الوقت!
          </div>
        </div>

        {/* ── Stats Bar ── */}
        {gameState === 'playing' && (
          <div className="minigame-stats">
            <div className={`minigame-stat minigame-stat--timer${timeLeft <= 10 ? ' minigame-stat--warning' : ''}`}>
              <div className="minigame-stat__value">⏱ {timeLeft}</div>
              <div className="minigame-stat__label">ثانية</div>
            </div>
            <div className="minigame-stat">
              <div className="minigame-stat__value">{matchedCount}/{totalPairs}</div>
              <div className="minigame-stat__label">أزواج</div>
            </div>
            <div className="minigame-stat">
              <div className="minigame-stat__value">{moves}</div>
              <div className="minigame-stat__label">محاولة</div>
            </div>
          </div>
        )}

        {/* ── Game Result ── */}
        {gameState === 'won' && (
          <div className="minigame-result">
            <span className="minigame-result__icon">🎉</span>
            <div className="minigame-result__title">أحسنت! فزت!</div>
            <div className="minigame-result__subtitle">
              أكملت اللعبة في {moves} محاولة وبقي لديك {timeLeft} ثانية!
            </div>
            <div className="minigame-result__reward">
              🪙 +{bonusKP} KP مكافأة إضافية!
            </div>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="minigame-result">
            <span className="minigame-result__icon">⏰</span>
            <div className="minigame-result__title">انتهى الوقت!</div>
            <div className="minigame-result__subtitle">
              لا بأس، حاول مرة أخرى! وجدت {matchedCount} من {totalPairs} أزواج.
            </div>
          </div>
        )}

        {/* ── Card Grid ── */}
        {gameState === 'playing' && (
          <div className="minigame-grid">
            {cards.map((card, idx) => (
              <button
                key={card.id}
                className={[
                  'mg-card',
                  card.flipped || card.matched ? 'mg-card--flipped' : '',
                  card.matched ? 'mg-card--matched' : '',
                ].join(' ')}
                onClick={() => handleFlip(idx)}
                aria-label={card.flipped || card.matched ? card.emoji : 'بطاقة مقلوبة'}
              >
                <div className="mg-card__back" />
                <div className="mg-card__front">{card.emoji}</div>
              </button>
            ))}
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="minigame-actions">
          {gameState === 'won' && (
            <button
              className="minigame-btn minigame-btn--primary"
              onClick={() => onWin?.(bonusKP)}
            >
              ✅ استلام +{bonusKP} KP
            </button>
          )}
          {gameState === 'lost' && (
            <button
              className="minigame-btn minigame-btn--primary"
              onClick={handleRestart}
            >
              🔄 حاول مرة أخرى
            </button>
          )}
          <button
            className="minigame-btn minigame-btn--secondary"
            onClick={onClose}
          >
            {gameState === 'playing' ? '✕ إغلاق' : '↩ رجوع'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MiniGameModal;
