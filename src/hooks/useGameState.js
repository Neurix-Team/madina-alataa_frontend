// src/hooks/useGameState.js
import { useReducer, useCallback, useEffect } from 'react';
import GameEngine from '../services/GameEngine';
import AudioManager from '../services/AudioManager';
import { showAppAlert as dispatchAppAlert } from '../utils/appAlerts';

// ── Initial State ─────────────────────────────────────────────────────────
const INITIAL_STATE = {
  appState:       'auth',
  activeTab:      'map',
  activeZone:     null,
  activeQuest:    null,
  showTutorial:   false,
  showDailyReward:false,
  showLevelUp:    false,
  showCityUnlock: null,
  levelUpData:    { level: 1, title: 'مبتدئ' },
  notification:   null,
  userStats: {
    name:        (() => {
      try {
        const raw = localStorage.getItem('madeena_login_user_response');
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed.userName || parsed.fullname || parsed.name || 'جاري التحميل...';
        }
      } catch (e) {}
      return 'جاري التحميل...';
    })(),
    title:       'مبتدئ',
    level:       1,
    xp:          0,
    xpNeeded:    1000,
    kp:          0,
    impactScore: 0,
  },
  avatarTheme: {
    bg:        '00bcd4',
    accessory: 'crown',
  },
  completedQuests:    new Set(),
  completedGeoQuests: [],
  orders:             [],
};

// ── Action Types ──────────────────────────────────────────────────────────
const A = {
  LOGIN:              'LOGIN',
  SET_TAB:            'SET_TAB',
  OPEN_ZONE:          'OPEN_ZONE',
  CLOSE_ZONE:         'CLOSE_ZONE',
  OPEN_QUEST:         'OPEN_QUEST',
  CLOSE_QUEST:        'CLOSE_QUEST',
  COMPLETE_QUEST:     'COMPLETE_QUEST',
  COMPLETE_GEO_QUEST: 'COMPLETE_GEO_QUEST',
  CONTRIBUTE_TEAM:    'CONTRIBUTE_TEAM',
  CLOSE_CITY_UNLOCK:  'CLOSE_CITY_UNLOCK',
  NOTIFY:             'NOTIFY',
  SET_SHOW_LEVEL_UP:  'SET_SHOW_LEVEL_UP',
  SET_AVATAR_COLOR:   'SET_AVATAR_COLOR',
  SET_AVATAR_ACCESSORY:'SET_AVATAR_ACCESSORY',
  FINISH_TUTORIAL:    'FINISH_TUTORIAL',
  CLAIM_DAILY_REWARD: 'CLAIM_DAILY_REWARD',
  HANDLE_DONATE:      'HANDLE_DONATE',
  ADD_ORDER:          'ADD_ORDER',
  SYNC_USER_STATS:    'SYNC_USER_STATS',
};

