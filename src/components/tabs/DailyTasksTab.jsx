import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import AudioManager from '../../services/AudioManager';
import {
  FaSun,
  FaBookOpen,
  FaHandsHelping,
  FaTint,
  FaRunning,
  FaSmileBeam,
  FaPenFancy,
  FaBell,
  FaMusic,
  FaGift,
  FaCheckCircle,
  FaClock,
  FaLink,
  FaFire,
  FaMedal,
  FaSave,
  FaVolumeUp,
  FaMoon,
  FaStar,
  FaTrophy,
} from 'react-icons/fa';
import {
  FiTarget,
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiZap,
} from 'react-icons/fi';

const DAILY_TASKS = [
  {
    id: 'dt_1',
    icon: FaSun,
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
    icon: FaBookOpen,
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
    icon: FaHandsHelping,
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
    icon: FaTint,
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
    icon: FaRunning,
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
    icon: FaSmileBeam,
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
    icon: FaPenFancy,
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

const NOTIFICATION_SOUNDS = [
  {
    id: 'gentle',
    label: 'رقيق',
    Icon: FaMusic,
    desc: 'نغمة هادئة',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('open');
    },
  },
  {
    id: 'cheerful',
    label: 'مبهج',
    Icon: FaVolumeUp,
    desc: 'نغمة مرحة',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('win');
    },
  },
  {
    id: 'alert',
    label: 'تنبيه',
    Icon: FaBell,
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
    Icon: FaGift,
    desc: 'نغمة احتفالية',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('reward');
    },
  },
  {
    id: 'levelup',
    label: 'إنجاز',
    Icon: FaTrophy,
    desc: 'نغمة إنجاز',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('levelUp');
    },
  },
  {
    id: 'soft',
    label: 'ناعم',
    Icon: FaMoon,
    desc: 'نغمة ناعمة',
    play: () => {
      const am = AudioManager.getInstance();
      am.play('nav');
      setTimeout(() => am.play('nav'), 300);
    },
  },
];

const CHAIN_TIPS = [
  {
    Icon: FaClock,
    title: 'حدد وقتاً ثابتاً',
    desc: 'خصص وقتاً محدداً كل يوم لإنجاز مهامك اليومية.',
  },
  {
    Icon: FiTarget,
    title: 'ابدأ بالأسهل',
    desc: 'أنجز المهام السهلة أولاً لتحفيز نفسك على إكمال الباقي.',
  },
  {
    Icon: FaBell,
    title: 'فعّل التذكير اليومي',
    desc: 'اضبط إشعاراً يومياً حتى لا تنسى مهامك وتحافظ على سلسلتك.',
  },
  {
    Icon: FaHandsHelping,
    title: 'شارك صديقاً',
    desc: 'تحدى صديقاً على إكمال المهام اليومية معاً لتحفيز بعضكما.',
  },
];

const getTodayKey = () => new Date().toISOString().split('T')[0];

