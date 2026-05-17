/**
 * Organization member management types.
 * @module organization-member-management-types
 */

import type {
  ComponentAction,
  SharedComponentProps,
  MemberInvitation,
  OrganizationMemberManagementMessages,
  Role,
  OrgMember,
  OrganizationMemberTabMessages,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import type {
  CreateInvitationInput,
  IdentityProviderOption,
  MemberManagementFilterState,
  MemberManagementPaginationState,
  MemberManagementSortConfig,
  OrganizationInvitationTabClasses,
} from './organization-invitation-table-types';

export type ActiveTab = 'members' | 'invitations';

export interface TableQueryParams<TSort, TFilter> {
  pageSize: number;
  fromToken: string | undefined;
  sortConfig: TSort;
  filters: TFilter;
}

export interface AssignRoleMutationInput {
  userId: string;
  roleIds: string[];
}

export interface UseMemberManagementServiceOptions {
  customMessages?: Partial<OrganizationMemberManagementMessages>;
  activeTab?: ActiveTab;
  createInvitationAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  revokeInvitationAction?: ComponentAction<MemberInvitation>;
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
  invitationParams?: TableQueryParams<MemberManagementSortConfig, MemberManagementFilterState>;
  memberParams?: TableQueryParams<MemberManagementSortConfig, MemberManagementFilterState>;
  removeFromOrgAction?: ComponentAction<{ userId: string }>;
  assignRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
}

export interface MemberManagementServiceResult {
  providersQuery: UseQueryResult<IdentityProviderOption[]>;
  rolesQuery: UseQueryResult<Role[]>;
  invitationsQuery: UseQueryResult<{
    invitations: MemberInvitation[];
    next: string | null;
  }>;
  createInvitationMutation: UseMutationResult<
    MemberInvitation | undefined,
    Error,
    CreateInvitationInput
  >;
  revokeInvitationMutation: UseMutationResult<MemberInvitation, Error, MemberInvitation>;
  resendInvitationMutation: UseMutationResult<
    MemberInvitation | undefined,
    Error,
    MemberInvitation
  >;
  fetchInvitationDetails: (invitationId: string) => Promise<MemberInvitation>;
  membersQuery: UseQueryResult<{
    members: OrgMember[];
    next: string | null;
  }>;
  assignRoleMutation: UseMutationResult<void, Error, AssignRoleMutationInput>;
  removeFromOrgMutation: UseMutationResult<void, Error, string, unknown>;
}

export interface UseOrganizationMemberManagementOptions {
  customMessages?: Partial<OrganizationMemberManagementMessages>;
  readOnly?: boolean;
  /** Action hooks for invitation creation (onBefore/onAfter) */
  createInvitationAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  /** Action hooks for invitation revocation (onBefore/onAfter) */
  revokeInvitationAction?: ComponentAction<MemberInvitation>;
  /** Action hooks for invitation revoke-and-resend (onBefore/onAfter) */
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
  /** Action hooks for removing a member from the organization (onBefore/onAfter) */
  removeFromOrgAction?: ComponentAction<{ userId: string }>;
  /** Action hooks for assigning a role to a member (onBefore/onAfter) */
  assignRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
}

/** Discriminated union for member management modal state. */
export type MemberManagementModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'details'; invitation: MemberInvitation }
  | { type: 'revoke'; invitation: MemberInvitation }
  | { type: 'revokeResend'; invitation: MemberInvitation }
  | { type: 'assignRole'; member: OrgMember }
  | { type: 'removeFromOrg'; member: OrgMember };

export interface UseOrganizationMemberManagementResult {
  activeTab: ActiveTab;
  availableRoles: Role[];
  availableProviders: IdentityProviderOption[];
  members: OrgMember[];

  invitations: MemberInvitation[];
  isFetchingInvitations: boolean;
  isFetchingMembers: boolean;
  isFetchingRoles: boolean;
  isCreatingInvitation: boolean;
  isRevokingInvitation: boolean;
  isResendingInvitation: boolean;
  invitationPagination: MemberManagementPaginationState;
  memberPagination: MemberManagementPaginationState;
  invitationFilters: MemberManagementFilterState;
  invitationSortConfig: MemberManagementSortConfig;
  memberFilters: MemberManagementFilterState;
  memberSortConfig: MemberManagementSortConfig;
  modalState: MemberManagementModalState;
  isRemovingFromOrg: boolean;
  isAssigningRole: boolean;

  setActiveTab: (tab: ActiveTab) => void;
  openModal: (state: MemberManagementModalState) => void;
  closeModal: () => void;
  handleCreateSubmit: (data: CreateInvitationInput) => void;
  handleRevokeConfirm: () => void;
  handleRevokeResendConfirm: () => void;
  handleCopyUrl: (invitation: MemberInvitation) => Promise<void>;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleSortChange: (sortConfig: MemberManagementSortConfig) => void;
  handleRoleFilterChange: (roleId: string | undefined) => void;
  handleAssignRole: (userId: string, roleIds: string[]) => void;
  handleRemoveFromOrg: (userId: string) => void;
}

/**
 * Props for the OrganizationMemberManagementView component.
 */
export interface OrganizationMemberManagementViewProps extends UseOrganizationMemberManagementResult {
  styling: OrganizationMemberManagementProps['styling'];
  customMessages: OrganizationMemberManagementProps['customMessages'];
  hideHeader: boolean;
  readOnly: boolean;
}

/** CSS classes for OrganizationMemberManagement. */
export interface OrganizationMemberManagementClasses extends OrganizationInvitationTabClasses {
  'OrganizationMemberManagement-root'?: string;
  'OrganizationMemberManagement-header'?: string;
  'OrganizationMemberManagement-tabs'?: string;
}

/** Props for OrganizationMemberManagement component. */
export interface OrganizationMemberManagementProps extends SharedComponentProps<
  OrganizationMemberManagementMessages,
  OrganizationMemberManagementClasses
> {
  hideHeader?: boolean;
  /** Action hooks for invitation creation (onBefore/onAfter) */
  createInvitationAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  /** Action hooks for invitation revocation (onBefore/onAfter) */
  revokeInvitationAction?: ComponentAction<MemberInvitation>;
  /** Action hooks for invitation revoke-and-resend (onBefore/onAfter) */
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
  /** Action hooks for removing a member from the organization (onBefore/onAfter) */
  removeFromOrgAction?: ComponentAction<{ userId: string }>;
  /** Action hooks for assigning a role to a member (onBefore/onAfter) */
  assignRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
}

/** Props for OrganizationMemberAssignRoleModal component. */
export interface OrganizationMemberAssignRoleModalProps {
  member: OrgMember | null;
  isOpen: boolean;
  isLoading?: boolean;
  availableRoles: Role[];
  assignedRoles: Role[];
  className?: string;
  customMessages?: Partial<OrganizationMemberTabMessages>;
  onClose: () => void;
  onAssign: (userId: string, roleIds: string[]) => void;
}

/** Props for OrganizationMemberRemoveFromOrgModal component. */
export interface OrganizationMemberRemoveFromOrgModalProps {
  member: OrgMember | null;
  isOpen: boolean;
  isLoading?: boolean;
  className?: string;
  customMessages?: Partial<OrganizationMemberTabMessages>;
  onClose: () => void;
  onConfirm: (userId: string) => void;
}
