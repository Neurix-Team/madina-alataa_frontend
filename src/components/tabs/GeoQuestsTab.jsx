// src/components/tabs/GeoQuestsTab.jsx
/**
 * GeoQuestsTab — Real-world GPS-based quests.
 * Player must physically travel to a location to unlock and complete the quest.
 */
import React, { useState, useCallback, memo } from 'react';
import GeoQuestService from '../../services/GeoQuestService';
import GEO_QUESTS      from '../../data/geoQuestsData';
import AudioManager                    from '../../services/AudioManager';
import JellyButton                     from '../common/JellyButton';

const DIFF_STYLE = {
  'سهل':      { bg:'#dcfce7', color:'#15803d' },
  'متوسط':    { bg:'#fef9c3', color:'#854d0e' },
  'صعب':      { bg:'#fee2e2', color:'#b91c1c' },
  'صعب جداً': { bg:'#fce7f3', color:'#9d174d' },
};

// ── Quest Card ────────────────────────────────────────────────────────────

const GeoQuestCard = memo(({ quest, completed, onVerify, isVerifying }) => {
  const dl = DIFF_STYLE[quest.difficulty] ?? DIFF_STYLE['متوسط'];

  return (
    <div style={{
      background:'var(--bg-card)', borderRadius:20, padding:'20px 22px',
      boxShadow:'var(--shadow-sm)',
      border: completed ? '2px solid #86efac' : '1.5px solid var(--border)',
      direction:'rtl', transition:'all 0.2s',
      opacity: completed ? 0.85 : 1,
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:12 }}>
        {/* Icon */}
        <div style={{
          width:56, height:56, borderRadius:16, flexShrink:0,
          background: completed ? 'var(--card-done-bg)' : 'var(--bg-card-2)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
          border: completed ? '2px solid #86efac' : '2px solid var(--border)',
        }}>
          {quest.emoji}
        </div>

        <div style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:15, fontWeight:900, color:'var(--text-primary)' }}>
              {completed ? '✅ ' : '📍 '}{quest.title}
            </span>
            <span style={{ fontSize:10, fontWeight:900, padding:'2px 8px', borderRadius:99, background:dl.bg, color:dl.color, whiteSpace:'nowrap', flexShrink:0 }}>
              {quest.difficulty}
            </span>
          </div>
          <p style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, lineHeight:1.6 }}>{quest.desc}</p>
        </div>
      </div>

      {/* Hint */}
      <div style={{ background:'rgba(29,110,216,0.1)', borderRadius:10, padding:'8px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:6, border:'1px solid rgba(29,110,216,0.2)' }}>
        <span style={{ fontSize:16 }}>💡</span>
        <span style={{ fontSize:12, color:'#3b82f6', fontWeight:700 }}>{quest.hint}</span>
      </div>

      {/* Rewards */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
        {[
          { label:`⭐ ${quest.kp} KP`,      bg:'#fef9c3', color:'#92400e' },
          { label:`🔷 ${quest.xp} XP`,        bg:'#eff6ff', color:'#1d4ed8' },
          { label:`🌍 تأثير ${quest.impact}`,  bg:'#f0fdf4', color:'#166534' },
        ].map((chip) => (
          <span key={chip.label} style={{ fontSize:11, fontWeight:900, padding:'3px 10px', borderRadius:99, background:chip.bg, color:chip.color }}>
            {chip.label}
          </span>
        ))}
      </div>

      {/* Action */}
      {completed ? (
        <div style={{ textAlign:'center', background:'var(--card-done-bg)', borderRadius:12, padding:'10px', color:'#16a34a', fontWeight:900, fontSize:13, border:'1px solid var(--card-done-border)' }}>
          🏆 مهمة مكتملة! أحسنت!
        </div>
      ) : (
        <JellyButton
          variant="primary"
          size="md"
          fullWidth
          sound="click"
          onClick={() => onVerify(quest)}
          disabled={isVerifying}
        >
          {isVerifying ? '⏳ جاري التحقق من موقعك…' : '📍 أنا في المكان الصح!'}
        </JellyButton>
      )}
    </div>
  );
});

// ── Verification Result Modal ─────────────────────────────────────────────

