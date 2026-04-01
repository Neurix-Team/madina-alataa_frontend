// src/components/tabs/CityExplorationTab.jsx
import React, { useState, useCallback, memo, useMemo, useEffect, useRef } from 'react';
import CITY_LOCATIONS from '../../data/cityExplorationData';
import AudioManager from '../../services/AudioManager';

// ── helpers ───────────────────────────────────────────────────────────────

const DIFF_CLASS = {
  'سهل':      'ce-task-chip--diff-easy',
  'متوسط':    'ce-task-chip--diff-medium',
  'صعب':      'ce-task-chip--diff-hard',
  'صعب جداً': 'ce-task-chip--diff-vhard',
};

// Simulated AI-generated tasks pool per location type
const AI_TASK_POOL = {
  loc_nursing: [
    { title: 'تعليم الخياطة اليدوية', story: 'السيدة نور تريد تعلم الخياطة لتشغل وقتها. علمها الأساسيات بصبر.', difficulty: 'متوسط', kp: 55, xp: 110, impact: 9, category: 'مهارات', duration: '1.5 ساعة', icon: '🧵' },
    { title: 'جلسة الموسيقى والأناشيد', story: 'المسنون يحبون الأناشيد القديمة. نظم لهم جلسة موسيقية ممتعة.', difficulty: 'سهل', kp: 45, xp: 90, impact: 8, category: 'ترفيه', duration: '1 ساعة', icon: '🎵' },
    { title: 'مساعدة في العلاج الطبيعي', story: 'الحاج كريم يحتاج لمساعدة في تمارينه اليومية. كن بجانبه.', difficulty: 'متوسط', kp: 60, xp: 120, impact: 10, category: 'رعاية', duration: '1 ساعة', icon: '🏃' },
  ],
  loc_orphan: [
    { title: 'تعليم لغة إنجليزية بسيطة', story: 'الأطفال يريدون تعلم كلمات إنجليزية. علمهم بطريقة ممتعة.', difficulty: 'متوسط', kp: 65, xp: 130, impact: 14, category: 'تعليم', duration: '1 ساعة', icon: '🔤' },
    { title: 'مسرحية صغيرة', story: 'الأطفال يريدون تمثيل قصة. ساعدهم في إعداد مسرحية بسيطة.', difficulty: 'صعب', kp: 90, xp: 180, impact: 18, category: 'إبداع', duration: '2 ساعة', icon: '🎭' },
    { title: 'زراعة نباتات صغيرة', story: 'علم الأطفال كيفية زراعة النباتات وتعلم المسؤولية.', difficulty: 'سهل', kp: 40, xp: 80, impact: 10, category: 'بيئة', duration: '1 ساعة', icon: '🌱' },
  ],
  loc_park: [
    { title: 'تركيب ألعاب الأطفال', story: 'الحديقة تحتاج لألعاب جديدة للأطفال. ساعد في تركيبها.', difficulty: 'صعب', kp: 100, xp: 200, impact: 22, category: 'خدمة', duration: '3 ساعات', icon: '🎠' },
    { title: 'رسم جداريات ملونة', story: 'جدران الحديقة رمادية. ارسم عليها جداريات ملونة وجميلة.', difficulty: 'صعب', kp: 110, xp: 220, impact: 20, category: 'إبداع', duration: '4 ساعات', icon: '🖌️' },
    { title: 'نصب صناديق إعادة التدوير', story: 'الحديقة تحتاج لصناديق إعادة تدوير. ساعد في نصبها وتوعية الناس.', difficulty: 'متوسط', kp: 70, xp: 140, impact: 20, category: 'بيئة', duration: '2 ساعة', icon: '♻️' },
  ],
  loc_hospital: [
    { title: 'توزيع الورود على المرضى', story: 'وردة واحدة تصنع فرقاً. وزع الورود على المرضى وأضف البسمة.', difficulty: 'سهل', kp: 40, xp: 80, impact: 12, category: 'خدمة', duration: '1 ساعة', icon: '🌹' },
    { title: 'قراءة القرآن للمرضى', story: 'المرضى يجدون الراحة في سماع القرآن. اقرأ لهم بصوت هادئ.', difficulty: 'سهل', kp: 45, xp: 90, impact: 14, category: 'روحاني', duration: '1 ساعة', icon: '📖' },
    { title: 'مساعدة في نقل المرضى', story: 'بعض المرضى يحتاجون مساعدة في التنقل داخل المستشفى.', difficulty: 'متوسط', kp: 55, xp: 110, impact: 10, category: 'خدمة', duration: '1 ساعة', icon: '🦽' },
  ],
  loc_animals: [
    { title: 'تدريب القطط على الاجتماعية', story: 'بعض القطط خائفة من البشر. ساعد في تدريبها على الثقة.', difficulty: 'متوسط', kp: 60, xp: 120, impact: 15, category: 'مهارات', duration: '1.5 ساعة', icon: '🐱' },
    { title: 'تصوير الحيوانات للتبني', story: 'صور احترافية تساعد في إيجاد منازل للحيوانات. التقط صوراً جميلة.', difficulty: 'متوسط', kp: 65, xp: 130, impact: 18, category: 'إبداع', duration: '2 ساعة', icon: '📷' },
    { title: 'بناء أكواخ للحيوانات', story: 'الحيوانات تحتاج لمأوى دافئ. ساعد في بناء أكواخ بسيطة.', difficulty: 'صعب', kp: 95, xp: 190, impact: 22, category: 'خدمة', duration: '3 ساعات', icon: '🏠' },
  ],
  default: [
    { title: 'مهمة تطوعية خاصة', story: 'مهمة مميزة تم توليدها خصيصاً لك. أكملها وافرح بمكافأتها!', difficulty: 'متوسط', kp: 70, xp: 140, impact: 18, category: 'خدمة', duration: '1.5 ساعة', icon: '⭐' },
    { title: 'مساعدة عاجلة', story: 'شخص يحتاج مساعدتك الآن. لا تتأخر وكن البطل الذي ينتظره.', difficulty: 'صعب', kp: 100, xp: 200, impact: 25, category: 'رعاية', duration: '2 ساعة', icon: '🆘' },
    { title: 'مبادرة مجتمعية', story: 'فكرة بسيطة يمكنها تغيير حياة الكثيرين. نفذها الآن!', difficulty: 'صعب', kp: 120, xp: 240, impact: 30, category: 'تنظيم', duration: '3 ساعات', icon: '💫' },
  ],
};

