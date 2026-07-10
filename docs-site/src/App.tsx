import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import { TechProvider } from './contexts/TechContext';
import DomainTableDocs from './pages/DomainTableDocs';
import GettingStarted from './pages/GettingStarted';
import MemberDetailDocs from './pages/MemberDetailDocs';
import MemberManagementDocs from './pages/MemberManagementDocs';
import MyAccountIntroduction from './pages/MyAccountIntroduction';
import MyOrganizationIntroduction from './pages/MyOrganizationIntroduction';
import OrganizationDetailsEditDocs from './pages/OrganizationDetailsEditDocs';
import SsoProviderCreateDocs from './pages/SsoProviderCreateDocs';
import SsoProviderEditDocs from './pages/SsoProviderEditDocs';
import SsoProviderTableDocs from './pages/SsoProviderTableDocs';
import Styling from './pages/Styling';
import UserMFAMgmtDocs from './pages/UserMFAMgmtDocs';
import UserPasskeyMgmtDocs from './pages/UserPasskeyMgmtDocs';

function AppContent() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<GettingStarted />} />
        <Route path="/getting-started" element={<GettingStarted />} />
        <Route path="/styling" element={<Styling />} />
        <Route path="/my-account" element={<MyAccountIntroduction />} />
        <Route path="/my-account/user-mfa-management" element={<UserMFAMgmtDocs />} />
        <Route path="/my-account/user-passkey-management" element={<UserPasskeyMgmtDocs />} />
        <Route path="/my-organization" element={<MyOrganizationIntroduction />} />
        <Route
          path="/my-organization/organization-details-edit"
          element={<OrganizationDetailsEditDocs />}
        />
        <Route path="/my-organization/domain-table" element={<DomainTableDocs />} />
        <Route path="/my-organization/sso-provider-table" element={<SsoProviderTableDocs />} />
        <Route path="/my-organization/sso-provider-create" element={<SsoProviderCreateDocs />} />
        <Route path="/my-organization/sso-provider-edit" element={<SsoProviderEditDocs />} />
        <Route path="/my-organization/member-management" element={<MemberManagementDocs />} />
        <Route path="/my-organization/member-detail" element={<MemberDetailDocs />} />
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
