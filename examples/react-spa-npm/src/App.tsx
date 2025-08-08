import './App.css';
import { Routes, Route } from 'react-router-dom';
import HomePage from './views/home-page';
import UserProfilePage from './views/user-profile-page';
import { Navbar } from './components/nav-bar';
import { Auth0ComponentProvider } from '@auth0-web-ui-components/react';
import '@auth0-web-ui-components/react/dist/index.css';
import { useTranslation } from 'react-i18next';
import { config } from './config/env';

function App() {
  const { i18n } = useTranslation();

  const defaultAuthDetails = {
    clientId: config.auth0.clientId,
    domain: config.auth0.domain,
  };
  return (
    <div>
      <Auth0ComponentProvider
        authDetails={defaultAuthDetails}
        i18n={{ currentLanguage: i18n.language }}
        theme={{
          mode: 'light',
        }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Routes>
      </Auth0ComponentProvider>
    </div>
  );
}

export default App;
