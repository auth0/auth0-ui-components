'use client';

import {
  OrganizationConnectionGroupTableView,
  type ConnectionGroup,
} from '@auth0/universal-components-react';
import { useMemo } from 'react';

/**
 * Demo page for the connection group list table (UIC-1634).
 *
 * The `@auth0/myorganization-js` SDK does not yet expose a `groups` namespace,
 * so the smart `OrganizationConnectionGroupTable` resolves to an empty list.
 * This page renders the presentational view directly with mock data to preview
 * the full design (name, source, assigned roles, row actions).
 */
export default function ConnectionGroupsPage() {
  const groups = useMemo<ConnectionGroup[]>(
    () => [
      {
        id: 'grp_engineering',
        name: 'Engineering',
        external_id: 'ext_eng',
        connection_id: 'con_acme_saml',
        source: 'ACME SAML',
        assignedRoles: [
          { id: 'role_admin', name: 'Admin' },
          { id: 'role_billing', name: 'Billing Manager' },
        ],
      },
      {
        id: 'grp_sales',
        name: 'Sales',
        external_id: 'ext_sales',
        connection_id: 'con_google',
        source: 'Google Workspace',
        assignedRoles: [
          { id: 'role_viewer', name: 'Viewer' },
          { id: 'role_support', name: 'Support' },
          { id: 'role_analyst', name: 'Analyst' },
          { id: 'role_auditor', name: 'Auditor' },
        ],
      },
      {
        id: 'grp_contractors',
        name: 'Contractors',
        external_id: 'ext_contractors',
        connection_id: 'con_acme_saml',
        source: 'ACME SAML',
        assignedRoles: [],
      },
    ],
    [],
  );

  return (
    <div className="p-6 pt-8 space-y-6">
      <OrganizationConnectionGroupTableView
        groups={groups}
        permissions={{ canListGroups: true, canManageGroupRoles: true }}
        onViewDetails={(group) => console.log('view', group)}
        onAssignRoles={(group) => console.log('assign roles', group)}
      />
    </div>
  );
}
