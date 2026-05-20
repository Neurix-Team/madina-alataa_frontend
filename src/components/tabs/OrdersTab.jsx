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
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../utils/permissions';
import {
  FaHandsHelping,
  FaHeart,
  FaDonate,
  FaClipboardList,
  FaUsers,
  FaCalendarAlt,
  FaStar,
  FaCheckCircle,
  FaSearch,
  FaListAlt,
  FaUserFriends,
  FaLeaf,
  FaGraduationCap,
  FaHospital,
  FaHome,
} from 'react-icons/fa';
import { FiTarget } from 'react-icons/fi';

const getBeneficiary = (id) =>
  beneficiariesData.find((b) => b.id === id) ?? null;

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'elderly':
      return <FaUserFriends />;
    case 'orphans':
      return <FaHeart />;
    case 'education':
      return <FaGraduationCap />;
    case 'environment':
      return <FaLeaf />;
    case 'health':
      return <FaHospital />;
    case 'community':
    case 'rural':
      return <FaHome />;
    default:
      return <FaHandsHelping />;
  }
};

const OrdersCSS = `
  .orders-page {
    direction: rtl;
    display: grid;
    gap: 16px;
    font-family: 'Cairo', sans-serif;
    color: var(--text-primary);
  }

  .orders-hero {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-radius: 24px;
    padding: 20px 24px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--glass-border);
    text-align: center;
  }

  .orders-hero__icon {
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
    border: 1px solid var(--border);
  }

  .orders-hero__title {
    font-size: 24px;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .orders-hero__subtitle {
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 700;
  }

  .orders-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .orders-stat-card {
    background: var(--bg-card-2);
    border-radius: 20px;
    padding: 18px 16px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border);
    transition: transform 0.2s ease;
  }

  .orders-stat-card:hover {
    transform: translateY(-2px);
  }

  .orders-stat-card__icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    font-size: 18px;
    border: 1px solid var(--border);
  }

  .orders-stat-card__value {
    font-size: 30px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 4px;
    color: var(--text-primary);
  }

  .orders-stat-card__label {
    font-size: 12px;
    font-weight: 800;
    color: var(--text-secondary);
  }

  .orders-stat-card--blue .orders-stat-card__icon,
  .orders-stat-card--blue .orders-stat-card__value { color: #2563eb; }

  .orders-stat-card--green .orders-stat-card__icon,
  .orders-stat-card--green .orders-stat-card__value { color: #10b981; }

  .orders-stat-card--orange .orders-stat-card__icon,
  .orders-stat-card--orange .orders-stat-card__value { color: #f59e0b; }

  .orders-tabs {
    display: flex;
    gap: 8px;
    background: var(--bg-card-2);
    border-radius: 16px;
    padding: 6px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
  }

  .orders-tab-btn {
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
    color: var(--text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .orders-tab-btn--active {
    background: var(--primary);
    color: #fff;
    box-shadow: var(--shadow-glow);
  }

  .orders-panel {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-radius: 22px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-md);
    padding: 18px;
  }

  .orders-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 17px;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 14px;
  }

  .orders-section-title__icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card-2);
    color: var(--primary);
    border: 1px solid var(--border);
    font-size: 14px;
  }

  .orders-toolbar {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
  }

  .orders-search {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 12px;
    font-family: 'Cairo', sans-serif;
    font-size: 12px;
    direction: rtl;
    outline: none;
    background: var(--bg-card-2);
    color: var(--text-primary);
  }

  .orders-search:focus {
    border-color: var(--primary);
    box-shadow: var(--shadow-glow-sm);
  }

  .orders-filter-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .orders-filter-chip {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 999px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    font-size: 11px;
    font-weight: 800;
    background: var(--bg-card-2);
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }

  .orders-filter-chip--active {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }

  .order-card {
    background: var(--bg-card-2);
    border-radius: 18px;
    padding: 16px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    margin-bottom: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .order-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .order-card:last-child {
    margin-bottom: 0;
  }

  .order-card__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .order-card__title {
    font-size: 14px;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .order-card__desc {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 700;
    line-height: 1.7;
    margin: 0 0 12px 0;
  }

  .order-card__badge {
    font-size: 10px;
    font-weight: 900;
    padding: 5px 9px;
    border-radius: 999px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .order-card__meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .order-card__chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 800;
    padding: 5px 10px;
    border-radius: 999px;
    background: var(--bg-card);
    border: 1px solid var(--border);
  }

  .order-progress {
    margin-top: 10px;
  }

  .order-progress__label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 800;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .order-progress__bar {
    height: 8px;
    background: var(--border);
    border-radius: 999px;
    overflow: hidden;
  }

  .order-progress__fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.7s ease;
  }

  .orders-empty {
    text-align: center;
    padding: 26px 14px;
    border: 1.5px dashed var(--border);
    border-radius: 14px;
    color: var(--text-secondary);
    font-weight: 700;
    background: var(--bg-card-2);
  }

  .orders-empty__icon {
    display: block;
    font-size: 34px;
    color: var(--text-secondary);
    opacity: 0.5;
    margin-bottom: 10px;
  }

  .orders-empty__text {
    margin: 0;
    font-size: 13px;
  }

  @media (max-width: 800px) {
    .orders-stats-grid {
      grid-template-columns: 1fr;
    }

    .orders-tabs {
      flex-direction: column;
    }
  }
`;

