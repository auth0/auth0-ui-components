import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { I18nextProvider } from 'react-i18next';
import i18n from './libs/i18n.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="dev-cz4yj2vahsv3re67.us.auth0.com"
        clientId="5VtIz7hb5G6omlgqspqosRKY8FvXlqru"
        authorizationParams={{ redirect_uri: window.location.origin }}
      >
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Auth0Provider>
    </BrowserRouter>
  </StrictMode>,
);
