/**
 * Organization invitation table types.
 * @module organization-invitation-table-types
 */

import type {
  SharedComponentProps,
  ComponentAction,
  EnhancedTranslationFunction,
} from '@auth0/universal-components-core';

/** Invitation status. */
export type InvitationStatus = 'pending' | 'expired';

/** Role option for invitation. */
export interface RoleOption {
  id: string;
  name: string;
  description?: string;
}

/** Identity provider option for invitation. */
export interface IdentityProviderOption {
  id: string;
  name: string;
  type?: string;
}

/** Organization invitation entity. */
export interface Invitation {
  id: string;
  invitee: {
    email: string;
  };
  inviter: {
    name?: string;
  };
  roles?: string[];
  created_at?: string;
  expires_at?: string;
  /** Computed status based on expires_at */
  status?: InvitationStatus;
  /** URL for the invitation */
  invitation_url?: string;
  /** Identity provider ID if assigned */
  identity_provider_id?: string;
}

/** Input for creating an invitation. */
export interface CreateInvitationInput {
  invitee: {
    email: string;
  };
  inviter?: {
    name?: string;
  };
  roles?: string[];
  identity_provider_id?: string;
  /** Time to live in seconds */
  ttl_sec?: number;
}

/** Pagination state for invitation table. */
export interface InvitationPaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Filter state for invitation table. */
export interface InvitationFilterState {
  searchQuery?: string;
  roleId?: string;
}

/** CSS classes for OrganizationInvitationTab. */
export interface OrganizationInvitationTabClasses {
  'OrganizationInvitationTab-root'?: string;
  'OrganizationInvitationTab-table'?: string;
  'OrganizationInvitationTab-createModal'?: string;
  'OrganizationInvitationTab-detailsModal'?: string;
  'OrganizationInvitationTab-revokeModal'?: string;
  'OrganizationInvitationTab-revokeResendModal'?: string;
  'OrganizationInvitationTab-searchInput'?: string;
  'OrganizationInvitationTab-filterDropdown'?: string;
  'OrganizationInvitationTab-pagination'?: string;
}

/** OrganizationInvitationTab translation messages. */
export interface OrganizationInvitationTabMessages {
  table?: {
    columns?: {
      email?: string;
      status?: string;
      inviter?: string;
      created_at?: string;
      expires_at?: string;
      roles?: string;
    };
    empty_message?: string;
    search_placeholder?: string;
    filter_by_role?: string;
    all_roles?: string;
    showing_results?: string;
    status_pending?: string;
    status_expired?: string;
  };
  actions?: {
    view_details?: string;
    copy_url?: string;
    revoke_and_resend?: string;
    revoke?: string;
  };
  create?: {
    title?: string;
    description?: string;
    email_label?: string;
    email_placeholder?: string;
    email_helper?: string;
    roles_label?: string;
    roles_placeholder?: string;
    provider_label?: string;
    provider_placeholder?: string;
    submit_button?: string;
    cancel_button?: string;
  };
  details?: {
    title?: string;
    email_label?: string;
    status_label?: string;
    roles_label?: string;
    provider_label?: string;
    created_at_label?: string;
    expires_at_label?: string;
    invited_by_label?: string;
    invitation_url_label?: string;
    copy_url_button?: string;
    close_button?: string;
    revoke_button?: string;
    resend_button?: string;
  };
  revoke?: {
    title?: string;
    description?: string;
    confirm_button?: string;
    cancel_button?: string;
  };
  revoke_resend?: {
    title?: string;
    description?: string;
    confirm_button?: string;
    cancel_button?: string;
  };
  success?: {
    url_copied?: string;
    invitation_resent?: string;
  };
}

/** Props for OrganizationInvitationTab component. */
export interface OrganizationInvitationTabProps
  extends SharedComponentProps<
    OrganizationInvitationTabMessages,
    OrganizationInvitationTabClasses
  > {
  createAction?: ComponentAction<CreateInvitationInput, Invitation>;
  revokeAction?: ComponentAction<Invitation>;
}

/** Hook options for useOrganizationInvitationTable. */
export interface UseOrganizationInvitationTableOptions {
  createAction?: OrganizationInvitationTabProps['createAction'];
  revokeAction?: OrganizationInvitationTabProps['revokeAction'];
  resendAction?: ComponentAction<Invitation, Invitation>;
  customMessages?: OrganizationInvitationTabProps['customMessages'];
  /** Available roles for filtering and creating invitations */
  availableRoles?: RoleOption[];
  /** Available identity providers for creating invitations */
  availableProviders?: IdentityProviderOption[];
  /** Default page size */
  pageSize?: number;
}

