'use client';

import {
  OrganizationConnectionGroupDetailView,
  type ConnectionGroup,
  type ConnectionGroupDetailModalState,
  type ConnectionGroupDetailRole,
} from '@auth0/universal-components-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const ALL_ROLES: ConnectionGroupDetailRole[] = [
  {
    id: 'role_admin',
    name: 'Admin',
    description: 'Full access',
    permissions: ['read', 'write'],
    removable: true,
  },
  {
    id: 'role_billing',
    name: 'Billing Manager',
    description: 'Manages billing',
    permissions: [],
    removable: true,
  },
  {
    id: 'role_developer',
    name: 'Developer',
    description: 'Managed by your tenant admin',
    permissions: ['read', 'deploy', 'debug'],
    removable: false,
  },
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: ['read'],
    removable: true,
  },
  {
    id: 'role_support',
    name: 'Support',
    description: 'Support tooling',
    permissions: ['read'],
    removable: true,
  },
];

const DEFAULT_GROUP: ConnectionGroup = {
  id: 'grp_engineering',
  name: 'Engineering',
  external_id: 'ext_eng',
  connection_id: 'con_acme_saml',
  source: 'ACME SAML',
  assignedRoles: [
    { id: 'role_admin', name: 'Admin' },
    { id: 'role_billing', name: 'Billing Manager' },
  ],
};

const MOCK_GROUPS: ConnectionGroup[] = [
  DEFAULT_GROUP,
  {
    id: 'grp_sales',
    name: 'Sales',
    external_id: 'ext_sales',
    connection_id: 'con_google',
    source: 'Google Workspace',
    assignedRoles: [{ id: 'role_viewer', name: 'Viewer' }],
  },
  {
    id: 'grp_contractors',
    name: 'Contractors',
    external_id: 'ext_contractors',
    connection_id: 'con_acme_saml',
    source: 'ACME SAML',
    assignedRoles: [],
  },
];

/**
 * Demo page for the connection group detail (UIC-1635).
 *
 * The `@auth0/myorganization-js` SDK does not yet expose a `groups` namespace,
 * so the smart `OrganizationConnectionGroupDetail` cannot load data. This page
 * renders the presentational view with local state so the Roles section, assign
 * modal, and remove modal can be previewed. Swap in `OrganizationConnectionGroupDetail`
 * once the SDK ships.
 */
export default function ConnectionGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = decodeURIComponent(params.group_id as string);

  const group = useMemo<ConnectionGroup>(
    () => MOCK_GROUPS.find((g) => g.id === groupId) ?? { ...DEFAULT_GROUP, id: groupId },
    [groupId],
  );

  const [roles, setRoles] = useState<ConnectionGroupDetailRole[]>(ALL_ROLES.slice(0, 3));
  const [selectedRoles, setSelectedRoles] = useState<ConnectionGroupDetailRole[]>([]);
  const [modalState, setModalState] = useState<ConnectionGroupDetailModalState>(null);
  const [search, setSearch] = useState('');

  const availableRoles = ALL_ROLES.filter(
    (r) =>
      !roles.some((assigned) => assigned.id === r.id) &&
      r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const closeModal = () => setModalState(null);

  return (
    <div className="p-6 pt-8">
      <OrganizationConnectionGroupDetailView
        permissions={{ canViewRoles: true, canAssignRoles: true, canRemoveRoles: true }}
        group={group}
        roles={roles}
        availableRoles={availableRoles}
        selectedRoles={selectedRoles}
        modalState={modalState}
        isFetchingRoles={false}
        isSearchingRoles={false}
        isAssigningRoles={false}
        isRemovingRoles={false}
        styling={{ variables: { common: {}, light: {}, dark: {} }, classes: {} }}
        customMessages={{}}
        setSelectedRoles={setSelectedRoles}
        onRoleSearch={setSearch}
        handleBack={() => router.push('/connection-groups')}
        openModal={setModalState}
        closeModal={closeModal}
        handleAssignRolesSubmit={(roleIds) => {
          setRoles((prev) => [...prev, ...ALL_ROLES.filter((r) => roleIds.includes(r.id))]);
          setSearch('');
          closeModal();
        }}
        handleRemoveRolesConfirm={() => {
          if (modalState?.type === 'removeRoles') {
            const removed = modalState.roles.map((r) => r.id);
            setRoles((prev) => prev.filter((r) => !removed.includes(r.id)));
          }
          setSelectedRoles([]);
          closeModal();
        }}
      />
    </div>
  );
}
