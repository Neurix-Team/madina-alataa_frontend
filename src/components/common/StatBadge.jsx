// ═══════════════════════════════════════════════════════════════════════
// 📊 Stat Badge Component - Clean Code Version (All-in-one)
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react';

// 🎨 Styles
const styles = {
  container: (isHovered) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '10px 16px',
    minWidth: '120px',
    flex: '1 1 120px',
    direction: 'rtl',
    transition: 'box-shadow 0.2s, transform 0.2s',
    boxShadow: isHovered ? '0 4px 14px rgba(0,0,0,0.08)' : 'none',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    cursor: 'default',
  }),
  
  icon: {
    fontSize: '22px',
  },
  
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  label: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  value: (color) => ({
    fontSize: '18px',
    fontWeight: '900',
    color: color || '#1e293b',
  }),
};

// 🎯 Sub-Components
const Icon = ({ icon }) => (
  <span style={styles.icon}>{icon}</span>
);

const Content = ({ label, value, color }) => (
  <div style={styles.content}>
    <span style={styles.label}>{label}</span>
    <span style={styles.value(color)}>
      {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
    </span>
  </div>
);

// 🎯 Main Component
const StatBadge = ({ icon, label, value, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  return (
    <div
      style={styles.container(isHovered)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="status"
      aria-label={`${label}: ${value}`}
    >
      <Icon icon={icon} />
      <Content label={label} value={value} color={color} />
    </div>
  );
};

export default StatBadge;
