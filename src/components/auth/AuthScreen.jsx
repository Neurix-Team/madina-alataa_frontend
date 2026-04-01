// src/components/auth/AuthScreen.jsx
import React, { useState } from 'react';
import JellyButton  from '../common/JellyButton';
import AudioManager from '../../services/AudioManager';

const AuthScreen = ({ onLogin }) => {
  const [tab,      setTab]      = useState('login');
  const [name,     setName]     = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const handleTabSwitch = (id) => {
    AudioManager.getInstance().play('click');
    setTab(id);
    setError('');
  };

  const handleSubmit = () => {
    if (!password.trim()) { setError('أدخل الكلمة السرية السحرية!'); AudioManager.getInstance().play('error'); return; }
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('win');
    onLogin({ name: name.trim() || 'البطل الشجاع' });
  };

  const handleGuest = () => {
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('click');
    onLogin({ name: 'زائر شجاع' });
  };

  return (
    <div dir="rtl" style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#3ba2f8 0%,#1d6ed8 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Cairo',sans-serif",
      position:'relative', overflow:'hidden',
    }}>
      {/* Ambient decorations */}
      {[
        { top:'6%',  left:'4%',  size:70, op:0.18, dur:'9s',  dl:'0s'   },
        { top:'12%', right:'6%', size:90, op:0.12, dur:'11s', dl:'1.5s' },
        { top:'55%', left:'2%',  size:55, op:0.10, dur:'8s',  dl:'3s'   },
        { top:'70%', right:'3%', size:65, op:0.08, dur:'10s', dl:'1s'   },
      ].map((c, i) => (
        <div key={i} style={{
          position:'absolute', top:c.top, left:c.left, right:c.right,
          fontSize:c.size, opacity:c.op, pointerEvents:'none',
          animation:`authCloudFloat ${c.dur} ease-in-out infinite`,
          animationDelay:c.dl,
        }}>☁️</div>
      ))}

      {[
        { top:'30%', left:'8%',  size:28, dl:'0s'   },
        { top:'80%', left:'20%', size:20, dl:'1s'   },
        { top:'20%', right:'15%',size:18, dl:'2s'   },
        { top:'65%', right:'10%',size:24, dl:'0.5s' },
      ].map((s, i) => (
        <div key={i} style={{
          position:'absolute', top:s.top, left:s.left, right:s.right,
          fontSize:s.size, color:'rgba(255,255,255,0.55)', pointerEvents:'none',
          animation:`authStarPulse 3s ease-in-out infinite`,
          animationDelay:s.dl,
        }}>✦</div>
      ))}

      {/* Card */}
      <div style={{
        background:'#fff', borderRadius:28,
        padding:'40px 36px 32px',
        width:'100%', maxWidth:380,
        boxShadow:'0 24px 80px rgba(0,0,0,0.18)',
        position:'relative', zIndex:1,
        animation:'authCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        direction:'rtl',
      }}>
        {/* Crown icon */}
        <div style={{
          width:72, height:72,
          background:'linear-gradient(135deg,#fbbf24,#f59e0b)',
          borderRadius:'50%',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 18px',
          boxShadow:'0 8px 24px rgba(245,158,11,0.35)',
          fontSize:34,
        }}>👑</div>

        <h1 style={{ textAlign:'center', fontSize:22, fontWeight:900, color:'#1e293b', marginBottom:6 }}>
          بطل العطاء
        </h1>
        <p style={{ textAlign:'center', fontSize:13, color:'#94a3b8', fontWeight:600, marginBottom:24 }}>
          انضم إلينا لنصنع عالماً أفضل!
        </p>

        {/* Tab switcher */}
        <div style={{
          display:'flex', background:'#f1f5f9',
          borderRadius:14, padding:4, marginBottom:22, gap:4,
        }}>
          {[{ id:'login', label:'تسجيل الدخول' }, { id:'register', label:'حساب جديد' }].map((t) => (
            <button key={t.id} onClick={() => handleTabSwitch(t.id)} style={{
              flex:1, padding:'8px 0', borderRadius:10, border:'none', cursor:'pointer',
              fontFamily:"'Cairo',sans-serif", fontSize:13,
              fontWeight: tab === t.id ? 900 : 700,
              background: tab === t.id ? '#fff' : 'transparent',
              color:      tab === t.id ? '#1d6ed8' : '#94a3b8',
              boxShadow:  tab === t.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition:'all 0.18s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
          <input
            type="text"
            placeholder="اسم البطل أو البريد الإلكتروني"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={INPUT_STYLE}
          />
          {tab === 'register' && (
            <input type="email" placeholder="البريد الإلكتروني" style={INPUT_STYLE} />
          )}
          <input
            type="password"
            placeholder="الكلمة السرية السحرية"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={INPUT_STYLE}
          />
        </div>

        {error && (
          <p style={{ color:'#ef4444', fontSize:12, fontWeight:700, marginBottom:10, textAlign:'center' }}>
            ⚠️ {error}
          </p>
        )}

        <JellyButton variant="success" size="lg" fullWidth sound="win" onClick={handleSubmit}
          style={{ marginBottom:14 }}>
          ابدأ اللعب! 🎮
        </JellyButton>

        <p onClick={handleGuest} style={{
          textAlign:'center', fontSize:12, color:'#94a3b8',
          fontWeight:600, cursor:'pointer', transition:'color 0.18s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.color='#3ba2f8'}
          onMouseLeave={(e) => e.currentTarget.style.color='#94a3b8'}
        >
          تخطي واللعب كزائر مؤقتاً
        </p>
      </div>

      <style>{`
        @keyframes authCardIn {
          0%   { opacity:0; transform:scale(0.85) translateY(24px); }
          100% { opacity:1; transform:scale(1)    translateY(0);    }
        }
        @keyframes authCloudFloat {
          0%,100% { transform:translateY(0);    }
          50%      { transform:translateY(-14px); }
        }
        @keyframes authStarPulse {
          0%,100% { opacity:0.18; transform:scale(1);    }
          50%      { opacity:0.40; transform:scale(1.25); }
        }
        input::placeholder { color:#cbd5e1; }
        input:focus { outline:none; border-color:#3ba2f8 !important; box-shadow:0 0 0 3px rgba(59,162,248,0.15) !important; }
      `}</style>
    </div>
  );
};

const INPUT_STYLE = {
  width:'100%', padding:'13px 16px',
  border:'2px solid #e2e8f0', borderRadius:14,
  fontFamily:"'Cairo',sans-serif", fontSize:14, fontWeight:600,
  color:'#334155', background:'#f8fafc',
  direction:'rtl', transition:'all 0.18s', outline:'none',
};

export default AuthScreen;
