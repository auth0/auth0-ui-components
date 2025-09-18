import { OrgDetailsEdit } from '@auth0-web-ui-components/react';

const OrgManagementPage = () => {
  return (
    <div className="space-y-6">
      <OrgDetailsEdit organizationId="your-organization-id" />
    </div>
  );
};

export default OrgManagementPage;
