import './App.css';
import { useAuth0 } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/web-ui-components-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate } from 'react-router-dom';

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
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mfa"
            element={
              <ProtectedRoute>
                <MFAPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org-management"
            element={
              <ProtectedRoute>
                <OrgManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sso-providers"
            element={
              <ProtectedRoute>
                <SsoProviderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sso-provider/create"
            element={
              <ProtectedRoute>
                <SsoProviderCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sso-provider/edit/:id"
            element={
              <ProtectedRoute>
                <SsoProviderEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/domain-management"
            element={
              <ProtectedRoute>
                <DomainManagementPage />
              </ProtectedRoute>
            }
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
