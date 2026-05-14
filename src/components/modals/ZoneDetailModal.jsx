// src/components/modals/ZoneDetailModal.jsx
import React, { useEffect, useRef } from 'react';
import AudioManager from '../../services/AudioManager';
import useInertOnOpen from '../../utils/useInertOnOpen';

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

  const modalRef = useRef(null);
  useInertOnOpen(modalRef, !!zone);

  if (!zone) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) { AudioManager.getInstance().play('click'); onClose(); } }}
      className="app-modal-overlay"
      style={{ zIndex: 100 }}
    >
      <div 
        ref={modalRef}
        className="app-modal-card"
        style={{ maxWidth: '820px', direction: 'rtl' }}
      >
        {/* Header */}
        <div className="app-modal-header">
          <div className="flex items-center gap-4">
            <div className="w-[58px] h-[58px] rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-[30px]">
              {zone.emoji}
            </div>
            <div>
              <h3 className="app-modal-title">{zone.title}</h3>
              <p className="app-modal-subtitle">{zone.desc}</p>
            </div>
          </div>
          <button
            onClick={() => { AudioManager.getInstance().play('click'); onClose(); }}
            className="app-modal-close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4">
          <h3 className="text-[16px] font-black text-slate-900 mb-4">المهام المتاحة في هذه المنطقة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {zone.quests.map((quest) => {
              const done = completedQuests.has(quest.id);
              const dl   = DIFF_STYLE[quest.diff] ?? DIFF_STYLE['متوسط'];
              return (
                <div 
                  key={quest.id}
                  onClick={() => { if (!done) { AudioManager.getInstance().play('click'); onOpenQuest(quest); } }}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    done 
                      ? 'bg-slate-50/50 border-slate-100 opacity-60 cursor-default' 
                      : 'bg-white border-slate-200/80 cursor-pointer hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className="text-[15px] font-black text-slate-900 leading-snug">
                      {done ? '✅ ' : ''}{quest.title}
                    </span>
                    <span 
                      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                      style={{ background: dl.bg, color: dl.color }}
                    >
                      {quest.diff}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[13px] leading-relaxed mb-4 font-medium">
                    {quest.story}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: `⭐ ${quest.kp} KP`, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
                      { label: `🔷 ${quest.xp} XP`, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
                      { label: `🌍 ${quest.impact}`, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
                    ].map((chip) => (
                      <span 
                        key={chip.label} 
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${chip.bg} ${chip.text} ${chip.border}`}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneDetailModal;
