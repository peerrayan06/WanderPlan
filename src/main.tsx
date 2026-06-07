import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for reliable offline caching of plans, styles, and map tiles
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[WanderPlan] ServiceWorker registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.warn('[WanderPlan] ServiceWorker registration failed:', err);
      });
  });
}