const ServiceRequestCard = ({ request }) => {
  const ben = getBeneficiary(request.beneficiaryId);
  const urgency = OrderService.urgencyLabel(request.urgency);
  const status = OrderService.statusLabel(request.status);
  const progress =
    request.requiredVolunteers > 0
      ? Math.round((request.currentVolunteers / request.requiredVolunteers) * 100)
      : 0;

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>
            {ben ? getCategoryIcon(ben.category) : <FaClipboardList />}
          </span>
          <div>
            <div className="order-card__title">{request.title}</div>
            {ben && (
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
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
        <span className="order-card__chip" style={{ background: status.bg, color: status.color }}>
          <FaCheckCircle />
          <span>{status.label}</span>
        </span>

        <span className="order-card__chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
          <FaUsers />
          <span>{request.currentVolunteers}/{request.requiredVolunteers} متطوع</span>
        </span>

        <span className="order-card__chip" style={{ background: '#f3f4f6', color: '#6b7280' }}>
          <FaCalendarAlt />
          <span>{formatDate(request.createdAt)}</span>
        </span>
      </div>

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
              background:
                progress >= 100
                  ? 'linear-gradient(90deg,#34d399,#10b981)'
                  : 'linear-gradient(90deg,#3b82f6,#1d4ed8)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

const VolunteerOrderCard = ({ order }) => {
  const ben = getBeneficiary(order.beneficiaryId);
  const status = OrderService.statusLabel(order.status);

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 22 }}>
            <FaHandsHelping />
          </span>
          <div>
            <div className="order-card__title">طلب تطوع مكتمل</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
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
        <span className="order-card__chip" style={{ background: '#fff7cc', color: '#92400e' }}>
          <FaStar />
          <span>+{order.reward?.kp ?? 0} KP</span>
        </span>

        <span className="order-card__chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
          <FiTarget />
          <span>+{order.reward?.xp ?? 0} XP</span>
        </span>

        <span className="order-card__chip" style={{ background: '#ecfdf5', color: '#166534' }}>
          <FaHeart />
          <span>تأثير +{order.reward?.impact ?? 0}</span>
        </span>

        <span className="order-card__chip" style={{ background: '#f3f4f6', color: '#6b7280' }}>
          <FaCalendarAlt />
          <span>{formatDate(order.createdAt)}</span>
        </span>
      </div>
    </div>
  );
};

const DonationOrderCard = ({ order }) => {
  const ben = getBeneficiary(order.beneficiaryId);
  const status = OrderService.statusLabel(order.status);

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 22 }}>
            <FaDonate />
          </span>
          <div>
            <div className="order-card__title">تبرع مكتمل</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
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
          <FaDonate />
          <span>{order.amount} نقطة</span>
        </span>

        <span className="order-card__chip" style={{ background: '#fff7cc', color: '#92400e' }}>
          <FaStar />
          <span>+{order.kpConverted ?? 0} KP</span>
        </span>

        <span className="order-card__chip" style={{ background: '#f3f4f6', color: '#6b7280' }}>
          <FaCalendarAlt />
          <span>{formatDate(order.createdAt)}</span>
        </span>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text }) => (
  <div className="orders-empty">
    <span className="orders-empty__icon">
      <Icon />
    </span>
    <p className="orders-empty__text">{text}</p>
  </div>
);