let _aiIdCounter = 1000;

// ── Task Success Overlay (animated) ──────────────────────────────────────

const STAR_COUNT = 18;

const TaskSuccessOverlay = memo(({ task, onDone }) => {
  const [phase, setPhase] = useState('enter'); // enter → show → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 50);
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    const t3 = setTimeout(() => onDone(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  // Random star positions (stable across renders)
  const stars = useRef(
    Array.from({ length: STAR_COUNT }, (_, i) => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 10 + Math.random() * 18,
      delay: Math.random() * 0.6,
      emoji: ['⭐', '✨', '🌟', '💫', '🎉', '🏆'][Math.floor(Math.random() * 6)],
    }))
  ).current;

  return (
    <div
      className={`ce-success-overlay ce-success-overlay--${phase}`}
      onClick={onDone}
    >
      {/* Floating stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="ce-success-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: s.size,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.emoji}
        </span>
      ))}

      {/* Center card */}
      <div className="ce-success-card">
        {/* Ripple rings */}
        <div className="ce-success-ripple ce-success-ripple--1" />
        <div className="ce-success-ripple ce-success-ripple--2" />
        <div className="ce-success-ripple ce-success-ripple--3" />

        {/* Big checkmark */}
        <div className="ce-success-check">
          <svg viewBox="0 0 52 52" className="ce-success-check__svg">
            <circle className="ce-success-check__circle" cx="26" cy="26" r="24" />
            <path className="ce-success-check__path" d="M14 27 l8 8 l16-16" />
          </svg>
        </div>

        <div className="ce-success-title">تم الإنجاز! 🎉</div>
        <div className="ce-success-task-name">{task.title}</div>

        <div className="ce-success-rewards">
          <div className="ce-success-reward-chip" style={{ background: '#fef9c3', color: '#92400e' }}>
            <span className="ce-success-reward-chip__icon">⭐</span>
            <span>+{task.kp} KP</span>
          </div>
          <div className="ce-success-reward-chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <span className="ce-success-reward-chip__icon">🔷</span>
            <span>+{task.xp} XP</span>
          </div>
          <div className="ce-success-reward-chip" style={{ background: '#f0fdf4', color: '#166534' }}>
            <span className="ce-success-reward-chip__icon">🌍</span>
            <span>تأثير +{task.impact}</span>
          </div>
        </div>

        <div className="ce-success-hint">اضغط في أي مكان للإغلاق</div>
      </div>
    </div>
  );
});

// ── Task Complete Modal ───────────────────────────────────────────────────

