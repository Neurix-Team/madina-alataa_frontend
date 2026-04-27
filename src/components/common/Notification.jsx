// src/components/common/Notification.jsx
import React from 'react';

const Notification = ({ message }) => (
  <div style={{
    position: 'fixed',
    top: 24,
    left: '50%',
    transform: `translateX(-50%) translateY(${message ? '0' : '-120px'})`,
    background: '#fff',
    borderRadius: 18,
    padding: '14px 28px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 900,
    fontSize: 15,
    color: '#1e293b',
    zIndex: 300,
    transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    direction: 'rtl',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '2px solid #e2e8f0',
    whiteSpace: 'nowrap',
  }}>
    {message}
  </div>
);

export default Notification;