// ── Reducer ───────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case A.SYNC_USER_STATS: {
      return {
        ...state,
        userStats: {
          ...state.userStats,
          ...action.stats,
        },
      };
    }

    case A.LOGIN: {
      const hasVisited = localStorage.getItem('madina_visited');
      const lastReward = localStorage.getItem('madina_last_reward');
      const today      = new Date().toDateString();
      const showReward = lastReward !== today;
      localStorage.setItem('madina_visited', '1');
      return {
        ...state,
        appState:        'game',
        activeTab:       'map',
        showTutorial:    !hasVisited,
        showDailyReward: showReward && !!hasVisited,
      };
    }

    case A.SET_TAB:
      return { ...state, activeTab: action.tab };

    case A.OPEN_ZONE:
      return { ...state, activeZone: action.zone };

    case A.CLOSE_ZONE:
      return { ...state, activeZone: null };

    case A.OPEN_QUEST:
      return { ...state, activeQuest: action.quest };

    case A.CLOSE_QUEST:
      return { ...state, activeQuest: null };

    case A.COMPLETE_QUEST: {
      const { quest } = action;
      if (!quest) return state;

      const already = state.completedQuests instanceof Set
        ? state.completedQuests.has(quest.id)
        : false;
      if (already) return { ...state, activeQuest: null };

      const newCompleted = new Set(state.completedQuests);
      newCompleted.add(quest.id);

      const result = GameEngine.applyQuestReward(state.userStats, quest);
      const newStats = result.stats;
      const leveledUp = result.leveledUp;

      try { AudioManager.play('complete'); } catch (_) {}

      return {
        ...state,
        activeQuest:     null,
        completedQuests: newCompleted,
        userStats:       newStats,
        showLevelUp:     leveledUp,
        levelUpData:     leveledUp
          ? { level: newStats.level, title: newStats.title }
          : state.levelUpData,
        notification: `🎉 أنجزت: ${quest.title}! +${quest.kp} KP`,
      };
    }

    case A.COMPLETE_GEO_QUEST: {
      const { questId, reward } = action;
      if (state.completedGeoQuests.includes(questId)) return state;

      const newGeo = [...state.completedGeoQuests, questId];
      const newStats = {
        ...state.userStats,
        kp:          state.userStats.kp + (reward?.kp ?? 0),
        xp:          state.userStats.xp + (reward?.xp ?? 0),
        impactScore: state.userStats.impactScore + (reward?.impact ?? 0),
      };

      return {
        ...state,
        completedGeoQuests: newGeo,
        userStats:          newStats,
        notification:       `📍 مهمة جغرافية مكتملة! +${reward?.kp ?? 0} KP`,
      };
    }

    case A.CONTRIBUTE_TEAM: {
      const { amount } = action;
      const newStats = {
        ...state.userStats,
        kp: state.userStats.kp + (amount ?? 0),
      };
      return {
        ...state,
        userStats:    newStats,
        notification: `🤝 ساهمت في تحدي الفريق! +${amount} KP`,
      };
    }

    case A.CLOSE_CITY_UNLOCK:
      return { ...state, showCityUnlock: null };

    case A.NOTIFY:
      return { ...state, notification: action.message };

    case A.SET_SHOW_LEVEL_UP:
      return { ...state, showLevelUp: action.value };

    case A.SET_AVATAR_COLOR:
      return {
        ...state,
        avatarTheme: { ...state.avatarTheme, bg: action.color },
      };

    case A.SET_AVATAR_ACCESSORY:
      return {
        ...state,
        avatarTheme: { ...state.avatarTheme, accessory: action.accessory },
      };

    case A.FINISH_TUTORIAL:
      return {
        ...state,
        showTutorial:    false,
        showDailyReward: true,
      };

    case A.CLAIM_DAILY_REWARD: {
      const today = new Date().toDateString();
      localStorage.setItem('madina_last_reward', today);
      const newStats = {
        ...state.userStats,
        kp: state.userStats.kp + GameEngine.DAILY_REWARD_KP,
      };
      return {
        ...state,
        showDailyReward: false,
        userStats:       newStats,
        notification:    `🎁 استلمت مكافأة اليوم! +${GameEngine.DAILY_REWARD_KP} KP`,
      };
    }

    case A.ADD_ORDER: {
      return {
        ...state,
        orders: [...state.orders, action.order],
      };
    }

    case A.HANDLE_DONATE: {
      const { amount } = action;
      const kpGain = Math.floor((amount ?? 0) / 10);
      const newStats = {
        ...state.userStats,
        kp:          state.userStats.kp + kpGain,
        impactScore: state.userStats.impactScore + (amount ?? 0),
      };
      return {
        ...state,
        userStats:    newStats,
        notification: `💝 شكراً على تبرعك! +${kpGain} KP`,
      };
    }

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────
export default function useGameState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // ── Auto-dismiss notification after 3 seconds ──────────────────────────
  useEffect(() => {
    if (!state.notification) return;
    const timer = setTimeout(() => {
      dispatch({ type: A.NOTIFY, message: null });
    }, 3000);
    return () => clearTimeout(timer);
  }, [state.notification]);

  const login = useCallback(() =>
    dispatch({ type: A.LOGIN }), []);

  const setActiveTab = useCallback((tab) =>
    dispatch({ type: A.SET_TAB, tab }), []);

  const openZone = useCallback((zone) =>
    dispatch({ type: A.OPEN_ZONE, zone }), []);

  const closeZone = useCallback(() =>
    dispatch({ type: A.CLOSE_ZONE }), []);

  const openQuest = useCallback((quest) =>
    dispatch({ type: A.OPEN_QUEST, quest }), []);

  const closeQuest = useCallback(() =>
    dispatch({ type: A.CLOSE_QUEST }), []);

  const completeQuest = useCallback((quest) =>
    dispatch({ type: A.COMPLETE_QUEST, quest }), []);

  const completeGeoQuest = useCallback((questId, reward) =>
    dispatch({ type: A.COMPLETE_GEO_QUEST, questId, reward }), []);

  const contributeToTeam = useCallback((amount) =>
    dispatch({ type: A.CONTRIBUTE_TEAM, amount }), []);

  const closeCityUnlock = useCallback(() =>
    dispatch({ type: A.CLOSE_CITY_UNLOCK }), []);

  const notify = useCallback((message) =>
    dispatch({ type: A.NOTIFY, message }), []);

  const setShowLevelUp = useCallback((value) =>
    dispatch({ type: A.SET_SHOW_LEVEL_UP, value }), []);

  const setAvatarColor = useCallback((color) =>
    dispatch({ type: A.SET_AVATAR_COLOR, color }), []);

  const setAvatarAccessory = useCallback((accessory) =>
    dispatch({ type: A.SET_AVATAR_ACCESSORY, accessory }), []);

  const finishTutorial = useCallback(() =>
    dispatch({ type: A.FINISH_TUTORIAL }), []);

  const claimDailyReward = useCallback(() =>
    dispatch({ type: A.CLAIM_DAILY_REWARD }), []);

  const handleDonate = useCallback((amount) =>
    dispatch({ type: A.HANDLE_DONATE, amount }), []);

  const addOrder = useCallback((order) =>
    dispatch({ type: A.ADD_ORDER, order }), []);

  const syncUserStats = useCallback((stats) =>
    dispatch({ type: A.SYNC_USER_STATS, stats }), []);

  const showAppAlert = useCallback((options = {}) =>
    dispatchAppAlert(options), []);

  return {
    state,
    actions: {
      login,
      setActiveTab,
      openZone,
      closeZone,
      openQuest,
      closeQuest,
      completeQuest,
      completeGeoQuest,
      contributeToTeam,
      closeCityUnlock,
      notify,
      setShowLevelUp,
      setAvatarColor,
      setAvatarAccessory,
      finishTutorial,
      claimDailyReward,
      handleDonate,
      addOrder,
      syncUserStats,
      showAppAlert,
    },
  };
}
