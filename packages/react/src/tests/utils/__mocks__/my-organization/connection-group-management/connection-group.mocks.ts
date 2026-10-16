import { vi } from 'vitest';

import type {
  ConnectionGroupDetailRole,
  OrganizationConnectionGroupDetailViewProps,
} from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';
import type {
  ConnectionGroup,
  ConnectionGroupPermissions,
  ConnectionGroupRole,
  OrganizationConnectionGroupTableViewProps,
} from '@/types/my-organization/connection-group-management/organization-connection-group-table-types';

/** Permissions with everything granted. */
export const ALL_CONNECTION_GROUP_PERMISSIONS: ConnectionGroupPermissions = {
  canListGroups: true,
  canRemoveFromOrganization: true,
};

/** Permissions with remove-from-organization disabled (read-only). */
export const READ_ONLY_CONNECTION_GROUP_PERMISSIONS: ConnectionGroupPermissions = {
  canListGroups: true,
  canRemoveFromOrganization: false,
};

/**
 * Builds a connection group role.
 * @param overrides - Partial fields to override.
 * @returns A {@link ConnectionGroupRole}.
 */
export function createMockConnectionGroupRole(
  overrides: Partial<ConnectionGroupRole> = {},
): ConnectionGroupRole {
  return {
    id: 'role_admin',
    name: 'Admin',
    ...overrides,
  };
}

/**
 * Builds a connection group detail role (role with permissions).
 * @param overrides - Partial fields to override.
 * @returns A {@link ConnectionGroupDetailRole}.
 */
export function createMockConnectionGroupDetailRole(
  overrides: Partial<ConnectionGroupDetailRole> = {},
): ConnectionGroupDetailRole {
  return {
    id: 'rol_admin',
    name: 'Admin',
    description: 'Administrator role',
    permissions: ['read:users', 'update:users'],
    removable: true,
    ...overrides,
  };
}

/** A mock list of connection group detail roles. */
export const createMockConnectionGroupDetailRoles = (): ConnectionGroupDetailRole[] => [
  createMockConnectionGroupDetailRole(),
  createMockConnectionGroupDetailRole({
    id: 'rol_member',
    name: 'Member',
    description: 'Member role',
    permissions: ['read:users'],
  }),
  createMockConnectionGroupDetailRole({
    id: 'rol_developer',
    name: 'Developer',
    description: 'Managed by the tenant admin',
    permissions: ['read:apis'],
    removable: false,
  }),
];

/**
 * Builds a connection group.
 * @param overrides - Partial fields to override.
 * @returns A {@link ConnectionGroup}.
 */
export function createMockConnectionGroup(
  overrides: Partial<ConnectionGroup> = {},
): ConnectionGroup {
  return {
    id: 'grp_engineering',
    name: 'Engineering',
    external_id: 'ext_engineering',
    connection_id: 'con_acme_saml',
    source: 'ACME SAML',
    assignedRoles: [createMockConnectionGroupRole()],
    ...overrides,
  };
}

/**
 * Builds props for the connection group table view component.
 * @param overrides - Partial fields to override.
 * @returns A {@link OrganizationConnectionGroupTableViewProps}.
 */
export function createMockConnectionGroupTableViewProps(
  overrides: Partial<OrganizationConnectionGroupTableViewProps> = {},
): OrganizationConnectionGroupTableViewProps {
  return {
    groups: [createMockConnectionGroup()],
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    permissions: ALL_CONNECTION_GROUP_PERMISSIONS,
    readOnly: false,
    hideHeader: false,
    isLoading: false,
    onRemoveFromOrganization: vi.fn(),
    onViewDetails: vi.fn(),
    ...overrides,
  };
}

/**
 * Builds props for the connection group detail view component.
 * @param overrides - Partial fields to override.
 * @returns A {@link OrganizationConnectionGroupDetailViewProps}.
 */
export function createMockConnectionGroupDetailViewProps(
  overrides: Partial<OrganizationConnectionGroupDetailViewProps> = {},
): OrganizationConnectionGroupDetailViewProps {
  return {
    permissions: { canViewRoles: true, canAssignRoles: true, canRemoveRoles: true },
    group: createMockConnectionGroup(),
    roles: createMockConnectionGroupDetailRoles(),
    availableRoles: [],
    selectedRoles: [],
    modalState: null,
    readOnly: false,
    isFetchingRoles: false,
    isSearchingRoles: false,
    isAssigningRoles: false,
    isRemovingRoles: false,
    setSelectedRoles: vi.fn(),
    onRoleSearch: vi.fn(),
    handleBack: vi.fn(),
    openModal: vi.fn(),
    closeModal: vi.fn(),
    handleAssignRolesSubmit: vi.fn(),
    handleRemoveRolesConfirm: vi.fn(),
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    ...overrides,
  };
}
