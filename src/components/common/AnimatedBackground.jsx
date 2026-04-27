import React, { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Generate random animated items
    const generateItems = () => {
      const emojis = ['🚀', '⭐', '🌠', '✨', '💫'];
      const newItems = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 8 + Math.random() * 6,
        size: 24 + Math.random() * 20,
      }));
      setItems(newItems);
    };

    generateItems();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            filter: drop-shadow(0 0 0px rgba(255, 255, 255, 0));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.8));
            transform: scale(1.1);
          }
          100% {
            filter: drop-shadow(0 0 0px rgba(255, 255, 255, 0));
            transform: scale(1);
          }
        }

        .animated-bg-item {
          position: absolute;
          font-size: 24px;
          user-select: none;
        }

        .rocket {
          animation: floatUp linear infinite;
        }

        .star {
          animation: twinkle 3s ease-in-out infinite;
          filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.6));
        }

        .meteor {
          animation: floatUp linear infinite, shimmer 2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.9));
        }
      `}</style>

      {items.map(item => {
        let className = 'animated-bg-item';
        if (item.emoji === '🚀') className += ' rocket';
        else if (item.emoji === '⭐') className += ' star';
        else className += ' meteor';

        return (
          <div
            key={item.id}
            className={className}
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              fontSize: `${item.size}px`,
              animation:
                item.emoji === '⭐'
                  ? `twinkle 3s ease-in-out infinite`
                  : `floatUp ${item.duration}s linear ${item.delay}s infinite`,
              opacity: 0.6,
            }}
          >
            {item.emoji}
          </div>
        );
      })}
    </div>
  );
}
