
// src/components/tabs/CityExplorationTab.jsx
import React, {
  useState,
  useCallback,
  memo,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import CITY_LOCATIONS from '../../data/cityExplorationData';
import AudioManager from '../../services/AudioManager';
import useGameState from '../../hooks/useGameState';

import {
  FaMapMarkedAlt,
  FaCrown,
  FaStar,
  FaTrophy,
  FaCheckCircle,
  FaHospital,
  FaUsers,
  FaTree,
  FaPaw,
  FaHeart,
  FaMusic,
  FaRecycle,
  FaCamera,
  FaHome,
  FaBookOpen,
  FaPaintBrush,
  FaHandsHelping,
  FaWheelchair,
  FaLanguage,
  FaTheaterMasks,
  FaSeedling,
  FaSpa,
  FaRobot,
} from 'react-icons/fa';

import {
  FiUnlock,
  FiLock,
  FiBarChart2,
  FiArrowRight,
  FiArrowLeft,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiZap,
  FiTarget,
  FiMapPin,
} from 'react-icons/fi';

import { GiSewingNeedle } from 'react-icons/gi';

// ── styles ────────────────────────────────────────────────────────────────

const CITY_EXPLORATION_STYLES = `
  .ce-tab {
    direction: rtl;
    display: grid;
    gap: 18px;
    font-family: 'Cairo', sans-serif;
    color: #0f172a;
  }

  .ce-header {
    background:
      radial-gradient(circle at top right, rgba(73,198,242,0.12), transparent 30%),
      radial-gradient(circle at bottom left, rgba(184,140,248,0.10), transparent 28%),
      linear-gradient(135deg, #ffffff 0%, #f7fcff 55%, #faf7ff 100%);
    border: 1px solid rgba(186, 230, 253, 0.95);
    border-radius: 24px;
    padding: 20px 20px 16px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
    overflow: hidden;
    position: relative;
  }

  .ce-header__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .ce-header__title {
    margin: 0;
    font-size: 24px;
    line-height: 1.2;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #0f172a;
    letter-spacing: -0.3px;
  }

  .ce-header__title-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #49c6f2, #5bb5f3);
    color: #fff;
    box-shadow: 0 10px 22px rgba(73,198,242,0.24);
    font-size: 18px;
  }

  .ce-header__subtitle {
    margin: 8px 0 0;
    color: #64748b;
    font-size: 14px;
    font-weight: 700;
  }

  .ce-level-badge {
    min-width: 110px;
    padding: 14px 16px;
    border-radius: 18px;
    background: linear-gradient(135deg, #f7f2ff, #f2f7ff);
    border: 1px solid rgba(221,214,254,0.95);
    display: grid;
    gap: 4px;
    justify-items: center;
    box-shadow: 0 10px 24px rgba(168,85,247,0.07);
  }

  .ce-level-badge__num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 22px;
    line-height: 1;
    font-weight: 900;
    color: #7c3aed;
  }

  .ce-level-badge__label {
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
  }

  .ce-header__progress-bar {
    margin-top: 16px;
    height: 10px;
    background: rgba(226,232,240,0.9);
    border-radius: 999px;
    overflow: hidden;
  }

  .ce-header__progress-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #49c6f2 0%, #56dcc9 50%, #be93ff 100%);
    box-shadow: 0 0 18px rgba(73,198,242,0.25);
    transition: width 0.5s ease;
  }

  .ce-header__progress-text {
    margin: 8px 0 0;
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
  }

  .ce-stats {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }

  .ce-stat-chip {
    border-radius: 20px;
    padding: 14px 16px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid rgba(226,232,240,0.9);
    box-shadow: 0 12px 26px rgba(15,23,42,0.04);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ce-stat-chip__val {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 17px;
    font-weight: 900;
    color: #0f172a;
  }

  .ce-stat-chip__icon {
    color: #49c6f2;
    font-size: 16px;
  }

  .ce-stat-chip__lbl {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
  }

  .ce-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 900;
    color: #0f172a;
    margin-top: 4px;
  }

  .ce-section-title__icon {
    width: 32px;
    height: 32px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f7f2ff);
    color: #5b9ef2;
    border: 1px solid rgba(186,230,253,0.95);
    font-size: 14px;
  }

  .ce-location-card {
    position: relative;
    border-radius: 22px;
    overflow: hidden;
    background: linear-gradient(180deg, #ffffff 0%, #f8fcff 100%);
    border: 1px solid rgba(226,232,240,0.9);
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    cursor: pointer;
  }

  .ce-location-card:hover.ce-location-card--unlocked {
    transform: translateY(-4px);
    box-shadow: 0 18px 36px rgba(15,23,42,0.08);
  }

  .ce-location-card--locked {
    opacity: 0.82;
    cursor: default;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .ce-location-card__accent {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 5px;
  }

  .ce-location-card__body {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
  }

  .ce-location-card__icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid;
    box-shadow: 0 8px 20px rgba(15,23,42,0.06);
    background: #fff;
  }

  .ce-location-card__icon {
    font-size: 28px;
  }

  .ce-location-card__info {
    flex: 1;
    min-width: 0;
  }

  .ce-location-card__name {
    font-size: 17px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 2px;
  }

  .ce-location-card__name-en {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 5px;
  }

  .ce-location-card__desc {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 10px;
  }

  .ce-card-progress {
    height: 8px;
    background: rgba(226,232,240,0.9);
    border-radius: 999px;
    overflow: hidden;
  }

  .ce-card-progress__fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.5s ease;
  }

  .ce-location-card__right {
    display: grid;
    gap: 8px;
    justify-items: end;
    flex-shrink: 0;
  }

  .ce-location-card__tasks-badge {
    padding: 6px 11px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    white-space: nowrap;
  }

  .ce-location-card__lock {
    color: #64748b;
    font-size: 20px;
  }

  .ce-location-card__level-req {
    padding: 5px 10px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #475569;
    font-size: 11px;
    font-weight: 900;
  }

  .ce-explore-btn {
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #49c6f2, #5ba6ef);
    color: #ffffff;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 10px 22px rgba(73,198,242,0.22);
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .ce-detail {
    display: grid;
    gap: 16px;
  }

  .ce-detail__back {
    width: fit-content;
    border: none;
    background: linear-gradient(135deg, #eff6ff, #f5f3ff);
    color: #334155;
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    border: 1px solid rgba(226,232,240,0.9);
  }

  .ce-detail__hero {
    color: #ffffff;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 18px 40px rgba(15,23,42,0.12);
    position: relative;
    overflow: hidden;
  }

  .ce-detail__hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 28%);
    pointer-events: none;
  }

  .ce-detail__hero-icon {
    width: 74px;
    height: 74px;
    border-radius: 20px;
    background: rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.24);
    margin-bottom: 14px;
  }

  .ce-detail__hero-name {
    font-size: 24px;
    line-height: 1.2;
    font-weight: 900;
    margin-bottom: 6px;
    position: relative;
    z-index: 1;
  }

  .ce-detail__hero-desc {
    font-size: 14px;
    font-weight: 700;
    color: rgba(255,255,255,0.9);
    position: relative;
    z-index: 1;
  }

  .ce-detail__hero-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
    position: relative;
    z-index: 1;
  }

  .ce-detail__hero-stat {
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.16);
    font-size: 12px;
    font-weight: 900;
    color: #fff;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .ce-ai-btn {
    border: none;
    border-radius: 18px;
    padding: 14px 16px;
    background: linear-gradient(135deg, #0f172a, #334155);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 900;
    box-shadow: 0 14px 28px rgba(15,23,42,0.14);
  }

  .ce-ai-btn--loading {
    opacity: 0.95;
  }

  .ce-ai-dots {
    display: inline-flex;
    gap: 4px;
  }

  .ce-ai-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    animation: ceBlink 1s infinite ease-in-out;
  }

  .ce-ai-dots span:nth-child(2) { animation-delay: 0.15s; }
  .ce-ai-dots span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes ceBlink {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-2px); }
  }

  .ce-task-card {
    position: relative;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(226,232,240,0.9);
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 12px 28px rgba(15,23,42,0.05);
    overflow: hidden;
  }

  .ce-task-card--done {
    background: linear-gradient(180deg, #f0fdf4 0%, #f7fff9 100%);
    border-color: rgba(134,239,172,0.9);
  }

  .ce-task-card--ai {
    border-color: rgba(221,214,254,0.95);
    box-shadow: 0 14px 30px rgba(168,85,247,0.06);
  }

  .ce-task-card__ai-badge {
    position: absolute;
    top: 14px;
    left: 14px;
    padding: 6px 10px;
    border-radius: 999px;
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    color: #7c3aed;
    font-size: 11px;
    font-weight: 900;
    border: 1px solid rgba(221,214,254,0.95);
  }

  .ce-task-card__header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 12px;
  }

  .ce-task-card__icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #4f46e5;
    border: 1px solid rgba(226,232,240,0.9);
    box-shadow: 0 8px 18px rgba(15,23,42,0.05);
    font-size: 24px;
  }

  .ce-task-card__title {
    font-size: 16px;
    font-weight: 900;
    color: #0f172a;
  }

  .ce-task-card__story {
    margin: 12px 0;
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    line-height: 1.8;
  }

  .ce-task-card__meta {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .ce-task-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    line-height: 1;
  }

  .ce-task-chip--diff-easy   { background: #ecfdf5; color: #15803d; }
  .ce-task-chip--diff-medium { background: #eff6ff; color: #1d4ed8; }
  .ce-task-chip--diff-hard   { background: #fff7ed; color: #c2410c; }
  .ce-task-chip--diff-vhard  { background: #fef2f2; color: #b91c1c; }

  .ce-task-chip--cat { background: #f5f3ff; color: #7c3aed; }
  .ce-task-chip--dur { background: #f8fafc; color: #475569; }
  .ce-task-chip--kp  { background: #fff7cc; color: #a16207; }
  .ce-task-chip--xp  { background: #eff6ff; color: #1d4ed8; }
  .ce-task-chip--imp { background: #ecfdf5; color: #15803d; }

  .ce-task-card__done-badge {
    border-radius: 14px;
    background: linear-gradient(135deg, #dcfce7, #ecfdf5);
    color: #166534;
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(134,239,172,0.9);
  }

  .ce-task-card__start-btn {
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #49c6f2, #5ba6ef);
    color: #ffffff;
    padding: 12px 16px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(73,198,242,0.22);
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .ce-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.48);
    backdrop-filter: blur(3px);
    z-index: 999;
  }

  .ce-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    width: min(92vw, 520px);
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 24px;
    padding: 24px;
    border: 1px solid rgba(226,232,240,0.95);
    box-shadow: 0 24px 60px rgba(15,23,42,0.18);
    text-align: center;
  }

  .ce-modal__icon {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f7f2ff);
    color: #4f46e5;
    font-size: 30px;
    box-shadow: 0 12px 24px rgba(15,23,42,0.06);
  }

  .ce-modal__title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 900;
    color: #0f172a;
  }

  .ce-modal__story {
    margin: 0 0 16px;
    font-size: 14px;
    color: #64748b;
    font-weight: 700;
    line-height: 1.8;
  }

  .ce-modal__rewards {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-bottom: 18px;
  }

  .ce-modal__reward-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 900;
  }

  .ce-modal__confirm-btn {
    width: 100%;
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #ffffff;
    padding: 14px 16px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    margin-bottom: 10px;
    box-shadow: 0 14px 28px rgba(16,185,129,0.18);
  }

  .ce-modal__cancel-btn {
    width: 100%;
    border: none;
    border-radius: 16px;
    background: #f8fafc;
    color: #475569;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    border: 1px solid rgba(226,232,240,0.9);
  }

  .ce-success-overlay {
    position: fixed;
    inset: 0;
    z-index: 1100;
    background: radial-gradient(circle at center, rgba(15,23,42,0.14), rgba(15,23,42,0.58));
    backdrop-filter: blur(4px);
    display: grid;
    place-items: center;
    overflow: hidden;
    transition: opacity 0.35s ease, transform 0.35s ease;
  }

  .ce-success-overlay--enter { opacity: 0; }
  .ce-success-overlay--show  { opacity: 1; }
  .ce-success-overlay--exit  { opacity: 0; }

  .ce-success-star {
    position: absolute;
    color: #ffd54a;
    opacity: 0;
    animation: ceFloatStar 2.6s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(255,213,74,0.25));
  }

  @keyframes ceFloatStar {
    0%   { transform: translateY(18px) scale(0.75); opacity: 0; }
    20%  { opacity: 1; }
    60%  { transform: translateY(-12px) scale(1.04); opacity: 1; }
    100% { transform: translateY(-26px) scale(0.9); opacity: 0; }
  }

  .ce-success-card {
    width: min(92vw, 460px);
    border-radius: 28px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(226,232,240,0.95);
    box-shadow: 0 28px 70px rgba(15,23,42,0.18);
    padding: 28px 24px 22px;
    position: relative;
    text-align: center;
    overflow: hidden;
  }

  .ce-success-ripple {
    position: absolute;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px solid rgba(73,198,242,0.22);
    pointer-events: none;
  }

  .ce-success-ripple--1 { width: 140px; height: 140px; animation: ceRipple 2.4s ease-out infinite; }
  .ce-success-ripple--2 { width: 190px; height: 190px; animation: ceRipple 2.4s ease-out infinite 0.35s; }
  .ce-success-ripple--3 { width: 240px; height: 240px; animation: ceRipple 2.4s ease-out infinite 0.7s; }

  @keyframes ceRipple {
    0% { opacity: 0.35; transform: translate(-50%, -50%) scale(0.84); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.08); }
  }

  .ce-success-check {
    position: relative;
    width: 88px;
    height: 88px;
    margin: 0 auto 16px;
    z-index: 1;
  }

  .ce-success-check__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .ce-success-check__circle {
    fill: #ecfdf5;
    stroke: #10b981;
    stroke-width: 2.5;
  }

  .ce-success-check__path {
    fill: none;
    stroke: #10b981;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .ce-success-title {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    position: relative;
    z-index: 1;
  }

  .ce-success-task-name {
    margin-top: 6px;
    font-size: 15px;
    font-weight: 800;
    color: #475569;
    position: relative;
    z-index: 1;
  }

  .ce-success-rewards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    position: relative;
    z-index: 1;
  }

  .ce-success-reward-chip {
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .ce-success-reward-chip__icon {
    display: inline-flex;
    align-items: center;
  }

  .ce-success-hint {
    margin-top: 14px;
    font-size: 12px;
    color: #94a3b8;
    font-weight: 800;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .ce-location-card__body {
      grid-template-columns: 1fr;
      display: grid;
    }

    .ce-location-card__right {
      justify-items: start;
    }

    .ce-header__title {
      font-size: 21px;
    }

    .ce-detail__hero-name {
      font-size: 21px;
    }

    .ce-task-card__header {
      align-items: center;
    }
  }
`;

// ── helpers ───────────────────────────────────────────────────────────────

const DIFF_CLASS = {
  سهل: 'ce-task-chip--diff-easy',
  متوسط: 'ce-task-chip--diff-medium',
  صعب: 'ce-task-chip--diff-hard',
  'صعب جداً': 'ce-task-chip--diff-vhard',
};

const LOCATION_ICON_MAP = {
  loc_nursing: FaHeart,
  loc_orphan: FaUsers,
  loc_park: FaTree,
  loc_hospital: FaHospital,
  loc_animals: FaPaw,
};

const TASK_ICON_MAP = {
  sewing: GiSewingNeedle,
  music: FaMusic,
  activity: FiActivity,
  language: FaLanguage,
  theater: FaTheaterMasks,
  seed: FaSeedling,
  paint: FaPaintBrush,
  recycle: FaRecycle,
  flower: FaSpa,
  book: FaBookOpen,
  transport: FaWheelchair,
  paw: FaPaw,
  camera: FaCamera,
  home: FaHome,
  star: FaStar,
  urgent: FiZap,
  help: FaHandsHelping,
};

const CATEGORY_ICON_MAP = {
  تعليم: FaLanguage,
  إبداع: FaPaintBrush,
  بيئة: FaSeedling,
  خدمة: FaHandsHelping,
  رعاية: FiActivity,
  مهارات: GiSewingNeedle,
  روحاني: FaBookOpen,
  تنظيم: FiTarget,
  ترفيه: FaMusic,
};

const PARTICLE_ICONS = [FaStar, FaTrophy, FaCheckCircle, FiZap];

// Simulated AI-generated tasks pool per location type
const AI_TASK_POOL = {
  loc_nursing: [
    {
      title: 'تعليم الخياطة اليدوية',
      story: 'السيدة نور تريد تعلم الخياطة لتشغل وقتها. علمها الأساسيات بصبر.',
      difficulty: 'متوسط',
      kp: 55,
      xp: 110,
      impact: 9,
      category: 'مهارات',
      duration: '1.5 ساعة',
      iconKey: 'sewing',
    },
    {
      title: 'جلسة الموسيقى والأناشيد',
      story: 'المسنون يحبون الأناشيد القديمة. نظم لهم جلسة موسيقية ممتعة.',
      difficulty: 'سهل',
      kp: 45,
      xp: 90,
      impact: 8,
      category: 'ترفيه',
      duration: '1 ساعة',
      iconKey: 'music',
    },
    {
      title: 'مساعدة في العلاج الطبيعي',
      story: 'الحاج كريم يحتاج لمساعدة في تمارينه اليومية. كن بجانبه.',
      difficulty: 'متوسط',
      kp: 60,
      xp: 120,
      impact: 10,
      category: 'رعاية',
      duration: '1 ساعة',
      iconKey: 'activity',
    },
  ],
  loc_orphan: [
    {
      title: 'تعليم لغة إنجليزية بسيطة',
      story: 'الأطفال يريدون تعلم كلمات إنجليزية. علمهم بطريقة ممتعة.',
      difficulty: 'متوسط',
      kp: 65,
      xp: 130,
      impact: 14,
      category: 'تعليم',
      duration: '1 ساعة',
      iconKey: 'language',
    },
    {
      title: 'مسرحية صغيرة',
      story: 'الأطفال يريدون تمثيل قصة. ساعدهم في إعداد مسرحية بسيطة.',
      difficulty: 'صعب',
      kp: 90,
      xp: 180,
      impact: 18,
      category: 'إبداع',
      duration: '2 ساعة',
      iconKey: 'theater',
    },
    {
      title: 'زراعة نباتات صغيرة',
      story: 'علم الأطفال كيفية زراعة النباتات وتعلم المسؤولية.',
      difficulty: 'سهل',
      kp: 40,
      xp: 80,
      impact: 10,
      category: 'بيئة',
      duration: '1 ساعة',
      iconKey: 'seed',
    },
  ],
  loc_park: [
    {
      title: 'تركيب ألعاب الأطفال',
      story: 'الحديقة تحتاج لألعاب جديدة للأطفال. ساعد في تركيبها.',
      difficulty: 'صعب',
      kp: 100,
      xp: 200,
      impact: 22,
      category: 'خدمة',
      duration: '3 ساعات',
      iconKey: 'help',
    },
    {
      title: 'رسم جداريات ملونة',
      story: 'جدران الحديقة رمادية. ارسم عليها جداريات ملونة وجميلة.',
      difficulty: 'صعب',
      kp: 110,
      xp: 220,
      impact: 20,
      category: 'إبداع',
      duration: '4 ساعات',
      iconKey: 'paint',
    },
    {
      title: 'نصب صناديق إعادة التدوير',
      story: 'الحديقة تحتاج لصناديق إعادة تدوير. ساعد في نصبها وتوعية الناس.',
      difficulty: 'متوسط',
      kp: 70,
      xp: 140,
      impact: 20,
      category: 'بيئة',
      duration: '2 ساعة',
      iconKey: 'recycle',
    },
  ],
  loc_hospital: [
    {
      title: 'توزيع الورود على المرضى',
      story: 'وردة واحدة تصنع فرقاً. وزع الورود على المرضى وأضف البسمة.',
      difficulty: 'سهل',
      kp: 40,
      xp: 80,
      impact: 12,
      category: 'خدمة',
      duration: '1 ساعة',
      iconKey: 'flower',
    },
    {
      title: 'قراءة القرآن للمرضى',
      story: 'المرضى يجدون الراحة في سماع القرآن. اقرأ لهم بصوت هادئ.',
      difficulty: 'سهل',
      kp: 45,
      xp: 90,
      impact: 14,
      category: 'روحاني',
      duration: '1 ساعة',
      iconKey: 'book',
    },
    {
      title: 'مساعدة في نقل المرضى',
      story: 'بعض المرضى يحتاجون مساعدة في التنقل داخل المستشفى.',
      difficulty: 'متوسط',
      kp: 55,
      xp: 110,
      impact: 10,
      category: 'خدمة',
      duration: '1 ساعة',
      iconKey: 'transport',
    },
  ],
  loc_animals: [
    {
      title: 'تدريب القطط على الاجتماعية',
      story: 'بعض القطط خائفة من البشر. ساعد في تدريبها على الثقة.',
      difficulty: 'متوسط',
      kp: 60,
      xp: 120,
      impact: 15,
      category: 'مهارات',
      duration: '1.5 ساعة',
      iconKey: 'paw',
    },
    {
      title: 'تصوير الحيوانات للتبني',
      story: 'صور احترافية تساعد في إيجاد منازل للحيوانات. التقط صوراً جميلة.',
      difficulty: 'متوسط',
      kp: 65,
      xp: 130,
      impact: 18,
      category: 'إبداع',
      duration: '2 ساعة',
      iconKey: 'camera',
    },
    {
      title: 'بناء أكواخ للحيوانات',
      story: 'الحيوانات تحتاج لمأوى دافئ. ساعد في بناء أكواخ بسيطة.',
      difficulty: 'صعب',
      kp: 95,
      xp: 190,
      impact: 22,
      category: 'خدمة',
      duration: '3 ساعات',
      iconKey: 'home',
    },
  ],
  default: [
    {
      title: 'مهمة تطوعية خاصة',
      story: 'مهمة مميزة تم توليدها خصيصاً لك. أكملها وافرح بمكافأتها!',
      difficulty: 'متوسط',
      kp: 70,
      xp: 140,
      impact: 18,
      category: 'خدمة',
      duration: '1.5 ساعة',
      iconKey: 'star',
    },
    {
      title: 'مساعدة عاجلة',
      story: 'شخص يحتاج مساعدتك الآن. لا تتأخر وكن البطل الذي ينتظره.',
      difficulty: 'صعب',
      kp: 100,
      xp: 200,
      impact: 25,
      category: 'رعاية',
      duration: '2 ساعة',
      iconKey: 'urgent',
    },
    {
      title: 'مبادرة مجتمعية',
      story: 'فكرة بسيطة يمكنها تغيير حياة الكثيرين. نفذها الآن!',
      difficulty: 'صعب',
      kp: 120,
      xp: 240,
      impact: 30,
      category: 'تنظيم',
      duration: '3 ساعات',
      iconKey: 'help',
    },
  ],
};

let _aiIdCounter = 1000;

const getLocationIcon = (loc) => LOCATION_ICON_MAP[loc.id] || FiMapPin;

const getTaskIcon = (task) => {
  if (task?.iconKey && TASK_ICON_MAP[task.iconKey]) return TASK_ICON_MAP[task.iconKey];
  if (task?.category && CATEGORY_ICON_MAP[task.category]) return CATEGORY_ICON_MAP[task.category];
  return FaStar;
};

// ── Task Success Overlay ──────────────────────────────────────────────────

const STAR_COUNT = 18;

const TaskSuccessOverlay = memo(({ task, onDone }) => {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 50);
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    const t3 = setTimeout(() => onDone(), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  const stars = useRef(
    Array.from({ length: STAR_COUNT }, () => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 12 + Math.random() * 12,
      delay: Math.random() * 0.6,
      iconIndex: Math.floor(Math.random() * PARTICLE_ICONS.length),
    }))
  ).current;

  return (
    <div className={`ce-success-overlay ce-success-overlay--${phase}`} onClick={onDone}>
      {stars.map((s, i) => {
        const Particle = PARTICLE_ICONS[s.iconIndex];
        return (
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
            <Particle />
          </span>
        );
      })}

      <div className="ce-success-card">
        <div className="ce-success-ripple ce-success-ripple--1" />
        <div className="ce-success-ripple ce-success-ripple--2" />
        <div className="ce-success-ripple ce-success-ripple--3" />

        <div className="ce-success-check">
          <svg viewBox="0 0 52 52" className="ce-success-check__svg">
            <circle className="ce-success-check__circle" cx="26" cy="26" r="24" />
            <path className="ce-success-check__path" d="M14 27 l8 8 l16-16" />
          </svg>
        </div>

        <div className="ce-success-title">تم الإنجاز بنجاح</div>
        <div className="ce-success-task-name">{task.title}</div>

        <div className="ce-success-rewards">
          <div className="ce-success-reward-chip" style={{ background: '#fff7cc', color: '#92400e' }}>
            <span className="ce-success-reward-chip__icon"><FaStar /></span>
            <span>+{task.kp} KP</span>
          </div>

          <div className="ce-success-reward-chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <span className="ce-success-reward-chip__icon"><FiBarChart2 /></span>
            <span>+{task.xp} XP</span>
          </div>

          <div className="ce-success-reward-chip" style={{ background: '#ecfdf5', color: '#166534' }}>
            <span className="ce-success-reward-chip__icon"><FiTrendingUp /></span>
            <span>تأثير +{task.impact}</span>
          </div>
        </div>

        <div className="ce-success-hint">اضغط في أي مكان للإغلاق</div>
      </div>
    </div>
  );
});