const loadDoneToday = () => {
  try {
    const raw = localStorage.getItem('dt_done_' + getTodayKey());
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
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
  try {
    return parseInt(localStorage.getItem('dt_streak') || '0', 10);
  } catch {
    return 0;
  }
};

const saveStreak = (n) => {
  try {
    localStorage.setItem('dt_streak', String(n));
  } catch {}
};

const loadReminderSettings = () => {
  try {
    const raw = localStorage.getItem('dt_reminder');
    return raw
      ? JSON.parse(raw)
      : {
          time: '08:00',
          date: new Date().toISOString().split('T')[0],
          sound: 'gentle',
          enabled: false,
        };
  } catch {
    return {
      time: '08:00',
      date: new Date().toISOString().split('T')[0],
      sound: 'gentle',
      enabled: false,
    };
  }
};

const saveReminderSettings = (s) => {
  try {
    localStorage.setItem('dt_reminder', JSON.stringify(s));
  } catch {}
};

const DT_CSS = `
  .dt-tab {
    padding: 24px 24px 40px;
    max-width: 1200px;
    margin: 0 auto;
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    color: #0f172a;
    display: grid;
    gap: 16px;
  }

  .dt-header {
    background:
      radial-gradient(circle at top right, rgba(73,198,242,0.12), transparent 28%),
      radial-gradient(circle at bottom left, rgba(184,140,248,0.10), transparent 25%),
      linear-gradient(135deg, #ffffff 0%, #f8fcff 60%, #faf7ff 100%);
    border-radius: 24px;
    padding: 20px 22px;
    border: 1.5px solid rgba(226,232,240,0.9);
    box-shadow: 0 18px 40px rgba(15,23,42,0.06);
    text-align: center;
  }

  .dt-header__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #2563eb;
    font-size: 24px;
    box-shadow: 0 12px 24px rgba(59,130,246,0.08);
  }

  .dt-header__title {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .dt-header__subtitle {
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
  }

  .dt-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 900;
    color: #0f172a;
    margin-top: 2px;
  }

  .dt-section-title__icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #2563eb;
    border: 1px solid rgba(186,230,253,0.9);
    font-size: 14px;
  }

  .dt-chain-card,
  .dt-progress-card,
  .dt-tips-card,
  .dt-reminder-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 22px;
    border: 1.5px solid rgba(226,232,240,0.9);
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
  }

  .dt-chain-card {
    padding: 20px;
  }

  .dt-chain-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .dt-chain-card__title {
    font-size: 18px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dt-chain-card__subtitle {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
  }

  .dt-chain-card__badge {
    padding: 8px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #fff7cc, #fef3c7);
    color: #92400e;
    font-size: 11px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(245,158,11,0.18);
  }

  .dt-streak-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
  }

  .dt-streak-fire {
    color: #f97316;
    font-size: 22px;
    animation: dtPulse 1.8s ease-in-out infinite;
  }

  .dt-streak-num {
    font-size: 38px;
    line-height: 1;
    font-weight: 900;
    color: #0f172a;
  }

  .dt-streak-label {
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
    margin-top: 4px;
  }

  .dt-chain-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .dt-chain-connector {
    width: 24px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #f97316, #f59e0b);
  }

  .dt-chain-connector--future {
    background: #e2e8f0;
  }

  .dt-chain-link {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 900;
    border: 1.5px solid rgba(226,232,240,0.9);
    transition: all 0.2s ease;
  }

  .dt-chain-link--done {
    background: linear-gradient(135deg, #f97316, #f59e0b);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 10px 20px rgba(249,115,22,0.20);
  }

  .dt-chain-link--today {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: rgba(147,197,253,0.9);
    box-shadow: 0 8px 18px rgba(59,130,246,0.10);
  }

  .dt-chain-link--future {
    background: #f8fafc;
    color: #94a3b8;
  }

  .dt-chain-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .dt-chain-stat {
    padding: 14px 12px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid rgba(226,232,240,0.9);
    text-align: center;
  }

  .dt-chain-stat__val {
    font-size: 22px;
    line-height: 1;
    font-weight: 900;
    color: #2563eb;
    display: block;
    margin-bottom: 4px;
  }

  .dt-chain-stat__lbl {
    font-size: 11px;
    font-weight: 800;
    color: #64748b;
  }

  .dt-progress-card {
    padding: 18px 20px;
  }

  .dt-progress-card__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .dt-progress-card__title {
    font-size: 15px;
    font-weight: 900;
    color: #0f172a;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .dt-progress-card__count {
    font-size: 12px;
    font-weight: 900;
    color: #64748b;
  }

  .dt-progress-bar {
    height: 10px;
    background: rgba(226,232,240,0.9);
    border-radius: 999px;
    overflow: hidden;
  }

  .dt-progress-bar__fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #49c6f2 0%, #56dcc9 50%, #be93ff 100%);
    box-shadow: 0 0 18px rgba(73,198,242,0.20);
    transition: width 0.5s ease;
  }

  .dt-progress-card__msg {
    margin-top: 10px;
    font-size: 12px;
    font-weight: 800;
    color: #2563eb;
  }

  .dt-reward-panel {
    display: grid;
    gap: 12px;
    margin-bottom: 4px;
    padding: 18px;
    border-radius: 24px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border: 1.5px solid rgba(226,232,240,0.9);
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
  }

  .dt-reward-panel__title {
    font-size: 15px;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #0f172a;
  }

  .dt-reward-cards {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(auto-fit,minmax(140px,1fr));
  }

  .dt-reward-mini {
    padding: 14px;
    border-radius: 18px;
    background: #fff;
    border: 1px solid rgba(226,232,240,0.9);
  }

  .dt-reward-mini__label {
    font-size: 12px;
    color: #475569;
    font-weight: 800;
  }

  .dt-reward-mini__value {
    margin-top: 8px;
    font-size: 22px;
    font-weight: 900;
    color: #0f172a;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .dt-task-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 20px;
    padding: 18px 16px;
    border: 1.5px solid rgba(226,232,240,0.9);
    box-shadow: 0 12px 28px rgba(15,23,42,0.05);
    display: flex;
    gap: 14px;
    align-items: flex-start;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    animation: dtPop 0.35s ease-out backwards;
  }

  .dt-task-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 34px rgba(15,23,42,0.08);
  }

  .dt-task-card--done {
    background: linear-gradient(180deg, #f0fdf4 0%, #f7fff9 100%);
    border-color: rgba(134,239,172,0.9);
  }

  .dt-task-card__icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(226,232,240,0.9);
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    font-size: 24px;
  }

  .dt-task-card__icon-wrap--pending {
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #2563eb;
  }

  .dt-task-card__icon-wrap--done {
    background: linear-gradient(135deg, #dcfce7, #ecfdf5);
    color: #16a34a;
    border-color: rgba(134,239,172,0.9);
  }

  .dt-task-card__body {
    flex: 1;
    min-width: 0;
  }

  .dt-task-card__title {
    font-size: 15px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 6px;
  }

  .dt-task-card__title--done {
    color: #166534;
  }

  .dt-task-card__desc {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
    line-height: 1.75;
    margin-bottom: 12px;
  }

  .dt-task-card__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .dt-task-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 900;
    padding: 6px 10px;
    border-radius: 999px;
  }

  .dt-task-chip--kp {
    background: #fff7cc;
    color: #92400e;
  }

  .dt-task-chip--xp {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .dt-task-chip--time {
    background: #f8fafc;
    color: #475569;
  }

  .dt-task-chip--cat {
    background: #f5f3ff;
    color: #7c3aed;
  }

  .dt-task-card__check {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    border: 2px solid rgba(226,232,240,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 16px;
    font-weight: 900;
    background: #fff;
  }

  .dt-task-card__check--done {
    background: #16a34a;
    color: #fff;
    border-color: #16a34a;
    box-shadow: 0 10px 20px rgba(22,163,74,0.18);
  }

  .dt-task-progress {
    height: 6px;
    margin-top: 12px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(226,232,240,0.9);
  }

  .dt-task-progress__fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #22c55e, #16a34a);
  }

  .dt-tips-card {
    padding: 20px;
  }

  .dt-tips-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .dt-tips-card__icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #2563eb;
    font-size: 20px;
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
  }

  .dt-tips-card__title {
    font-size: 16px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 3px;
  }

  .dt-tips-card__subtitle {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
  }

  .dt-tips-list {
    display: grid;
    gap: 10px;
  }

  .dt-tip-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid rgba(226,232,240,0.9);
  }

  .dt-tip-item__icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    color: #7c3aed;
    border: 1px solid rgba(221,214,254,0.9);
    font-size: 16px;
  }

  .dt-tip-item__title {
    font-size: 13px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 3px;
  }

  .dt-tip-item__desc {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
    line-height: 1.7;
  }

  .dt-reminder-card {
    padding: 20px;
  }

  .dt-reminder-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .dt-reminder-card__bell {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fff7cc, #fef3c7);
    color: #b45309;
    font-size: 20px;
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
  }

  .dt-reminder-card__title {
    font-size: 16px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 3px;
  }

  .dt-reminder-card__subtitle {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
  }

  .dt-reminder-form {
    display: grid;
    gap: 14px;
  }

  .dt-form-row,
  .dt-sound-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .dt-form-group {
    min-width: 240px;
    flex: 1;
  }

  .dt-form-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 900;
    color: #334155;
    margin-bottom: 8px;
  }

  .dt-form-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid rgba(226,232,240,0.9);
    border-radius: 14px;
    font-family: 'Cairo', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    outline: none;
    box-shadow: 0 8px 18px rgba(15,23,42,0.03);
  }

  .dt-form-input:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
  }

  .dt-sound-btn {
    border: 1.5px solid rgba(226,232,240,0.9);
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    color: #334155;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 140px;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 10px 20px rgba(15,23,42,0.04);
  }

  .dt-sound-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 26px rgba(15,23,42,0.07);
  }

  .dt-sound-btn--active {
    background: linear-gradient(135deg, #eff6ff, #f5f3ff);
    border-color: #93c5fd;
    color: #1d4ed8;
  }

  .dt-sound-btn__play {
    width: 26px;
    height: 26px;
    border-radius: 10px;
    background: #f8fafc;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .dt-save-btn {
    border: none;
    border-radius: 16px;
    padding: 14px 16px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 12px 24px rgba(37,99,235,0.18);
  }

  .dt-save-btn--saved {
    background: linear-gradient(135deg, #10b981, #22c55e);
    box-shadow: 0 12px 24px rgba(16,185,129,0.18);
  }

  .dt-saved-msg {
    background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
    border: 1.5px solid rgba(134,239,172,0.9);
    border-radius: 14px;
    padding: 10px 14px;
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    font-weight: 800;
    color: #166534;
  }

  .dt-celebration {
    background: linear-gradient(135deg, #fef9c3, #fef3c7);
    border: 2px solid #fbbf24;
    border-radius: 20px;
    padding: 18px 20px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 14px;
    animation: dtPop 0.4s ease-out;
    box-shadow: 0 6px 20px rgba(251,191,36,0.3);
  }

  .dt-celebration__icon {
    color: #b45309;
    font-size: 34px;
    animation: dtBounce 1s ease-in-out infinite;
  }

  .dt-celebration__title {
    font-size: 15px;
    font-weight: 900;
    color: #92400e;
  }

  .dt-celebration__desc {
    font-size: 12px;
    font-weight: 700;
    color: #b45309;
    margin-top: 2px;
  }

  @keyframes dtPop {
    0% { opacity: 0; transform: translateY(10px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes dtBounce {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @keyframes dtPulse {
    0%,100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }

  @media (max-width: 900px) {
    .dt-tab {
      padding: 18px 16px 32px;
    }

    .dt-chain-links,
    .dt-form-row,
    .dt-sound-grid {
      flex-direction: column;
      align-items: stretch;
    }

    .dt-form-group {
      min-width: auto;
      width: 100%;
    }

    .dt-chain-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .dt-tab {
      padding: 14px 12px 28px;
    }

    .dt-section-title {
      font-size: 15px;
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

    .dt-chain-stats {
      grid-template-columns: 1fr;
    }

    .dt-header__title {
      font-size: 21px;
    }
  }
`;

const AchievementChainCard = memo(({ streak, totalDone, todayDone, totalTasks }) => {
  const days = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
  const today = new Date().getDay();

  const chainDays = Array.from({ length: 7 }, (_, i) => {
    const dayIdx = (today - 6 + i + 7) % 7;
    const isPast = i < 6;
    const isToday = i === 6;
    const isDone = isPast ? i < streak : todayDone === totalTasks;
    return { label: days[dayIdx], isDone, isToday };
  });

  const bestStreak = Math.max(
    streak,
    parseInt(localStorage.getItem('dt_best_streak') || '0', 10)
  );

  return (
    <div className="dt-chain-card">
      <div className="dt-chain-card__header">
        <div>
          <div className="dt-chain-card__title">
            <FaLink />
            <span>سلسلة الإنجازات</span>
          </div>
          <div className="dt-chain-card__subtitle">حافظ على سلسلتك اليومية</div>
        </div>

        <div className="dt-chain-card__badge">
          <FaMedal />
          <span>أفضل: {bestStreak} يوم</span>
        </div>
      </div>

      <div className="dt-streak-row">
        <span className="dt-streak-fire"><FaFire /></span>
        <div style={{ textAlign: 'center' }}>
          <div className="dt-streak-num">{streak}</div>
          <div className="dt-streak-label">يوم متتالي</div>
        </div>
        <span className="dt-streak-fire"><FaFire /></span>
      </div>

      <div className="dt-chain-links">
        {chainDays.map((day, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className={`dt-chain-connector${day.isDone ? '' : ' dt-chain-connector--future'}`} />
            )}
            <div
              className={`dt-chain-link ${
                day.isDone
                  ? 'dt-chain-link--done'
                  : day.isToday
                  ? 'dt-chain-link--today'
                  : 'dt-chain-link--future'
              }`}
              title={day.label}
            >
              {day.isDone ? <FiCheckCircle /> : day.isToday ? <FiTarget /> : day.label.charAt(0)}
            </div>
          </React.Fragment>
        ))}
      </div>

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

const DailyProgressCard = memo(({ done, total }) => {
  const pct = total ? Math.round((done / total) * 100) : 0;

  const msgs = [
    'ابدأ يومك بخطوة صغيرة.',
    'رائع! استمر في التقدم.',
    'أكثر من النصف! أنت بطل.',
    'تقريباً انتهيت! لا تتوقف.',
    'أكملت كل مهامك اليوم! أحسنت.',
  ];

  const msgIdx =
    done === 0
      ? 0
      : done === total
      ? 4
      : done <= total * 0.25
      ? 1
      : done <= total * 0.5
      ? 2
      : 3;

  return (
    <div className="dt-progress-card">
      <div className="dt-progress-card__row">
        <span className="dt-progress-card__title">
          <FiActivity />
          <span>تقدم اليوم</span>
        </span>
        <span className="dt-progress-card__count">
          {done}/{total} مهمة
        </span>
      </div>

      <div className="dt-progress-bar">
        <div
          className="dt-progress-bar__fill"
          style={{ width: `${Math.max(pct, done > 0 ? 8 : 0)}%` }}
        />
      </div>

      <div className="dt-progress-card__msg">{msgs[msgIdx]}</div>
    </div>
  );
});

const DailyTaskCard = memo(({ task, done, onToggle, animDelay }) => {
  const Icon = task.icon;

  return (
    <div
      className={`dt-task-card${done ? ' dt-task-card--done' : ''}`}
      style={{ animationDelay: `${animDelay}s` }}
      onClick={() => onToggle(task)}
    >
      <div
        className={`dt-task-card__icon-wrap ${
          done ? 'dt-task-card__icon-wrap--done' : 'dt-task-card__icon-wrap--pending'
        }`}
      >
        {done ? <FaCheckCircle /> : <Icon />}
      </div>

      <div className="dt-task-card__body">
        <div className={`dt-task-card__title${done ? ' dt-task-card__title--done' : ''}`}>
          {task.title}
        </div>

        <div className="dt-task-card__desc">{task.desc}</div>

        <div className="dt-task-card__chips">
          <span className="dt-task-chip dt-task-chip--kp">
            <FaStar />
            <span>{task.kp} KP</span>
          </span>

          <span className="dt-task-chip dt-task-chip--xp">
            <FiTarget />
            <span>{task.xp} XP</span>
          </span>

          <span className="dt-task-chip dt-task-chip--time">
            <FiClock />
            <span>{task.duration}</span>
          </span>

          <span className="dt-task-chip dt-task-chip--cat">{task.category}</span>
        </div>

        {done && (
          <div className="dt-task-progress">
            <div className="dt-task-progress__fill" style={{ width: '100%' }} />
          </div>
        )}
      </div>

      <div className={`dt-task-card__check${done ? ' dt-task-card__check--done' : ''}`}>
        {done ? <FaCheckCircle /> : '○'}
      </div>
    </div>
  );
});

const MaintainChainCard = memo(() => (
  <div className="dt-tips-card">
    <div className="dt-tips-card__header">
      <span className="dt-tips-card__icon">
        <FaLink />
      </span>
      <div>
        <div className="dt-tips-card__title">كيف تحافظ على سلسلتك؟</div>
        <div className="dt-tips-card__subtitle">نصائح ذهبية للاستمرارية</div>
      </div>
    </div>

    <div className="dt-tips-list">
      {CHAIN_TIPS.map((tip, i) => {
        const Icon = tip.Icon;
        return (
          <div key={i} className="dt-tip-item">
            <span className="dt-tip-item__icon">
              <Icon />
            </span>

            <div>
              <div className="dt-tip-item__title">{tip.title}</div>
              <div className="dt-tip-item__desc">{tip.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
));

const ReminderCard = memo(() => {
  const [settings, setSettings] = useState(loadReminderSettings);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSoundSelect = useCallback((soundId) => {
    AudioManager.getInstance().unlock();
    const sound = NOTIFICATION_SOUNDS.find((s) => s.id === soundId);
    sound?.play();
    setSettings((prev) => ({ ...prev, sound: soundId }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('win');

    const newSettings = { ...settings, enabled: true };
    saveReminderSettings(newSettings);
    setSaved(true);

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    const [h, m] = settings.time.split(':').map(Number);
    const now = new Date();
    const target = new Date(settings.date || new Date());
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target - now;

    timerRef.current = setTimeout(() => {
      const sound = NOTIFICATION_SOUNDS.find((s) => s.id === settings.sound);
      AudioManager.getInstance().unlock();
      sound?.play();

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('مدينة العطاء — تذكير يومي', {
          body: 'حان وقت إنجاز مهامك اليومية! لا تكسر سلسلتك.',
          icon: '/favicon.ico',
        });
      }
    }, delay);

    setTimeout(() => setSaved(false), 3000);
  }, [settings]);

  return (
    <div className="dt-reminder-card">
      <div className="dt-reminder-card__header">
        <span className="dt-reminder-card__bell">
          <FaBell />
        </span>
        <div>
          <div className="dt-reminder-card__title">إشعار التذكير اليومي</div>
          <div className="dt-reminder-card__subtitle">اختر وقت التذكير ونغمته المفضلة</div>
        </div>
      </div>

      <div className="dt-reminder-form">
        <div className="dt-form-row">
          <div className="dt-form-group">
            <label className="dt-form-label">
              <FaClock />
              <span>وقت التذكير</span>
            </label>
            <input
              type="time"
              className="dt-form-input"
              value={settings.time}
              onChange={(e) => {
                setSettings((p) => ({ ...p, time: e.target.value }));
                setSaved(false);
              }}
            />
          </div>

          <div className="dt-form-group">
            <label className="dt-form-label">
              <FiCalendar />
              <span>يبدأ من تاريخ</span>
            </label>
            <input
              type="date"
              className="dt-form-input"
              value={settings.date || new Date().toISOString().split('T')[0]}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setSettings((p) => ({ ...p, date: e.target.value }));
                setSaved(false);
              }}
            />
          </div>
        </div>

        <div>
          <div className="dt-form-label" style={{ marginBottom: 8 }}>
            <FaMusic />
            <span>اختر نغمة التذكير</span>
          </div>

          <div className="dt-sound-grid">
            {NOTIFICATION_SOUNDS.map((sound) => {
              const Icon = sound.Icon;
              return (
                <button
                  key={sound.id}
                  type="button"
                  className={`dt-sound-btn${settings.sound === sound.id ? ' dt-sound-btn--active' : ''}`}
                  onClick={() => handleSoundSelect(sound.id)}
                >
                  <span className="dt-sound-btn__play">
                    <Icon />
                  </span>
                  <span>{sound.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={`dt-save-btn${saved ? ' dt-save-btn--saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? (
            <>
              <FaCheckCircle />
              <span>تم حفظ التذكير</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>حفظ وتفعيل التذكير</span>
            </>
          )}
        </button>

        {saved && (
          <div className="dt-saved-msg">
            <FaBell />
            <span>
              سيتم تذكيرك يومياً الساعة {settings.time} بنغمة{' '}
              {NOTIFICATION_SOUNDS.find((s) => s.id === settings.sound)?.label}
            </span>
          </div>
        )}

        {'Notification' in window && Notification.permission === 'denied' && (
          <div
            style={{
              background: '#fef2f2',
              border: '1.5px solid #fca5a5',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 11,
              fontWeight: 700,
              color: '#b91c1c',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <FaBell />
            <span>
              الإشعارات محظورة في المتصفح. فعّلها من إعدادات المتصفح للحصول على التذكيرات.
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

const AllDoneCelebration = memo(() => (
  <div className="dt-celebration">
    <span className="dt-celebration__icon">
      <FaTrophy />
    </span>
    <div>
      <div className="dt-celebration__title">أكملت كل مهامك اليوم!</div>
      <div className="dt-celebration__desc">
        سلسلتك تزداد قوة! استمر غداً للحفاظ عليها.
      </div>
    </div>
  </div>
));

const DailyTasksTab = () => {
  const [doneIds, setDoneIds] = useState(loadDoneToday);
  const [streak, setStreak] = useState(loadStreak);
  const [rewardClaimed, setRewardClaimed] = useState(loadRewardClaimed);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevDoneCount = useRef(doneIds.size);

  const totalTasks = DAILY_TASKS.length;
  const doneCount = doneIds.size;
  const todayXp = DAILY_TASKS.filter((task) => doneIds.has(task.id)).reduce(
    (sum, task) => sum + task.xp,
    0
  );
  const todayKp = DAILY_TASKS.filter((task) => doneIds.has(task.id)).reduce(
    (sum, task) => sum + task.kp,
    0
  );

  const [totalDone, setTotalDone] = useState(() => {
    try {
      return parseInt(localStorage.getItem('dt_total_done') || '0', 10);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (doneCount === totalTasks && prevDoneCount.current < totalTasks) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      saveStreak(newStreak);

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

    setDoneIds((prev) => {
      const next = new Set(prev);

      if (next.has(task.id)) {
        next.delete(task.id);
        AudioManager.getInstance().play('click');
      } else {
        next.add(task.id);
        AudioManager.getInstance().play('win');

        setTotalDone((t) => {
          const newTotal = t + 1;
          try {
            localStorage.setItem('dt_total_done', String(newTotal));
          } catch {}
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
      <style>{DT_CSS}</style>

      <div className="dt-header">
        <div className="dt-header__icon">
          <FiCheckCircle />
        </div>
        <div className="dt-header__title">المهام اليومية</div>
        <div className="dt-header__subtitle">
          حافظ على استمراريتك اليومية واجمع XP و KP كل يوم
        </div>
      </div>

      <AchievementChainCard
        streak={streak}
        totalDone={totalDone}
        todayDone={doneCount}
        totalTasks={totalTasks}
      />

      <DailyProgressCard done={doneCount} total={totalTasks} />

      {showCelebration && <AllDoneCelebration />}

      <div className="dt-reward-panel">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div className="dt-reward-panel__title">
              <FaGift />
              <span>مكافأتك اليومية</span>
            </div>
            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 700, marginTop: 4 }}>
              اجمع النقاط وأكمل المهام لتحصل على XP و KP.
            </div>
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
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: rewardClaimed
                ? 'none'
                : '0 12px 24px rgba(37,99,235,0.18)',
            }}
          >
            {rewardClaimed ? (
              <>
                <FaCheckCircle />
                <span>تمت المطالبة</span>
              </>
            ) : (
              <>
                <FaGift />
                <span>{todayXp} XP / {todayKp} KP</span>
              </>
            )}
          </button>
        </div>

        <div className="dt-reward-cards">
          <div className="dt-reward-mini">
            <div className="dt-reward-mini__label">نقاط XP اليوم</div>
            <div className="dt-reward-mini__value">
              <FiTarget />
              <span>{todayXp}</span>
            </div>
          </div>

          <div className="dt-reward-mini">
            <div className="dt-reward-mini__label">نقاط KP اليوم</div>
            <div className="dt-reward-mini__value">
              <FaStar />
              <span>{todayKp}</span>
            </div>
          </div>

          <div className="dt-reward-mini">
            <div className="dt-reward-mini__label">الحالة</div>
            <div className="dt-reward-mini__value">
              {doneCount === totalTasks ? <FaCheckCircle /> : <FiZap />}
              <span>{doneCount === totalTasks ? 'مكتمل' : 'قيد الإنجاز'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dt-section-title">
        <span className="dt-section-title__icon">
          <FaCheckCircle />
        </span>
        <span>
          مهام اليوم ({doneCount}/{totalTasks})
        </span>
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

      <MaintainChainCard />

      <div className="dt-section-title" style={{ marginTop: 4 }}>
        <span className="dt-section-title__icon">
          <FaBell />
        </span>
        <span>إشعار التذكير اليومي</span>
      </div>

      <ReminderCard />

      <div style={{ height: 20 }} />
    </div>
  );
};

export default memo(DailyTasksTab);