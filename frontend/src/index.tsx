import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { logger } from './utils/logging';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

logger.info('React application mounting', 'Index');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

logger.info('React application mounted successfully', 'Index');
