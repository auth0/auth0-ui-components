import { useAuth0 } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/web-ui-components-react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Layout from './components/Layout';
import DomainTableDocs from './pages/DomainTableDocs';
import GettingStarted from './pages/GettingStarted';
import MyAccountIntroduction from './pages/MyAccountIntroduction';
import MyOrgIntroduction from './pages/MyOrgIntroduction';
import OrgDetailsEditDocs from './pages/OrgDetailsEditDocs';
import SsoProviderCreateDocs from './pages/SsoProviderCreateDocs';
import SsoProviderEditDocs from './pages/SsoProviderEditDocs';
import SsoProviderTableDocs from './pages/SsoProviderTableDocs';
import UserMFAMgmtDocs from './pages/UserMFAMgmtDocs';

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
        }}
      >
        <Routes>
          <Route path="/" element={<GettingStarted />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route path="/my-account" element={<MyAccountIntroduction />} />
          <Route path="/my-account/user-mfa-management" element={<UserMFAMgmtDocs />} />
          <Route path="/my-org" element={<MyOrgIntroduction />} />
          <Route path="/my-org/org-details-edit" element={<OrgDetailsEditDocs />} />
          <Route path="/my-org/domain-table" element={<DomainTableDocs />} />
          <Route path="/my-org/sso-provider-table" element={<SsoProviderTableDocs />} />
          <Route path="/my-org/sso-provider-create" element={<SsoProviderCreateDocs />} />
          <Route path="/my-org/sso-provider-edit" element={<SsoProviderEditDocs />} />
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
