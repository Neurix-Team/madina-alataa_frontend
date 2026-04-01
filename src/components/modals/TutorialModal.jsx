// src/components/modals/TutorialModal.jsx
import React from 'react';
import JellyButton  from '../common/JellyButton';
import AudioManager from '../../services/AudioManager';

const TutorialModal = ({ onFinish }) => {
  const handleStart = () => {
    // Unlock audio on first user gesture — required by browsers
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('reward');
    onFinish();
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
        maxWidth:340, width:'100%',
        boxShadow:'0 40px 100px rgba(0,0,0,0.3)',
        animation:'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        direction:'rtl', overflow:'hidden',
      }}>
        <div style={{ height:5, background:'linear-gradient(90deg,#3ba2f8,#1d6ed8)' }} />

        <div style={{ padding:'36px 32px 32px', textAlign:'center' }}>
          <div style={{
            width:80, height:80,
            background:'linear-gradient(135deg,#e0f2fe,#bae6fd)',
            borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 20px', fontSize:42,
            boxShadow:'0 8px 24px rgba(59,162,248,0.2)',
          }}>😊</div>

          <h2 style={{ fontSize:24, fontWeight:900, color:'#1e293b', marginBottom:14 }}>
            أهلاً بك يا بطل!
          </h2>

          <p style={{ fontSize:14, color:'#475569', fontWeight:600, lineHeight:1.8, marginBottom:28 }}>
            مهمتك هنا هي مساعدة الآخرين ونشر السعادة!{' '}
            اضغط على المباني في الخريطة لاكتشاف المهام، واجمع{' '}
            <span style={{ color:'#f59e0b', fontWeight:900, background:'#fef9c3', padding:'1px 6px', borderRadius:6 }}>
              نقاط العطاء (KP)
            </span>.
          </p>

          <JellyButton variant="primary" size="lg" fullWidth sound="click" onClick={handleStart}>
            أنا مستعد للبدء! 🚀
          </JellyButton>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