/** Hook result for useOrganizationInvitationTable. */
export interface UseOrganizationInvitationTableResult {
  invitations: Invitation[];
  isFetching: boolean;
  isCreating: boolean;
  isRevoking: boolean;
  isResending: boolean;
  /** Pagination state */
  pagination: InvitationPaginationState;
  /** Filter state */
  filters: InvitationFilterState;
  /** Available roles for filtering */
  availableRoles: RoleOption[];
  /** Available identity providers */
  availableProviders: IdentityProviderOption[];
  fetchInvitations: (page?: number) => Promise<void>;
  onCreateInvitation: (data: CreateInvitationInput) => Promise<Invitation | null>;
  onRevokeInvitation: (invitation: Invitation) => Promise<void>;
  onResendInvitation: (invitation: Invitation) => Promise<Invitation | null>;
  onRevokeAndResendInvitation: (invitation: Invitation) => Promise<Invitation | null>;
  /** Update filters */
  setFilters: (filters: InvitationFilterState) => void;
  /** Change page */
  setPage: (page: number) => void;
  /** Change page size */
  setPageSize: (size: number) => void;
  /** Copy invitation URL */
  copyInvitationUrl: (invitation: Invitation) => Promise<void>;
}

/** Hook options for useOrganizationInvitationTableLogic. */
export interface UseOrganizationInvitationTableLogicOptions {
  t: EnhancedTranslationFunction;
  onCreateInvitation: UseOrganizationInvitationTableResult['onCreateInvitation'];
  onRevokeInvitation: UseOrganizationInvitationTableResult['onRevokeInvitation'];
  onResendInvitation?: UseOrganizationInvitationTableResult['onResendInvitation'];
  onRevokeAndResendInvitation?: UseOrganizationInvitationTableResult['onRevokeAndResendInvitation'];
  fetchInvitations: UseOrganizationInvitationTableResult['fetchInvitations'];
  copyInvitationUrl?: UseOrganizationInvitationTableResult['copyInvitationUrl'];
}

/** Hook result for useOrganizationInvitationTableLogic. */
export interface UseOrganizationInvitationTableLogicResult {
  showCreateModal: boolean;
  showDetailsModal: boolean;
  showRevokeModal: boolean;
  showRevokeResendModal: boolean;
  selectedInvitation: Invitation | null;
  setShowCreateModal: (show: boolean) => void;
  setShowDetailsModal: (show: boolean) => void;
  setShowRevokeModal: (show: boolean) => void;
  setShowRevokeResendModal: (show: boolean) => void;
  handleCreateClick: () => void;
  handleCreate: (data: CreateInvitationInput) => Promise<void>;
  handleDetailsClick: (invitation: Invitation) => void;
  handleRevokeClick: (invitation: Invitation) => void;
  handleRevoke: (invitation: Invitation) => Promise<void>;
  handleRevokeResendClick: (invitation: Invitation) => void;
  handleRevokeResend: (invitation: Invitation) => Promise<void>;
  handleCopyUrl: (invitation: Invitation) => Promise<void>;
}

/** Props for OrganizationInvitationTableActionsColumn component. */
export interface OrganizationInvitationTableActionsColumnProps {
  invitation: Invitation;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  readOnly?: boolean;
  onViewDetails?: (invitation: Invitation) => void;
  onCopyUrl?: (invitation: Invitation) => void;
  onRevokeAndResend?: (invitation: Invitation) => void;
  onRevoke?: (invitation: Invitation) => void;
}

/** Props for OrganizationInvitationTable component. */
export interface OrganizationInvitationTableProps {
  invitations: Invitation[];
  loading?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  pagination: InvitationPaginationState;
  filters?: InvitationFilterState;
  availableRoles?: RoleOption[];
  readOnly?: boolean;
  onView?: (invitation: Invitation) => void;
  onCopyUrl?: (invitation: Invitation) => void;
  onRevokeAndResend?: (invitation: Invitation) => void;
  onRevoke?: (invitation: Invitation) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (query: string) => void;
  onRoleFilterChange?: (roleId: string | undefined) => void;
  className?: string;
}

/** Props for InvitationSearchFilter component. */
export interface InvitationSearchFilterProps {
  filters?: InvitationFilterState;
  availableRoles?: RoleOption[];
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  className?: string;
  onSearchChange?: (query: string) => void;
  onRoleFilterChange?: (roleId: string | undefined) => void;
}
