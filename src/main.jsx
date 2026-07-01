import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted variable faces (font-display: swap). Archivo is an industrial
// grotesque with a drafting-label feel; it carries both display and body.
// Spline Sans Mono is the annotation/instrument voice (specs, badges, code,
// labels). Together they set the blueprint tone.
import '@fontsource-variable/archivo';
import '@fontsource-variable/spline-sans-mono';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
