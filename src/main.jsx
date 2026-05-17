// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthProvider';
import './styles/tailwind.css';
import './styles/variables.css';
import './styles/professional-ui.css';
import './styles/professional-pages.css';
import './styles/orders.css';
import './styles/admin.css';
import './styles/npc-dialog.css';
import './styles/minigame.css';
import './styles/badges.css';
import App from './App';
import 'wicg-inert';
import './i18n';

const restoreHashRouteFromPath = () => {
  if (window.location.hash || window.location.pathname === '/') return;

  const routePath = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, '', `/#${routePath}`);
};

// import { worker } from './mocks/browser';

// ✅ إلغاء تسجيل أي Service Worker قديم (مثل MSW) ومسح الكاش في وضع التطوير
// ده بيحل مشكلة إن التعديلات في الملفات مش بتظهر في البراوزر
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then((success) => {
        if (success) {
          console.log('[Dev] تم إلغاء تسجيل Service Worker قديم');
        }
      });
    });
  });

  // مسح كل الكاشات اللي ممكن البراوزر يكون عاملها
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).then(() => {
          console.log('[Dev] تم مسح الكاش:', cacheName);
        });
      });
    });
  }
}

const renderApp = () => {
  restoreHashRouteFromPath();

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </React.StrictMode>
  );
};

// if (import.meta.env.DEV) {
//   worker.start({
//     serviceWorker: {
//       url: '/mockServiceWorker.js',
//     },
//   }).then(renderApp);
// } else {
  renderApp();
// }
