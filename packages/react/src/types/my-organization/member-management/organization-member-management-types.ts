/**
 * Organization member management types.
 * @module organization-member-management-types
 */

import type {
  ComponentAction,
  SharedComponentProps,
  MemberInvitation,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import type {
  CreateInvitationInput,
  IdentityProviderOption,
  InvitationFilterState,
  InvitationPaginationState,
  InvitationSortConfig,
  OrganizationInvitationTabClasses,
  OrganizationInvitationTabMessages,
  RoleOption,
} from './organization-invitation-table-types';

export type ActiveTab = 'members' | 'invitations';

export interface TableQueryParams<TSort, TFilter> {
  pageSize: number;
  fromToken: string | undefined;
  sortConfig: TSort;
  filters: TFilter;
}

export interface UseMemberManagementServiceOptions {
  customMessages?: OrganizationMemberManagementMessages;
  activeTab: ActiveTab;
  createInvitationAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  revokeInvitationAction?: ComponentAction<MemberInvitation>;
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
  invitationParams: TableQueryParams<InvitationSortConfig, InvitationFilterState>;
}

export interface MemberManagementServiceResult {
  providersQuery: UseQueryResult<IdentityProviderOption[]>;
  invitationsQuery: UseQueryResult<{
    invitations: MemberInvitation[];
    next: string | null;
    total: number | undefined;
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
}

export interface UseOrganizationMemberManagementOptions {
  customMessages?: OrganizationMemberManagementMessages;
  readOnly?: boolean;
  /** Action hooks for invitation creation (onBefore/onAfter) */
  createInvitationAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  /** Action hooks for invitation revocation (onBefore/onAfter) */
  revokeInvitationAction?: ComponentAction<MemberInvitation>;
  /** Action hooks for invitation revoke-and-resend (onBefore/onAfter) */
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
}

/** Discriminated union for member management modal state. */
export type MemberManagementModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'details'; invitation: MemberInvitation }
  | { type: 'revoke'; invitation: MemberInvitation }
  | { type: 'revokeResend'; invitation: MemberInvitation };

export interface UseOrganizationMemberManagementResult {
  activeTab: ActiveTab;
  isLoading: boolean;
  availableRoles: RoleOption[];
  availableProviders: IdentityProviderOption[];

  invitations: MemberInvitation[];
  isFetchingInvitations: boolean;
  isCreatingInvitation: boolean;
  isRevokingInvitation: boolean;
  isResendingInvitation: boolean;
  invitationPagination: InvitationPaginationState;
  invitationFilters: InvitationFilterState;
  invitationSortConfig: InvitationSortConfig;
  modalState: MemberManagementModalState;

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
  handleSortChange: (sortConfig: InvitationSortConfig) => void;
  handleRoleFilterChange: (roleId: string | undefined) => void;
}

/** CSS classes for OrganizationMemberManagement. */
export interface OrganizationMemberManagementClasses extends OrganizationInvitationTabClasses {
  'OrganizationMemberManagement-root'?: string;
  'OrganizationMemberManagement-header'?: string;
  'OrganizationMemberManagement-tabs'?: string;
}

/** OrganizationMemberManagement translation messages. */
export interface OrganizationMemberManagementMessages {
  header?: {
    title?: string;
    description?: string;
  };
  tabs?: {
    members?: string;
    invitations?: string;
  };
  invitation?: OrganizationInvitationTabMessages;
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
  /** Action hooks for invitation revocation (onBefore/onAfter) */
  revokeInvitationAction?: ComponentAction<MemberInvitation>;
  /** Action hooks for invitation revoke-and-resend (onBefore/onAfter) */
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
}
