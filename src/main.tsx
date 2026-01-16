import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ← Put the detection here – before rendering anything
if (typeof window !== 'undefined') {
  try {
    // Simple localStorage test
    window.localStorage.setItem('test-brave-fix', 'test');
    window.localStorage.removeItem('test-brave-fix');
  } catch (e) {
    // If localStorage is blocked → show friendly message instead of blank screen
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.innerHTML = `
        <div style="
          padding: 2rem;
          text-align: center;
          font-family: system-ui, sans-serif;
          color: #fff;
          background: #111827;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        ">
          <h2 style="margin-bottom: 1rem;">Oops! The game can't load properly</h2>
          <p style="max-width: 500px; margin-bottom: 1.5rem;">
            It looks like your browser (probably Brave) is blocking localStorage access.
            This is needed for saving progress, sound settings, and tutorial state.
          </p>
          <p style="max-width: 500px; margin-bottom: 1.5rem;">
            <strong>Quick fix:</strong><br>
            1. Click the 🦁 lion icon in the address bar<br>
            2. Set Shields to <strong>Standard</strong> (or turn them down for this site)<br>
            3. Refresh the page (Ctrl + F5 / Cmd + Shift + R)
          </p>
          <p>Thanks for understanding! 🛡️</p>
        </div>
      `;
    }
    // Stop here – don't render React app
    // You can also console.warn if you want
    console.warn('localStorage blocked – showing fallback message');
  }
}

// If we reached here → localStorage works → render normal app
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
