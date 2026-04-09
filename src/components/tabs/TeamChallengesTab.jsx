import React, { useState, useCallback, memo } from 'react';
import TeamService     from '../../services/TeamService';
import TEAM_CHALLENGES from '../../data/teamChallengesData';
import AudioManager    from '../../services/AudioManager';
import JellyButton     from '../common/JellyButton';
import { useAuth } from '../../hooks/useAuth';
import useGameState from '../../hooks/useGameState';

const svc = TeamService.getInstance();

// ── Challenge Card ────────────────────────────────────────────────────────

const ChallengeCard = memo(({ challenge, myTeam, onCreateTeam, onJoinPrompt }) => {
  const progress = myTeam ? svc.getTeamProgress(myTeam) : null;

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 20, overflow: 'hidden',
      boxShadow: 'var(--shadow-md)', direction: 'rtl',
    }}>
      <div style={{ height: 6, background: `linear-gradient(90deg,${challenge.color},${challenge.color}88)` }} />

      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 32 }}>{challenge.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{challenge.title}</span>
              <span style={{
                fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0,
                background: challenge.difficulty === 'صعب جداً' ? '#fce7f3' : challenge.difficulty === 'صعب' ? '#fee2e2' : '#fef9c3',
                color:      challenge.difficulty === 'صعب جداً' ? '#9d174d' : challenge.difficulty === 'صعب' ? '#b91c1c' : '#854d0e',
              }}>{challenge.difficulty}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 3, lineHeight: 1.6 }}>{challenge.desc}</p>
          </div>
        </div>

        {/* Requirements */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--bg-card-2)', color: 'var(--text-secondary)', padding: '3px 10px', borderRadius: 99 }}>
            👥 {challenge.requiredMembers} أعضاء
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, background: '#fef9c3', color: '#92400e', padding: '3px 10px', borderRadius: 99 }}>
            ⭐ {challenge.rewardKP} KP
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: 99 }}>
            🔷 {challenge.rewardXP} XP
          </span>
        </div>

        {/* Team progress */}
        {myTeam && progress && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ background: 'var(--bg-card-2)', borderRadius: 14, padding: '12px 14px', border: '1.5px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-primary)' }}>📊 تقدم الفريق: {myTeam.name}</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: challenge.color }}>{progress.completed}/{progress.total}</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  height: '100%', width: `${progress.percent}%`,
                  background: `linear-gradient(90deg,${challenge.color},${challenge.color}bb)`,
                  borderRadius: 99, transition: 'width 0.8s ease-out',
                }} />
              </div>

              {/* Members */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {myTeam.members.map((m) => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg-card)', borderRadius: 99, padding: '4px 10px', border: '1.5px solid var(--border)', fontSize: 12 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: `#${m.avatarBg ?? '00bcd4'}`, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</span>
                    {m.isLeader && <span style={{ fontSize: 10 }}>👑</span>}
                  </div>
                ))}
              </div>

              {myTeam.completed && (
                <div style={{ marginTop: 10, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#fff', borderRadius: 12, padding: '8px 14px', textAlign: 'center', fontWeight: 900, fontSize: 13 }}>
                  🏆 تهانينا! أتممتم التحدي! لقب: {challenge.rewardTitle}
                </div>
              )}

              {/* Invite code */}
              <div style={{ marginTop: 8, background: 'var(--success-light)', borderRadius: 10, padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700 }}>كود الدعوة:</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--success)', letterSpacing: '0.1em' }}>
                  {svc.getInviteCode(myTeam.teamId)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!myTeam ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <JellyButton variant="primary" size="sm" sound="click" onClick={() => onCreateTeam(challenge)} style={{ flex: 1 }}>
              ➕ إنشاء فريق
            </JellyButton>
            <JellyButton variant="dark" size="sm" sound="click" onClick={() => onJoinPrompt(challenge)} style={{ flex: 1 }}>
              🔗 انضم بكود
            </JellyButton>
          </div>
        ) : !myTeam.completed ? (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>
            أكمل المهام المطلوبة من قائمة المهام لتقدم الفريق!
          </div>
        ) : null}
      </div>
    </div>
  );
});

// ── Create Team Modal ─────────────────────────────────────────────────────

const CreateTeamModal = memo(({ challenge, userName, avatarBg, onConfirm, onClose }) => {
  const [teamName, setTeamName] = useState(`فريق ${userName}`);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: 'var(--bg-card)', borderRadius: 24, padding: '28px 26px',
        maxWidth: 340, width: '90%', zIndex: 110,
        direction: 'rtl', boxShadow: 'var(--shadow-lg)', animation: 'popIn 0.3s ease-out',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>{challenge.emoji} إنشاء فريق جديد</h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 16 }}>{challenge.title}</p>
        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="اسم الفريق"
          style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: 12, fontFamily: "'Cairo',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', background: 'var(--bg-card-2)', direction: 'rtl', outline: 'none', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <JellyButton variant="primary" size="md" sound="win" fullWidth onClick={() => onConfirm(teamName)}>
            إنشاء 🚀
          </JellyButton>
          <JellyButton variant="dark" size="md" sound="click" onClick={onClose} style={{ flex: 0.6 }}>
            إلغاء
          </JellyButton>
        </div>
      </div>
    </>
  );
});

// ── Join Team Modal ───────────────────────────────────────────────────────

