import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Header from './components/Header';
import { Routes, Route, BrowserRouter, Navigate } from './components/RouterCompat';
import { Sidebar } from './components/side-bar';
import { config } from './config/env';
import DomainManagement from './pages/DomainManagement';
import IdentityProviderManagement from './pages/IdentityProviderManagement';
import IdentityProviderManagementCreate from './pages/IdentityProviderManagementCreate';
import IdentityProviderManagementEdit from './pages/IdentityProviderManagementEdit';
import Index from './pages/Index';
import MFAManagement from './pages/MFAManagement';
import OrganizationManagement from './pages/OrganizationManagement';
import Profile from './pages/Profile';

import { Auth0ComponentProvider } from '@/auth0-ui-components/providers/spa-provider';

const queryClient = new QueryClient();

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

// Layout component with conditional sidebar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      {isAuthenticated && <Sidebar />}
      <div className={isAuthenticated ? 'ml-64' : ''}>{children}</div>
    </div>
  );
};

const App = () => {
  const { i18n } = useTranslation();
  const defaultAuthDetails = {
    domain: config.auth0.domain,
  };
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipPrimitive.Provider>
        <BrowserRouter>
          <Auth0Provider
            domain={config.auth0.domain}
            clientId={config.auth0.clientId}
            authorizationParams={{
              redirect_uri: window.location.origin,
            }}
          >
            <Auth0ComponentProvider
              authDetails={defaultAuthDetails}
              i18n={{ currentLanguage: i18n.language }}
            >
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mfa"
                    element={
                      <ProtectedRoute>
                        <MFAManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/organization-management"
                    element={
                      <ProtectedRoute>
                        <OrganizationManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/idp-management"
                    element={
                      <ProtectedRoute>
                        <IdentityProviderManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/idp-management/create"
                    element={
                      <ProtectedRoute>
                        <IdentityProviderManagementCreate />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/idp-management/edit/:id"
                    element={
                      <ProtectedRoute>
                        <IdentityProviderManagementEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/domain-management"
                    element={
                      <ProtectedRoute>
                        <DomainManagement />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AppLayout>
            </Auth0ComponentProvider>
          </Auth0Provider>
        </BrowserRouter>
      </TooltipPrimitive.Provider>
    </QueryClientProvider>
  );
};

export default App;
