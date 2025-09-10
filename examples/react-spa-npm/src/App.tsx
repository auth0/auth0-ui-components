import './App.css';
import '@auth0-web-ui-components/react/dist/index.css';
import { Auth0ComponentProvider } from '@auth0-web-ui-components/react';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';

import { Navbar } from './components/nav-bar';
import { config } from './config/env';
import HomePage from './views/home-page';
import UserProfilePage from './views/user-profile-page';

function App() {
  const { i18n } = useTranslation();

  const defaultAuthDetails = {
    clientId: config.auth0.clientId,
    domain: config.auth0.domain,
  };

  return (
    <div className="min-h-screen">
      <Auth0ComponentProvider
        authDetails={defaultAuthDetails}
        i18n={{ currentLanguage: i18n.language }}
      >
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<UserProfilePage />} />
          </Routes>
        </main>
      </Auth0ComponentProvider>
    </div>
  );
}

export default App;
