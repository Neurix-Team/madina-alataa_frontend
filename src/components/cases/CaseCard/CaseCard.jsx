import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaHeart } from 'react-icons/fa';
import UrgencyBadge from '../UrgencyBadge/UrgencyBadge';

export default function CaseCard({ caseItem, index = 0 }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [filled, setFilled] = useState(false);

  const EGP_FORMATTER = useMemo(() => new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US'), [i18n.language]);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 120 + (index * 90));
    return () => clearTimeout(t);
  }, [index]);

  const progress = Math.max(0, Math.min(100, caseItem.fundedPercentage));

  return (
    <article
      style={{
        background: '#ffffff',
        borderRadius: 24,
        border: '1.5px solid rgba(148, 163, 184, 0.24)',
        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.12)',
        padding: 20,
        direction: 'rtl',
        transition: 'transform 0.24s ease, box-shadow 0.24s ease',
        animation: `caseCardEnter 420ms ease-out both`,
        animationDelay: `${index * 80}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 20px 38px rgba(15, 23, 42, 0.18)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 14px 30px rgba(15, 23, 42, 0.12)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <UrgencyBadge urgency={caseItem.urgency} label={caseItem.urgencyLabel} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fee2e2',
              color: '#b91c1c',
              borderRadius: 999,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            🔒 {caseItem.updates}/{caseItem.totalUpdates} {caseItem.updatesLabel}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>{caseItem.categoryIcon}</span>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: 24, fontWeight: 900 }}>
              {caseItem.title}
            </h3>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 700, fontSize: 14 }}>
            {caseItem.categoryLabel} - {caseItem.city}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#334155', fontWeight: 900, fontSize: 14 }}>{t('cases.funded')}</span>
          <span style={{ color: '#0f172a', fontWeight: 900, fontSize: 20 }}>{progress}%</span>
        </div>
        <div
          style={{
            height: 13,
            borderRadius: 999,
            background: '#e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: filled ? `${progress}%` : 0,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
              transition: 'width 1.2s ease-out',
            }}
          />
        </div>
        <div style={{ marginTop: 8, color: '#334155', fontWeight: 800, fontSize: 13, direction: 'ltr', textAlign: 'left' }}>
          {EGP_FORMATTER.format(caseItem.fundedAmount)} / {EGP_FORMATTER.format(caseItem.targetAmount)} EGP
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(`/cases/${caseItem.id}`)}
          style={{
            border: 'none',
            background: 'linear-gradient(135deg,#22d3ee,#38bdf8)',
            color: '#082f49',
            borderRadius: 12,
            padding: '10px 14px',
            fontWeight: 900,
            fontSize: 14,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 8px 18px rgba(56, 189, 248, 0.32)',
          }}
        >
          <FaEye />
          {t('common.details')}
        </button>
        <button
          onClick={() => navigate(`/donate/${caseItem.id}`)}
          style={{
            border: 'none',
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            color: '#ffffff',
            borderRadius: 12,
            padding: '10px 14px',
            fontWeight: 900,
            fontSize: 14,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 8px 20px rgba(34, 197, 94, 0.35)',
          }}
        >
          <FaHeart />
          {t('cases.donate_now')}
        </button>
      </div>
    </article>
  );
}