// ── Task Modal ────────────────────────────────────────────────────────────

const TaskModal = memo(({ task, onConfirm, onClose }) => {
  const TaskIcon = getTaskIcon(task);

  return (
    <>
      <div className="ce-modal-overlay" onClick={onClose} />
      <div className="ce-modal">
        <div className="ce-modal__icon">
          <TaskIcon />
        </div>

        <h3 className="ce-modal__title">{task.title}</h3>
        <p className="ce-modal__story">{task.story}</p>

        <div className="ce-modal__rewards">
          <span className="ce-modal__reward-chip" style={{ background: '#fff7cc', color: '#92400e' }}>
            <FaStar />
            <span>+{task.kp} KP</span>
          </span>

          <span className="ce-modal__reward-chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <FiBarChart2 />
            <span>+{task.xp} XP</span>
          </span>

          <span className="ce-modal__reward-chip" style={{ background: '#ecfdf5', color: '#166534' }}>
            <FiTrendingUp />
            <span>تأثير +{task.impact}</span>
          </span>

          <span className="ce-modal__reward-chip" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <FiClock />
            <span>{task.duration}</span>
          </span>
        </div>

        <button className="ce-modal__confirm-btn" onClick={onConfirm}>
          <FaCheckCircle />
          <span>أكملت المهمة واستلام المكافأة</span>
        </button>

        <button className="ce-modal__cancel-btn" onClick={onClose}>
          لاحقاً
        </button>
      </div>
    </>
  );
});