const VerifyModal = memo(({ result, quest, onClose, onComplete }) => {
  if (!result) return null;

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(3px)', zIndex:100 }} />
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        background:'var(--bg-card)', borderRadius:24, padding:'32px 28px',
        maxWidth:340, width:'90%', zIndex:110,
        textAlign:'center', direction:'rtl',
        boxShadow:'var(--shadow-lg)',
        animation:'popIn 0.35s ease-out',
        border:'1.5px solid var(--border)',
      }}>
        <div style={{ fontSize:56, marginBottom:12 }}>
          {result.success ? '🎉' : result.error ? '⚠️' : '📍'}
        </div>
        <h3 style={{ fontSize:18, fontWeight:900, color:'var(--text-primary)', marginBottom:8 }}>
          {result.success
            ? 'تم التحقق! أنت في المكان الصح'
            : result.error
            ? 'خطأ في GPS'
            : `أنت بعيد بـ ${GeoQuestService.formatDistance(result.distance)}`}
        </h3>
        <p style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:600, marginBottom:20, lineHeight:1.6 }}>
          {result.success
            ? `مبروك! تبعد فقط ${GeoQuestService.formatDistance(result.distance)} عن الهدف`
            : result.error
            ? result.error
            : `تحتاج أن تكون على بُعد ${GeoQuestService.formatDistance(quest.radiusM)} من الهدف`}
        </p>
        {result.success ? (
          <JellyButton variant="success" size="md" fullWidth sound="win" onClick={onComplete}>
            ✅ استلام المكافأة!
          </JellyButton>
        ) : (
          <JellyButton variant="dark" size="md" fullWidth sound="click" onClick={onClose}>
            حسناً، سأذهب هناك
          </JellyButton>
        )}
      </div>
    </>
  );
});

// ── Main Tab ──────────────────────────────────────────────────────────────

const GeoQuestsTab = ({ completedQuests, onCompleteQuest }) => {
  const [verifying,    setVerifying]    = useState(null);   // quest being verified
  const [verifyResult, setVerifyResult] = useState(null);
  const [gpsError,     setGpsError]     = useState(null);

  const handleVerify = useCallback(async (quest) => {
    setVerifying(quest);
    setVerifyResult(null);
    setGpsError(null);
    AudioManager.getInstance().play('click');

    const result = await GeoQuestService.verifyQuestLocation(quest);
    setVerifying(null);
    setVerifyResult(result);

    if (result.success) AudioManager.getInstance().play('open');
  }, []);

  const handleComplete = useCallback(() => {
    if (!verifyResult?.success) return;
    // Find the quest currently being verified (last one shown)
    const quest = GEO_QUESTS.find((q) => verifyResult !== null) ?? null;
    // Use onCompleteQuest from parent
    if (quest) onCompleteQuest?.(quest, 0);
    setVerifyResult(null);
    AudioManager.getInstance().play('win');
  }, [verifyResult, onCompleteQuest]);

  // Track which quest the verify modal is for
  const [pendingQuest, setPendingQuest] = useState(null);

  const startVerify = useCallback(async (quest) => {
    setPendingQuest(quest);
    setVerifying(quest);
    setVerifyResult(null);
    AudioManager.getInstance().play('click');

    const result = await GeoQuestService.verifyQuestLocation(quest);
    setVerifying(null);
    setVerifyResult(result);
    if (result.success) AudioManager.getInstance().play('open');
  }, []);

  const completeVerified = useCallback(() => {
    if (!pendingQuest || !verifyResult?.success) return;
    onCompleteQuest?.(pendingQuest, 0);
    setVerifyResult(null);
    setPendingQuest(null);
    AudioManager.getInstance().play('win');
  }, [pendingQuest, verifyResult, onCompleteQuest]);

  return (
    <div>
      {/* Header */}
      <div style={{ background:'var(--bg-card)', borderRadius:22, padding:'18px 24px', marginBottom:16, boxShadow:'var(--shadow-md)', textAlign:'center', direction:'rtl', border:'1.5px solid var(--border)' }}>
        <h2 style={{ fontSize:24, fontWeight:900, color:'var(--text-primary)', marginBottom:4 }}>📍 مهام العالم الحقيقي</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:600 }}>
          توجه إلى الأماكن الحقيقية وأكمل المهام — GPS يتحقق من وجودك!
        </p>
      </div>

      {/* GPS info banner */}
      <div style={{
        background:'linear-gradient(135deg,#eff6ff,#dbeafe)',
        border:'1.5px solid #bfdbfe',
        borderRadius:16, padding:'12px 18px', marginBottom:16,
        display:'flex', alignItems:'center', gap:12, direction:'rtl',
      }}>
        <span style={{ fontSize:28 }}>📡</span>
        <div>
          <div style={{ fontSize:13, fontWeight:900, color:'#1d4ed8' }}>كيف يعمل؟</div>
          <div style={{ fontSize:12, color:'#1e40af', fontWeight:600 }}>
            اذهب إلى المكان المحدد، اضغط "أنا في المكان الصح"، وسيتحقق GPS من موقعك تلقائياً!
          </div>
        </div>
      </div>

      {/* Quest cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {GEO_QUESTS.map((quest) => (
          <GeoQuestCard
            key={quest.id}
            quest={quest}
            completed={completedQuests.has(quest.id)}
            onVerify={startVerify}
            isVerifying={verifying?.id === quest.id}
          />
        ))}
      </div>

      {/* Verification result modal */}
      {(verifyResult || verifying) && (
        <VerifyModal
          result={verifying ? { loading: true } : verifyResult}
          quest={pendingQuest}
          onClose={() => { setVerifyResult(null); setPendingQuest(null); }}
          onComplete={completeVerified}
        />
      )}
    </div>
  );
};

export default memo(GeoQuestsTab);
