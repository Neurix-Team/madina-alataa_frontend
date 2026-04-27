// src/components/modals/LevelUpModal.jsx
/**
 * LevelUpModal — Celebratory full-screen modal shown on level-up.
 * Fires confetti burst + level-up fanfare via AudioManager on mount.
 */
import React, { useEffect } from 'react';
import ConfettiOverlay from '../common/ConfettiOverlay';
import JellyButton     from '../common/JellyButton';
import AudioManager    from '../../services/AudioManager';

const LevelUpModal = ({ level, title, onClose }) => {
  // Play fanfare once on mount
  useEffect(() => {
    AudioManager.getInstance().play('levelUp');
  }, []);

  return (
    <>
      <ConfettiOverlay active />

      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,0.6)',
          backdropFilter:'blur(6px)',
          zIndex:150,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:20,
        }}
      >
        <div style={{
          background:'#fff',
          borderRadius:32,
          maxWidth:360, width:'100%',
          boxShadow:'0 40px 100px rgba(0,0,0,0.3)',
          animation:'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          textAlign:'center',
          padding:'48px 32px 36px',
          direction:'rtl',
          position:'relative',
          overflow:'hidden',
        }}>
          {/* Background burst */}
          <div style={{
            position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)',
            width:300, height:300,
            background:'radial-gradient(circle,rgba(251,191,36,0.18) 0%,transparent 70%)',
            pointerEvents:'none',
          }} />

          <span style={{ fontSize:80, display:'block', marginBottom:12, animation:'popIn 0.6s ease-out' }}>🎉</span>

          <h2 style={{ fontSize:26, fontWeight:900, color:'#1e293b', marginBottom:8 }}>
            ارتقيت للمستوى!
          </h2>

          <div style={{
            display:'inline-block',
            background:'linear-gradient(135deg,#fbbf24,#f59e0b)',
            color:'#fff', fontSize:19, fontWeight:900,
            padding:'10px 28px', borderRadius:99,
            boxShadow:'0 4px 16px rgba(245,158,11,0.45)',
            margin:'12px 0 20px',
          }}>
            مستوى {level} — {title} 🏆
          </div>

          <p style={{ fontSize:15, color:'#64748b', fontWeight:600, marginBottom:28, lineHeight:1.7 }}>
            أحسنت! استمر في العطاء وستصل للقمة! 🚀
          </p>

          <JellyButton
            variant="primary"
            size="lg"
            fullWidth
            sound="click"
            onClick={onClose}
          >
            رائع، هنكمل! 🚀
          </JellyButton>
        </div>
      </div>
    </>
  );
};

export default LevelUpModal;
