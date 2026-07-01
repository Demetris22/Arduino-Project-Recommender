import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted variable faces (font-display: swap). Bricolage Grotesque carries
// the display voice (wordmark + headings) — a characterful grotesque whose name,
// fittingly, means building from the materials you already have. Spline Sans
// Mono is the technical voice used everywhere the UI reads like instrumentation
// (specs, badges, code, labels). Body text stays on the neutral system stack.
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/spline-sans-mono';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
