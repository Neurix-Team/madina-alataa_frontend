// src/components/modals/DailyRewardModal.jsx
import React from 'react';
import JellyButton  from '../common/JellyButton';
import AudioManager from '../../services/AudioManager';
import GameEngine   from '../../services/GameEngine';

const DailyRewardModal = ({ onClaim }) => {
  const handleClaim = () => {
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('reward');
    onClaim();
  };

  return (
    <div style={{
      position:'fixed', inset:0,
      background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
      fontFamily:"'Cairo',sans-serif",
    }}>
      <div style={{
        background:'#fff', borderRadius:28,
        maxWidth:320, width:'100%',
        boxShadow:'0 40px 100px rgba(0,0,0,0.3)',
        animation:'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        direction:'rtl', overflow:'hidden', position:'relative',
      }}>
        {/* Burst bg */}
        <div style={{
          position:'absolute', top:-30, left:'50%', transform:'translateX(-50%)',
          width:120, height:120,
          background:'radial-gradient(circle,#fef08a 0%,#fde68a 40%,transparent 70%)',
          borderRadius:'50%', opacity:0.7, zIndex:0,
        }} />

        <div style={{ padding:'40px 32px 32px', textAlign:'center', position:'relative', zIndex:1 }}>
          {/* Gift icon */}
          <div style={{
            width:84, height:84,
            background:'linear-gradient(135deg,#fef9c3,#fde68a)',
            borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 20px', fontSize:42,
            boxShadow:'0 8px 28px rgba(245,158,11,0.3)',
            border:'3px solid #fbbf24',
            animation:'giftBounce 2s ease-in-out infinite',
          }}>🎁</div>

          <h2 style={{ fontSize:24, fontWeight:900, color:'#1e293b', marginBottom:8 }}>
            مرحباً بعودتك!
          </h2>
          <p style={{ fontSize:14, color:'#64748b', fontWeight:600, marginBottom:24, lineHeight:1.7 }}>
            استمرارك في فعل الخير يصنع الفرق.
          </p>

          {/* KP badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:10,
            background:'linear-gradient(135deg,#fbbf24,#f59e0b)',
            color:'#fff', fontSize:22, fontWeight:900,
            padding:'12px 28px', borderRadius:99,
            boxShadow:'0 4px 16px rgba(245,158,11,0.45)',
            marginBottom:24,
            animation:'kpPulse 2s ease-in-out infinite',
          }}>
            KP {GameEngine.DAILY_REWARD_KP}+ ⭐
          </div>

          <JellyButton variant="dark" size="lg" fullWidth sound="reward" onClick={handleClaim}>
            استلام هديتي! 🎉
          </JellyButton>
        </div>
      </div>

      <style>{`
        @keyframes giftBounce {
          0%,100% { transform:translateY(0)   scale(1);    }
          50%      { transform:translateY(-8px) scale(1.05); }
        }
        @keyframes kpPulse {
          0%,100% { box-shadow:0 4px 16px rgba(245,158,11,0.45); }
          50%      { box-shadow:0 8px 28px rgba(245,158,11,0.65); }
        }
      `}</style>
    </div>
  );
};

export default DailyRewardModal;
