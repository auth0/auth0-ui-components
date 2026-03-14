'use client';

import { OrganizationMemberManagement } from '@auth0/universal-components-react/rwa';

export default function MemberManagementPage() {
  return (
    <div className="p-6 pt-8 space-y-6">
      <OrganizationMemberManagement defaultTab="members" />
    </div>
  );
}
