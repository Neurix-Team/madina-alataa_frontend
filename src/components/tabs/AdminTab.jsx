// src/components/tabs/AdminTab.jsx
/**
 * AdminTab — Admin Panel.
 * Domain: Actor → Admin
 *
 * Sections:
 *  1. KPI Overview (users, orders, beneficiaries, partners)
 *  2. Service Requests management
 *  3. Beneficiaries list
 *  4. Partners list
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const UsersManagementLazy = React.lazy(() => import('../../pages/UsersManagementEnhancedPage'));
const PartnersTabLazy = React.lazy(() => import('./PartnersTab'));
const PendingChildrenTabLazy = React.lazy(() => import('./PendingChildrenTab'));
import '../../styles/admin.css';
import { beneficiariesData, partnersData } from '../../data/beneficiariesData';
import serviceRequestsData from '../../data/ordersData';
import OrderService from '../../services/OrderService';
import { axiosClient } from '../../services/axiosClient';
import AnimatedBackground from '../common/AnimatedBackground';
import useGameState from '../../hooks/useGameState';

import {
  FaChartBar,
  FaClipboardList,
  FaHome,
  FaHandshake,
  FaUsers,
  FaStar,
  FaSearch,
  FaCheckCircle,
  FaHospital,
  FaSchool,
  FaLeaf,
  FaBuilding,
  FaMosque,
  FaUserFriends,
  FaInfoCircle,
  FaHeart,
  FaMapMarkerAlt,
  FaBell,
} from 'react-icons/fa';
import {
  FiTrendingUp,
  FiFilter,
} from 'react-icons/fi';

const CSS = `
  .admin-page {
    direction: rtl;
    display: grid;
    gap: 16px;
    font-family: 'Cairo', sans-serif;
    color: #0f172a;
    position: relative;
  }

  .admin-shell {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 16px;
  }

  .admin-hero {
    background:
      radial-gradient(circle at top right, rgba(73,198,242,0.12), transparent 28%),
      radial-gradient(circle at bottom left, rgba(184,140,248,0.08), transparent 24%),
      linear-gradient(135deg, #ffffff 0%, #f8fcff 55%, #faf7ff 100%);
    border-radius: 24px;
    padding: 20px 24px;
    box-shadow: 0 18px 40px rgba(15,23,42,0.06);
    border: 1.5px solid rgba(226,232,240,0.9);
    text-align: center;
  }

  .admin-hero__icon {
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

  .admin-hero__title {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .admin-hero__subtitle {
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
  }

  .admin-tabs {
    display: flex;
    gap: 8px;
    background: #fff;
    border-radius: 16px;
    padding: 6px;
    border: 1.5px solid rgba(226,232,240,0.9);
    box-shadow: 0 12px 24px rgba(15,23,42,0.04);
  }

  .admin-tab-btn {
    flex: 1;
    padding: 10px 8px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    font-size: 12px;
    font-weight: 800;
    transition: all 0.2s ease;
    background: transparent;
    color: #64748b;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .admin-tab-btn--active {
    background: linear-gradient(135deg,#4338ca,#6366f1);
    color: #fff;
    box-shadow: 0 4px 12px rgba(67,56,202,0.28);
  }

  .admin-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .admin-kpi-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 20px;
    padding: 18px 16px;
    text-align: center;
    box-shadow: 0 12px 28px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
  }

  .admin-kpi-card__icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    font-size: 18px;
  }

  .admin-kpi-card__value {
    font-size: 30px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 4px;
  }

  .admin-kpi-card__label {
    font-size: 12px;
    color: #64748b;
    font-weight: 800;
  }

  .admin-kpi-card--indigo .admin-kpi-card__icon,
  .admin-kpi-card--indigo .admin-kpi-card__value { color: #6366f1; }

  .admin-kpi-card--green .admin-kpi-card__icon,
  .admin-kpi-card--green .admin-kpi-card__value { color: #10b981; }

  .admin-kpi-card--blue .admin-kpi-card__icon,
  .admin-kpi-card--blue .admin-kpi-card__value { color: #2563eb; }

  .admin-kpi-card--red .admin-kpi-card__icon,
  .admin-kpi-card--red .admin-kpi-card__value { color: #ef4444; }

  .admin-section {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 22px;
    padding: 18px;
    border: 1.5px solid rgba(226,232,240,0.9);
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
  }

  .admin-section__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 17px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 14px;
  }

  .admin-section__title-icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f7f2ff);
    color: #2563eb;
    border: 1px solid rgba(186,230,253,0.9);
    font-size: 14px;
  }

  .admin-row-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-radius: 12px;
    margin-bottom: 8px;
  }

  .admin-row-box:last-child {
    margin-bottom: 0;
  }

  .admin-row-box__label {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
  }

  .admin-row-box__value {
    font-size: 18px;
    font-weight: 900;
    background: #fff;
    padding: 2px 12px;
    border-radius: 999px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }

  .admin-simple-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(226,232,240,0.9);
  }

  .admin-simple-row:last-child {
    border-bottom: none;
  }

  .admin-simple-row__label {
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .admin-simple-row__value {
    font-size: 15px;
    font-weight: 900;
    color: #0f172a;
  }

  .admin-toolbar {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
  }

  .admin-search {
    width: 100%;
    border: 1.5px solid rgba(226,232,240,0.9);
    border-radius: 12px;
    padding: 10px 12px;
    font-family: 'Cairo', sans-serif;
    font-size: 12px;
    direction: rtl;
    outline: none;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  }

  .admin-search:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
  }

  .admin-filter-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .admin-filter-chip {
    padding: 6px 10px;
    border: 1px solid rgba(226,232,240,0.9);
    border-radius: 999px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    font-size: 11px;
    font-weight: 800;
    background: #fff;
    color: #64748b;
  }

  .admin-filter-chip--active {
    background: linear-gradient(135deg,#4338ca,#6366f1);
    color: #fff;
    border-color: transparent;
  }

  .admin-ben-row,
  .admin-sr-row,
  .admin-partner-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(226,232,240,0.9);
  }

  .admin-ben-row:last-child,
  .admin-sr-row:last-child,
  .admin-partner-row:last-child {
    border-bottom: none;
  }

  .admin-ben-row__icon,
  .admin-partner-row__icon,
  .admin-sr-row__icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef8ff, #f5f3ff);
    color: #2563eb;
    border: 1px solid rgba(186,230,253,0.9);
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    font-size: 18px;
  }

  .admin-ben-row__info,
  .admin-partner-row__info,
  .admin-sr-row__content {
    flex: 1;
    min-width: 0;
  }

  .admin-ben-row__name,
  .admin-partner-row__name,
  .admin-sr-row__title {
    font-size: 14px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 3px;
  }

  .admin-ben-row__desc,
  .admin-partner-row__desc {
    font-size: 11px;
    color: #64748b;
    font-weight: 700;
    line-height: 1.7;
  }

  .admin-ben-row__badge,
  .admin-sr-row__chip,
  .admin-partner-row__count {
    font-size: 10px;
    font-weight: 900;
    padding: 5px 9px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .admin-partner-row__count {
    background: #eef8ff;
    color: #1d4ed8;
  }

  .admin-sr-row__meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .admin-progress {
    margin-top: 6px;
  }

  .admin-progress__bar {
    height: 8px;
    background: rgba(226,232,240,0.9);
    border-radius: 999px;
    overflow: hidden;
  }

  .admin-progress__fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.7s ease;
  }

  .admin-action-btn {
    flex-shrink: 0;
    padding: 8px 12px;
    background: linear-gradient(135deg,#1d4ed8,#3b82f6);
    color: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 900;
    font-family: 'Cairo', sans-serif;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .admin-action-btn:hover {
    transform: scale(1.05);
  }

  .admin-empty {
    text-align: center;
    padding: 22px 14px;
    border: 1.5px dashed rgba(226,232,240,0.9);
    border-radius: 12px;
    color: #64748b;
    font-weight: 700;
    background: #fff;
  }

  .admin-api-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .admin-api-stat {
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border: 1.5px solid rgba(226,232,240,0.9);
    border-radius: 16px;
    padding: 14px;
    box-shadow: 0 10px 20px rgba(15,23,42,0.04);
  }

  .admin-api-stat__label {
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .admin-api-stat__value {
    color: #0f172a;
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
    word-break: break-word;
  }

  .admin-api-sections {
    display: grid;
    gap: 12px;
  }

  .admin-api-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1.5px solid rgba(226,232,240,0.9);
    border-radius: 18px;
    padding: 16px;
  }

  .admin-api-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .admin-api-card__title {
    color: #0f172a;
    font-size: 14px;
    font-weight: 900;
  }

  .admin-api-card__badge {
    background: #eef8ff;
    color: #1d4ed8;
    border-radius: 999px;
    padding: 5px 10px;
    font-size: 10px;
    font-weight: 900;
  }

  .admin-api-list {
    display: grid;
    gap: 8px;
  }

  .admin-api-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid rgba(226,232,240,0.9);
  }

  .admin-api-row__label {
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    word-break: break-word;
  }

  .admin-api-row__value {
    color: #0f172a;
    font-size: 13px;
    font-weight: 900;
    text-align: left;
    direction: ltr;
    word-break: break-word;
  }

  .admin-api-collection {
    display: grid;
    gap: 10px;
  }

  .admin-api-collection__item {
    border-radius: 14px;
    border: 1px solid rgba(226,232,240,0.9);
    padding: 12px;
    background: #f8fafc;
  }

  .admin-api-raw {
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 14px;
    padding: 14px;
    overflow: auto;
    font-size: 12px;
    font-family: monospace;
    direction: ltr;
    text-align: left;
  }

  @media (max-width: 900px) {
    .admin-kpi-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .admin-tabs {
      flex-direction: column;
    }
  }

  @media (max-width: 560px) {
    .admin-kpi-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const URGENCY_COLORS = {
  critical: { bg: '#fee2e2', color: '#b91c1c' },
  high: { bg: '#fef3c7', color: '#d97706' },
  medium: { bg: '#eff6ff', color: '#1d4ed8' },
  low: { bg: '#f0fdf4', color: '#15803d' },
};

const STATUS_COLORS = {
  open: { bg: '#eff6ff', color: '#1d4ed8' },
  in_progress: { bg: '#fef9c3', color: '#92400e' },
  completed: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#f3f4f6', color: '#6b7280' },
};

const CATEGORY_LABELS = {
  elderly: 'مسنون',
  orphans: 'أيتام',
  education: 'تعليم',
  community: 'مجتمع',
  environment: 'بيئة',
  health: 'صحة',
  rural: 'ريف',
  ngo: 'منظمة',
  government: 'حكومي',
  corporate: 'شركة',
  religious: 'ديني',
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'elderly':
      return <FaUserFriends />;
    case 'orphans':
      return <FaHome />;
    case 'education':
      return <FaSchool />;
    case 'environment':
      return <FaLeaf />;
    case 'health':
      return <FaHospital />;
    case 'ngo':
      return <FaHandshake />;
    case 'government':
      return <FaBuilding />;
    case 'religious':
      return <FaMosque />;
    default:
      return <FaUsers />;
  }
};

const KpiCard = ({ icon: Icon, value, label, tone }) => (
  <div className={`admin-kpi-card admin-kpi-card--${tone}`}>
    <div className="admin-kpi-card__icon">
      <Icon />
    </div>
    <div className="admin-kpi-card__value">{value}</div>
    <div className="admin-kpi-card__label">{label}</div>
  </div>
);

const formatDashboardLabel = (key = '') =>
  String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

const formatDashboardValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return value.toLocaleString('ar-EG');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

const isPlainObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);

const extractDashboardOverview = (data) => {
  if (!isPlainObject(data)) return { stats: [], sections: [] };

  const stats = [];
  const sections = [];

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'number') {
      stats.push({ key, value });
      return;
    }

    if (typeof value === 'string' || typeof value === 'boolean') {
      stats.push({ key, value });
      return;
    }

    if (Array.isArray(value)) {
      sections.push({ key, type: 'array', value });
      return;
    }

    if (isPlainObject(value)) {
      sections.push({ key, type: 'object', value });
      return;
    }

    sections.push({ key, type: 'raw', value });
  });

  return { stats, sections };
};

const DashboardObjectRows = ({ data }) => (
  <div className="admin-api-list">
    {Object.entries(data).map(([key, value]) => (
      <div key={key} className="admin-api-row">
        <div className="admin-api-row__label">{formatDashboardLabel(key)}</div>
        <div className="admin-api-row__value">
          {isPlainObject(value) || Array.isArray(value) ? JSON.stringify(value) : formatDashboardValue(value)}
        </div>
      </div>
    ))}
  </div>
);

const DashboardSectionCard = ({ section }) => (
  <div className="admin-api-card">
    <div className="admin-api-card__head">
      <div className="admin-api-card__title">{formatDashboardLabel(section.key)}</div>
      <div className="admin-api-card__badge">
        {section.type === 'array' ? `${section.value.length} items` : section.type}
      </div>
    </div>

    {section.type === 'object' && <DashboardObjectRows data={section.value} />}

    {section.type === 'array' && (
      <div className="admin-api-collection">
        {section.value.length === 0 ? (
          <div className="admin-empty">لا توجد بيانات داخل هذا القسم</div>
        ) : (
          section.value.slice(0, 8).map((item, index) => (
            <div key={`${section.key}-${index}`} className="admin-api-collection__item">
              {isPlainObject(item) ? (
                <DashboardObjectRows data={item} />
              ) : (
                <div className="admin-api-row">
                  <div className="admin-api-row__label">Item {index + 1}</div>
                  <div className="admin-api-row__value">{formatDashboardValue(item)}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    )}

    {section.type === 'raw' && <pre className="admin-api-raw">{JSON.stringify(section.value, null, 2)}</pre>}
  </div>
);

const BeneficiaryRow = ({ ben }) => {
  const urgency = URGENCY_COLORS[ben.urgency] ?? URGENCY_COLORS.medium;
  const helped = ben.helpedCount ?? 0;
  const needs = ben.needsCount ?? 1;
  const pct = Math.min(100, Math.round((helped / needs) * 100));

  return (
    <div className="admin-ben-row">
      <span className="admin-ben-row__icon">{getCategoryIcon(ben.category)}</span>

      <div className="admin-ben-row__info">
        <div className="admin-ben-row__name">{ben.name}</div>
        <div className="admin-ben-row__desc">
          {CATEGORY_LABELS[ben.category] ?? ben.category} — {ben.description}
        </div>

        <div className="admin-progress" style={{ marginTop: 6 }}>
          <div className="admin-progress__bar">
            <div
              className="admin-progress__fill"
              style={{
                width: `${pct}%`,
                background:
                  pct >= 80
                    ? 'linear-gradient(90deg,#34d399,#10b981)'
                    : 'linear-gradient(90deg,#3b82f6,#1d4ed8)',
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
          {helped} / {needs} احتياج مُلبّى ({pct}%)
        </div>
      </div>

      <span
        className="admin-ben-row__badge"
        style={{ background: urgency.bg, color: urgency.color }}
      >
        {OrderService.urgencyLabel(ben.urgency).label}
      </span>
    </div>
  );
};

const ServiceRequestRow = ({ request, onFulfill }) => {
  const urgency = URGENCY_COLORS[request.urgency] ?? URGENCY_COLORS.medium;
  const status = STATUS_COLORS[request.status] ?? STATUS_COLORS.open;
  const ben = beneficiariesData.find((b) => b.id === request.beneficiaryId);
  const pct =
    request.requiredVolunteers > 0
      ? Math.round((request.currentVolunteers / request.requiredVolunteers) * 100)
      : 0;

  return (
    <div className="admin-sr-row">
      <span className="admin-sr-row__icon">
        {ben ? getCategoryIcon(ben.category) : <FaClipboardList />}
      </span>

      <div className="admin-sr-row__content">
        <div className="admin-sr-row__title">{request.title}</div>

        <div className="admin-sr-row__meta">
          <span className="admin-sr-row__chip" style={{ background: urgency.bg, color: urgency.color }}>
            {OrderService.urgencyLabel(request.urgency).label}
          </span>

          <span className="admin-sr-row__chip" style={{ background: status.bg, color: status.color }}>
            {OrderService.statusLabel(request.status).label}
          </span>

          <span className="admin-sr-row__chip" style={{ background: '#f3f4f6', color: '#6b7280' }}>
            {request.currentVolunteers}/{request.requiredVolunteers} متطوع
          </span>
        </div>

        <div className="admin-progress" style={{ marginTop: 8 }}>
          <div className="admin-progress__bar">
            <div
              className="admin-progress__fill"
              style={{
                width: `${pct}%`,
                background:
                  pct >= 100
                    ? 'linear-gradient(90deg,#34d399,#10b981)'
                    : 'linear-gradient(90deg,#fbbf24,#f59e0b)',
              }}
            />
          </div>
        </div>
      </div>

      {request.status === 'open' && (
        <button className="admin-action-btn" onClick={() => onFulfill?.(request.id)}>
          <FaCheckCircle />
          <span>تلبية</span>
        </button>
      )}
    </div>
  );
};

const PartnerRow = ({ partner }) => (
  <div className="admin-partner-row">
    <span className="admin-partner-row__icon">{getCategoryIcon(partner.category)}</span>

    <div className="admin-partner-row__info">
      <div className="admin-partner-row__name">{partner.name}</div>
      <div className="admin-partner-row__desc">
        {CATEGORY_LABELS[partner.category] ?? partner.category} — {partner.description}
      </div>
    </div>

    <span className="admin-partner-row__count">
      {partner.supportedBeneficiaries?.length ?? 0} مستفيد
    </span>
  </div>
);

const SECTIONS = [
  { id: 'overview', label: 'نظرة عامة', Icon: FaChartBar },
  { id: 'requests', label: 'الطلبات', Icon: FaClipboardList },
  { id: 'beneficiaries', label: 'المستفيدون', Icon: FaHome },
  { id: 'partners', label: 'الشركاء', Icon: FaHandshake },
  { id: 'incoming-requests', label: 'الطلبات الواردة', Icon: FaBell },
  { id: 'locations', label: 'العناوين', Icon: FaMapMarkerAlt },
  { id: 'users', label: 'إدارة المستخدمين', Icon: FaUsers },
];

const AdminTab = () => {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { userStats, orders = [] } = state;

  const [activeSection, setActiveSection] = useState('overview');
  const [requests, setRequests] = useState(serviceRequestsData);
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dashboard data from API
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        console.log('🔍 Fetching admin dashboard from API...');
        const response = await axiosClient.get('/api/admin/dashboard');
        console.log('✅ Admin Dashboard API Response:', response.data);
        setDashboardData(response.data);
      } catch (error) {
        console.error('❌ Error fetching admin dashboard:', error);
        if (error.response) {
          console.error('❌ Dashboard API Error:', {
            status: error.response.status,
            data: error.response.data
          });
        }
        setDashboardError(error.message || 'Failed to fetch dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const volunteerOrders = useMemo(
    () => orders.filter((o) => o.type === 'VolunteerOrder'),
    [orders]
  );

  const donationOrders = useMemo(
    () => orders.filter((o) => o.type === 'DonationOrder'),
    [orders]
  );

  const openRequests = requests.filter((r) => r.status === 'open').length;
  const totalKP = userStats?.kp ?? 0;
  const dashboardOverview = useMemo(() => extractDashboardOverview(dashboardData), [dashboardData]);

  const requestsFiltered = useMemo(() => {
    const normalizedSearch = requestSearch.trim().toLowerCase();

    return requests.filter((r) => {
      const matchStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      if (!matchStatus) return false;

      if (!normalizedSearch) return true;

      const ben = beneficiariesData.find((b) => b.id === r.beneficiaryId);
      const title = (r.title ?? '').toLowerCase();
      const benName = (ben?.name ?? '').toLowerCase();
      const urgencyLabel = (OrderService.urgencyLabel(r.urgency)?.label ?? '').toLowerCase();
      const statusLabel = (OrderService.statusLabel(r.status)?.label ?? '').toLowerCase();

      return (
        title.includes(normalizedSearch) ||
        benName.includes(normalizedSearch) ||
        urgencyLabel.includes(normalizedSearch) ||
        statusLabel.includes(normalizedSearch)
      );
    });
  }, [requests, requestSearch, statusFilter]);

  const handleFulfill = (requestId) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'completed' } : r))
    );
  };

  const handleTabClick = (sectionId) => {
    if (sectionId === 'locations') {
      navigate('/locations');
    } else {
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="admin-page">
      <AnimatedBackground />
      <style>{CSS}</style>

      <div className="admin-shell">
        <div className="admin-hero">
          <div className="admin-hero__icon">
            <FaChartBar />
          </div>
          <div className="admin-hero__title">لوحة الإدارة</div>
          <div className="admin-hero__subtitle">
            إدارة المستفيدين والشركاء والطلبات ومتابعة النشاط العام
          </div>
        </div>

        <div className="admin-tabs">
          {SECTIONS.map((sec) => {
            const Icon = sec.Icon;
            return (
              <button
                key={sec.id}
                className={`admin-tab-btn${activeSection === sec.id ? ' admin-tab-btn--active' : ''}`}
                onClick={() => handleTabClick(sec.id)}
              >
                <Icon />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {activeSection === 'overview' && (
          <>
            <div className="admin-kpi-grid">
              <KpiCard icon={FaHome} value={beneficiariesData.length} label="مستفيد مسجل" tone="indigo" />
              <KpiCard icon={FaHandshake} value={partnersData.length} label="شريك فاعل" tone="green" />
              <KpiCard icon={FaClipboardList} value={openRequests} label="طلب مفتوح" tone="blue" />
              <KpiCard icon={FaStar} value={totalKP.toLocaleString()} label="نقاط الخير" tone="red" />
            </div>

            <div className="admin-section">
              <div className="admin-section__title">
                <span className="admin-section__title-icon">
                  <FiTrendingUp />
                </span>
                <span>إحصائيات الأوامر</span>
              </div>

              {[
                { label: 'أوامر التطوع المكتملة', value: volunteerOrders.length, color: '#1d4ed8', bg: '#eff6ff' },
                { label: 'أوامر التبرع المكتملة', value: donationOrders.length, color: '#059669', bg: '#f0fdf4' },
                { label: 'طلبات الخدمة المفتوحة', value: openRequests, color: '#d97706', bg: '#fef3c7' },
                { label: 'إجمالي المستفيدين', value: beneficiariesData.length, color: '#7c3aed', bg: '#ede9fe' },
              ].map((item) => (
                <div key={item.label} className="admin-row-box" style={{ background: item.bg }}>
                  <span className="admin-row-box__label">{item.label}</span>
                  <span className="admin-row-box__value" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="admin-section">
              <div className="admin-section__title">
                <span className="admin-section__title-icon">
                  <FaStar />
                </span>
                <span>إنجازات المستخدم</span>
              </div>

              {[
                { label: 'المستوى الحالي', value: userStats?.level ?? 1, icon: <FiTrendingUp /> },
                { label: 'نقاط الخير (KP)', value: userStats?.kp ?? 0, icon: <FaStar /> },
                { label: 'نقاط الخبرة (XP)', value: userStats?.xp ?? 0, icon: <FaInfoCircle /> },
                { label: 'نقاط التأثير', value: userStats?.impactScore ?? 0, icon: <FaHeart /> },
              ].map((item) => (
                <div key={item.label} className="admin-simple-row">
                  <span className="admin-simple-row__label">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  <span className="admin-simple-row__value">
                    {typeof item.value === 'number'
                      ? item.value.toLocaleString('ar-EG')
                      : item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Dashboard API Response Display */}
            <div className="admin-section">
              <div className="admin-section__title">
                <span className="admin-section__title-icon">
                  <FaChartBar />
                </span>
                <span>بيانات لوحة التحكم (API)</span>
              </div>

              {dashboardLoading && (
                <div className="admin-empty">جاري تحميل بيانات لوحة التحكم...</div>
              )}

              {dashboardError && (
                <div className="admin-empty" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                  خطأ في تحميل البيانات: {dashboardError}
                </div>
              )}

              {!dashboardLoading && !dashboardError && dashboardData && (
                <div className="admin-api-sections">
                  {dashboardOverview.stats.length > 0 && (
                    <div className="admin-api-grid">
                      {dashboardOverview.stats.map((item) => (
                        <div key={item.key} className="admin-api-stat">
                          <div className="admin-api-stat__label">{formatDashboardLabel(item.key)}</div>
                          <div className="admin-api-stat__value">{formatDashboardValue(item.value)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {dashboardOverview.sections.map((section) => (
                    <DashboardSectionCard key={section.key} section={section} />
                  ))}

                  <div className="admin-api-card">
                    <div className="admin-api-card__head">
                      <div className="admin-api-card__title">الاستجابة الخام</div>
                      <div className="admin-api-card__badge">raw json</div>
                    </div>
                    <pre className="admin-api-raw">{JSON.stringify(dashboardData, null, 2)}</pre>
                  </div>
                </div>
              )}

              {!dashboardLoading && !dashboardError && !dashboardData && (
                <div className="admin-empty">لا توجد بيانات متاحة</div>
              )}
            </div>
          </>
        )}

        {activeSection === 'requests' && (
          <div className="admin-section">
            <div className="admin-section__title">
              <span className="admin-section__title-icon">
                <FaClipboardList />
              </span>
              <span>طلبات الخدمة ({requestsFiltered.length}/{requests.length})</span>
            </div>

            <div className="admin-toolbar">
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  placeholder="ابحث بالعنوان أو اسم المستفيد أو الحالة..."
                  className="admin-search"
                />
              </div>

              <div className="admin-filter-row">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'open', label: 'مفتوح' },
                  { id: 'in_progress', label: 'قيد التنفيذ' },
                  { id: 'completed', label: 'مكتمل' },
                  { id: 'cancelled', label: 'ملغي' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    className={`admin-filter-chip${statusFilter === filter.id ? ' admin-filter-chip--active' : ''}`}
                    onClick={() => setStatusFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {requestsFiltered.length === 0 ? (
              <div className="admin-empty">لا توجد طلبات مطابقة للبحث أو الفلتر الحالي</div>
            ) : (
              requestsFiltered.map((req) => (
                <ServiceRequestRow key={req.id} request={req} onFulfill={handleFulfill} />
              ))
            )}
          </div>
        )}

        {activeSection === 'beneficiaries' && (
          <div className="admin-section">
            <div className="admin-section__title">
              <span className="admin-section__title-icon">
                <FaHome />
              </span>
              <span>المستفيدون ({beneficiariesData.length})</span>
            </div>

            {beneficiariesData.map((ben) => (
              <BeneficiaryRow key={ben.id} ben={ben} />
            ))}
          </div>
        )}

        {activeSection === 'partners' && (
          <React.Suspense fallback={<div>جاري التحميل...</div>}>
            <PartnersTabLazy />
          </React.Suspense>
        )}

        {activeSection === 'incoming-requests' && (
          <React.Suspense fallback={<div>جاري التحميل...</div>}>
            <PendingChildrenTabLazy />
          </React.Suspense>
        )}

        {activeSection === 'users' && (
          <div className="admin-section">
            <div className="admin-section__title">
              <span className="admin-section__title-icon">
                <FaUsers />
              </span>
              <span>إدارة المستخدمين</span>
            </div>
            <div style={{ marginTop: 8 }}>
              {/* Lazy-load the users management page UI */}
              <React.Suspense fallback={<div>جاري التحميل...</div>}>
                <UsersManagementLazy />
              </React.Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTab;