// ── Task Card ─────────────────────────────────────────────────────────────

const TaskCard = memo(({ task, done, onStart, isAI }) => {
  const diffClass = DIFF_CLASS[task.difficulty] ?? DIFF_CLASS['متوسط'];
  const TaskIcon = getTaskIcon(task);

  return (
    <div className={`ce-task-card${done ? ' ce-task-card--done' : ''}${isAI ? ' ce-task-card--ai' : ''}`}>
      {isAI && (
        <span className="ce-task-card__ai-badge">
          <FaRobot />
          <span>AI</span>
        </span>
      )}

      <div className="ce-task-card__header">
        <div className="ce-task-card__icon">
          <TaskIcon />
        </div>

        <div style={{ flex: 1 }}>
          <div className="ce-task-card__title">{task.title}</div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            <span className={`ce-task-chip ${diffClass}`}>{task.difficulty}</span>
            <span className="ce-task-chip ce-task-chip--cat">{task.category}</span>
            <span className="ce-task-chip ce-task-chip--dur">
              <FiClock />
              <span>{task.duration}</span>
            </span>
          </div>
        </div>
      </div>

      <p className="ce-task-card__story">{task.story}</p>

      <div className="ce-task-card__meta">
        <span className="ce-task-chip ce-task-chip--kp">
          <FaStar />
          <span>{task.kp} KP</span>
        </span>

        <span className="ce-task-chip ce-task-chip--xp">
          <FiBarChart2 />
          <span>{task.xp} XP</span>
        </span>

        <span className="ce-task-chip ce-task-chip--imp">
          <FiTrendingUp />
          <span>تأثير {task.impact}</span>
        </span>
      </div>

      {done ? (
        <div className="ce-task-card__done-badge">
          <FaCheckCircle />
          <span>مهمة مكتملة</span>
        </div>
      ) : (
        <button className="ce-task-card__start-btn" onClick={() => onStart(task)}>
          <FiZap />
          <span>ابدأ المهمة الآن</span>
        </button>
      )}
    </div>
  );
});

