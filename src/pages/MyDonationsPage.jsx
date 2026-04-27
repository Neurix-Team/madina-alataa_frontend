import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEye,
  FaDownload,
  FaSync,
  FaWallet,
  FaCheckCircle,
  FaBullseye,
  FaMoneyBillWave,
  FaReceipt,
  FaCalendarAlt,
  FaInfoCircle,
  FaTimes,
  FaCreditCard,
} from 'react-icons/fa';
import {
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  getDonationStats,
  formatDonationDate,
  formatCurrency,
  getStatusConfig,
  getDonationTypeConfig,
  getPaymentMethodConfig,
  DONATION_STATUSES,
} from '../data/donationsData';
import { api } from '../services/api.js';
import AnimatedBackground from '../components/common/AnimatedBackground';

const CSS = `
  .md-page {
    direction: rtl;
    min-height: 100vh;
    background: var(--bg-app);
    position: relative;
    overflow: hidden;
    font-family: 'Cairo', sans-serif;
    color: #0f172a;
  }

  .md-shell {
    position: relative;
    z-index: 1;
    padding-bottom: 32px;
  }

  .md-header {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 0 0 24px 24px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(30, 144, 255, 0.1);
    position: relative;
    overflow: hidden;
    animation: mdSlideInDown 0.5s ease-out;
  }

  .md-header__orb {
    position: absolute;
    top: -40px;
    right: -40px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent);
    border-radius: 50%;
  }

  .md-header__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  .md-back-btn {
    background: rgba(59, 130, 246, 0.1);
    border: none;
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
    color: #3b82f6;
    font-size: 18px;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
  }

  .md-back-btn:hover {
    background: #e0e7ff;
    transform: scale(1.05);
  }

  .md-title {
    font-size: 28px;
    font-weight: 900;
    background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .md-subtitle {
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
    margin: 4px 0 0 0;
  }

  .md-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
    position: relative;
    z-index: 1;
    animation: mdScaleIn 0.6s ease-out;
  }

  .md-stat {
    border-radius: 18px;
    padding: 16px;
    color: #fff;
    text-align: center;
    border: 1px solid rgba(255,255,255,0.15);
    position: relative;
    overflow: hidden;
  }

  .md-stat::after {
    content: '';
    position: absolute;
    bottom: -15px;
    right: -15px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255,255,255,0.10);
  }

  .md-stat__icon {
    font-size: 24px;
    margin-bottom: 6px;
    position: relative;
    z-index: 1;
  }

  .md-stat__value {
    font-size: 22px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }

  .md-stat__label {
    font-size: 11px;
    font-weight: 700;
    opacity: 0.92;
    position: relative;
    z-index: 1;
  }

  .md-filters {
    display: flex;
    gap: 8px;
    margin: 0 24px 20px;
    background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.8));
    border-radius: 16px;
    padding: 6px;
    border: 1px solid rgba(203, 213, 225, 0.4);
    backdrop-filter: blur(10px);
    overflow-x: auto;
    animation: mdSlideInUp 0.5s ease-out;
  }

  .md-filter-btn {
    padding: 10px 14px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    font-size: 12px;
    font-weight: 700;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: transparent;
    color: #64748b;
    white-space: nowrap;
  }

  .md-filter-btn--active {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: #fff;
    box-shadow: 0 4px 12px rgba(29, 78, 216, 0.35);
  }

  .md-content {
    padding: 0 24px;
    margin-bottom: 40px;
  }

  .md-empty {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
  }

  .md-empty__icon {
    font-size: 52px;
    margin-bottom: 16px;
    opacity: 0.55;
    color: #94a3b8;
  }

  .md-empty__text {
    font-size: 15px;
    font-weight: 700;
    color: #475569;
  }

  .md-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .md-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96));
    border-radius: 18px;
    padding: 20px;
    border: 1px solid rgba(203, 213, 225, 0.4);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    animation: mdSlideInUp 0.4s ease-out backwards;
  }

  .md-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
    border-color: rgba(59, 130, 246, 0.2);
  }

  .md-card__shine {
    position: absolute;
    top: 0;
    right: -100px;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    pointer-events: none;
  }

  .md-card__body {
    position: relative;
    z-index: 1;
  }

  .md-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 12px;
  }

  .md-card__case {
    font-size: 15px;
    font-weight: 900;
    color: #1e293b;
    margin: 0 0 4px 0;
  }

  .md-card__beneficiary {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
    margin: 0;
  }

  .md-card__amount {
    text-align: right;
  }

  .md-card__amount-value {
    font-size: 18px;
    font-weight: 900;
    color: #1d4ed8;
  }

  .md-card__amount-type {
    font-size: 11px;
    color: #64748b;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }

  .md-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(203, 213, 225, 0.2);
  }

  .md-chip {
    font-size: 11px;
    font-weight: 900;
    padding: 6px 12px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid transparent;
  }

  .md-note {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
    margin: 0 0 12px 0;
    padding: 8px 12px;
    background: rgba(59, 130, 246, 0.05);
    border-radius: 8px;
    border-right: 3px solid #3b82f6;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .md-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .md-btn {
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    font-weight: 700;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .md-btn--outline {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #3b82f6;
    background: transparent;
    color: #3b82f6;
    font-size: 12px;
  }

  .md-btn--outline:hover {
    background: rgba(59, 130, 246, 0.1);
  }

  .md-btn--icon {
    width: 42px;
    height: 42px;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    font-size: 14px;
  }

  .md-btn--icon:hover {
    transform: scale(1.05);
  }

  .md-btn--retry {
    padding: 10px 14px;
    background: linear-gradient(135deg, #f97316, #fb923c);
    color: #fff;
    font-size: 12px;
  }

  .md-btn--retry:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
  }

  .md-loading,
  .md-error {
    text-align: center;
    padding: 50px;
    font-size: 14px;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }

  .md-error {
    color: #f87171;
  }

  .md-modal-wrap {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .md-modal {
    max-width: 520px;
    width: 100%;
    background: var(--bg-card);
    border-radius: 26px;
    padding: 24px;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.24);
    position: relative;
    overflow: hidden;
  }

  .md-modal__close {
    position: absolute;
    top: 16px;
    left: 16px;
    border: none;
    background: rgba(148, 163, 184, 0.12);
    color: #1e293b;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .md-modal__title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .md-modal__subtitle {
    margin: 8px 0 0;
    color: var(--text-secondary);
    font-size: 13px;
  }

  .md-modal__grid {
    display: grid;
    gap: 14px;
    margin-top: 20px;
  }

  .md-modal__row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .md-modal__label {
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
  }

  .md-modal__value {
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 900;
    text-align: left;
  }

  .md-modal__note {
    padding: 14px;
    border-radius: 18px;
    background: rgba(59, 130, 246, 0.08);
    color: #1e293b;
    font-weight: 600;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  @keyframes mdSlideInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes mdSlideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes mdScaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const getStatusTone = (status) => {
  switch (status) {
    case DONATION_STATUSES.SUCCESS:
      return { icon: <FaCheckCircle />, bg: '#dcfce7', color: '#166534', border: '#16653440' };
    case DONATION_STATUSES.PENDING:
      return { icon: <FiClock />, bg: '#fef3c7', color: '#92400e', border: '#92400e40' };
    case DONATION_STATUSES.FAILED:
      return { icon: <FiAlertCircle />, bg: '#fee2e2', color: '#b91c1c', border: '#b91c1c40' };
    case DONATION_STATUSES.REFUNDED:
      return { icon: <FiRefreshCw />, bg: '#eff6ff', color: '#1d4ed8', border: '#1d4ed840' };
    default:
      return { icon: <FaInfoCircle />, bg: '#f8fafc', color: '#475569', border: '#47556930' };
  }
};

export default function MyDonationsPage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    let isMounted = true;

    api
      .getDonations()
      .then((data) => {
        if (!isMounted) return;
        setDonations(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'فشل في تحميل التبرعات');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => getDonationStats(donations), [donations]);

  const filteredDonations = useMemo(() => {
    if (filterStatus === 'all') return donations;
    return donations.filter((d) => d.status === filterStatus);
  }, [donations, filterStatus]);

  const handleViewReceipt = (donation) => {
    setSelectedReceipt(donation);
  };

  const handleDownloadReceipt = (donation) => {
    console.log('Download receipt:', donation.receiptId);
  };

  const handleRetry = (donation) => {
    console.log('Retry donation:', donation.id);
    navigate(`/donation-checkout?retry=${donation.id}`);
  };

  if (loading) {
    return (
      <div className="md-page">
        <AnimatedBackground />
        <style>{CSS}</style>
        <div className="md-loading">جاري تحميل التبرعات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-page">
        <AnimatedBackground />
        <style>{CSS}</style>
        <div className="md-error">خطأ في التحميل: {error}</div>
      </div>
    );
  }

  return (
    <div className="md-page">
      <AnimatedBackground />
      <style>{CSS}</style>

      <div className="md-shell">
        <div className="md-header">
          <div className="md-header__orb" />

          <div className="md-header__top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="md-back-btn" onClick={() => navigate('/')}>
                <FaArrowLeft />
              </button>

              <div>
                <h1 className="md-title">تبرعاتي</h1>
                <p className="md-subtitle">متابعة كاملة لكل مساهماتك وتأثيرك</p>
              </div>
            </div>
          </div>

          <div className="md-stats-grid">
            <div
              className="md-stat"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                boxShadow: '0 8px 24px rgba(29, 78, 216, 0.2)',
              }}
            >
              <div className="md-stat__icon">
                <FaMoneyBillWave />
              </div>
              <div className="md-stat__value">{formatCurrency(stats.totalAmount)}</div>
              <div className="md-stat__label">إجمالي التبرعات</div>
            </div>

            <div
              className="md-stat"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)',
              }}
            >
              <div className="md-stat__icon">
                <FiTrendingUp />
              </div>
              <div className="md-stat__value">{stats.totalCount}</div>
              <div className="md-stat__label">عدد التبرعات</div>
            </div>

            <div
              className="md-stat"
              style={{
                background: 'linear-gradient(135deg, #0891b2 0%, #10b981 100%)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
              }}
            >
              <div className="md-stat__icon">
                <FaCheckCircle />
              </div>
              <div className="md-stat__value">{stats.successCount}</div>
              <div className="md-stat__label">تبرعات ناجحة</div>
            </div>

            <div
              className="md-stat"
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                boxShadow: '0 8px 24px rgba(249, 115, 22, 0.2)',
              }}
            >
              <div className="md-stat__icon">
                <FaBullseye />
              </div>
              <div className="md-stat__value">{stats.uniqueCases}</div>
              <div className="md-stat__label">حالات مدعومة</div>
            </div>
          </div>
        </div>

        <div className="md-filters">
          {[
            { label: 'الكل', value: 'all' },
            { label: 'ناجح', value: DONATION_STATUSES.SUCCESS },
            { label: 'قيد المعالجة', value: DONATION_STATUSES.PENDING },
            { label: 'فشل', value: DONATION_STATUSES.FAILED },
            { label: 'استرجاع', value: DONATION_STATUSES.REFUNDED },
          ].map((tab) => (
            <button
              key={tab.value}
              className={`md-filter-btn${filterStatus === tab.value ? ' md-filter-btn--active' : ''}`}
              onClick={() => setFilterStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md-content">
          {filteredDonations.length === 0 ? (
            <div className="md-empty">
              <div className="md-empty__icon">
                <FaReceipt />
              </div>
              <p className="md-empty__text">لا توجد تبرعات لعرضها حالياً</p>
            </div>
          ) : (
            <div className="md-list">
              {filteredDonations.map((donation, index) => {
                const statusConfig = getStatusConfig(donation.status);
                const typeConfig = getDonationTypeConfig(donation.type);
                const paymentConfig = getPaymentMethodConfig(donation.paymentMethod);
                const statusTone = getStatusTone(donation.status);

                return (
                  <div
                    key={donation.id}
                    className="md-card"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="md-card__shine" />
                    <div className="md-card__body">
                      <div className="md-card__top">
                        <div style={{ flex: 1 }}>
                          <h3 className="md-card__case">{donation.caseName}</h3>
                          <p className="md-card__beneficiary">{donation.beneficiaryName}</p>
                        </div>

                        <div className="md-card__amount">
                          <div className="md-card__amount-value">
                            {formatCurrency(donation.amount)}
                          </div>
                          <div className="md-card__amount-type">
                            <FaWallet />
                            <span>{typeConfig.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="md-meta">
                        <div
                          className="md-chip"
                          style={{
                            background: statusTone.bg,
                            color: statusTone.color,
                            borderColor: statusTone.border,
                          }}
                        >
                          {statusTone.icon}
                          <span>{statusConfig.label}</span>
                        </div>

                        <div className="md-chip" style={{ background: 'rgba(203, 213, 225, 0.15)', color: '#64748b' }}>
                          <FaCalendarAlt />
                          <span>{formatDonationDate(donation.date)}</span>
                        </div>

                        <div className="md-chip" style={{ background: 'rgba(203, 213, 225, 0.15)', color: '#64748b' }}>
                          <FaCreditCard />
                          <span>{paymentConfig.label}</span>
                        </div>

                        <div
                          className="md-chip"
                          style={{
                            background: 'rgba(203, 213, 225, 0.1)',
                            color: '#94a3b8',
                            fontFamily: 'monospace',
                          }}
                        >
                          <FaReceipt />
                          <span>#{donation.receiptId}</span>
                        </div>
                      </div>

                      {donation.notes && (
                        <p className="md-note">
                          <FaInfoCircle />
                          <span>{donation.notes}</span>
                        </p>
                      )}

                      <div className="md-actions">
                        <button
                          className="md-btn md-btn--outline"
                          onClick={() => handleViewReceipt(donation)}
                        >
                          <FaEye size={13} />
                          <span>عرض الإيصال</span>
                        </button>

                        <button
                          className="md-btn md-btn--icon"
                          onClick={() => handleDownloadReceipt(donation)}
                        >
                          <FaDownload size={13} />
                        </button>

                        {donation.status === DONATION_STATUSES.FAILED && (
                          <button
                            className="md-btn md-btn--retry"
                            onClick={() => handleRetry(donation)}
                          >
                            <FaSync size={12} />
                            <span>إعادة محاولة</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedReceipt && (
          <div className="md-modal-wrap" onClick={() => setSelectedReceipt(null)}>
            <div className="md-modal" onClick={(e) => e.stopPropagation()}>
              <button className="md-modal__close" onClick={() => setSelectedReceipt(null)}>
                <FaTimes />
              </button>

              <div style={{ marginBottom: '20px' }}>
                <h2 className="md-modal__title">
                  <FaReceipt />
                  <span>تفاصيل الإيصال</span>
                </h2>
                <p className="md-modal__subtitle">
                  عرض كامل لتفاصيل التبرع ورقم الإيصال
                </p>
              </div>

              <div className="md-modal__grid">
                <div className="md-modal__row">
                  <span className="md-modal__label">رقم الإيصال</span>
                  <span className="md-modal__value">#{selectedReceipt.receiptId}</span>
                </div>

                <div className="md-modal__row">
                  <span className="md-modal__label">المستفيد</span>
                  <span className="md-modal__value">{selectedReceipt.beneficiaryName}</span>
                </div>

                <div className="md-modal__row">
                  <span className="md-modal__label">الحالة</span>
                  <span className="md-modal__value">
                    {getStatusConfig(selectedReceipt.status).label}
                  </span>
                </div>

                <div className="md-modal__row">
                  <span className="md-modal__label">المبلغ</span>
                  <span className="md-modal__value">
                    {formatCurrency(selectedReceipt.amount)}
                  </span>
                </div>

                <div className="md-modal__row">
                  <span className="md-modal__label">طريقة الدفع</span>
                  <span className="md-modal__value">
                    {getPaymentMethodConfig(selectedReceipt.paymentMethod).label}
                  </span>
                </div>

                <div className="md-modal__row">
                  <span className="md-modal__label">نوع التبرع</span>
                  <span className="md-modal__value">
                    {getDonationTypeConfig(selectedReceipt.type).label}
                  </span>
                </div>

                <div className="md-modal__row">
                  <span className="md-modal__label">التاريخ</span>
                  <span className="md-modal__value">
                    {formatDonationDate(selectedReceipt.date)}
                  </span>
                </div>

                {selectedReceipt.notes && (
                  <div className="md-modal__note">
                    <FaInfoCircle />
                    <span>{selectedReceipt.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}