import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App.tsx';

// Auth0 configuration
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || 'demo.auth0.com',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || 'demo-client-id',
  authorizationParams: {
    redirect_uri: window.location.origin,
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider {...auth0Config}>
      <App />
    </Auth0Provider>
  </React.StrictMode>,
);
