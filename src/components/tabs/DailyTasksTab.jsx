// src/components/tabs/DailyTasksTab.jsx
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import AudioManager from '../../services/AudioManager';

// ── Daily Tasks Data ──────────────────────────────────────────────────────

const DAILY_TASKS = [
  {
    id: 'dt_1',
    icon: '🌅',
    title: 'صلاة الفجر في وقتها',
    desc: 'ابدأ يومك بالصلاة في وقتها وستشعر بالبركة طوال اليوم.',
    category: 'روحاني',
    kp: 30,
    xp: 60,
    duration: '10 دقائق',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    id: 'dt_2',
    icon: '📖',
    title: 'قراءة ورد يومي من القرآن',
    desc: 'اقرأ صفحة أو أكثر من القرآن الكريم يومياً.',
    category: 'تعليم',
    kp: 40,
    xp: 80,
    duration: '15 دقيقة',
    color: '#0ea5e9',
    bg: '#f0f9ff',
  },
  {
    id: 'dt_3',
    icon: '🤝',
    title: 'مساعدة شخص واحد على الأقل',
    desc: 'ساعد شخصاً في حاجته سواء كانت صغيرة أو كبيرة.',
    category: 'خدمة',
    kp: 50,
    xp: 100,
    duration: '30 دقيقة',
    color: '#22c55e',
    bg: '#f0fdf4',
  },
  {
    id: 'dt_4',
    icon: '💧',
    title: 'شرب 8 أكواب ماء',
    desc: 'حافظ على صحتك بشرب كميتك اليومية من الماء.',
    category: 'صحة',
    kp: 20,
    xp: 40,
    duration: 'طوال اليوم',
    color: '#38bdf8',
    bg: '#f0f9ff',
  },
  {
    id: 'dt_5',
    icon: '🏃',
    title: 'تمرين رياضي خفيف',
    desc: 'مشي أو تمارين بسيطة لمدة 20 دقيقة على الأقل.',
    category: 'صحة',
    kp: 35,
    xp: 70,
    duration: '20 دقيقة',
    color: '#f97316',
    bg: '#fff7ed',
  },
  {
    id: 'dt_6',
    icon: '😊',
    title: 'ابتسم لثلاثة أشخاص',
    desc: 'الابتسامة صدقة. أضف البهجة لمن حولك.',
    category: 'اجتماعي',
    kp: 15,
    xp: 30,
    duration: 'لحظات',
    color: '#ec4899',
    bg: '#fdf2f8',
  },
  {
    id: 'dt_7',
    icon: '📝',
    title: 'كتابة 3 أشياء تشكر عليها',
    desc: 'سجّل في دفترك ثلاثة أشياء جميلة حدثت اليوم.',
    category: 'تطوير',
    kp: 25,
    xp: 50,
    duration: '5 دقائق',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
];

// ── Notification Sounds ───────────────────────────────────────────────────

const NOTIFICATION_SOUNDS = [
  {
    id: 'gentle',
    label: 'رقيق',
    emoji: '🎵',
    desc: 'نغمة هادئة',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('open');
    },
  },
  {
    id: 'cheerful',
    label: 'مبهج',
    emoji: '🎶',
    desc: 'نغمة مرحة',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('win');
    },
  },
  {
    id: 'alert',
    label: 'تنبيه',
    emoji: '🔔',
    desc: 'نغمة تنبيه',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('click');
      setTimeout(() => am.play('click'), 200);
      setTimeout(() => am.play('click'), 400);
    },
  },
  {
    id: 'reward',
    label: 'مكافأة',
    emoji: '⭐',
    desc: 'نغمة احتفالية',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('reward');
    },
  },
  {
    id: 'levelup',
    label: 'إنجاز',
    emoji: '🏆',
    desc: 'نغمة إنجاز',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('levelUp');
    },
  },
  {
    id: 'soft',
    label: 'ناعم',
    emoji: '🌙',
    desc: 'نغمة ناعمة',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('nav');
      setTimeout(() => am.play('nav'), 300);
    },
  },
];

