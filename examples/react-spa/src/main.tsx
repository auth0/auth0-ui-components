import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0-web-ui-components/react';
import '@auth0-web-ui-components/react/dist/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="your_Auth0_domain"
      clientId="your_Auth0_client_id"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <Auth0ComponentProvider i18n={{ currentLanguage: 'en-US' }}>
        <App />
      </Auth0ComponentProvider>
    </Auth0Provider>
  </StrictMode>,
);
