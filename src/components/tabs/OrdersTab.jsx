// src/components/tabs/OrdersTab.jsx
/**
 * OrdersTab — Displays all Domain Orders.
 * Domain: Actors → creates → Orders → serves → Beneficiary
 *
 * Three sections:
 *  1. ServiceRequests  — requests from Beneficiaries needing help
 *  2. VolunteerOrders  — created when user completes quests
 *  3. DonationOrders   — created when user donates
 */
import React, { useState, useMemo, useEffect } from 'react';
import '../../styles/orders.css';
import OrderService from '../../services/OrderService';
import serviceRequestsData from '../../data/ordersData';
import beneficiariesData from '../../data/beneficiariesData';
import useGameState from '../../hooks/useGameState';
import { usePermissions } from '../../hooks/usePermissions';import { useAuth } from '../../hooks/useAuth';import { PERMISSIONS } from '../../utils/permissions';

// ── Helpers ───────────────────────────────────────────────────────────────
const getBeneficiary = (id) =>
  beneficiariesData.find((b) => b.id === id) ?? null;

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── ServiceRequest Card ───────────────────────────────────────────────────
const ServiceRequestCard = ({ request }) => {
  const ben      = getBeneficiary(request.beneficiaryId);
  const urgency  = OrderService.urgencyLabel(request.urgency);
  const status   = OrderService.statusLabel(request.status);
  const progress = request.requiredVolunteers > 0
    ? Math.round((request.currentVolunteers / request.requiredVolunteers) * 100)
    : 0;

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          {ben && (
            <span style={{ fontSize: 22, flexShrink: 0 }}>{ben.emoji}</span>
          )}
          <div>
            <div className="order-card__title">{request.title}</div>
            {ben && (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {ben.name}
              </div>
            )}
          </div>
        </div>
        <span
          className="order-card__badge"
          style={{ background: urgency.bg, color: urgency.color }}
        >
          {urgency.label}
        </span>
      </div>

      <p className="order-card__desc">{request.description}</p>

      <div className="order-card__meta">
        <span
          className="order-card__chip"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
        <span className="order-card__chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
          👥 {request.currentVolunteers}/{request.requiredVolunteers} متطوع
        </span>
        <span className="order-card__chip" style={{ background: '#f3f4f6', color: '#6b7280' }}>
          📅 {formatDate(request.createdAt)}
        </span>
      </div>

      {/* Volunteer progress */}
      <div className="order-progress">
        <div className="order-progress__label">
          <span>تقدم التطوع</span>
          <span>{progress}%</span>
        </div>
        <div className="order-progress__bar">
          <div
            className="order-progress__fill"
            style={{
              width: `${progress}%`,
              background: progress >= 100
                ? 'linear-gradient(90deg,#34d399,#10b981)'
                : 'linear-gradient(90deg,#3b82f6,#1d4ed8)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── VolunteerOrder Card ───────────────────────────────────────────────────
const VolunteerOrderCard = ({ order }) => {
  const ben    = getBeneficiary(order.beneficiaryId);
  const status = OrderService.statusLabel(order.status);

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 22 }}>🤝</span>
          <div>
            <div className="order-card__title">طلب تطوع مكتمل</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
              {ben ? ben.name : 'مهمة عامة'} — مهمة #{order.questId}
            </div>
          </div>
        </div>
        <span
          className="order-card__badge"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      <div className="order-card__meta">
        <span className="order-card__chip" style={{ background: '#fef9c3', color: '#92400e' }}>
          ⭐ +{order.reward?.kp ?? 0} KP
        </span>
        <span className="order-card__chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
          🔷 +{order.reward?.xp ?? 0} XP
        </span>
        <span className="order-card__chip" style={{ background: '#f0fdf4', color: '#166534' }}>
          🌍 تأثير +{order.reward?.impact ?? 0}
        </span>
        <span className="order-card__chip" style={{ background: '#f3f4f6', color: '#6b7280' }}>
          📅 {formatDate(order.createdAt)}
        </span>
      </div>
    </div>
  );
};

