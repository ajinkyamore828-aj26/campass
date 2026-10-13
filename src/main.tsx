import React from 'react';
import ReactDOM from 'react-dom/client';
import { CampusPassProvider } from './context/CampusPassContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CampusPassProvider>
      <App />
    </CampusPassProvider>
  </React.StrictMode>
);
