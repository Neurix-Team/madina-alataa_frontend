// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import './styles/orders.css';
import './styles/admin.css';
import './styles/npc-dialog.css';
import './styles/minigame.css';
import './styles/badges.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
