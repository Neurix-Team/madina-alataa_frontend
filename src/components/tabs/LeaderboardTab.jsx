// src/components/tabs/LeaderboardTab.jsx
import React from 'react';
import leaderboardData from '../../data/leaderboardData';
import { useAuth } from '../../hooks/useAuth';

const RANK_EMOJI = ['🥇','🥈','🥉'];
const RANK_COLOR = ['#f59e0b','#94a3b8','#cd7c2f'];

const LeaderboardTab = () => {
  const { user } = useAuth();
  const userKP = user?.points || 0;
  const rows = leaderboardData
    .map((p) => ({ ...p, kp: p.isMe ? userKP : p.kp }))
    .sort((a, b) => b.kp - a.kp);

  return (
    <div>
      <div style={{ background:'var(--bg-card)', borderRadius:22, padding:'18px 24px', marginBottom:18, boxShadow:'var(--shadow-md)', textAlign:'center', direction:'rtl', border:'1.5px solid var(--border)' }}>
        <h2 style={{ fontSize:24, fontWeight:900, color:'var(--text-primary)', marginBottom:4 }}>🥇 لوحة الشرف</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:600 }}>المتطوعون الأكثر عطاءً هذا الأسبوع</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {rows.map((player, i) => (
          <div key={player.id} style={{
            background: player.isMe ? 'linear-gradient(135deg,#1e3a5f,#1d4ed8)' : 'var(--bg-card)',
            border:     player.isMe ? '2px solid #3b82f6' : '1.5px solid var(--border)',
            borderRadius:16, padding:'12px 18px',
            display:'flex', alignItems:'center', gap:12,
            boxShadow:'var(--shadow-sm)',
            direction:'rtl',
            animation:'popIn 0.3s ease-out backwards',
            animationDelay:`${i * 0.07}s`,
          }}>
            <div style={{ fontSize:18, fontWeight:900, minWidth:34, textAlign:'center', color: i < 3 ? RANK_COLOR[i] : 'var(--text-secondary)' }}>
              {i < 3 ? RANK_EMOJI[i] : i + 1}
            </div>
            <div style={{ width:40, height:40, borderRadius:'50%', border:'2px solid var(--border)', background:'var(--bg-card-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
              {player.emoji}
            </div>
            <div style={{ flex:1, fontWeight:900, fontSize:14, color: player.isMe ? '#fff' : 'var(--text-primary)', minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {player.name}{player.isMe ? ' (أنت)' : ''}
            </div>
            <div style={{ fontWeight:900, fontSize:15, color:'#ca8a04', background:'#fef9c3', padding:'4px 12px', borderRadius:99, whiteSpace:'nowrap', flexShrink:0 }}>
              ⭐ {player.kp.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardTab;
