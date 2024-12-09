import './styles/global.css';  // Tailwind og globale stiler først
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrer service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service worker registrert:', registration);
      })
      .catch(error => {
        console.log('Service worker registrering feilet:', error);
      });
  });
}