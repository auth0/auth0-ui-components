import { Auth0Provider } from '@auth0/auth0-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Routes, Route, BrowserRouter } from '@/components/RouterCompat';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Auth0ComponentProvider } from '@/providers/component-provider';

import { config } from './config/env';
import Index from './pages/Index';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

const App = () => {
  const { i18n } = useTranslation();
  const defaultAuthDetails = {
    clientId: config.auth0.clientId,
    domain: config.auth0.domain,
  };
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Auth0Provider
            domain={config.auth0.domain}
            clientId={config.auth0.clientId}
            authorizationParams={{ redirect_uri: window.location.origin }}
          >
            <Auth0ComponentProvider
              authDetails={defaultAuthDetails}
              i18n={{ currentLanguage: i18n.language }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Auth0ComponentProvider>
          </Auth0Provider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
