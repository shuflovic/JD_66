// main.tsx – Brave/localStorage blocker detection FIRST

// This runs before React imports/hooks
if (typeof window !== 'undefined') {
  let canAccessStorage = false;
  try {
    const testKey = 'brave-storage-test';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    canAccessStorage = true;
  } catch (e) {
    console.warn('localStorage blocked by browser (likely Brave Shields)');
  }

  if (!canAccessStorage) {
    // Replace root content immediately – no React needed
    document.addEventListener('DOMContentLoaded', () => {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = `
          <div style="
            padding: 3rem 1rem;
            text-align: center;
            font-family: system-ui, sans-serif;
            color: #e5e7eb;
            background: #111827;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 1.5rem;
          ">
            <h2 style="font-size: 2rem; margin: 0;">Game can't load properly 😕</h2>
            <p style="max-width: 500px; margin: 0;">
              Your browser (likely Brave) is blocking localStorage access.<br>
              This is required for saving tutorial progress, high scores & sound settings.
            </p>
            <p style="max-width: 500px; margin: 0; font-weight: bold;">
              Quick fix:<br>
              1. Click the 🦁 lion icon in the address bar<br>
              2. Set Shields to <strong>Standard</strong> (not Aggressive)<br>
              3. Or turn Shields down/off for this site<br>
              4. Hard refresh (Ctrl + Shift + R / Cmd + Shift + R)
            </p>
            <p>Thanks & sorry for the trouble! 🛡️</p>
          </div>
        `;
      }
    });
    // Stop everything – no more script execution
    throw new Error('localStorage blocked – halting render');
  }
}

// If we reach here → storage works → safe to import & render React
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
