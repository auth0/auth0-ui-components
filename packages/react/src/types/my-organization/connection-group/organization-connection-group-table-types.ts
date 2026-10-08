/**
 * Connection group table types.
 * @module organization-connection-group-table-types
 */

import type {
  ComponentAction,
  OrganizationConnectionGroupTableMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';
import type { UseQueryResult } from '@tanstack/react-query';

/**
 * A role assigned to a connection group.
 *
 * TODO(SDK): replace with the role type from `@auth0/myorganization-js` once the
 * groups role-management endpoints land.
 */
export interface ConnectionGroupRole {
  id: string;
  name: string;
}

/**
 * A connection-level group (SCIM or Google Workspace) belonging to an
 * organization's identity provider.
 *
 * Mirrors the `GET /my-org/groups` payload (PRD Req 7.1: `id`, `name`,
 * `external_id`, `connection_id`) plus display fields resolved client-side:
 * - `source` — human-readable label for the group's connection (e.g. "ACME SAML").
 * - `assignedRoles` — roles granted to the group; sourced from the role-management
 *   endpoints and empty until those are wired.
 *
 * TODO(SDK): replace with the generated groups type from `@auth0/myorganization-js`
 * once the `groups` namespace is available; the SDK currently exposes no such type.
 */
export interface ConnectionGroup {
  /** Group id, e.g. `grp_...`. */
  id: string;
  /** Display name, e.g. "Engineering". */
  name: string;
  /** Identifier from the external directory. */
  external_id?: string;
  /** Owning connection id, e.g. `con_...`. */
  connection_id: string;
  /** Resolved display label for the owning connection, e.g. "ACME SAML". */
  source: string;
  /** Roles assigned to the group. */
  assignedRoles: ConnectionGroupRole[];
}

/**
 * Capabilities for the connection group table, derived from the current access
 * level.
 *
 * TODO(SDK): resolve from granted scopes (e.g. `read:my_org:groups`) via a core
 * permission resolver once those scopes exist in `MyOrganization.OauthScope`.
 */
export interface ConnectionGroupPermissions {
  /** Whether the user can view connection groups. */
  canListGroups: boolean;
  /** Whether the user can manage roles on a group — gates the actions menu. */
  canManageGroupRoles: boolean;
}

/** CSS classes for OrganizationConnectionGroupTable. */
export interface OrganizationConnectionGroupTableClasses {
  'OrganizationConnectionGroupTable-header'?: string;
  'OrganizationConnectionGroupTable-table'?: string;
}

/** Props for the OrganizationConnectionGroupTable component. */
export interface OrganizationConnectionGroupTableProps
  extends SharedComponentProps<
    OrganizationConnectionGroupTableMessages,
    OrganizationConnectionGroupTableClasses
  > {
  /** Hide the title/description header. */
  hideHeader?: boolean;
  /** Max role names shown per row before collapsing into a "+N more" overflow. Defaults to 3. */
  maxVisibleRoles?: number;
  /** Fired when the "Assign roles" row action is triggered. */
  assignRolesAction?: ComponentAction<ConnectionGroup>;
  /** Fired when the "View group" row action is triggered. */
  viewDetailsAction?: ComponentAction<ConnectionGroup>;
}

/** Internal service hook result for connection group table data. */
export interface UseConnectionGroupTableServiceReturn {
  groups: ConnectionGroup[];
  isLoading: boolean;
  isFetching: boolean;
  groupsError: unknown;
  refetchGroups: UseQueryResult<ConnectionGroup[]>['refetch'];
}

/** Options for the useOrganizationConnectionGroupTable hook. */
export interface UseOrganizationConnectionGroupTableOptions {
  readOnly?: boolean;
  customMessages?: Partial<OrganizationConnectionGroupTableMessages>;
  assignRolesAction?: ComponentAction<ConnectionGroup>;
  viewDetailsAction?: ComponentAction<ConnectionGroup>;
}

/** useOrganizationConnectionGroupTable hook result. */
export interface UseOrganizationConnectionGroupTableReturn {
  permissions: ConnectionGroupPermissions;
  groups: ConnectionGroup[];
  isLoading: boolean;
  isViewLoading: boolean;
  refetchGroups: UseConnectionGroupTableServiceReturn['refetchGroups'];
  handleAssignRoles: (group: ConnectionGroup) => void;
  handleViewDetails: (group: ConnectionGroup) => void;
}

/** Props for the OrganizationConnectionGroupTable view component. */
export interface OrganizationConnectionGroupTableViewProps
  extends SharedComponentProps<
    OrganizationConnectionGroupTableMessages,
    OrganizationConnectionGroupTableClasses
  > {
  groups: ConnectionGroup[];
  isLoading?: boolean;
  hideHeader?: boolean;
  permissions: ConnectionGroupPermissions;
  /** Max role names shown per row before collapsing into a "+N more" overflow. Defaults to 3. */
  maxVisibleRoles?: number;
  onAssignRoles?: (group: ConnectionGroup) => void;
  onViewDetails?: (group: ConnectionGroup) => void;
  className?: string;
}

/** Props for the OrganizationConnectionGroupTable actions column. */
export interface OrganizationConnectionGroupTableActionsColumnProps {
  group: ConnectionGroup;
  permissions: ConnectionGroupPermissions;
  customMessages?: Partial<OrganizationConnectionGroupTableMessages>;
  onAssignRoles?: (group: ConnectionGroup) => void;
  onViewDetails?: (group: ConnectionGroup) => void;
}
