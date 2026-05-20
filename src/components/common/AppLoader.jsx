import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaStar } from 'react-icons/fa';

const AppLoader = ({
  message = 'جاري تحميل البيانات...',
  fullPage = false,
  fillContainer = false,
}) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    minHeight: fullPage ? '100vh' : fillContainer ? '100%' : '300px',
    height: fillContainer ? '100%' : 'auto',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    direction: 'rtl',
    fontFamily: "'Cairo', sans-serif",
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes rocketShake {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-2deg); }
          75% { transform: translateY(2px) rotate(2deg); }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.2, scale: 0.5 }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.2, 0.5],
              x: `${Math.random() * 100 - 50}%`,
              y: `${Math.random() * 100 - 50}%`,
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              color: 'var(--warning)',
              fontSize: 10 + Math.random() * 15,
            }}
          >
            <FaStar />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          zIndex: 1,
          textAlign: 'center',
          width: 'min(420px, 100%)',
          padding: '32px 28px',
          borderRadius: '28px',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            fontSize: '64px',
            color: 'var(--primary)',
            marginBottom: '24px',
            animation: 'rocketShake 0.1s infinite',
            filter: 'drop-shadow(0 10px 15px rgba(59,130,246,0.3))',
          }}
        >
          <FaRocket style={{ transform: 'rotate(-45deg)' }} />
        </motion.div>

        <h3
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
          }}
        >
          {message}
        </h3>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--primary)',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AppLoader;
