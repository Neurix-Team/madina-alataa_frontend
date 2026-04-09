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
import React, { useState, useMemo } from 'react';
import '../../styles/admin.css';
import { beneficiariesData, partnersData } from '../../data/beneficiariesData';
import serviceRequestsData from '../../data/ordersData';
import OrderService from '../../services/OrderService';
import AnimatedBackground from '../common/AnimatedBackground';

// ── Helpers ───────────────────────────────────────────────────────────────
const URGENCY_COLORS = {
  critical: { bg: '#fee2e2', color: '#b91c1c' },
  high:     { bg: '#fef3c7', color: '#d97706' },
  medium:   { bg: '#eff6ff', color: '#1d4ed8' },
  low:      { bg: '#f0fdf4', color: '#15803d' },
};

const STATUS_COLORS = {
  open:        { bg: '#eff6ff', color: '#1d4ed8' },
  in_progress: { bg: '#fef9c3', color: '#92400e' },
  completed:   { bg: '#dcfce7', color: '#166534' },
  cancelled:   { bg: '#f3f4f6', color: '#6b7280' },
};

const CATEGORY_LABELS = {
  elderly:     '👴 مسنون',
  orphans:     '👶 أيتام',
  education:   '🎓 تعليم',
  community:   '🏘️ مجتمع',
  environment: '🌿 بيئة',
  health:      '🏥 صحة',
  rural:       '🌾 ريف',
  ngo:         '🤝 منظمة',
  government:  '🏛️ حكومي',
  corporate:   '🏢 شركة',
  religious:   '🕌 ديني',
};

// ── KPI Card ──────────────────────────────────────────────────────────────
const KpiCard = ({ icon, value, label, tone }) => (
  <div className={`admin-kpi-card admin-kpi-card--${tone}`}>
    <span className="admin-kpi-card__icon">{icon}</span>
    <div className="admin-kpi-card__value">{value}</div>
    <div className="admin-kpi-card__label">{label}</div>
  </div>
);

// ── Beneficiary Row ───────────────────────────────────────────────────────
const BeneficiaryRow = ({ ben }) => {
  const urgency = URGENCY_COLORS[ben.urgency] ?? URGENCY_COLORS.medium;
  const helped  = ben.helpedCount ?? 0;
  const needs   = ben.needsCount  ?? 1;
  const pct     = Math.min(100, Math.round((helped / needs) * 100));

  return (
    <div className="admin-ben-row">
      <span className="admin-ben-row__emoji">{ben.emoji}</span>
      <div className="admin-ben-row__info">
        <div className="admin-ben-row__name">{ben.name}</div>
        <div className="admin-ben-row__desc">
          {CATEGORY_LABELS[ben.category] ?? ben.category} — {ben.description}
        </div>
        {/* Progress */}
        <div className="admin-progress" style={{ marginTop: 6 }}>
          <div className="admin-progress__bar">
            <div
              className="admin-progress__fill"
              style={{
                width: `${pct}%`,
                background: pct >= 80
                  ? 'linear-gradient(90deg,#34d399,#10b981)'
                  : 'linear-gradient(90deg,#3b82f6,#1d4ed8)',
              }}
            />
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 2 }}>
          {helped} / {needs} احتياج مُلبَّى ({pct}%)
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

