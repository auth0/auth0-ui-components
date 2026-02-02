import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App.tsx';
import { config } from './config/env.ts';
import i18n from './libs/i18n.ts';
import { Auth0ProviderWithRedirectCallback } from './providers/Auth0ProviderWithRedirectCallback.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithRedirectCallback
        domain={config.auth0.domain}
        clientId={config.auth0.clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
        useMrrt={true}
        cacheLocation="localstorage"
        useRefreshTokens={true}
      >
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Auth0ProviderWithRedirectCallback>
    </BrowserRouter>
  </StrictMode>,
);
