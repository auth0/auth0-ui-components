/**
 * Organization member management types.
 * @module organization-member-management-types
 */

import type { ComponentAction, SharedComponentProps } from '@auth0/universal-components-core';

import type {
  CreateInvitationInput,
  Invitation,
  IdentityProviderOption,
  InvitationFilterState,
  InvitationPaginationState,
  InvitationSortConfig,
  OrganizationInvitationTabClasses,
  OrganizationInvitationTabMessages,
  RoleOption,
} from './organization-invitation-table-types';
import type {
  Member,
  OrganizationMemberTabClasses,
  OrganizationMemberTabMessages,
} from './organization-member-table-types';

export type ActiveTab = 'members' | 'invitations';

export interface UseOrganizationMemberManagementOptions {
  customMessages?: OrganizationMemberManagementMessages;
  defaultTab?: ActiveTab;
  readOnly?: boolean;
  /** Action hooks for invitation creation (onBefore/onAfter) */
  createInvitationAction?: ComponentAction<CreateInvitationInput, Invitation>;
  /** Action hooks for invitation revocation (onBefore/onAfter) */
  revokeInvitationAction?: ComponentAction<Invitation>;
  /** Action hooks for invitation revoke-and-resend (onBefore/onAfter) */
  resendInvitationAction?: ComponentAction<Invitation, Invitation>;
  /** Action hooks for member removal (onBefore/onAfter) */
  removeMemberAction?: ComponentAction<Member>;
}

export interface MemberManagementState {
  activeTab: ActiveTab;
  isLoading: boolean;
  availableRoles: RoleOption[];
  availableProviders: IdentityProviderOption[];

  invitations: Invitation[];
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
  selectedInvitation: Invitation | null;

  members: Member[];
  isFetchingMembers: boolean;
  isRemovingMember: boolean;
  showRemoveModal: boolean;
  selectedMember: Member | null;
}

export interface MemberManagementHandlers {
  setActiveTab: (tab: ActiveTab) => void;

  handleCreateClick: () => void;
  handleCreateSubmit: (data: CreateInvitationInput) => Promise<void>;
  handleCreateCancel: () => void;
  handleDetailsClick: (invitation: Invitation) => void;
  handleDetailsClose: () => void;
  handleRevokeClick: (invitation: Invitation) => void;
  handleRevokeConfirm: () => Promise<void>;
  handleRevokeCancel: () => void;
  handleRevokeResendClick: (invitation: Invitation) => void;
  handleRevokeResendConfirm: () => Promise<void>;
  handleRevokeResendCancel: () => void;
  handleCopyUrl: (invitation: Invitation) => Promise<void>;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleSortChange: (sortConfig: InvitationSortConfig) => void;
  handleRoleFilterChange: (roleId: string | undefined) => void;

  handleRemoveClick: (member: Member) => void;
  handleRemoveConfirm: () => Promise<void>;
  handleRemoveCancel: () => void;
}

/** CSS classes for OrganizationMemberManagement. */
export interface OrganizationMemberManagementClasses
  extends OrganizationMemberTabClasses,
    OrganizationInvitationTabClasses {
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
  member?: OrganizationMemberTabMessages;
  invitation?: OrganizationInvitationTabMessages;
}

/** Props for OrganizationMemberManagement component. */
export interface OrganizationMemberManagementProps
  extends SharedComponentProps<
    OrganizationMemberManagementMessages,
    OrganizationMemberManagementClasses
  > {
  hideHeader?: boolean;
  defaultTab?: 'member' | 'invitation';
  /** Action hooks for invitation creation (onBefore/onAfter) */
  createInvitationAction?: ComponentAction<CreateInvitationInput, Invitation>;
  /** Action hooks for invitation revocation (onBefore/onAfter) */
  revokeInvitationAction?: ComponentAction<Invitation>;
  /** Action hooks for invitation revoke-and-resend (onBefore/onAfter) */
  resendInvitationAction?: ComponentAction<Invitation, Invitation>;
  /** Action hooks for member removal (onBefore/onAfter) */
  removeMemberAction?: ComponentAction<Member>;
}
