// src/components/modals/ZoneDetailModal.jsx
import React, { useEffect } from 'react';
import AudioManager from '../../services/AudioManager';

const DIFF_STYLE = {
  'سهل':      { bg:'#dcfce7', color:'#15803d' },
  'متوسط':    { bg:'#fef9c3', color:'#854d0e' },
  'صعب':      { bg:'#fee2e2', color:'#b91c1c' },
  'صعب جداً': { bg:'#fce7f3', color:'#9d174d' },
};

const CSS = `
  .zone-modal-box {
    background:#fff; border-radius:24px;
    width:100%; max-width:480px; max-height:90vh; overflow-y:auto;
    box-shadow:0 40px 100px rgba(0,0,0,0.25);
    animation:popIn 0.3s ease-out; direction:rtl;
  }
  .zone-modal-box::-webkit-scrollbar { width:4px; }
  .zone-modal-box::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }

  @media (max-width: 520px) {
    .zone-modal-box {
      max-width:100%; border-radius:20px 20px 0 0;
      max-height:85vh;
    }
  }
`;

const ZoneDetailModal = ({ zone, completedQuests, onClose, onOpenQuest }) => {
  useEffect(() => {
    if (zone) AudioManager.getInstance().play('open');
  }, [zone]);

  if (!zone) return null;

  return (
    <>
      <style>{CSS}</style>
      <div
        onClick={(e) => { if (e.target === e.currentTarget) { AudioManager.getInstance().play('click'); onClose(); } }}
        style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)',
          zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16,
        }}
      >
        <div className="zone-modal-box">
          {/* Header */}
          <div style={{ padding:'22px 24px 16px', borderBottom:'1.5px solid #f1f5f9', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:58, height:58, borderRadius:16, background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>
              {zone.emoji}
            </div>
            <div style={{ flex:1 }}>
              <h2 style={{ fontSize:18, fontWeight:900, color:'#1e293b', marginBottom:3 }}>{zone.title}</h2>
              <p  style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>{zone.desc}</p>
            </div>
            <button
              onClick={() => { AudioManager.getInstance().play('click'); onClose(); }}
              style={{ background:'#f1f5f9', border:'none', width:34, height:34, borderRadius:'50%', cursor:'pointer', fontSize:16, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginRight:'auto' }}
            >✕</button>
          </div>

          {/* Quest list */}
          <div style={{ padding:'16px 24px 24px' }}>
            <h3 style={{ fontSize:15, fontWeight:900, color:'#334155', marginBottom:10 }}>المهام المتاحة</h3>
            {zone.quests.map((quest) => {
              const done = completedQuests.has(quest.id);
              const dl   = DIFF_STYLE[quest.diff] ?? DIFF_STYLE['متوسط'];
              return (
                <div key={quest.id}
                  onClick={() => { if (!done) { AudioManager.getInstance().play('click'); onOpenQuest(quest); } }}
                  style={{
                    background:'#f8fafc', border:'1.5px solid #e2e8f0',
                    borderRadius:16, padding:14, marginBottom:10,
                    cursor: done ? 'default' : 'pointer',
                    opacity: done ? 0.55 : 1, transition:'all 0.18s',
                  }}
                  onMouseEnter={(e) => { if (!done) { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.borderColor='#bfdbfe'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0'; }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6, gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:900, color:'#1e293b' }}>{done ? '✅ ' : ''}{quest.title}</span>
                    <span style={{ fontSize:10, fontWeight:900, padding:'3px 8px', borderRadius:99, background:dl.bg, color:dl.color, whiteSpace:'nowrap', flexShrink:0 }}>{quest.diff}</span>
                  </div>
                  <p style={{ fontSize:12, color:'#64748b', fontWeight:600, lineHeight:1.6, marginBottom:8 }}>{quest.story}</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {[
                      { label:`⭐ ${quest.kp} KP`,      bg:'#fef9c3', color:'#92400e' },
                      { label:`🔷 ${quest.xp} XP`,        bg:'#eff6ff', color:'#1d4ed8' },
                      { label:`🌍 ${quest.impact}`,         bg:'#f0fdf4', color:'#166534' },
                    ].map((chip) => (
                      <span key={chip.label} style={{ fontSize:11, fontWeight:900, padding:'3px 9px', borderRadius:99, background:chip.bg, color:chip.color }}>{chip.label}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ZoneDetailModal;
