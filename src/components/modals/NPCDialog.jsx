// src/components/modals/NPCDialog.jsx
/**
 * NPCDialog — Interactive NPC conversation modal.
 * Domain: Content → NPC
 *
 * Shows a step-by-step dialog with an NPC character before a quest starts.
 * The player selects responses, advancing through dialog steps.
 * After the final step, the "Start Quest" button appears.
 */
import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/npc-dialog.css';
import AudioManager from '../../services/AudioManager';

// ── Choice icons ──────────────────────────────────────────────────────────
const CHOICE_ICONS = ['💬', '🤝', '❤️', '👍', '✨', '🌟'];

// ── NPCDialog ─────────────────────────────────────────────────────────────
const NPCDialog = ({ npc, onStartQuest, onClose }) => {
  const [stepIndex,    setStepIndex]    = useState(0);
  const [chosenChoice, setChosenChoice] = useState(null);
  const [isTyping,     setIsTyping]     = useState(true);

  const steps   = npc?.dialog ?? [];
  const current = steps[stepIndex];
  const isLast  = stepIndex === steps.length - 1;

  // Simulate typing effect
  useEffect(() => {
    setIsTyping(true);
    setChosenChoice(null);
    const t = setTimeout(() => setIsTyping(false), 600);
    return () => clearTimeout(t);
  }, [stepIndex]);

  const handleChoice = useCallback((choice, idx) => {
    try { AudioManager.getInstance().play('toggle'); } catch (_) {}
    setChosenChoice(idx);
    setTimeout(() => {
      if (!isLast) {
        setStepIndex((s) => s + 1);
      }
    }, 300);
  }, [isLast]);

  const handleStart = useCallback(() => {
    try { AudioManager.getInstance().play('open'); } catch (_) {}
    onStartQuest?.();
  }, [onStartQuest]);

  if (!npc || steps.length === 0) {
    onStartQuest?.();
    return null;
  }

  return (
    <div className="npc-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="npc-dialog">

        {/* ── Header ── */}
        <div className="npc-dialog__header">
          <div className="npc-dialog__avatar">{npc.avatar}</div>
          <div className="npc-dialog__npc-info">
            <div className="npc-dialog__npc-name">{npc.name}</div>
            <div className="npc-dialog__npc-role">{npc.role ?? 'شخصية في المهمة'}</div>
          </div>
          {/* Step dots */}
          <div className="npc-dialog__step-indicator">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`npc-dialog__step-dot${i === stepIndex ? ' npc-dialog__step-dot--active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="npc-dialog__body">

          {/* Speech bubble */}
          <div className="npc-dialog__bubble" key={stepIndex}>
            {isTyping ? (
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                <span style={{ animation: 'npcTextAppear 0.3s ease-out' }}>
                  ● ● ●
                </span>
              </span>
            ) : (
              <p className="npc-dialog__text">{current?.text}</p>
            )}
          </div>

          {/* Choices or Start button */}
          {!isTyping && (
            <>
              {isLast && chosenChoice !== null ? (
                /* After last choice — show start quest button */
                <button className="npc-dialog__start-btn" onClick={handleStart}>
                  🚀 ابدأ المهمة الآن!
                </button>
              ) : (
                /* Show choices */
                <div className="npc-dialog__choices">
                  {(current?.choices ?? []).map((choice, idx) => (
                    <button
                      key={idx}
                      className="npc-dialog__choice-btn"
                      onClick={() => handleChoice(choice, idx)}
                      style={{
                        background: chosenChoice === idx
                          ? 'linear-gradient(135deg, rgba(29,78,216,0.1), rgba(14,165,233,0.06))'
                          : undefined,
                        borderColor: chosenChoice === idx ? '#3b82f6' : undefined,
                      }}
                    >
                      <span className="npc-dialog__choice-icon">
                        {CHOICE_ICONS[idx % CHOICE_ICONS.length]}
                      </span>
                      {choice}
                    </button>
                  ))}

                  {/* If last step and no choice selected yet, also show start button */}
                  {isLast && chosenChoice === null && (current?.choices ?? []).length === 0 && (
                    <button className="npc-dialog__start-btn" onClick={handleStart}>
                      🚀 ابدأ المهمة الآن!
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NPCDialog;
