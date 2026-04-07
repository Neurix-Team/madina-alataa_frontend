import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaDownload, FaSync } from 'react-icons/fa';
import {
  loadDonations,
  getDonationStats,
  formatDonationDate,
  formatCurrency,
  getStatusConfig,
  getDonationTypeConfig,
  getPaymentMethodConfig,
  DONATION_STATUSES,
} from '../data/donationsData';
import AnimatedBackground from '../components/common/AnimatedBackground';

export default function MyDonationsPage() {
  const navigate = useNavigate();
  const [donations] = useState(() => loadDonations());
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const stats = useMemo(() => getDonationStats(donations), [donations]);

  const filteredDonations = useMemo(() => {
    if (filterStatus === 'all') return donations;
    return donations.filter(d => d.status === filterStatus);
  }, [donations, filterStatus]);

  const handleViewReceipt = (donation) => {
    setSelectedReceipt(donation);
  };

  const handleDownloadReceipt = (donation) => {
    console.log('Download receipt:', donation.receiptId);
    // In a real app, this would trigger PDF download
  };

  const handleRetry = (donation) => {
    console.log('Retry donation:', donation.id);
    navigate(`/donation-checkout?retry=${donation.id}`);
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: 'var(--bg-app)', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .donations-header {
          animation: slideInDown 0.5s ease-out;
        }

        .donations-stats-grid {
          animation: scaleIn 0.6s ease-out;
        }

        .donations-tabs {
          animation: slideInUp 0.5s ease-out;
        }

        .donation-card {
          animation: slideInUp 0.4s ease-out;
        }

        .donation-card:nth-child(1) { animation-delay: 0s; }
        .donation-card:nth-child(2) { animation-delay: 0.1s; }
        .donation-card:nth-child(3) { animation-delay: 0.2s; }
        .donation-card:nth-child(4) { animation-delay: 0.3s; }
        .donation-card:nth-child(5) { animation-delay: 0.4s; }
        .donation-card:nth-child(6) { animation-delay: 0.5s; }
      `}</style>

      <AnimatedBackground />

      {/* Header */}
      <div
        className="donations-header"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '0 0 24px 24px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(30, 144, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Decorative background */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent)',
            borderRadius: '50%',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                cursor: 'pointer',
                color: '#3b82f6',
                fontSize: '18px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseOver={e => {
                e.target.style.background = '#e0e7ff';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={e => {
                e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                }}
              >
                تبرعاتي 💝
              </h1>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  margin: '4px 0 0 0',
                }}
              >
                متابع كل مساهماتك وتأثيرك
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          className="donations-stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Total Donations */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
              borderRadius: '18px',
              padding: '16px',
              color: '#fff',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(29, 78, 216, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-15px',
                right: '-15px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <div style={{ fontSize: '24px', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
              💰
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: '4px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {formatCurrency(stats.totalAmount)}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                opacity: 0.9,
                position: 'relative',
                zIndex: 1,
              }}
            >
              إجمالي التبرعات
            </div>
          </div>

          {/* Total Count */}
          <div
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              borderRadius: '18px',
              padding: '16px',
              color: '#fff',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-15px',
                right: '-15px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <div style={{ fontSize: '24px', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
              📊
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: '4px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {stats.totalCount}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                opacity: 0.9,
                position: 'relative',
                zIndex: 1,
              }}
            >
              عدد التبرعات
            </div>
          </div>

          {/* Success Count */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #10b981 100%)',
              borderRadius: '18px',
              padding: '16px',
              color: '#fff',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-15px',
                right: '-15px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <div style={{ fontSize: '24px', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
              ✅
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: '4px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {stats.successCount}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                opacity: 0.9,
                position: 'relative',
                zIndex: 1,
              }}
            >
              تبرعات ناجحة
            </div>
          </div>

          {/* Unique Cases */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              borderRadius: '18px',
              padding: '16px',
              color: '#fff',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-15px',
                right: '-15px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <div style={{ fontSize: '24px', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
              🎯
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: '4px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {stats.uniqueCases}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                opacity: 0.9,
                position: 'relative',
                zIndex: 1,
              }}
            >
              حالات مدعومة
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          paddingX: '24px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
          borderRadius: '16px',
          padding: '6px',
          marginX: '24px',
          border: '1px solid rgba(203, 213, 225, 0.4)',
          backdropFilter: 'blur(10px)',
          overflowX: 'auto',
        }}
      >
        {[
          { label: 'الكل', value: 'all' },
          { label: 'ناجح', value: DONATION_STATUSES.SUCCESS },
          { label: 'قيد المعالجة', value: DONATION_STATUSES.PENDING },
          { label: 'فشل', value: DONATION_STATUSES.FAILED },
          { label: 'استرجاع', value: DONATION_STATUSES.REFUNDED },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            style={{
              padding: '10px 14px',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              background: filterStatus === tab.value ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)' : 'transparent',
              color: filterStatus === tab.value ? '#fff' : '#64748b',
              whiteSpace: 'nowrap',
              boxShadow: filterStatus === tab.value ? '0 4px 12px rgba(29, 78, 216, 0.4)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Donations List */}
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        {filteredDonations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.6 }}>📭</div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#475569' }}>
              لا توجد تبرعات لعرضها حالياً
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDonations.map(donation => {
              const statusConfig = getStatusConfig(donation.status);
              const typeConfig = getDonationTypeConfig(donation.type);
              const paymentConfig = getPaymentMethodConfig(donation.paymentMethod);

              return (
                <div
                  key={donation.id}
                  className="donation-card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
                    borderRadius: '18px',
                    padding: '20px',
                    border: '1px solid rgba(203, 213, 225, 0.4)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.4)';
                  }}
                >
                  {/* Shine effect */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: -100,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                      transition: 'right 0.5s',
                    }}
                  />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header with case name and amount */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '14px',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: '15px',
                            fontWeight: 900,
                            color: '#1e293b',
                            margin: '0 0 4px 0',
                          }}
                        >
                          {donation.caseName}
                        </h3>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {donation.beneficiaryName}
                        </p>
                      </div>
                      <div
                        style={{
                          textAlign: 'right',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 900,
                            color: '#1d4ed8',
                          }}
                        >
                          {formatCurrency(donation.amount)}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#64748b',
                            fontWeight: 700,
                          }}
                        >
                          {typeConfig.icon} {typeConfig.label}
                        </div>
                      </div>
                    </div>

                    {/* Meta information */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid rgba(203, 213, 225, 0.2)',
                      }}
                    >
                      {/* Status Badge */}
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 900,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: statusConfig.bgColor,
                          color: statusConfig.color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: `1px solid ${statusConfig.color}40`,
                        }}
                      >
                        {statusConfig.icon} {statusConfig.label}
                      </div>

                      {/* Date */}
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#64748b',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          background: 'rgba(203, 213, 225, 0.15)',
                        }}
                      >
                        📅 {formatDonationDate(donation.date)}
                      </div>

                      {/* Payment Method */}
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#64748b',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          background: 'rgba(203, 213, 225, 0.15)',
                        }}
                      >
                        {paymentConfig.icon} {paymentConfig.label}
                      </div>

                      {/* Receipt ID */}
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#94a3b8',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          background: 'rgba(203, 213, 225, 0.1)',
                          fontFamily: 'monospace',
                        }}
                      >
                        #{donation.receiptId}
                      </div>
                    </div>

                    {/* Notes (if available) */}
                    {donation.notes && (
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#64748b',
                          fontWeight: 600,
                          margin: '0 0 12px 0',
                          padding: '8px 12px',
                          background: 'rgba(59, 130, 246, 0.05)',
                          borderRadius: '8px',
                          borderRight: '3px solid #3b82f6',
                        }}
                      >
                        💬 {donation.notes}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        onClick={() => handleViewReceipt(donation)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          border: '1px solid #3b82f6',
                          borderRadius: '10px',
                          background: 'transparent',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontFamily: "'Cairo', sans-serif",
                          fontSize: '12px',
                          fontWeight: 700,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                        onMouseOver={e => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                        }}
                        onMouseOut={e => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        <FaEye size={13} /> عرض الإيصال
                      </button>

                      <button
                        onClick={() => handleDownloadReceipt(donation)}
                        style={{
                          padding: '10px 14px',
                          border: 'none',
                          borderRadius: '10px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseOver={e => {
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={e => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <FaDownload size={13} />
                      </button>

                      {donation.status === DONATION_STATUSES.FAILED && (
                        <button
                          onClick={() => handleRetry(donation)}
                          style={{
                            padding: '10px 14px',
                            border: 'none',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #f97316, #fb923c)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 700,
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: "'Cairo', sans-serif",
                          }}
                          onMouseOver={e => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.4)';
                          }}
                          onMouseOut={e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <FaSync size={12} /> إعادة محاولة
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: 'var(--bg-card)',
              borderRadius: '26px',
              padding: '24px',
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.24)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                border: 'none',
                background: 'rgba(148, 163, 184, 0.12)',
                color: '#1e293b',
                width: 38,
                height: 38,
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 900,
              }}
              onClick={() => setSelectedReceipt(null)}
            >
              ×
            </button>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>
                تفاصيل الإيصال
              </h2>
              <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                عرض كامل لتفاصيل التبرع ورقم الإيصال.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 700 }}>رقم الإيصال</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 900 }}>#{selectedReceipt.receiptId}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 700 }}>المستفيد</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 900 }}>{selectedReceipt.beneficiaryName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 700 }}>الحالة</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 900 }}>{getStatusConfig(selectedReceipt.status).label}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 700 }}>المبلغ</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 900 }}>{formatCurrency(selectedReceipt.amount)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 700 }}>طريقة الدفع</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 900 }}>{getPaymentMethodConfig(selectedReceipt.paymentMethod).label}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 700 }}>نوع التبرع</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 900 }}>{getDonationTypeConfig(selectedReceipt.type).label}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 700 }}>التاريخ</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 900 }}>{formatDonationDate(selectedReceipt.date)}</span>
              </div>

              {selectedReceipt.notes && (
                <div style={{ padding: '14px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.08)', color: '#1e293b', fontWeight: 600 }}>
                  💬 {selectedReceipt.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
