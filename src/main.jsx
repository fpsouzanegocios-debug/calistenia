import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { App } from './App';
import './app.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

// Register PWA Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registrado:', registration.scope);
      })
      .catch((error) => {
        console.warn('[PWA] Falha ao registrar Service Worker:', error);
      });
  });
}

// Disable pinch-to-zoom and gesture zooming across mobile browsers
if (typeof window !== 'undefined') {
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

  // Prevent multi-touch pinch zoom
  document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevent double-tap to zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
}
