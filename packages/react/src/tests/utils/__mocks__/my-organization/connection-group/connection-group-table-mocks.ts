import { vi } from 'vitest';

import type {
  ConnectionGroup,
  ConnectionGroupPermissions,
  ConnectionGroupRole,
  OrganizationConnectionGroupTableViewProps,
} from '@/types/my-organization/connection-group/organization-connection-group-table-types';

/** Permissions with everything granted. */
export const ALL_CONNECTION_GROUP_PERMISSIONS: ConnectionGroupPermissions = {
  canListGroups: true,
  canManageGroupRoles: true,
};

/** Permissions with role management disabled (read-only). */
export const READ_ONLY_CONNECTION_GROUP_PERMISSIONS: ConnectionGroupPermissions = {
  canListGroups: true,
  canManageGroupRoles: false,
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
    onAssignRoles: vi.fn(),
    onViewDetails: vi.fn(),
    ...overrides,
  };
}
