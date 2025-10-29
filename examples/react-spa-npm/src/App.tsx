import './App.css';
import '@auth0-web-ui-components/react/dist/index.css';
import { useAuth0 } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0-web-ui-components/react';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';

import { Navbar } from './components/nav-bar';
import { Sidebar } from './components/side-bar';
import { config } from './config/env';
import HomePage from './views/home-page';
import MFAPage from './views/mfa-page';
import OrgManagementPage from './views/org-management-page';
import SsoProviderCreatePage from './views/sso-provider-create-page';
import SsoProviderEditPage from './views/sso-provider-edit-page';
import SsoProviderPage from './views/sso-provider-page';
import UserProfilePage from './views/user-profile-page';

function AppContent() {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="min-h-screen">
      <Navbar />
      {isAuthenticated && <Sidebar />}
      <main className={`pt-16 ${isAuthenticated ? 'ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/mfa" element={<MFAPage />} />
          <Route path="/org-management" element={<OrgManagementPage />} />
          <Route path="/sso-providers" element={<SsoProviderPage />} />
          <Route path="/sso-provider/create" element={<SsoProviderCreatePage />} />
          <Route path="/sso-provider/edit/:id" element={<SsoProviderEditPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const { i18n } = useTranslation();

  const defaultAuthDetails = {
    domain: config.auth0.domain,
  };

  return (
    <Auth0ComponentProvider
      authDetails={defaultAuthDetails}
      i18n={{ currentLanguage: i18n.language }}
      themeSettings={{
        theme: 'minimal',
        mode: 'light',
      }}
    >
      <AppContent />
    </Auth0ComponentProvider>
  );
}

export default App;