// ── Tips Data ─────────────────────────────────────────────────────────────

const CHAIN_TIPS = [
  {
    emoji: '⏰',
    title: 'حدد وقتاً ثابتاً',
    desc: 'خصص وقتاً محدداً كل يوم لإنجاز مهامك اليومية.',
  },
  {
    emoji: '🎯',
    title: 'ابدأ بالأسهل',
    desc: 'أنجز المهام السهلة أولاً لتحفيز نفسك على إكمال الباقي.',
  },
  {
    emoji: '🔔',
    title: 'فعّل التذكير اليومي',
    desc: 'اضبط إشعاراً يومياً حتى لا تنسى مهامك وتحافظ على سلسلتك.',
  },
  {
    emoji: '🤝',
    title: 'شارك صديقاً',
    desc: 'تحدى صديقاً على إكمال المهام اليومية معاً لتحفيز بعضكما.',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

const getTodayKey = () => new Date().toISOString().split('T')[0];

const loadDoneToday = () => {
  try {
    const raw = localStorage.getItem('dt_done_' + getTodayKey());
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
};

const saveDoneToday = (set) => {
  try {
    localStorage.setItem('dt_done_' + getTodayKey(), JSON.stringify([...set]));
  } catch {}
};

const loadRewardClaimed = () => {
  try {
    return localStorage.getItem('dt_reward_claimed_' + getTodayKey()) === '1';
  } catch {
    return false;
  }
};

const saveRewardClaimed = () => {
  try {
    localStorage.setItem('dt_reward_claimed_' + getTodayKey(), '1');
  } catch {}
};

const loadStreak = () => {
  try { return parseInt(localStorage.getItem('dt_streak') || '0', 10); } catch { return 0; }
};

const saveStreak = (n) => {
  try { localStorage.setItem('dt_streak', String(n)); } catch {}
};

const loadReminderSettings = () => {
  try {
    const raw = localStorage.getItem('dt_reminder');
    return raw ? JSON.parse(raw) : { time: '08:00', sound: 'gentle', enabled: false };
  } catch { return { time: '08:00', sound: 'gentle', enabled: false }; }
};

const saveReminderSettings = (s) => {
  try { localStorage.setItem('dt_reminder', JSON.stringify(s)); } catch {}
};

const RESPONSIVE_CSS = `
  .dt-tab {
    padding: 24px 24px 40px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .dt-reward-panel {
    padding: 18px;
  }
  .dt-task-card {
    min-height: auto;
  }
  .dt-chain-links,
  .dt-chain-stats,
  .dt-form-row,
  .dt-sound-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .dt-form-group {
    min-width: 240px;
  }
  @media (max-width: 900px) {
    .dt-tab {
      padding: 18px 16px 32px;
    }
    .dt-chain-links,
    .dt-chain-stats,
    .dt-form-row,
    .dt-sound-grid {
      flex-direction: column;
      align-items: stretch;
    }
    .dt-form-group {
      min-width: auto;
      width: 100%;
    }
    .dt-task-card {
      padding: 18px 16px;
    }
  }
  @media (max-width: 640px) {
    .dt-tab {
      padding: 14px 12px 28px;
    }
    .dt-section-title {
      font-size: 16px;
    }
    .dt-progress-card__row {
      flex-direction: column;
      align-items: stretch;
    }
    .dt-task-card {
      padding: 16px 14px;
    }
    .dt-reward-panel {
      padding: 14px;
    }
  }
`;

// ── Achievement Chain Card ────────────────────────────────────────────────

const AchievementChainCard = memo(({ streak, totalDone, todayDone, totalTasks }) => {
  // Build 7-day chain display
  const days = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
  const today = new Date().getDay();

  const chainDays = Array.from({ length: 7 }, (_, i) => {
    const dayIdx = (today - 6 + i + 7) % 7;
    const isPast = i < 6;
    const isToday = i === 6;
    const isDone = isPast ? i < streak : todayDone === totalTasks;
    return { label: days[dayIdx], isDone, isToday };
  });

  const bestStreak = Math.max(streak, parseInt(localStorage.getItem('dt_best_streak') || '0', 10));

  return (
    <div className="dt-chain-card">
      <div className="dt-chain-card__header">
        <div>
          <div className="dt-chain-card__title">🔗 سلسلة الإنجازات</div>
          <div className="dt-chain-card__subtitle">حافظ على سلسلتك اليومية</div>
        </div>
        <div className="dt-chain-card__badge">🏆 أفضل: {bestStreak} يوم</div>
      </div>

      {/* Streak counter */}
      <div className="dt-streak-row">
        <span className="dt-streak-fire">🔥</span>
        <div style={{ textAlign: 'center' }}>
          <div className="dt-streak-num">{streak}</div>
          <div className="dt-streak-label">يوم متتالي</div>
        </div>
        <span className="dt-streak-fire">🔥</span>
      </div>

      {/* 7-day chain */}
      <div className="dt-chain-links">
        {chainDays.map((day, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className={`dt-chain-connector${day.isDone ? '' : ' dt-chain-connector--future'}`} />
            )}
            <div
              className={`dt-chain-link ${
                day.isDone ? 'dt-chain-link--done' :
                day.isToday ? 'dt-chain-link--today' :
                'dt-chain-link--future'
              }`}
              title={day.label}
            >
              {day.isDone ? '✓' : day.isToday ? '●' : day.label.charAt(0)}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Stats */}
      <div className="dt-chain-stats">
        <div className="dt-chain-stat">
          <span className="dt-chain-stat__val">{streak}</span>
          <span className="dt-chain-stat__lbl">السلسلة الحالية</span>
        </div>
        <div className="dt-chain-stat">
          <span className="dt-chain-stat__val">{bestStreak}</span>
          <span className="dt-chain-stat__lbl">أطول سلسلة</span>
        </div>
        <div className="dt-chain-stat">
          <span className="dt-chain-stat__val">{totalDone}</span>
          <span className="dt-chain-stat__lbl">إجمالي المهام</span>
        </div>
      </div>
    </div>
  );
});

// ── Daily Progress Card ───────────────────────────────────────────────────

const DailyProgressCard = memo(({ done, total }) => {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const msgs = [
    'ابدأ يومك بخطوة صغيرة! 💪',
    'رائع! استمر في التقدم! 🚀',
    'أكثر من النصف! أنت بطل! ⭐',
    'تقريباً انتهيت! لا تتوقف! 🔥',
    '🎉 أكملت كل مهامك اليوم! أحسنت!',
  ];
  const msgIdx = done === 0 ? 0 : done === total ? 4 : done <= total * 0.25 ? 1 : done <= total * 0.5 ? 2 : 3;

  return (
    <div className="dt-progress-card">
      <div className="dt-progress-card__row">
        <span className="dt-progress-card__title">📊 تقدم اليوم</span>
        <span className="dt-progress-card__count">{done}/{total} مهمة</span>
      </div>
      <div className="dt-progress-bar">
        <div className="dt-progress-bar__fill" style={{ width: `${Math.max(pct, done > 0 ? 8 : 0)}%` }} />
      </div>
      <div className="dt-progress-card__msg">{msgs[msgIdx]}</div>
    </div>
  );
});

// ── Task Card ─────────────────────────────────────────────────────────────

const DailyTaskCard = memo(({ task, done, onToggle, animDelay }) => (
  <div
    className={`dt-task-card${done ? ' dt-task-card--done' : ''}`}
    style={{ animationDelay: `${animDelay}s` }}
    onClick={() => onToggle(task)}
  >
    <div className={`dt-task-card__icon-wrap ${done ? 'dt-task-card__icon-wrap--done' : 'dt-task-card__icon-wrap--pending'}`}>
      {done ? '✅' : task.icon}
    </div>
    <div className="dt-task-card__body">
      <div className={`dt-task-card__title${done ? ' dt-task-card__title--done' : ''}`}>
        {task.title}
      </div>
      <div className="dt-task-card__desc">{task.desc}</div>
      <div className="dt-task-card__chips">
        <span className="dt-task-chip dt-task-chip--kp">⭐ {task.kp} KP</span>
        <span className="dt-task-chip dt-task-chip--xp">🔷 {task.xp} XP</span>
        <span className="dt-task-chip dt-task-chip--time">⏱️ {task.duration}</span>
        <span className="dt-task-chip dt-task-chip--cat">{task.category}</span>
      </div>
      {done && <div className="dt-task-progress"><div className="dt-task-progress__fill" style={{ width: '100%' }} /></div>}
    </div>
    <div className={`dt-task-card__check${done ? ' dt-task-card__check--done' : ''}`}>
      {done ? '✓' : '○'}
    </div>
  </div>
));

// ── Tips Card ─────────────────────────────────────────────────────────────

const MaintainChainCard = memo(() => (
  <div className="dt-tips-card">
    <div className="dt-tips-card__header">
      <span className="dt-tips-card__icon">🔗</span>
      <div>
        <div className="dt-tips-card__title">كيف تحافظ على سلسلتك؟</div>
        <div className="dt-tips-card__subtitle">نصائح ذهبية للاستمرارية</div>
      </div>
    </div>
    <div className="dt-tips-list">
      {CHAIN_TIPS.map((tip, i) => (
        <div key={i} className="dt-tip-item">
          <span className="dt-tip-item__emoji">{tip.emoji}</span>
          <div>
            <div className="dt-tip-item__title">{tip.title}</div>
            <div className="dt-tip-item__desc">{tip.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

// ── Reminder Card ─────────────────────────────────────────────────────────

const ReminderCard = memo(() => {
  const [settings, setSettings] = useState(loadReminderSettings);
  const [saved,    setSaved]    = useState(false);
  const timerRef = useRef(null);

  const handleSoundSelect = useCallback((soundId) => {
    AudioManager.getInstance().unlock();
    const sound = NOTIFICATION_SOUNDS.find(s => s.id === soundId);
    sound?.play();
    setSettings(prev => ({ ...prev, sound: soundId }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('win');

    const newSettings = { ...settings, enabled: true };
    saveReminderSettings(newSettings);
    setSaved(true);

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Schedule reminder using setTimeout (for current session)
    if (timerRef.current) clearTimeout(timerRef.current);

    const [h, m] = settings.time.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target - now;
    timerRef.current = setTimeout(() => {
      // Play selected sound
      const sound = NOTIFICATION_SOUNDS.find(s => s.id === settings.sound);
      AudioManager.getInstance().unlock();
      sound?.play();

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🌟 مدينة العطاء — تذكير يومي', {
          body: 'حان وقت إنجاز مهامك اليومية! لا تكسر سلسلتك 🔗🔥',
          icon: '/favicon.ico',
        });
      }
    }, delay);

    setTimeout(() => setSaved(false), 3000);
  }, [settings]);

  return (
    <div className="dt-reminder-card">
      <div className="dt-reminder-card__header">
        <span className="dt-reminder-card__bell">🔔</span>
        <div>
          <div className="dt-reminder-card__title">إشعار التذكير اليومي</div>
          <div className="dt-reminder-card__subtitle">اختر وقت التذكير ونغمته المفضلة</div>
        </div>
      </div>

      <div className="dt-reminder-form">
        {/* Time & Date row */}
        <div className="dt-form-row">
          <div className="dt-form-group">
            <label className="dt-form-label">⏰ وقت التذكير</label>
            <input
              type="time"
              className="dt-form-input"
              value={settings.time}
              onChange={e => { setSettings(p => ({ ...p, time: e.target.value })); setSaved(false); }}
            />
          </div>
          <div className="dt-form-group">
            <label className="dt-form-label">📅 يبدأ من تاريخ</label>
            <input
              type="date"
              className="dt-form-input"
              value={settings.date || new Date().toISOString().split('T')[0]}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => { setSettings(p => ({ ...p, date: e.target.value })); setSaved(false); }}
            />
          </div>
        </div>

        {/* Sound selector */}
        <div>
          <div className="dt-form-label" style={{ marginBottom: 8 }}>🎵 اختر نغمة التذكير</div>
          <div className="dt-sound-grid">
            {NOTIFICATION_SOUNDS.map(sound => (
              <button
                key={sound.id}
                className={`dt-sound-btn${settings.sound === sound.id ? ' dt-sound-btn--active' : ''}`}
                onClick={() => handleSoundSelect(sound.id)}
              >
                <span className="dt-sound-btn__play">▶</span>
                <span>{sound.emoji} {sound.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          className={`dt-save-btn${saved ? ' dt-save-btn--saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? '✅ تم حفظ التذكير!' : '💾 حفظ وتفعيل التذكير'}
        </button>

        {/* Saved confirmation */}
        {saved && (
          <div className="dt-saved-msg">
            <span>🔔</span>
            <span>سيتم تذكيرك يومياً الساعة {settings.time} بنغمة {NOTIFICATION_SOUNDS.find(s => s.id === settings.sound)?.label}</span>
          </div>
        )}

        {/* Permission hint */}
        {'Notification' in window && Notification.permission === 'denied' && (
          <div style={{
            background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12,
            padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#b91c1c',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <span>⚠️</span>
            <span>الإشعارات محظورة في المتصفح. فعّلها من إعدادات المتصفح للحصول على التذكيرات.</span>
          </div>
        )}
      </div>
    </div>
  );
});

// ── Task Completion Celebration ───────────────────────────────────────────

const AllDoneCelebration = memo(() => (
  <div style={{
    background: 'linear-gradient(135deg, #fef9c3, #fef3c7)',
    border: '2px solid #fbbf24',
    borderRadius: 20,
    padding: '18px 20px',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    animation: 'dtPop 0.4s ease-out',
    boxShadow: '0 6px 20px rgba(251,191,36,0.3)',
  }}>
    <span style={{ fontSize: 36, animation: 'dtBounce 1s ease-in-out infinite' }}>🏆</span>
    <div>
      <div style={{ fontSize: 15, fontWeight: 900, color: '#92400e' }}>أكملت كل مهامك اليوم!</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#b45309', marginTop: 2 }}>
        سلسلتك تزداد قوة! استمر غداً للحفاظ عليها 🔥
      </div>
    </div>
  </div>
));

// ── Main Tab ──────────────────────────────────────────────────────────────

const DailyTasksTab = () => {
  const [doneIds,  setDoneIds]  = useState(loadDoneToday);
  const [streak,   setStreak]   = useState(loadStreak);
  const [rewardClaimed, setRewardClaimed] = useState(loadRewardClaimed);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevDoneCount = useRef(doneIds.size);

  const totalTasks = DAILY_TASKS.length;
  const doneCount  = doneIds.size;
  const todayXp   = DAILY_TASKS.filter((task) => doneIds.has(task.id)).reduce((sum, task) => sum + task.xp, 0);
  const todayKp   = DAILY_TASKS.filter((task) => doneIds.has(task.id)).reduce((sum, task) => sum + task.kp, 0);

  // Load total done from localStorage
  const [totalDone, setTotalDone] = useState(() => {
    try { return parseInt(localStorage.getItem('dt_total_done') || '0', 10); } catch { return 0; }
  });

  // Update streak when all tasks done
  useEffect(() => {
    if (doneCount === totalTasks && prevDoneCount.current < totalTasks) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      saveStreak(newStreak);
      // Update best streak
      const best = parseInt(localStorage.getItem('dt_best_streak') || '0', 10);
      if (newStreak > best) localStorage.setItem('dt_best_streak', String(newStreak));
      setShowCelebration(true);
      AudioManager.getInstance().play('levelUp');
      setTimeout(() => setShowCelebration(false), 5000);
    }
    prevDoneCount.current = doneCount;
  }, [doneCount, totalTasks, streak]);

  const handleToggle = useCallback((task) => {
    AudioManager.getInstance().unlock();
    setDoneIds(prev => {
      const next = new Set(prev);
      if (next.has(task.id)) {
        next.delete(task.id);
        AudioManager.getInstance().play('click');
      } else {
        next.add(task.id);
        AudioManager.getInstance().play('win');
        // Update total done
        setTotalDone(t => {
          const newTotal = t + 1;
          try { localStorage.setItem('dt_total_done', String(newTotal)); } catch {}
          return newTotal;
        });
      }
      saveDoneToday(next);
      return next;
    });
  }, []);

  const handleClaimReward = useCallback(() => {
    if (rewardClaimed || doneCount === 0) return;
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('reward');
    saveRewardClaimed();
    setRewardClaimed(true);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  }, [doneCount, rewardClaimed]);

  return (
    <div className="dt-tab">
      <style>{RESPONSIVE_CSS}</style>

      {/* ── Achievement Chain Card ── */}
      <AchievementChainCard
        streak={streak}
        totalDone={totalDone}
        todayDone={doneCount}
        totalTasks={totalTasks}
      />

      {/* ── Daily Progress ── */}
      <DailyProgressCard done={doneCount} total={totalTasks} />

      {/* ── All Done Celebration ── */}
      {showCelebration && <AllDoneCelebration />}

      {/* ── Daily Reward Summary ── */}
      <div className="dt-reward-panel" style={{ display: 'grid', gap: 12, marginBottom: 18, padding: 18, borderRadius: 24, background: '#f8fafc', border: '1px solid rgba(148,163,184,0.24)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900 }}>🎁 مكافأتك اليومية</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>جمع النقاط وأكمل المهام لتحصل على XP و KP.</div>
          </div>
          <button
            type="button"
            onClick={handleClaimReward}
            disabled={rewardClaimed || doneCount === 0}
            style={{
              border: 'none',
              borderRadius: 16,
              padding: '12px 18px',
              fontSize: 14,
              fontWeight: 900,
              cursor: rewardClaimed || doneCount === 0 ? 'not-allowed' : 'pointer',
              background: rewardClaimed ? '#94a3b8' : '#2563eb',
              color: '#fff',
              minWidth: 170,
            }}
          >
            {rewardClaimed ? '✅ تمت المطالبة' : `Claim ${todayXp} XP / ${todayKp} KP`}
          </button>
        </div>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
          <div style={{ padding: 14, borderRadius: 18, background: '#fff', border: '1px solid rgba(148,163,184,0.18)' }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 800 }}>نقاط XP اليوم</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 900 }}>{todayXp}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 18, background: '#fff', border: '1px solid rgba(148,163,184,0.18)' }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 800 }}>نقاط KP اليوم</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 900 }}>{todayKp}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 18, background: '#fff', border: '1px solid rgba(148,163,184,0.18)' }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 800 }}>الحالة</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 900 }}>{doneCount === totalTasks ? 'مكتمل' : 'قيد الإنجاز'}</div>
          </div>
        </div>
      </div>

      {/* ── Daily Tasks ── */}
      <div className="dt-section-title">
        <span>✅</span> مهام اليوم ({doneCount}/{totalTasks})
      </div>

      {DAILY_TASKS.map((task, i) => (
        <DailyTaskCard
          key={task.id}
          task={task}
          done={doneIds.has(task.id)}
          onToggle={handleToggle}
          animDelay={i * 0.06}
        />
      ))}

      {/* ── Maintain Chain Tips ── */}
      <MaintainChainCard />

      {/* ── Reminder Card ── */}
      <div className="dt-section-title" style={{ marginTop: 4 }}>
        <span>🔔</span> إشعار التذكير اليومي
      </div>
      <ReminderCard />

      {/* ── Bottom padding ── */}
      <div style={{ height: 20 }} />
    </div>
  );
};

export default memo(DailyTasksTab);
