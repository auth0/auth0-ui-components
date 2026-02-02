import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import type { WithAuthenticationRequiredOptions } from '@auth0/auth0-react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Header from './components/Header';
import { Routes, Route, BrowserRouter } from './components/RouterCompat';
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
import { Auth0ProviderWithRedirectCallback } from './providers/Auth0ProviderWithRedirectCallback';

import { Auth0ComponentProvider } from '@/auth0-ui-components/providers/spa-provider';

const queryClient = new QueryClient();

// Protected Route wrapper
interface ProtectedRouteProps extends WithAuthenticationRequiredOptions {
  component: ComponentType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, args);
  return <Component />;
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
          <Auth0ProviderWithRedirectCallback
            domain={config.auth0.domain}
            clientId={config.auth0.clientId}
            authorizationParams={{
              redirect_uri: window.location.origin,
              scope: 'offline_access openid profile email',
            }}
            cacheLocation="localstorage"
            useRefreshTokens={true}
            useMrrt={true}
          >
            <Auth0ComponentProvider
              authDetails={defaultAuthDetails}
              i18n={{ currentLanguage: i18n.language }}
            >
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
                  <Route path="/mfa" element={<ProtectedRoute component={MFAManagement} />} />
                  <Route
                    path="/organization-management"
                    element={<ProtectedRoute component={OrganizationManagement} />}
                  />
                  <Route
                    path="/idp-management"
                    element={<ProtectedRoute component={IdentityProviderManagement} />}
                  />
                  <Route
                    path="/idp-management/create"
                    element={<ProtectedRoute component={IdentityProviderManagementCreate} />}
                  />
                  <Route
                    path="/idp-management/edit/:id"
                    element={<ProtectedRoute component={IdentityProviderManagementEdit} />}
                  />
                  <Route
                    path="/domain-management"
                    element={<ProtectedRoute component={DomainManagement} />}
                  />
                </Routes>
              </AppLayout>
            </Auth0ComponentProvider>
          </Auth0ProviderWithRedirectCallback>
        </BrowserRouter>
      </TooltipPrimitive.Provider>
    </QueryClientProvider>
  );
};

export default App;
