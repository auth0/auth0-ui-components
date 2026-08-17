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
  OrganizationPrivate,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import type {
  ConnectionOption,
  CreateInvitationInput,
  OrganizationInvitationTabClasses,
} from './organization-invitation-table-types';
import type { OrganizationMemberDetailTab } from './organization-member-detail-types';

export type ActiveTab = 'members' | 'invitations';

export interface ViewMemberDetailsParams {
  userId: string;
  tab?: OrganizationMemberDetailTab;
}

/** Pagination state for member management tables - invitation and member tables (checkpoint-based). */
export interface MemberManagementPaginationState {
  pageSize: number;
  currentPage: number;
  totalItems?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Sort configuration for member management tables. */
export interface MemberManagementSortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

/** Filter state for member management tables. */
export interface MemberManagementFilterState {
  searchQuery?: string;
  roleId?: string;
}

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
  userId?: string;
  memberRolesQueryEnabled?: boolean;
  createInvitationAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  revokeInvitationAction?: ComponentAction<MemberInvitation[]>;
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
  invitationParams?: TableQueryParams<MemberManagementSortConfig, MemberManagementFilterState>;
  memberParams?: TableQueryParams<MemberManagementSortConfig, MemberManagementFilterState>;
  viewMemberDetailsAction?: ComponentAction<ViewMemberDetailsParams>;
  assignRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
  removeFromOrganizationAction?: ComponentAction<string>;
  invitationRolesId?: string | null;
  deferRoleSearch?: boolean;
}

export interface MemberManagementServiceResult {
  providersQuery: UseQueryResult<ConnectionOption[]>;
  userStoresQuery: UseQueryResult<ConnectionOption[]>;
  invitationRolesQuery: UseQueryResult<Role[]>;
  rolesSearchQuery: UseQueryResult<Role[]>;
  setRoleSearchTerm: (term: string) => void;
  enableRoleSearch: () => void;
  invitationsQuery: UseQueryResult<{
    invitations: MemberInvitation[];
    next: string | null;
  }>;
  membersQuery: UseQueryResult<{
    members: OrgMember[];
    next: string | undefined | null;
  }>;
  organizationQuery: UseQueryResult<OrganizationPrivate>;
  assignRolesMutation: UseMutationResult<
    { aborted: boolean },
    Error,
    { roleIds: string[]; memberRoles: Role[]; userId?: string | null }
  >;
  removeFromOrganizationMutation: UseMutationResult<
    void,
    Error,
    { userId?: string | null; memberName?: string; organizationName?: string }
  >;
  createInvitationMutation: UseMutationResult<
    MemberInvitation | undefined,
    Error,
    CreateInvitationInput
  >;
  revokeInvitationMutation: UseMutationResult<MemberInvitation[], Error, MemberInvitation[]>;
  resendInvitationMutation: UseMutationResult<
    MemberInvitation | undefined,
    Error,
    MemberInvitation
  >;
  fetchInvitationDetails: (invitationId: string) => Promise<MemberInvitation>;
  memberRolesQuery: UseQueryResult<Role[]>;
}

export interface UseOrganizationMemberManagementOptions {
  customMessages?: Partial<OrganizationMemberManagementMessages>;
  readOnly?: boolean;
  /** Action hooks for invitation creation (onBefore/onAfter) */
  createInvitationAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  /** Action hooks for invitation revocation (onBefore/onAfter) */
  revokeInvitationAction?: ComponentAction<MemberInvitation[]>;
  /** Action hooks for invitation revoke-and-resend (onBefore/onAfter) */
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
  /** Action hooks for viewing member details (onBefore/onAfter) */
  viewMemberDetailsAction?: ComponentAction<ViewMemberDetailsParams>;
  /** Action hooks for assigning a role to a member (onBefore/onAfter) */
  assignRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
  /** Action hooks for removing a member from the organization (onBefore/onAfter) */
  removeFromOrganizationAction?: ComponentAction<string>;
}

