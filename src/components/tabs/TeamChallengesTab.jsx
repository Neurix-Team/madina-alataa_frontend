import React, { useState, useCallback, memo } from 'react';
import TeamService from '../../services/TeamService';
import TEAM_CHALLENGES from '../../data/teamChallengesData';
import AudioManager from '../../services/AudioManager';
import JellyButton from '../common/JellyButton';
import { useAuth } from '../../hooks/useAuth';
import useGameState from '../../hooks/useGameState';

import {
  FaUsers,
  FaLink,
  FaCheckCircle,
  FaCrown,
  FaStar,
  FaTrophy,
  FaPlusCircle,
  FaSignInAlt,
  FaInfoCircle,
  FaShieldAlt,
  FaHandsHelping,
  FaLeaf,
  FaSchool,
  FaHospital,
  FaHome,
  FaCode,
} from 'react-icons/fa';
import {
  FiUsers,
  FiTarget,
  FiBarChart2,
} from 'react-icons/fi';

const svc = TeamService.getInstance();

const TEAM_CSS = `
  .tc-tab {
    direction: rtl;
    display: grid;
    gap: 16px;
    font-family: 'Cairo', sans-serif;
    color: var(--text-primary);
  }

  .tc-header {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    padding: 28px 32px;
    box-shadow: var(--shadow-lg);
    text-align: center;
  }
  .tc-header__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card-2);
    color: var(--primary);
    font-size: 24px;
    box-shadow: var(--shadow-sm);
  }

  .tc-header__title {
    font-size: 24px;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .tc-header__subtitle {
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 700;
  }

  .tc-info {
    background: var(--success-light);
    border: 1.5px solid var(--success);
    border-radius: 18px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: var(--shadow-sm);
  }

  .tc-info__icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: var(--bg-card);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--success);
    font-size: 22px;
    flex-shrink: 0;
  }

  .tc-info__title {
    font-size: 13px;
    font-weight: 900;
    color: var(--success);
    margin-bottom: 2px;
  }

  .tc-info__desc {
    font-size: 12px;
    color: var(--success);
    font-weight: 700;
    line-height: 1.7;
    opacity: 0.9;
  }

  .tc-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tc-card {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    direction: rtl;
    border: 1px solid var(--glass-border);
  }

  .tc-card__topline {
    height: 6px;
  }

  .tc-card__body {
    padding: 18px 20px;
  }

  .tc-card__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .tc-card__icon {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    flex-shrink: 0;
    background: var(--bg-card-2);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    font-size: 24px;
    box-shadow: var(--shadow-sm);
  }

  .tc-card__title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .tc-card__title {
    font-size: 15px;
    font-weight: 900;
    color: var(--text-primary);
  }

  .tc-card__desc {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 700;
    margin-top: 4px;
    line-height: 1.7;
  }

  .tc-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 900;
    padding: 6px 10px;
    border-radius: 999px;
  }

  .tc-chip--members {
    background: var(--bg-card);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }

  .tc-chip--kp {
    background: var(--success-light);
    color: var(--success);
    border: 1px solid var(--success);
  }

  .tc-chip--xp {
    background: var(--primary-hover);
    color: #fff;
  }

  .tc-team-box {
    margin-bottom: 14px;
    background: var(--bg-card);
    border-radius: 16px;
    padding: 12px 14px;
    border: 1.5px solid var(--border);
  }

  .tc-team-box__row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    gap: 10px;
  }

  .tc-team-box__label {
    font-size: 12px;
    font-weight: 900;
    color: var(--text-primary);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .tc-team-box__value {
    font-size: 12px;
    font-weight: 900;
    color: var(--text-primary);
  }

  .tc-progress {
    height: 8px;
    background: var(--border);
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .tc-progress__fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.8s ease-out;
  }

  .tc-members {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tc-member {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-card-2);
    border-radius: 999px;
    padding: 5px 10px;
    border: 1.5px solid var(--border);
    font-size: 12px;
    color: var(--text-primary);
  }

  .tc-member__avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tc-member__name {
    font-weight: 800;
    color: var(--text-primary);
  }

  .tc-complete-badge {
    margin-top: 10px;
    background: linear-gradient(135deg, var(--success), #22c55e);
    color: #fff;
    border-radius: 12px;
    padding: 8px 14px;
    text-align: center;
    font-weight: 900;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    width: 100%;
  }

  .tc-invite {
    margin-top: 8px;
    background: var(--success-light);
    border-radius: 12px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border: 1px solid var(--success);
  }

  .tc-invite__label {
    font-size: 11px;
    color: var(--success);
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .tc-invite__code {
    font-size: 14px;
    font-weight: 900;
    color: var(--success);
    letter-spacing: 0.1em;
  }

  .tc-actions {
    display: flex;
    gap: 10px;
  }

  .tc-note {
    text-align: center;
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 700;
  }

  .tc-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
    z-index: 100;
  }

  .tc-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-radius: 24px;
    padding: 28px 26px;
    max-width: 340px;
    width: 90%;
    z-index: 110;
    direction: rtl;
    box-shadow: var(--shadow-lg);
    animation: tcPop 0.3s ease-out;
    border: 1.5px solid var(--glass-border);
  }

  .tc-modal__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .tc-modal__desc {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 700;
    margin-bottom: 16px;
  }

  .tc-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    font-family: 'Cairo', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: var(--text-primary);
    background: var(--input-bg);
    outline: none;
    margin-bottom: 16px;
  }

  .tc-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
  }

  .tc-toast {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-radius: 16px;
    padding: 12px 24px;
    box-shadow: var(--shadow-lg);
    font-family: 'Cairo', sans-serif;
    font-weight: 900;
    font-size: 14px;
    color: var(--text-primary);
    z-index: 300;
    direction: rtl;
    border: 2px solid var(--glass-border);
    animation: tcPop 0.3s ease-out;
    white-space: nowrap;
  }

  @keyframes tcPop {
    0% { opacity: 0; transform: translate(-50%,-50%) scale(0.95); }
    100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  }
`;

