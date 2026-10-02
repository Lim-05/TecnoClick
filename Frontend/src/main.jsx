// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Asegurar que todas las peticiones fetch al backend incluyan las cookies HttpOnly
const originalFetch = window.fetch;
window.fetch = (url, options = {}) => {
  return originalFetch(url, { ...options, credentials: 'include' });
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)