import React from 'react';

const URGENCY_STYLES = {
  very_urgent: {
    bg: '#ef4444',
    border: '#dc2626',
    text: '#ffffff',
    label: 'عاجل جداً',
    icon: '🔴',
  },
  urgent: {
    bg: '#f97316',
    border: '#ea580c',
    text: '#ffffff',
    label: 'عاجل',
    icon: '🟠',
  },
  not_urgent: {
    bg: '#65a30d',
    border: '#4d7c0f',
    text: '#ffffff',
    label: 'غير عاجل',
    icon: '🟢',
  },
};

export default function UrgencyBadge({ urgency, label }) {
  const style = URGENCY_STYLES[urgency] || URGENCY_STYLES.not_urgent;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: style.bg,
        color: style.text,
        border: `1.5px solid ${style.border}`,
        borderRadius: 999,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 900,
        fontFamily: "'Cairo', sans-serif",
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{label || style.label}</span>
      <span>{style.icon}</span>
    </span>
  );
}
