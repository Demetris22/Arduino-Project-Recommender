import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted variable faces (font-display: swap). Archivo is an industrial
// grotesque with a drafting-label feel; it carries both display and body.
// Spline Sans Mono is the annotation/instrument voice (specs, badges, code,
// labels). Together they set the blueprint tone.
// Standard axes so the display headline can use Archivo's width axis (an
// expanded, title-block cut); body + labels stay at the default width.
import '@fontsource-variable/archivo/standard.css';
import '@fontsource-variable/spline-sans-mono';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
