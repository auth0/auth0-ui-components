import { useAuth0 } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0-web-ui-components/react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Layout from './components/Layout';
import GettingStarted from './pages/GettingStarted';
import HomePage from './pages/HomePage';
import UserMFA from './pages/UserMFA';
import '@auth0-web-ui-components/react/dist/index.css';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Handle post-logout redirect
  React.useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      const preLogoutLocation = localStorage.getItem('preLogoutLocation');
      if (preLogoutLocation) {
        localStorage.removeItem('preLogoutLocation');
        // Navigate to the stored location
        navigate(preLogoutLocation);
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Layout>
      <Auth0ComponentProvider
        authDetails={{
          domain: import.meta.env.VITE_AUTH0_DOMAIN,
          clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route path="/components/user-mfa" element={<UserMFA />} />
        </Routes>
      </Auth0ComponentProvider>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