const TABS = [
  { id: 'requests', label: 'طلبات المساعدة', Icon: FaClipboardList },
  { id: 'volunteer', label: 'تطوعي', Icon: FaHandsHelping },
  { id: 'donations', label: 'تبرعاتي', Icon: FaDonate },
];

const OrdersTab = () => {
  const { state } = useGameState();
  const { orders = [] } = state;
  const { can } = usePermissions();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('admin');
  const isParent = user?.roles?.includes('parent');

  const availableTabs = useMemo(() => {
    return TABS.filter((tab) => {
      if (tab.id === 'donations') return can(PERMISSIONS.VIEW_MY_DONATIONS) && !isAdmin && !isParent;
      return true;
    });
  }, [can, isAdmin, isParent]);

  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    if (!availableTabs.find((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs.length > 0 ? availableTabs[0].id : 'requests');
    }
  }, [availableTabs, activeTab]);

  const allServiceRequests = useMemo(() => {
    const runtimeSR = orders.filter((o) => o.type === 'ServiceRequest');
    const seededIds = new Set(runtimeSR.map((r) => r.id));
    const seeded = serviceRequestsData.filter((r) => !seededIds.has(r.id));
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

  const openRequests = allServiceRequests.filter((r) => r.status === 'open').length;
  const totalVolunteer = volunteerOrders.length;
  const totalDonations = donationOrders.length;

  return (
    <div className="orders-page">
      <style>{OrdersCSS}</style>

      <div className="orders-hero">
        <div className="orders-hero__icon">
          <FaListAlt />
        </div>
        <div className="orders-hero__title">الطلبات والأوامر</div>
        <div className="orders-hero__subtitle">
          تتبع طلبات المساعدة وأوامر التطوع والتبرعات
        </div>
      </div>

      <div className="orders-stats-grid">
        <div className="orders-stat-card orders-stat-card--blue">
          <div className="orders-stat-card__icon">
            <FaClipboardList />
          </div>
          <div className="orders-stat-card__value">{openRequests}</div>
          <div className="orders-stat-card__label">طلب مفتوح</div>
        </div>

        <div className="orders-stat-card orders-stat-card--green">
          <div className="orders-stat-card__icon">
            <FaHandsHelping />
          </div>
          <div className="orders-stat-card__value">{totalVolunteer}</div>
          <div className="orders-stat-card__label">تطوع مكتمل</div>
        </div>

        <div className="orders-stat-card orders-stat-card--orange">
          <div className="orders-stat-card__icon">
            <FaDonate />
          </div>
          <div className="orders-stat-card__value">{totalDonations}</div>
          <div className="orders-stat-card__label">تبرع مكتمل</div>
        </div>
      </div>

      <div className="orders-tabs">
        {availableTabs.map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              className={`orders-tab-btn${activeTab === tab.id ? ' orders-tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'requests' && (
        <div className="orders-panel">
          <div className="orders-section-title">
            <span className="orders-section-title__icon">
              <FaClipboardList />
            </span>
            <span>طلبات المساعدة</span>
          </div>

          {allServiceRequests.length === 0 ? (
            <EmptyState icon={FaClipboardList} text="لا توجد طلبات مساعدة حالياً" />
          ) : (
            allServiceRequests.map((req) => (
              <ServiceRequestCard key={req.id} request={req} />
            ))
          )}
        </div>
      )}

      {activeTab === 'volunteer' && (
        <div className="orders-panel">
          <div className="orders-section-title">
            <span className="orders-section-title__icon">
              <FaHandsHelping />
            </span>
            <span>طلبات التطوع</span>
          </div>

          {volunteerOrders.length === 0 ? (
            <EmptyState icon={FaHandsHelping} text="لم تكمل أي مهمة تطوعية بعد — ابدأ من خريطة المهام" />
          ) : (
            volunteerOrders.map((order) => (
              <VolunteerOrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="orders-panel">
          <div className="orders-section-title">
            <span className="orders-section-title__icon">
              <FaDonate />
            </span>
            <span>التبرعات</span>
          </div>

          {donationOrders.length === 0 ? (
            <EmptyState icon={FaDonate} text="لم تتبرع بعد — تبرع من صفحة أثري" />
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