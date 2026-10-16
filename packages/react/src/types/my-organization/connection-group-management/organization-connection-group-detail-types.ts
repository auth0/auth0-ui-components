/**
 * Connection group detail types.
 * @module organization-connection-group-detail-types
 */

import type {
  ComponentAction,
  OrganizationConnectionGroupDetailMessages,
  Role,
  SharedComponentProps,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type React from 'react';

import type { ConnectionGroup } from './organization-connection-group-table-types';

/**
 * A role assigned to a connection group, including its permissions.
 *
 * TODO(API): PRD Req 7.2 returns only `{ id, name, description }`. `permissions`
 * is assumed (the design shows a Permission column) and must be confirmed with
 * the backend. `removable` is likewise assumed (see the field below).
 */
export type ConnectionGroupDetailRole = Role & {
  permissions: string[];
  /**
   * Whether the role can be removed from the group. `false` for roles managed by
   * the tenant admin; they cannot be removed here.
   *
   * TODO(API): assumed field; the backend may express it as `allowed_binding_actions`.
   * Confirm the contract with the backend.
   */
  removable: boolean;
};

/**
 * Capabilities for the connection group detail, derived from granted scopes.
 */
export interface ConnectionGroupDetailPermissions {
  /** `read:my_org:group_roles` - whether group roles can be loaded. */
  canViewRoles: boolean;
  /** `create:my_org:group_roles` - whether roles can be assigned. */
  canAssignRoles: boolean;
  /** `delete:my_org:group_roles` - whether roles can be removed. */
  canRemoveRoles: boolean;
}

/** Variables for the assign / remove roles mutations. */
export interface ConnectionGroupRolesMutationVariables {
  /** Ids of the roles to assign or remove. */
  roleIds: string[];
}

/** Options for the connection group detail service hook. */
export interface UseConnectionGroupDetailServiceOptions {
  /** Whether the user may read group roles; gates the group roles query. */
  canViewRoles: boolean;
  /** Whether the user may assign roles; gates the available roles query. */
  canAssignRoles: boolean;
}

/** Result of the connection group detail service hook. */
export interface ConnectionGroupDetailServiceResult {
  rolesQuery: UseQueryResult<ConnectionGroupDetailRole[]>;
  availableRolesQuery: UseQueryResult<Role[]>;
  setRoleSearchTerm: (term: string) => void;
  enableRoleSearch: () => void;
  assignRolesMutation: UseMutationResult<void, Error, ConnectionGroupRolesMutationVariables>;
  removeRolesMutation: UseMutationResult<void, Error, ConnectionGroupRolesMutationVariables>;
}

/** Discriminated union for connection group detail modal state; `null` means closed. */
export type ConnectionGroupDetailModalState =
  | { type: 'assignRoles' }
  | { type: 'removeRoles'; roles: ConnectionGroupDetailRole[] }
  | null;

/** CSS classes for OrganizationConnectionGroupDetail. */
export interface OrganizationConnectionGroupDetailClasses {
  'OrganizationConnectionGroupDetail-root'?: string;
  'OrganizationConnectionGroupDetail-header'?: string;
  'OrganizationConnectionGroupDetail-rolesTab'?: string;
  'ConnectionGroupAssignRolesModal-dialogContent'?: string;
  'ConnectionGroupRemoveRolesModal-dialogContent'?: string;
}

/** Props for the OrganizationConnectionGroupDetail component. */
export interface OrganizationConnectionGroupDetailProps
  extends SharedComponentProps<
    OrganizationConnectionGroupDetailMessages,
    OrganizationConnectionGroupDetailClasses
  > {
  /** The group to display, as emitted by the list's `onViewDetails`. */
  group: ConnectionGroup;
  /** Back button handler; the consumer owns routing. */
  onBack: () => void;
  /** `onBefore` / `onAfter` hooks around assigning roles. */
  assignRolesAction?: ComponentAction<{ groupId: string; roleIds: string[] }>;
  /** `onBefore` / `onAfter` hooks around removing roles. */
  removeRolesAction?: ComponentAction<{ groupId: string; roleIds: string[] }>;
}

/** Options for the useOrganizationConnectionGroupDetail hook. */
export interface UseOrganizationConnectionGroupDetailOptions {
  /** Id of the group whose roles are managed. */
  groupId: string;
  onBack: () => void;
  readOnly?: boolean;
  customMessages?: Partial<OrganizationConnectionGroupDetailMessages>;
  assignRolesAction?: OrganizationConnectionGroupDetailProps['assignRolesAction'];
  removeRolesAction?: OrganizationConnectionGroupDetailProps['removeRolesAction'];
}

/** useOrganizationConnectionGroupDetail hook result. */
export interface UseOrganizationConnectionGroupDetailResult {
  permissions: ConnectionGroupDetailPermissions;
  roles: ConnectionGroupDetailRole[];
  availableRoles: ConnectionGroupDetailRole[];
  selectedRoles: ConnectionGroupDetailRole[];
  modalState: ConnectionGroupDetailModalState;
  readOnly?: boolean;
  isFetchingRoles: boolean;
  /** Whether the available roles search is in flight. */
  isSearchingRoles: boolean;
  isAssigningRoles: boolean;
  isRemovingRoles: boolean;
  setSelectedRoles: (roles: ConnectionGroupDetailRole[]) => void;
  /** Sets the search term used to filter available roles by name. */
  onRoleSearch: (value: string) => void;
  handleBack: () => void;
  openModal: (state: Exclude<ConnectionGroupDetailModalState, null>) => void;
  closeModal: () => void;
  handleAssignRolesSubmit: (roleIds: string[]) => void;
  handleRemoveRolesConfirm: () => void;
}

/** Props for the OrganizationConnectionGroupDetailView component. */
export interface OrganizationConnectionGroupDetailViewProps
  extends UseOrganizationConnectionGroupDetailResult {
  /** The group to display in the header. */
  group: ConnectionGroup;
  styling: OrganizationConnectionGroupDetailProps['styling'];
  customMessages: OrganizationConnectionGroupDetailProps['customMessages'];
}

/** Props for the connection group roles tab. */
export interface ConnectionGroupRolesTabProps {
  roles: ConnectionGroupDetailRole[];
  selectedRoles: ConnectionGroupDetailRole[];
  permissions: ConnectionGroupDetailPermissions;
  readOnly?: boolean;
  isLoading?: boolean;
  customMessages?: Partial<OrganizationConnectionGroupDetailMessages>;
  classes?: Pick<
    OrganizationConnectionGroupDetailClasses,
    'OrganizationConnectionGroupDetail-rolesTab'
  >;
  onSelectedRowsChange: (roles: ConnectionGroupDetailRole[]) => void;
  onAssignClick: () => void;
  onRemoveClick: (roles: ConnectionGroupDetailRole[]) => void;
}

/** Props for the assign roles modal. */
export interface ConnectionGroupAssignRolesModalProps {
  isOpen: boolean;
  /** Whether the assign request is in flight. */
  isLoading?: boolean;
  /** Whether the available roles search is in flight. */
  isSearchingRoles?: boolean;
  availableRoles: ConnectionGroupDetailRole[];
  assignedRoles: ConnectionGroupDetailRole[];
  customMessages?: Partial<OrganizationConnectionGroupDetailMessages>;
  classes?: Pick<
    OrganizationConnectionGroupDetailClasses,
    'ConnectionGroupAssignRolesModal-dialogContent'
  >;
  style?: React.CSSProperties;
  onClose: () => void;
  onAssign: (roleIds: string[]) => void;
  /** Server-side role search; when omitted, options are filtered locally. */
  onRoleSearch?: (query: string) => void;
}

/** Props for the remove roles confirmation modal. */
export interface ConnectionGroupRemoveRolesModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  roles: ConnectionGroupDetailRole[];
  groupName?: string;
  customMessages?: Partial<OrganizationConnectionGroupDetailMessages>;
  classes?: Pick<
    OrganizationConnectionGroupDetailClasses,
    'ConnectionGroupRemoveRolesModal-dialogContent'
  >;
  style?: React.CSSProperties;
  onClose: () => void;
  onConfirm: () => void;
}