// ── DonationOrder Card ────────────────────────────────────────────────────
const DonationOrderCard = ({ order }) => {
  const ben    = getBeneficiary(order.beneficiaryId);
  const status = OrderService.statusLabel(order.status);

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 22 }}>💝</span>
          <div>
            <div className="order-card__title">تبرع مكتمل</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
              {ben ? `لصالح: ${ben.name}` : 'تبرع عام'}
            </div>
          </div>
        </div>
        <span
          className="order-card__badge"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      <div className="order-card__meta">
        <span className="order-card__chip" style={{ background: '#fce7f3', color: '#9d174d' }}>
          💰 {order.amount} نقطة
        </span>
        <span className="order-card__chip" style={{ background: '#fef9c3', color: '#92400e' }}>
          ⭐ +{order.kpConverted ?? 0} KP
        </span>
        <span className="order-card__chip" style={{ background: '#f3f4f6', color: '#6b7280' }}>
          📅 {formatDate(order.createdAt)}
        </span>
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────
const EmptyState = ({ icon, text }) => (
  <div className="orders-empty">
    <span className="orders-empty__icon">{icon}</span>
    <p className="orders-empty__text">{text}</p>
  </div>
);

// ── OrdersTab ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'requests',   label: 'طلبات المساعدة', icon: '📋' },
  { id: 'volunteer',  label: 'تطوعي',          icon: '🤝' },
  { id: 'donations',  label: 'تبرعاتي',        icon: '💝' },
];

const OrdersTab = () => {
  const { state } = useGameState();
  const { orders = [] } = state;
  const { can } = usePermissions();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('admin');
  const isParent = user?.roles?.includes('parent');

  const availableTabs = useMemo(() => {
    return TABS.filter(tab => {
      if (tab.id === 'donations') return can(PERMISSIONS.VIEW_MY_DONATIONS);
    return TABS.filter((tab) => {
      if (tab.id === 'donations') return can(PERMISSIONS.VIEW_MY_DONATIONS) && !isAdmin && !isParent;
      return true;
    });
  }, [can, isAdmin, isParent]);

  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs.length > 0 ? availableTabs[0].id : 'requests');
    }
  }, [availableTabs, activeTab]);

  // Merge seeded service requests with runtime orders
  const allServiceRequests = useMemo(() => {
    const runtimeSR = orders.filter((o) => o.type === 'ServiceRequest');
    const seededIds  = new Set(runtimeSR.map((r) => r.id));
    const seeded     = serviceRequestsData.filter((r) => !seededIds.has(r.id));
    return [...seeded, ...runtimeSR];
  }, [orders]);

  const volunteerOrders = useMemo(
    () => orders.filter((o) => o.type === 'VolunteerOrder'),
    [orders]
  );

  const donationOrders = useMemo(
    () => orders.filter((o) => o.type === 'DonationOrder'),
    [orders]
  );

  // Stats
  const openRequests    = allServiceRequests.filter((r) => r.status === 'open').length;
  const totalVolunteer  = volunteerOrders.length;
  const totalDonations  = donationOrders.length;

  return (
    <div className="orders-page">

      {/* ── Header ── */}
      <div className="orders-header">
        <h2>📋 الطلبات والأوامر</h2>
        <p>تتبع طلبات المساعدة وأوامر التطوع والتبرعات</p>
      </div>

      {/* ── Stats ── */}
      <div className="orders-stats-grid">
        <div className="orders-stat-card orders-stat-card--blue">
          <span className="orders-stat-card__icon">📋</span>
          <div className="orders-stat-card__value">{openRequests}</div>
          <div className="orders-stat-card__label">طلب مفتوح</div>
        </div>
        <div className="orders-stat-card orders-stat-card--green">
          <span className="orders-stat-card__icon">🤝</span>
          <div className="orders-stat-card__value">{totalVolunteer}</div>
          <div className="orders-stat-card__label">تطوع مكتمل</div>
        </div>
        <div className="orders-stat-card orders-stat-card--orange">
          <span className="orders-stat-card__icon">💝</span>
          <div className="orders-stat-card__value">{totalDonations}</div>
          <div className="orders-stat-card__label">تبرع مكتمل</div>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="orders-tabs">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            className={`orders-tab-btn${activeTab === tab.id ? ' orders-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {activeTab === 'requests' && (
        <div>
          {allServiceRequests.length === 0 ? (
            <EmptyState icon="📭" text="لا توجد طلبات مساعدة حالياً" />
          ) : (
            allServiceRequests.map((req) => (
              <ServiceRequestCard key={req.id} request={req} />
            ))
          )}
        </div>
      )}

      {activeTab === 'volunteer' && (
        <div>
          {volunteerOrders.length === 0 ? (
            <EmptyState icon="🤝" text="لم تكمل أي مهمة تطوعية بعد — ابدأ من خريطة المهام!" />
          ) : (
            volunteerOrders.map((order) => (
              <VolunteerOrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      )}

      {activeTab === 'donations' && (
        <div>
          {donationOrders.length === 0 ? (
            <EmptyState icon="💝" text="لم تتبرع بعد — تبرع من صفحة أثري!" />
          ) : (
            donationOrders.map((order) => (
              <DonationOrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default OrdersTab;
