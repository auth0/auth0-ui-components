import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import { TechProvider } from './contexts/TechContext';
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
  return (
    <Layout>
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
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <TechProvider>
        <AppContent />
      </TechProvider>
    </Router>
  );
}

export default App;