// ── Service Request Row ───────────────────────────────────────────────────
const ServiceRequestRow = ({ request, onFulfill }) => {
  const urgency = URGENCY_COLORS[request.urgency] ?? URGENCY_COLORS.medium;
  const status  = STATUS_COLORS[request.status]   ?? STATUS_COLORS.open;
  const ben     = beneficiariesData.find((b) => b.id === request.beneficiaryId);
  const pct     = request.requiredVolunteers > 0
    ? Math.round((request.currentVolunteers / request.requiredVolunteers) * 100)
    : 0;

  return (
    <div className="admin-sr-row">
      <span style={{ fontSize: 22, flexShrink: 0 }}>{ben?.emoji ?? '📋'}</span>
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
            👥 {request.currentVolunteers}/{request.requiredVolunteers}
          </span>
        </div>
        <div className="admin-progress" style={{ marginTop: 8 }}>
          <div className="admin-progress__bar">
            <div
              className="admin-progress__fill"
              style={{
                width: `${pct}%`,
                background: pct >= 100
                  ? 'linear-gradient(90deg,#34d399,#10b981)'
                  : 'linear-gradient(90deg,#fbbf24,#f59e0b)',
              }}
            />
          </div>
        </div>
      </div>
      {request.status === 'open' && (
        <button
          onClick={() => onFulfill?.(request.id)}
          style={{
            flexShrink: 0,
            padding: '6px 12px',
            background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 900,
            fontFamily: "'Cairo', sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ✅ تلبية
        </button>
      )}
    </div>
  );
};

// ── Partner Row ───────────────────────────────────────────────────────────
const PartnerRow = ({ partner }) => (
  <div className="admin-partner-row">
    <span className="admin-partner-row__emoji">{partner.emoji}</span>
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

// ── AdminTab ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',      label: 'نظرة عامة',   icon: '📊' },
  { id: 'requests',      label: 'الطلبات',      icon: '📋' },
  { id: 'beneficiaries', label: 'المستفيدون',   icon: '🏠' },
  { id: 'partners',      label: 'الشركاء',      icon: '🤝' },
];

import useGameState from '../../hooks/useGameState';

const AdminTab = () => {
  const { state } = useGameState();
  const { userStats, orders = [] } = state;
  const [activeSection, setActiveSection] = useState('overview');
  const [requests, setRequests] = useState(serviceRequestsData);
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const volunteerOrders = useMemo(() => orders.filter((o) => o.type === 'VolunteerOrder'), [orders]);
  const donationOrders  = useMemo(() => orders.filter((o) => o.type === 'DonationOrder'),  [orders]);
  const openRequests    = requests.filter((r) => r.status === 'open').length;
  const totalKP         = userStats?.kp ?? 0;

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
      prev.map((r) => r.id === requestId ? { ...r, status: 'completed' } : r)
    );
  };

  return (
    <div className="admin-page">
      <AnimatedBackground />

      {/* ── Header ── */}
      <div className="admin-header admin-header--animated">
        <h2>⚙️ لوحة الإدارة</h2>
        <p>إدارة المستفيدين والشركاء والطلبات</p>
      </div>

      {/* ── Section Tabs ── */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 18,
        background: 'var(--bg-card)', borderRadius: 16,
        padding: 6, border: '1.5px solid var(--border)',
        direction: 'rtl',
      }}>
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            style={{
              flex: 1, padding: '9px 6px',
              border: 'none', borderRadius: 12,
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              fontSize: 11, fontWeight: 700,
              transition: 'all 0.2s ease',
              background: activeSection === sec.id
                ? 'linear-gradient(135deg,#4338ca,#6366f1)'
                : 'transparent',
              color: activeSection === sec.id ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeSection === sec.id
                ? '0 4px 12px rgba(67,56,202,0.3)'
                : 'none',
            }}
          >
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeSection === 'overview' && (
        <>
          <div className="admin-kpi-grid">
            <KpiCard icon="🏠" value={beneficiariesData.length} label="مستفيد مسجل"  tone="indigo" />
            <KpiCard icon="🤝" value={partnersData.length}      label="شريك فاعل"    tone="green"  />
            <KpiCard icon="📋" value={openRequests}             label="طلب مفتوح"    tone="blue"   />
            <KpiCard icon="⭐" value={totalKP.toLocaleString()} label="نقاط الخير"   tone="red"    />
          </div>

          <div className="admin-section">
            <div className="admin-section__title">📈 إحصائيات الأوامر</div>
            {[
              { label: 'أوامر التطوع المكتملة', value: volunteerOrders.length, color: '#1d4ed8', bg: '#eff6ff' },
              { label: 'أوامر التبرع المكتملة',  value: donationOrders.length,  color: '#059669', bg: '#f0fdf4' },
              { label: 'طلبات الخدمة المفتوحة',  value: openRequests,           color: '#d97706', bg: '#fef3c7' },
              { label: 'إجمالي المستفيدين',       value: beneficiariesData.length, color: '#7c3aed', bg: '#ede9fe' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: item.bg,
                borderRadius: 12, marginBottom: 8, direction: 'rtl',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: 18, fontWeight: 900, color: item.color,
                  background: '#fff', padding: '2px 12px', borderRadius: 99,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="admin-section">
            <div className="admin-section__title">🏆 إنجازات المستخدم</div>
            {[
              { label: 'المستوى الحالي',    value: userStats?.level ?? 1,  icon: '⬆️' },
              { label: 'نقاط الخير (KP)',   value: userStats?.kp ?? 0,     icon: '⭐' },
              { label: 'نقاط الخبرة (XP)',  value: userStats?.xp ?? 0,     icon: '🔷' },
              { label: 'نقاط التأثير',      value: userStats?.impactScore ?? 0, icon: '🌍' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid var(--border)', direction: 'rtl',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {item.icon} {item.label}
                </span>
                <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>
                  {typeof item.value === 'number' ? item.value.toLocaleString('ar-EG') : item.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Service Requests ── */}
      {activeSection === 'requests' && (
        <div className="admin-section">
          <div className="admin-section__title">📋 طلبات الخدمة ({requestsFiltered.length}/{requests.length})</div>

          <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={requestSearch}
              onChange={(e) => setRequestSearch(e.target.value)}
              placeholder="ابحث بالعنوان أو اسم المستفيد أو الحالة..."
              style={{
                width: '100%',
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                padding: '8px 10px',
                fontFamily: "'Cairo', sans-serif",
                fontSize: 12,
                direction: 'rtl',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', direction: 'rtl' }}>
              {[
              { id: 'all', label: 'الكل' },
                { id: 'open', label: 'مفتوح' },
                { id: 'in_progress', label: 'قيد التنفيذ' },
                { id: 'completed', label: 'مكتمل' },
                { id: 'cancelled', label: 'ملغي' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    background: statusFilter === filter.id ? 'linear-gradient(135deg,#4338ca,#6366f1)' : '#fff',
                    color: statusFilter === filter.id ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {requestsFiltered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '22px 14px',
                border: '1.5px dashed var(--border)',
                borderRadius: 12,
                color: 'var(--text-secondary)',
                fontWeight: 700,
                direction: 'rtl',
              }}
            >
              لا توجد طلبات مطابقة للبحث/الفلتر الحالي.
            </div>
          ) : (
            requestsFiltered.map((req) => (
              <ServiceRequestRow key={req.id} request={req} onFulfill={handleFulfill} />
            ))
          )}
        </div>
      )}

      {/* ── Beneficiaries ── */}
      {activeSection === 'beneficiaries' && (
        <div className="admin-section">
          <div className="admin-section__title">🏠 المستفيدون ({beneficiariesData.length})</div>
          {beneficiariesData.map((ben) => (
            <BeneficiaryRow key={ben.id} ben={ben} />
          ))}
        </div>
      )}

      {/* ── Partners ── */}
      {activeSection === 'partners' && (
        <div className="admin-section">
          <div className="admin-section__title">🤝 الشركاء ({partnersData.length})</div>
          {partnersData.map((partner) => (
            <PartnerRow key={partner.id} partner={partner} />
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminTab;
