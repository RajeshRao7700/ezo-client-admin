import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/* Global styles & Ionic imports */
import './theme/variables.css';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
