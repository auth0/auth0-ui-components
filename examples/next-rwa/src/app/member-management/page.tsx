'use client';

import { OrganizationMemberManagement } from '@auth0/universal-components-react';

export default function MemberManagementPage() {
  return (
    <div className="p-6 pt-8 space-y-6">
      <p className="text-primary">
        Follow{' '}
        <a
          href="https://github.com/auth0/auth0-ui-components/tree/main/examples/next-rwa#adding-a-universal-component-to-your-app"
          target="_blank"
        >
          <u>Quickstart guidance</u>
        </a>{' '}
        on how to add Member Management component.
      </p>
      <OrganizationMemberManagement />
    </div>
  );
}
