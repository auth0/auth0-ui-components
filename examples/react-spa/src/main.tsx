import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0-web-ui-components/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-cz4yj2vahsv3re67.us.auth0.com"
      clientId="5VtIz7hb5G6omlgqspqosRKY8FvXlqru"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <Auth0ComponentProvider i18n={{ currentLanguage: 'en-US' }}>
        <App />
      </Auth0ComponentProvider>
    </Auth0Provider>
  </StrictMode>,
);
