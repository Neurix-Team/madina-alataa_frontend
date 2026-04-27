// ═══════════════════════════════════════════════════════════════════════
// 🎨 Custom Section Component - Clean Code Version
// ═══════════════════════════════════════════════════════════════════════

import React from 'react';

// 🎨 Inline Styles
const styles = {
  container: {
    marginBottom: '30px',
    padding: '20px',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#78350f',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  
  icon: {
    fontSize: '24px',
  },
  
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
};

// 🎯 Sub-Components
const SectionTitle = ({ icon, title }) => (
  <h4 style={styles.title}>
    {icon && <span style={styles.icon}>{icon}</span>}
    {title}
  </h4>
);

const SectionContent = ({ children }) => (
  <div style={styles.content}>
    {children}
  </div>
);

// 🎯 Main Component
export default function CustomSection({ title, children, icon }) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const containerStyle = {
    ...styles.container,
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered 
      ? '0 8px 16px rgba(0, 0, 0, 0.15)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
  };
  
  return (
    <div 
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SectionTitle icon={icon} title={title} />
      <SectionContent>{children}</SectionContent>
    </div>
  );
}
