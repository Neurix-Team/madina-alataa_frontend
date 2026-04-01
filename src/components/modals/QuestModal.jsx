// src/components/modals/QuestModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import JellyButton  from '../common/JellyButton';
import AudioManager from '../../services/AudioManager';
import GameEngine   from '../../services/GameEngine';

const QuestModal = ({ quest, onClose, onComplete }) => {
  const [selectedBonuses, setSelectedBonuses] = useState(new Set());

  useEffect(() => {
    setSelectedBonuses(new Set());
    if (quest) AudioManager.getInstance().play('open');
  }, [quest?.id]);

  const toggleBonus = useCallback((bonusId) => {
    AudioManager.getInstance().play('toggle');
    setSelectedBonuses((prev) => {
      const next = new Set(prev);
      next.has(bonusId) ? next.delete(bonusId) : next.add(bonusId);
      return next;
    });
  }, []);

  if (!quest) return null;

  const bonusKP  = GameEngine.calcBonusKP(quest.bonuses, selectedBonuses);
  const totalKP  = quest.kp + bonusKP;

  const handleComplete = () => {
    AudioManager.getInstance().play('win');
    onComplete(quest, bonusKP);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:'fixed', inset:0,
        background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)',
        zIndex:110, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
      }}
    >
      <div style={{
        background:'var(--bg-card)', borderRadius:28,
        maxWidth:480, width:'100%', maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 40px 100px rgba(0,0,0,0.28)',
        animation:'popIn 0.3s ease-out', direction:'rtl',
      }}>
        {/* Gradient header */}
        <div style={{ background:'linear-gradient(135deg,#3ba2f8,#1d6ed8)', borderRadius:'28px 28px 0 0', padding:28 }}>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.2)', border:'none',
            width:36, height:36, borderRadius:'50%', cursor:'pointer',
            fontSize:18, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12,
          }}>✕</button>
          <h2 style={{ fontSize:22, fontWeight:900, color:'#fff', marginBottom:6 }}>{quest.title}</h2>
          <p  style={{ fontSize:14, color:'rgba(255,255,255,0.85)', lineHeight:1.6, fontWeight:600 }}>{quest.story}</p>
        </div>

        {/* Body */}
        <div style={{ padding:'20px 28px 28px' }}>
          <h3 style={{ fontSize:16, fontWeight:900, color:'var(--text-primary)', marginBottom:12 }}>✨ مكافآت إضافية (اختياري)</h3>

          {(quest.bonuses ?? []).map((bonus) => {
            const checked = selectedBonuses.has(bonus.id);
            return (
              <div key={bonus.id} onClick={() => toggleBonus(bonus.id)} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 16px',
                background: checked ? 'var(--card-done-bg)' : 'var(--bg-card-2)',
                border:`1.5px solid ${checked ? 'var(--card-done-border)' : 'var(--border)'}`,
                borderRadius:14, marginBottom:8,
                cursor:'pointer', transition:'all 0.18s',
              }}>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>
                  {checked ? '✅ ' : '🎁 '}{bonus.label}
                </span>
                <span style={{ fontSize:13, fontWeight:900, color:'#92400e', background:'#fef9c3', padding:'3px 10px', borderRadius:99 }}>
                  +{bonus.kp} KP
                </span>
              </div>
            );
          })}

          {/* Reward chips */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:16 }}>
            {[
              { label:`⭐ ${totalKP} KP`,         bg:'#fef9c3', color:'#92400e' },
              { label:`🔷 ${quest.xp} XP`,          bg:'#eff6ff', color:'#1d4ed8' },
              { label:`🌍 تأثير ${quest.impact}`,   bg:'#f0fdf4', color:'#166534' },
            ].map((chip) => (
              <span key={chip.label} style={{
                fontSize:13, fontWeight:900, padding:'5px 12px',
                borderRadius:99, background:chip.bg, color:chip.color,
              }}>{chip.label}</span>
            ))}
          </div>

          <JellyButton
            variant="primary"
            size="lg"
            fullWidth
            sound="win"
            onClick={handleComplete}
            style={{ marginTop:20 }}
          >
            ✅ إتمام المهمة!
          </JellyButton>
        </div>
      </div>
    </div>
  );
};

export default QuestModal;