const JoinTeamModal = memo(({ onConfirm, onClose }) => {
  const [code,  setCode]  = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    const team = svc.findByInviteCode(code);
    if (!team) { setError('كود غير صحيح!'); AudioManager.getInstance().play('error'); return; }
    onConfirm(team);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: 'var(--bg-card)', borderRadius: 24, padding: '28px 26px',
        maxWidth: 320, width: '90%', zIndex: 110,
        direction: 'rtl', boxShadow: 'var(--shadow-lg)', animation: 'popIn 0.3s ease-out',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 14 }}>🔗 انضم لفريق</h3>
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
          placeholder="أدخل كود الدعوة"
          maxLength={6}
          style={{ width: '100%', padding: '11px 14px', border: `2px solid ${error ? '#fca5a5' : 'var(--border)'}`, borderRadius: 12, fontFamily: "'Cairo',sans-serif", fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', background: 'var(--bg-card-2)', direction: 'ltr', textAlign: 'center', letterSpacing: '0.15em', outline: 'none', marginBottom: error ? 6 : 16 }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, marginBottom: 12 }}>⚠️ {error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <JellyButton variant="primary" size="md" sound="click" fullWidth onClick={handleJoin}>انضم ✅</JellyButton>
          <JellyButton variant="dark"    size="md" sound="click" onClick={onClose} style={{ flex: 0.6 }}>إلغاء</JellyButton>
        </div>
      </div>
    </>
  );
});

// ── Main Tab ──────────────────────────────────────────────────────────────

const TeamChallengesTab = () => {
  const { user } = useAuth();
  const { state } = useGameState();
  const { userStats, avatarTheme } = state;
  const [modal,  setModal]  = useState(null);
  const [teams,  setTeams]  = useState(() => svc.getAllTeams());
  const [notify, setNotify] = useState('');

  const showNotify = (msg) => {
    setNotify(msg);
    setTimeout(() => setNotify(''), 3000);
  };

  const myTeamFor = useCallback((challengeId) => (
    teams.find((t) => t.challengeId === challengeId && t.members.some((m) => m.name === (userStats?.name || user?.name || 'Unknown')))
  ), [teams, userStats?.name, user?.name]);

  const handleCreateTeam = useCallback((teamName) => {
    svc.createTeam(modal.challenge.id, teamName, { name: userStats?.name || user?.name || 'Unknown', avatarBg: avatarTheme?.bg || '#1d6ed8' });
    setTeams(svc.getAllTeams());
    setModal(null);
    AudioManager.getInstance().play('win');
    showNotify(`🎉 تم إنشاء الفريق "${teamName}"! شارك كود الدعوة مع أصدقائك`);
  }, [modal, userStats, avatarTheme]);

  const handleJoinTeam = useCallback((team) => {
    const result = svc.joinTeam(team.teamId, { name: userStats?.name || user?.name || 'Unknown', avatarBg: avatarTheme?.bg || '#1d6ed8' });
    if (result.success) {
      setTeams(svc.getAllTeams());
      setModal(null);
      AudioManager.getInstance().play('win');
      showNotify(`🎉 انضممت للفريق "${team.name}" بنجاح!`);
    } else {
      showNotify(`⚠️ ${result.error}`);
      AudioManager.getInstance().play('error');
    }
  }, [userStats, avatarTheme]);

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 22, padding: '18px 24px', marginBottom: 16, boxShadow: 'var(--shadow-md)', textAlign: 'center', direction: 'rtl' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>👨‍👩‍👧 تحديات الفريق</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
          تعاون مع أصدقائك وأسرتك لإتمام التحديات الكبيرة معاً!
        </p>
      </div>

      {/* How-it-works */}
      <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #86efac', borderRadius: 16, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, direction: 'rtl' }}>
        <span style={{ fontSize: 26 }}>💡</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#166534' }}>كيف تعمل التحديات؟</div>
          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>أنشئ فريقاً ← شارك كود الدعوة ← أكملوا المهام المطلوبة ← احصلوا على مكافأة ضخمة معاً!</div>
        </div>
      </div>

      {/* Challenge cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {TEAM_CHALLENGES.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            myTeam={myTeamFor(challenge.id)}
            onCreateTeam={(c) => setModal({ type: 'create', challenge: c })}
            onJoinPrompt={(c) => setModal({ type: 'join', challenge: c })}
          />
        ))}
      </div>

      {/* Modals */}
      {modal?.type === 'create' && (
        <CreateTeamModal
          challenge={modal.challenge}
          userName={userStats?.name || user?.name || 'Unknown'}
          avatarBg={avatarTheme?.bg || '#1d6ed8'}
          onConfirm={handleCreateTeam}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'join' && (
        <JoinTeamModal onConfirm={handleJoinTeam} onClose={() => setModal(null)} />
      )}

      {notify && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-card)', borderRadius: 16, padding: '12px 24px',
          boxShadow: 'var(--shadow-lg)', fontFamily: "'Cairo',sans-serif",
          fontWeight: 900, fontSize: 14, color: 'var(--text-primary)',
          zIndex: 300, direction: 'rtl', border: '2px solid var(--border)',
          animation: 'popIn 0.3s ease-out', whiteSpace: 'nowrap',
        }}>{notify}</div>
      )}
    </div>
  );
};

export default memo(TeamChallengesTab);
