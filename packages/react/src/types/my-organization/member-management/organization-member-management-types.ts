/**
 * Organization member management types.
 * @module organization-member-management-types
 */

import type {
  ComponentAction,
  SharedComponentProps,
  MemberInvitation,
} from '@auth0/universal-components-core';

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

export interface MemberManagementState {
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
  showCreateModal: boolean;
  showDetailsModal: boolean;
  showRevokeModal: boolean;
  showRevokeResendModal: boolean;
  selectedInvitation: MemberInvitation | null;
}

export interface MemberManagementHandlers {
  setActiveTab: (tab: ActiveTab) => void;

  handleCreateClick: () => void;
  handleCreateSubmit: (data: CreateInvitationInput) => void;
  handleCreateCancel: () => void;
  handleDetailsClick: (invitation: MemberInvitation) => void;
  handleDetailsClose: () => void;
  handleRevokeClick: (invitation: MemberInvitation) => void;
  handleRevokeConfirm: () => void;
  handleRevokeCancel: () => void;
  handleRevokeResendClick: (invitation: MemberInvitation) => void;
  handleRevokeResendConfirm: () => void;
  handleRevokeResendCancel: () => void;
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