// ── Location Card ─────────────────────────────────────────────────────────

const LocationCard = memo(({ loc, userLevel, completedIds, onOpen }) => {
  const unlocked = userLevel >= loc.requiredLevel;
  const done = loc.tasks.filter((t) => completedIds.has(t.id)).length;
  const total = loc.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const allDone = done === total;
  const LocationIcon = getLocationIcon(loc);

  return (
    <div
      className={`ce-location-card${unlocked ? ' ce-location-card--unlocked' : ' ce-location-card--locked'}`}
      style={unlocked ? { borderColor: loc.borderColor } : {}}
      onClick={() => {
        if (unlocked) {
          AudioManager.getInstance().play('open');
          onOpen(loc);
        }
      }}
    >
      <div className="ce-location-card__accent" style={{ background: loc.gradient }} />

      <div className="ce-location-card__body">
        <div
          className="ce-location-card__icon-wrap"
          style={{ background: loc.bgLight, borderColor: loc.borderColor }}
        >
          {unlocked ? (
            <LocationIcon className="ce-location-card__icon" style={{ color: loc.color }} />
          ) : (
            <FiLock className="ce-location-card__icon" style={{ color: '#64748b' }} />
          )}
        </div>

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

        <div className="ce-location-card__right">
          {unlocked ? (
            <>
              <span
                className="ce-location-card__tasks-badge"
                style={{ background: loc.bgLight, color: loc.color }}
              >
                {done}/{total} مهمة
              </span>

              {allDone ? (
                <span style={{ fontSize: 11, fontWeight: 900, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FaCheckCircle />
                  <span>مكتمل</span>
                </span>
              ) : (
                <button
                  className="ce-explore-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    AudioManager.getInstance().play('open');
                    onOpen(loc);
                  }}
                >
                  <span>استكشف الآن</span>
                  <FiArrowLeft />
                </button>
              )}
            </>
          ) : (
            <>
              <span className="ce-location-card__lock"><FiLock /></span>
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
  const [aiTasks, setAiTasks] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [toast, setToast] = useState(null);

  const done = loc.tasks.filter((t) => completedIds.has(t.id)).length;
  const total = loc.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const LocationIcon = getLocationIcon(loc);

  const handleGenerate = useCallback(() => {
    if (generating) return;

    setGenerating(true);
    AudioManager.getInstance().play('click');

    setTimeout(() => {
      const pool = AI_TASK_POOL[loc.id] ?? AI_TASK_POOL.default;
      const available = pool.filter((p) => !aiTasks.some((a) => a.title === p.title));

      if (available.length === 0) {
        setGenerating(false);
        return;
      }

      const pick = available[Math.floor(Math.random() * available.length)];
      const newTask = { ...pick, id: `ai_${loc.id}_${++_aiIdCounter}`, isAI: true };

      setAiTasks((prev) => [...prev, newTask]);
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
      <button className="ce-detail__back" onClick={onBack}>
        <FiArrowRight />
        <span>العودة للخريطة</span>
      </button>

      <div className="ce-detail__hero" style={{ background: loc.gradient }}>
        <div className="ce-detail__hero-icon">
          <LocationIcon />
        </div>

        <div className="ce-detail__hero-name">{loc.name}</div>
        <div className="ce-detail__hero-desc">{loc.description}</div>

        <div className="ce-detail__hero-stats">
          <span className="ce-detail__hero-stat">
            <FiTarget />
            <span>{total} مهمة</span>
          </span>

          <span className="ce-detail__hero-stat">
            <FaCheckCircle />
            <span>{done} مكتملة</span>
          </span>

          <span className="ce-detail__hero-stat">
            <FiBarChart2 />
            <span>{pct}% تقدم</span>
          </span>

          {aiTasks.length > 0 && (
            <span className="ce-detail__hero-stat">
              <FaRobot />
              <span>{aiTasks.length} AI</span>
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: 16,
          padding: '12px 16px',
          marginBottom: 14,
          boxShadow: '0 12px 24px rgba(15,23,42,0.04)',
          border: '1.5px solid rgba(226,232,240,0.9)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: '#0f172a' }}>
            تقدمك في {loc.name}
          </span>
          <span style={{ fontSize: 12, fontWeight: 900, color: loc.color }}>
            {done}/{total}
          </span>
        </div>

        <div style={{ height: 10, background: 'rgba(226,232,240,0.9)', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: loc.gradient,
              borderRadius: 99,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>

      <button
        className={`ce-ai-btn${generating ? ' ce-ai-btn--loading' : ''}`}
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? (
          <>
            <FaRobot />
            <span>جاري توليد مهمة جديدة بالذكاء الاصطناعي</span>
            <div className="ce-ai-dots">
              <span />
              <span />
              <span />
            </div>
          </>
        ) : (
          <>
            <FaRobot />
            <span>توليد مهمة جديدة بالذكاء الاصطناعي</span>
          </>
        )}
      </button>

      <div className="ce-section-title">
        <span className="ce-section-title__icon">
          <FiTarget />
        </span>
        <span>المهام المتاحة ({allTasks.length})</span>
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

      {activeTask && (
        <TaskModal
          task={activeTask}
          onConfirm={handleConfirm}
          onClose={() => setActiveTask(null)}
        />
      )}

      {toast && <TaskSuccessOverlay task={toast} onDone={() => setToast(null)} />}
    </div>
  );
});

// ── Main Tab ──────────────────────────────────────────────────────────────

const CityExplorationTab = () => {
  const { state, actions } = useGameState();
  const { userStats, completedQuests } = state;
  const { completeQuest } = actions;

  const [selectedLoc, setSelectedLoc] = useState(null);
  const [localDone, setLocalDone] = useState(() => new Set());

  const userLevel = userStats?.level ?? 1;

  const allCompleted = useMemo(() => {
    const merged = new Set(completedQuests ?? []);
    localDone.forEach((id) => merged.add(id));
    return merged;
  }, [completedQuests, localDone]);

  const handleCompleteTask = useCallback(
    (task) => {
      setLocalDone((prev) => new Set([...prev, task.id]));
      completeQuest?.(task);
    },
    [completeQuest]
  );

  const totalTasks = CITY_LOCATIONS.reduce((s, l) => s + l.tasks.length, 0);
  const completedCount = CITY_LOCATIONS.reduce(
    (s, l) => s + l.tasks.filter((t) => allCompleted.has(t.id)).length,
    0
  );
  const unlockedLocs = CITY_LOCATIONS.filter((l) => userLevel >= l.requiredLevel).length;
  const overallPct = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;

  const unlockedList = CITY_LOCATIONS.filter((l) => userLevel >= l.requiredLevel);
  const lockedList = CITY_LOCATIONS.filter((l) => userLevel < l.requiredLevel);

  if (selectedLoc) {
    return (
      <div className="ce-tab">
        <style>{CITY_EXPLORATION_STYLES}</style>
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
      <style>{CITY_EXPLORATION_STYLES}</style>

      <div className="ce-header">
        <div className="ce-header__top">
          <div>
            <h2 className="ce-header__title">
              <span className="ce-header__title-icon">
                <FaMapMarkedAlt />
              </span>
              <span>استكشاف المدينة</span>
            </h2>

            <p className="ce-header__subtitle">
              استكشف أماكن المدينة وأكمل المهام الخيرية
            </p>
          </div>

          <div className="ce-level-badge">
            <span className="ce-level-badge__num">
              <FaCrown />
              <span>{userLevel}</span>
            </span>
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

      <div className="ce-stats">
        {[
          { val: unlockedLocs, lbl: 'مكان مفتوح', icon: FiUnlock },
          { val: completedCount, lbl: 'مهمة مكتملة', icon: FaCheckCircle },
          { val: lockedList.length, lbl: 'مكان مقفل', icon: FiLock },
          { val: `${overallPct}%`, lbl: 'التقدم الكلي', icon: FiBarChart2 },
        ].map(({ val, lbl, icon: StatIcon }) => (
          <div key={lbl} className="ce-stat-chip">
            <span className="ce-stat-chip__val">
              <StatIcon className="ce-stat-chip__icon" />
              <span>{val}</span>
            </span>
            <span className="ce-stat-chip__lbl">{lbl}</span>
          </div>
        ))}
      </div>

      {unlockedList.length > 0 && (
        <>
          <div className="ce-section-title">
            <span className="ce-section-title__icon">
              <FiUnlock />
            </span>
            <span>الأماكن المتاحة ({unlockedList.length})</span>
          </div>

          {unlockedList.map((loc) => (
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

      {lockedList.length > 0 && (
        <>
          <div className="ce-section-title" style={{ marginTop: 8 }}>
            <span className="ce-section-title__icon">
              <FiLock />
            </span>
            <span>أماكن مقفلة — ارفع مستواك لفتحها ({lockedList.length})</span>
          </div>

          {lockedList.map((loc) => (
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

      <div
        style={{
          background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
          border: '1.5px solid #86efac',
          borderRadius: 18,
          padding: '14px 18px',
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          direction: 'rtl',
          boxShadow: '0 10px 24px rgba(22,163,74,0.06)',
        }}
      >
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.7)',
            color: '#15803d',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          <FiZap />
        </span>

        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#166534' }}>نصيحة</div>
          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>
            أكمل المهام لرفع مستواك وفتح أماكن جديدة. استخدم زر الذكاء الاصطناعي داخل كل مكان لتوليد مهام إضافية.
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(CityExplorationTab);