/** Discriminated union for member management modal state. */
export type MemberManagementModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'details'; invitation: MemberInvitation }
  | { type: 'revoke'; invitation: MemberInvitation }
  | { type: 'revokeResend'; invitation: MemberInvitation }
  | { type: 'bulkRevoke'; invitations: MemberInvitation[] }
  | { type: 'assignRole'; member: OrgMember }
  | { type: 'removeFromOrganization'; member: OrgMember };

export interface UseOrganizationMemberManagementResult {
  activeTab: ActiveTab;
  searchedRoles: Role[];
  onRoleSearch: (term: string) => void;
  availableConnections: ConnectionOption[];
  isLoadingConnections: boolean;
  hasNoConnections: boolean;
  members: OrgMember[];

  invitations: MemberInvitation[];
  organizationDisplayName?: string;
  isInitialLoading: boolean;
  isFetchingInvitations: boolean;
  isLoadingInvitations: boolean;
  isFetchingMembers: boolean;
  isSearchingRoles: boolean;
  isMembersStale: boolean;
  isInvitationsStale: boolean;
  membersUpdatedAt: number;
  invitationsUpdatedAt: number;
  refetchMembers: MemberManagementServiceResult['membersQuery']['refetch'];
  refetchInvitations: MemberManagementServiceResult['invitationsQuery']['refetch'];
  invitationRoles: Role[];
  isFetchingInvitationRoles: boolean;
  isCreatingInvitation: boolean;
  isRevokingInvitation: boolean;
  isResendingInvitation: boolean;
  selectedInvitations: MemberInvitation[];
  invitationPagination: MemberManagementPaginationState;
  memberPagination: MemberManagementPaginationState;
  invitationFilters?: MemberManagementFilterState;
  invitationSortConfig?: MemberManagementSortConfig;
  memberFilters?: MemberManagementFilterState;
  memberSortConfig?: MemberManagementSortConfig;
  modalState: MemberManagementModalState;
  isRemovingFromOrganization?: boolean;
  isAssigningRoles?: boolean;
  isLoadingMemberRoles: boolean;
  memberRoles?: Role[];

  setActiveTab: (tab: ActiveTab) => void;
  openModal: (state: MemberManagementModalState) => void;
  closeModal: () => void;
  onSelectedInvitationsChange: (invitations: MemberInvitation[]) => void;
  handleCreateSubmit: (data: CreateInvitationInput) => void;
  handleRevokeConfirm: () => void;
  handleRevokeResendConfirm: () => void;
  handleBulkRevokeClick: (invitations: MemberInvitation[]) => void;
  handleCopyUrl: (invitation: MemberInvitation) => Promise<void>;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleSortChange: (sortConfig: MemberManagementSortConfig) => void;
  handleRoleFilterChange: (roleId: string | undefined) => void;
  handleViewMemberDetails: (params: ViewMemberDetailsParams) => void;
  handleAssignRolesSubmit: (roleIds: string[], memberRoles: Role[], userId?: string | null) => void;
  handleRemoveFromOrganizationConfirm: (
    userId?: string | null,
    memberName?: string,
    organizationName?: string,
  ) => void;
}

/**
 * Props for the OrganizationMemberManagementView component.
 */
export interface OrganizationMemberManagementViewProps
  extends UseOrganizationMemberManagementResult {
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
  'OrganizationMemberManagement-tableActions'?: string;
}

/** Props for OrganizationMemberManagement component. */
export interface OrganizationMemberManagementProps
  extends SharedComponentProps<
    OrganizationMemberManagementMessages,
    OrganizationMemberManagementClasses
  > {
  hideHeader?: boolean;
  /** Action hooks for invitation creation (onBefore/onAfter) */
  createInvitationAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  /** Action hooks for invitation revocation, single or bulk (onBefore/onAfter) */
  revokeInvitationAction?: ComponentAction<MemberInvitation[]>;
  /** Action hooks for invitation revoke-and-resend (onBefore/onAfter) */
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
  /** Action hooks for viewing member details (onBefore/onAfter) */
  viewMemberDetailsAction?: ComponentAction<ViewMemberDetailsParams>;
  /** Action hooks for assigning a role to a member (onBefore/onAfter) */
  assignRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
  /** Action hooks for removing a member from the organization (onBefore/onAfter) */
  removeFromOrganizationAction?: ComponentAction<string>;
}