const DIFF_TONE = {
  'صعب جداً': { bg: '#fce7f3', color: '#9d174d' },
  صعب: { bg: '#fee2e2', color: '#b91c1c' },
  متوسط: { bg: '#fef9c3', color: '#854d0e' },
  سهل: { bg: '#dcfce7', color: '#15803d' },
};

const getChallengeIcon = (challenge) => {
  const text = `${challenge?.title || ''} ${challenge?.desc || ''}`.toLowerCase();

  if (text.includes('بيئة') || text.includes('تشجير')) return FaLeaf;
  if (text.includes('مدرس') || text.includes('تعليم')) return FaSchool;
  if (text.includes('مستشفى') || text.includes('مرض')) return FaHospital;
  if (text.includes('حي') || text.includes('منزل') || text.includes('سكن')) return FaHome;
  if (text.includes('خدمة') || text.includes('دعم')) return FaHandsHelping;

  return FaUsers;
};

const ChallengeCard = memo(({ challenge, myTeam, onCreateTeam, onJoinPrompt }) => {
  const progress = myTeam ? svc.getTeamProgress(myTeam) : null;
  const tone = DIFF_TONE[challenge.difficulty] || DIFF_TONE['متوسط'];
  const ChallengeIcon = getChallengeIcon(challenge);

  return (
    <div className="tc-card">
      <div
        className="tc-card__topline"
        style={{ background: `linear-gradient(90deg,${challenge.color},${challenge.color}88)` }}
      />

      <div className="tc-card__body">
        <div className="tc-card__header">
          <div className="tc-card__icon">
            <ChallengeIcon />
          </div>

          <div style={{ flex: 1 }}>
            <div className="tc-card__title-row">
              <span className="tc-card__title">{challenge.title}</span>
              <span
                className="tc-chip"
                style={{
                  background: tone.bg,
                  color: tone.color,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {challenge.difficulty}
              </span>
            </div>

            <p className="tc-card__desc">{challenge.desc}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="tc-chip tc-chip--members">
            <FiUsers />
            <span>{challenge.requiredMembers} أعضاء</span>
          </span>

          <span className="tc-chip tc-chip--kp">
            <FaStar />
            <span>{challenge.rewardKP} KP</span>
          </span>

          <span className="tc-chip tc-chip--xp">
            <FiTarget />
            <span>{challenge.rewardXP} XP</span>
          </span>
        </div>

        {myTeam && progress && (
          <div className="tc-team-box">
            <div className="tc-team-box__row">
              <span className="tc-team-box__label">
                <FiBarChart2 />
                <span>تقدم الفريق: {myTeam.name}</span>
              </span>
              <span className="tc-team-box__value" style={{ color: challenge.color }}>
                {progress.completed}/{progress.total}
              </span>
            </div>

            <div className="tc-progress">
              <div
                className="tc-progress__fill"
                style={{
                  width: `${progress.percent}%`,
                  background: `linear-gradient(90deg,${challenge.color},${challenge.color}bb)`,
                }}
              />
            </div>

            <div className="tc-members">
              {myTeam.members.map((m) => (
                <div key={m.name} className="tc-member">
                  <div
                    className="tc-member__avatar"
                    style={{ background: `#${m.avatarBg ?? '00bcd4'}` }}
                  />
                  <span className="tc-member__name">{m.name}</span>
                  {m.isLeader && <FaCrown style={{ fontSize: 10, color: '#f59e0b' }} />}
                </div>
              ))}
            </div>

            {myTeam.completed && (
              <div className="tc-complete-badge">
                <FaTrophy />
                <span>تهانينا! أتممتم التحدي — اللقب: {challenge.rewardTitle}</span>
              </div>
            )}

            <div className="tc-invite">
              <span className="tc-invite__label">
                <FaCode />
                <span>كود الدعوة</span>
              </span>
              <span className="tc-invite__code">{svc.getInviteCode(myTeam.teamId)}</span>
            </div>
          </div>
        )}

        {!myTeam ? (
          <div className="tc-actions">
            <JellyButton
              variant="primary"
              size="sm"
              sound="click"
              onClick={() => onCreateTeam(challenge)}
              style={{ flex: 1 }}
            >
              <FaPlusCircle />
              <span>إنشاء فريق</span>
            </JellyButton>

            <JellyButton
              variant="dark"
              size="sm"
              sound="click"
              onClick={() => onJoinPrompt(challenge)}
              style={{ flex: 1 }}
            >
              <FaLink />
              <span>انضم بكود</span>
            </JellyButton>
          </div>
        ) : !myTeam.completed ? (
          <div className="tc-note">
            أكملوا المهام المطلوبة من قائمة المهام لتقدم الفريق.
          </div>
        ) : null}
      </div>
    </div>
  );
});

const CreateTeamModal = memo(({ challenge, userName, onConfirm, onClose }) => {
  const [teamName, setTeamName] = useState(`فريق ${userName}`);
  const ChallengeIcon = getChallengeIcon(challenge);

  return (
    <>
      <div className="tc-modal-overlay" onClick={onClose} />
      <div className="tc-modal">
        <h3 className="tc-modal__title">
          <ChallengeIcon />
          <span>إنشاء فريق جديد</span>
        </h3>

        <p className="tc-modal__desc">{challenge.title}</p>

        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="اسم الفريق"
          className="tc-input"
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <JellyButton
            variant="primary"
            size="md"
            sound="win"
            fullWidth
            onClick={() => onConfirm(teamName)}
          >
            <FaPlusCircle />
            <span>إنشاء</span>
          </JellyButton>

          <JellyButton
            variant="dark"
            size="md"
            sound="click"
            onClick={onClose}
            style={{ flex: 0.6 }}
          >
            إلغاء
          </JellyButton>
        </div>
      </div>
    </>
  );
});

const JoinTeamModal = memo(({ onConfirm, onClose }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    const team = svc.findByInviteCode(code);
    if (!team) {
      setError('كود غير صحيح');
      AudioManager.getInstance().play('error');
      return;
    }
    onConfirm(team);
  };

  return (
    <>
      <div className="tc-modal-overlay" onClick={onClose} />
      <div className="tc-modal">
        <h3 className="tc-modal__title">
          <FaLink />
          <span>الانضمام إلى فريق</span>
        </h3>

        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          placeholder="أدخل كود الدعوة"
          maxLength={6}
          className="tc-input"
          style={{
            direction: 'ltr',
            textAlign: 'center',
            letterSpacing: '0.15em',
            borderColor: error ? '#fca5a5' : 'rgba(226,232,240,0.9)',
          }}
        />

        {error && (
          <p
            style={{
              color: '#ef4444',
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FaInfoCircle />
            <span>{error}</span>
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <JellyButton variant="primary" size="md" sound="click" fullWidth onClick={handleJoin}>
            <FaSignInAlt />
            <span>انضم</span>
          </JellyButton>

          <JellyButton
            variant="dark"
            size="md"
            sound="click"
            onClick={onClose}
            style={{ flex: 0.6 }}
          >
            إلغاء
          </JellyButton>
        </div>
      </div>
    </>
  );
});

const TeamChallengesTab = () => {
  const { user } = useAuth();
  const { state } = useGameState();
  const { userStats, avatarTheme } = state;

  const [modal, setModal] = useState(null);
  const [teams, setTeams] = useState(() => svc.getAllTeams());
  const [notify, setNotify] = useState('');

  const showNotify = (msg) => {
    setNotify(msg);
    setTimeout(() => setNotify(''), 3000);
  };

  const myTeamFor = useCallback(
    (challengeId) =>
      teams.find(
        (t) =>
          t.challengeId === challengeId &&
          t.members.some((m) => m.name === (userStats?.name || user?.name || 'Unknown'))
      ),
    [teams, userStats?.name, user?.name]
  );

  const handleCreateTeam = useCallback(
    (teamName) => {
      svc.createTeam(modal.challenge.id, teamName, {
        name: userStats?.name || user?.name || 'Unknown',
        avatarBg: avatarTheme?.bg || '#1d6ed8',
      });

      setTeams(svc.getAllTeams());
      setModal(null);
      AudioManager.getInstance().play('win');
      showNotify(`تم إنشاء الفريق "${teamName}" بنجاح`);
    },
    [modal, userStats, user, avatarTheme]
  );

  const handleJoinTeam = useCallback(
    (team) => {
      const result = svc.joinTeam(team.teamId, {
        name: userStats?.name || user?.name || 'Unknown',
        avatarBg: avatarTheme?.bg || '#1d6ed8',
      });

      if (result.success) {
        setTeams(svc.getAllTeams());
        setModal(null);
        AudioManager.getInstance().play('win');
        showNotify(`انضممت للفريق "${team.name}" بنجاح`);
      } else {
        showNotify(result.error);
        AudioManager.getInstance().play('error');
      }
    },
    [userStats, user, avatarTheme]
  );

  return (
    <div className="tc-tab">
      <style>{TEAM_CSS}</style>

      <div className="tc-header">
        <div className="tc-header__icon">
          <FaUsers />
        </div>
        <div className="tc-header__title">تحديات الفريق</div>
        <div className="tc-header__subtitle">
          تعاون مع أصدقائك وأسرتك لإتمام التحديات الكبيرة معًا
        </div>
      </div>

      <div className="tc-info">
        <span className="tc-info__icon">
          <FaInfoCircle />
        </span>
        <div>
          <div className="tc-info__title">كيف تعمل التحديات الجماعية؟</div>
          <div className="tc-info__desc">
            أنشئ فريقًا، شارك كود الدعوة، أكملوا المهام المطلوبة، ثم احصلوا على المكافأة واللقب معًا.
          </div>
        </div>
      </div>

      <div className="tc-list">
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

      {modal?.type === 'create' && (
        <CreateTeamModal
          challenge={modal.challenge}
          userName={userStats?.name || user?.name || 'Unknown'}
          onConfirm={handleCreateTeam}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'join' && (
        <JoinTeamModal onConfirm={handleJoinTeam} onClose={() => setModal(null)} />
      )}

      {notify && <div className="tc-toast">{notify}</div>}
    </div>
  );
};

export default memo(TeamChallengesTab);