const TaskModal = memo(({ task, location, onConfirm, onClose }) => (
  <>
    <div className="ce-modal-overlay" onClick={onClose} />
    <div className="ce-modal">
      <span className="ce-modal__emoji">{task.icon}</span>
      <h3 className="ce-modal__title">{task.title}</h3>
      <p className="ce-modal__story">{task.story}</p>
      <div className="ce-modal__rewards">
        <span className="ce-modal__reward-chip" style={{ background: '#fef9c3', color: '#92400e' }}>⭐ +{task.kp} KP</span>
        <span className="ce-modal__reward-chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>🔷 +{task.xp} XP</span>
        <span className="ce-modal__reward-chip" style={{ background: '#f0fdf4', color: '#166534' }}>🌍 تأثير +{task.impact}</span>
        <span className="ce-modal__reward-chip" style={{ background: '#f5f3ff', color: '#7c3aed' }}>⏱️ {task.duration}</span>
      </div>
      <button className="ce-modal__confirm-btn" onClick={onConfirm}>
        ✅ أكملت المهمة! استلم المكافأة
      </button>
      <button className="ce-modal__cancel-btn" onClick={onClose}>
        لاحقاً
      </button>
    </div>
  </>
));

// ── Task Card ─────────────────────────────────────────────────────────────

const TaskCard = memo(({ task, done, onStart, isAI }) => {
  const diffClass = DIFF_CLASS[task.difficulty] ?? DIFF_CLASS['متوسط'];
  return (
    <div className={`ce-task-card${done ? ' ce-task-card--done' : ''}${isAI ? ' ce-task-card--ai' : ''}`}>
      {isAI && <span className="ce-task-card__ai-badge">✨ AI</span>}
      <div className="ce-task-card__header">
        <div className="ce-task-card__icon">{task.icon}</div>
        <div style={{ flex: 1 }}>
          <div className="ce-task-card__title">{done ? '✅ ' : ''}{task.title}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
            <span className={`ce-task-chip ${diffClass}`}>{task.difficulty}</span>
            <span className="ce-task-chip ce-task-chip--cat">{task.category}</span>
            <span className="ce-task-chip ce-task-chip--dur">⏱️ {task.duration}</span>
          </div>
        </div>
      </div>
      <p className="ce-task-card__story">{task.story}</p>
      <div className="ce-task-card__meta">
        <span className="ce-task-chip ce-task-chip--kp">⭐ {task.kp} KP</span>
        <span className="ce-task-chip ce-task-chip--xp">🔷 {task.xp} XP</span>
        <span className="ce-task-chip ce-task-chip--imp">🌍 تأثير {task.impact}</span>
      </div>
      {done ? (
        <div className="ce-task-card__done-badge">🏆 مهمة مكتملة! أحسنت!</div>
      ) : (
        <button className="ce-task-card__start-btn" onClick={() => onStart(task)}>
          🚀 ابدأ المهمة الآن
        </button>
      )}
    </div>
  );
});

// ── Location Card (list view) ─────────────────────────────────────────────

