// src/App.jsx
import React from 'react';
import AppAlertHost from './components/common/AppAlertHost';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <>
      <AppAlertHost />
      <AppRouter />
    </>
  );
}

export default App;
