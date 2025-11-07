import './App.css';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import type { WithAuthenticationRequiredOptions } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/web-ui-components-react';
import type { ComponentType } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';

import { Navbar } from './components/nav-bar';
import { Sidebar } from './components/side-bar';
import { config } from './config/env';
import DomainManagementPage from './views/domain-management-page';
import HomePage from './views/home-page';
import MFAPage from './views/mfa-page';
import OrgManagementPage from './views/org-management-page';
import SsoProviderCreatePage from './views/sso-provider-create-page';
import SsoProviderEditPage from './views/sso-provider-edit-page';
import SsoProviderPage from './views/sso-provider-page';
import UserProfilePage from './views/user-profile-page';

// Protected Route wrapper
interface ProtectedRouteProps extends WithAuthenticationRequiredOptions {
  component: ComponentType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, args);
  return <Component />;
};

function AppContent() {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="min-h-screen">
      <Navbar />
      {isAuthenticated && <Sidebar />}
      <main className={`pt-16 ${isAuthenticated ? 'ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProtectedRoute component={UserProfilePage} />} />
          <Route path="/mfa" element={<ProtectedRoute component={MFAPage} />} />
          <Route
            path="/org-management"
            element={<ProtectedRoute component={OrgManagementPage} />}
          />
          <Route path="/sso-providers" element={<ProtectedRoute component={SsoProviderPage} />} />
          <Route
            path="/sso-provider/create"
            element={<ProtectedRoute component={SsoProviderCreatePage} />}
          />
          <Route
            path="/sso-provider/edit/:id"
            element={<ProtectedRoute component={SsoProviderEditPage} />}
          />
          <Route
            path="/domain-management"
            element={<ProtectedRoute component={DomainManagementPage} />}
          />
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
        theme: 'default',
        mode: 'light',
      }}
    >
      <AppContent />
    </Auth0ComponentProvider>
  );
}

export default App;