const LocationCard = memo(({ loc, userLevel, completedIds, onOpen }) => {
  const unlocked = userLevel >= loc.requiredLevel;
  const done = loc.tasks.filter(t => completedIds.has(t.id)).length;
  const total = loc.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const allDone = done === total;

  return (
    <div
      className={`ce-location-card${unlocked ? ' ce-location-card--unlocked' : ' ce-location-card--locked'}`}
      style={unlocked ? { borderColor: loc.borderColor } : {}}
      onClick={() => { if (unlocked) { AudioManager.getInstance().play('open'); onOpen(loc); } }}
    >
      <div className="ce-location-card__accent" style={{ background: loc.gradient }} />
      <div className="ce-location-card__body">
        {/* Icon */}
        <div
          className="ce-location-card__icon-wrap"
          style={{ background: loc.bgLight, borderColor: loc.borderColor }}
        >
          {unlocked ? loc.emoji : '🔒'}
        </div>

        {/* Info */}
        <div className="ce-location-card__info">
          <div className="ce-location-card__name">{loc.name}</div>
          <div className="ce-location-card__name-en">{loc.nameEn}</div>
          <div className="ce-location-card__desc">{loc.description}</div>
          {unlocked && (
            <div className="ce-card-progress">
              <div
                className="ce-card-progress__fill"
                style={{ width: `${pct}%`, background: loc.gradient }}
              />
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="ce-location-card__right">
          {unlocked ? (
            <>
              <span
                className="ce-location-card__tasks-badge"
                style={{ background: loc.bgLight, color: loc.color }}
              >
                {done}/{total} مهمة
              </span>
              {allDone
                ? <span style={{ fontSize: 11, fontWeight: 900, color: '#16a34a' }}>✅ مكتمل</span>
                : <button className="ce-explore-btn" onClick={(e) => { e.stopPropagation(); AudioManager.getInstance().play('open'); onOpen(loc); }}>
                    استكشف الآن ▶
                  </button>
              }
            </>
          ) : (
            <>
              <span className="ce-location-card__lock">🔒</span>
              <span className="ce-location-card__level-req">مستوى {loc.requiredLevel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// ── Detail View ───────────────────────────────────────────────────────────

const DetailView = memo(({ loc, completedIds, onBack, onCompleteTask }) => {
  const [aiTasks, setAiTasks]       = useState([]);
  const [generating, setGenerating] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [toast,      setToast]      = useState(null);

  const done  = loc.tasks.filter(t => completedIds.has(t.id)).length;
  const total = loc.tasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  const handleGenerate = useCallback(() => {
    if (generating) return;
    setGenerating(true);
    AudioManager.getInstance().play('click');

    setTimeout(() => {
      const pool = AI_TASK_POOL[loc.id] ?? AI_TASK_POOL.default;
      const available = pool.filter(p => !aiTasks.some(a => a.title === p.title));
      if (available.length === 0) {
        setGenerating(false);
        return;
      }
      const pick = available[Math.floor(Math.random() * available.length)];
      const newTask = { ...pick, id: `ai_${loc.id}_${++_aiIdCounter}`, isAI: true };
      setAiTasks(prev => [...prev, newTask]);
      setGenerating(false);
      AudioManager.getInstance().play('win');
    }, 1800);
  }, [generating, loc.id, aiTasks]);

  const handleStart = useCallback((task) => {
    AudioManager.getInstance().play('click');
    setActiveTask(task);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!activeTask) return;
    const completed = activeTask;
    onCompleteTask(completed);
    setActiveTask(null);
    setToast(completed);
    AudioManager.getInstance().play('win');
  }, [activeTask, onCompleteTask]);

  const allTasks = useMemo(() => [...loc.tasks, ...aiTasks], [loc.tasks, aiTasks]);

  return (
    <div className="ce-detail">
      {/* Back button */}
      <button className="ce-detail__back" onClick={onBack}>
        ◀ العودة للخريطة
      </button>

      {/* Hero */}
      <div className="ce-detail__hero" style={{ background: loc.gradient }}>
        <span className="ce-detail__hero-emoji">{loc.emoji}</span>
        <div className="ce-detail__hero-name">{loc.name}</div>
        <div className="ce-detail__hero-desc">{loc.description}</div>
        <div className="ce-detail__hero-stats">
          <span className="ce-detail__hero-stat">📋 {total} مهمة</span>
          <span className="ce-detail__hero-stat">✅ {done} مكتملة</span>
          <span className="ce-detail__hero-stat">📊 {pct}% تقدم</span>
          {aiTasks.length > 0 && (
            <span className="ce-detail__hero-stat">✨ {aiTasks.length} AI</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '12px 16px', marginBottom: 14, boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-primary)' }}>تقدمك في {loc.name}</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: loc.color }}>{done}/{total}</span>
        </div>
        <div style={{ height: 10, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: loc.gradient, borderRadius: 99, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* AI Generate button */}
      <button
        className={`ce-ai-btn${generating ? ' ce-ai-btn--loading' : ''}`}
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? (
          <>
            <span>✨</span>
            <span>جاري توليد مهمة جديدة بالذكاء الاصطناعي</span>
            <div className="ce-ai-dots">
              <span /><span /><span />
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 18 }}>🤖</span>
            <span>توليد مهمة جديدة بالذكاء الاصطناعي ✨</span>
          </>
        )}
      </button>

      {/* Tasks */}
      <div className="ce-section-title">
        <span>📋</span> المهام المتاحة ({allTasks.length})
      </div>

      {allTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          done={completedIds.has(task.id)}
          onStart={handleStart}
          isAI={!!task.isAI}
        />
      ))}

      {/* Task modal */}
      {activeTask && (
        <TaskModal
          task={activeTask}
          location={loc}
          onConfirm={handleConfirm}
          onClose={() => setActiveTask(null)}
        />
      )}

      {/* Animated success overlay */}
      {toast && (
        <TaskSuccessOverlay
          task={toast}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
});

// ── Main Tab ──────────────────────────────────────────────────────────────

const CityExplorationTab = ({ userStats, completedQuests, onCompleteQuest }) => {
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [localDone,   setLocalDone]   = useState(() => new Set());

  const userLevel = userStats?.level ?? 1;

  // Merge parent completedQuests + local completions
  const allCompleted = useMemo(() => {
    const merged = new Set(completedQuests ?? []);
    localDone.forEach(id => merged.add(id));
    return merged;
  }, [completedQuests, localDone]);

  const handleCompleteTask = useCallback((task) => {
    setLocalDone(prev => new Set([...prev, task.id]));
    // Propagate to parent game engine if callback provided
    onCompleteQuest?.({ id: task.id, kp: task.kp, xp: task.xp, title: task.title }, 0);
  }, [onCompleteQuest]);

  // Stats
  const totalTasks     = CITY_LOCATIONS.reduce((s, l) => s + l.tasks.length, 0);
  const completedCount = CITY_LOCATIONS.reduce((s, l) => s + l.tasks.filter(t => allCompleted.has(t.id)).length, 0);
  const unlockedLocs   = CITY_LOCATIONS.filter(l => userLevel >= l.requiredLevel).length;
  const overallPct     = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Grouped
  const unlockedList = CITY_LOCATIONS.filter(l => userLevel >= l.requiredLevel);
  const lockedList   = CITY_LOCATIONS.filter(l => userLevel < l.requiredLevel);

  if (selectedLoc) {
    return (
      <div className="ce-tab">
        <DetailView
          loc={selectedLoc}
          completedIds={allCompleted}
          onBack={() => setSelectedLoc(null)}
          onCompleteTask={handleCompleteTask}
        />
      </div>
    );
  }

  return (
    <div className="ce-tab">

      {/* ── Header ── */}
      <div className="ce-header">
        <div className="ce-header__top">
          <div>
            <h2 className="ce-header__title">🗺️ استكشاف المدينة</h2>
            <p className="ce-header__subtitle">استكشف أماكن المدينة وأكمل المهام الخيرية</p>
          </div>
          <div className="ce-level-badge">
            <span className="ce-level-badge__num">{userLevel}</span>
            <span className="ce-level-badge__label">مستواك الحالي</span>
          </div>
        </div>
        <div className="ce-header__progress-bar">
          <div className="ce-header__progress-fill" style={{ width: `${overallPct}%` }} />
        </div>
        <p className="ce-header__progress-text">
          {completedCount} من {totalTasks} مهمة مكتملة — {overallPct}% إجمالي
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="ce-stats">
        {[
          { val: unlockedLocs,   lbl: 'مكان مفتوح',   emoji: '🔓' },
          { val: completedCount, lbl: 'مهمة مكتملة',  emoji: '✅' },
          { val: lockedList.length, lbl: 'مكان مقفل', emoji: '🔒' },
          { val: `${overallPct}%`, lbl: 'التقدم الكلي', emoji: '📊' },
        ].map(({ val, lbl, emoji }) => (
          <div key={lbl} className="ce-stat-chip">
            <span className="ce-stat-chip__val">{emoji} {val}</span>
            <span className="ce-stat-chip__lbl">{lbl}</span>
          </div>
        ))}
      </div>

      {/* ── Unlocked locations ── */}
      {unlockedList.length > 0 && (
        <>
          <div className="ce-section-title">
            <span>🔓</span> الأماكن المتاحة ({unlockedList.length})
          </div>
          {unlockedList.map(loc => (
            <LocationCard
              key={loc.id}
              loc={loc}
              userLevel={userLevel}
              completedIds={allCompleted}
              onOpen={setSelectedLoc}
            />
          ))}
        </>
      )}

      {/* ── Locked locations ── */}
      {lockedList.length > 0 && (
        <>
          <div className="ce-section-title" style={{ marginTop: 8 }}>
            <span>🔒</span> أماكن مقفلة — ارفع مستواك لفتحها ({lockedList.length})
          </div>
          {lockedList.map(loc => (
            <LocationCard
              key={loc.id}
              loc={loc}
              userLevel={userLevel}
              completedIds={allCompleted}
              onOpen={() => {}}
            />
          ))}
        </>
      )}

      {/* ── Tip ── */}
      <div style={{
        background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
        border: '1.5px solid #86efac',
        borderRadius: 16, padding: '12px 18px', marginTop: 8,
        display: 'flex', alignItems: 'center', gap: 12, direction: 'rtl',
      }}>
        <span style={{ fontSize: 26 }}>💡</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#166534' }}>نصيحة!</div>
          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>
            أكمل المهام لرفع مستواك وفتح أماكن جديدة. استخدم زر الذكاء الاصطناعي داخل كل مكان لتوليد مهام إضافية!
          </div>
        </div>
      </div>

    </div>
  );
};

export default memo(CityExplorationTab);
