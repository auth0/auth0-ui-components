/**
 * Organization invitation table types.
 * @module organization-invitation-table-types
 */

import type {
  SharedComponentProps,
  ComponentAction,
  MemberInvitation,
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

/** Pagination state for invitation table (checkpoint-based). */
export interface InvitationPaginationState {
  pageSize: number;
  currentPage: number;
  totalItems?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Sort configuration for invitation table. */
export interface InvitationSortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
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
    reset_filter?: string;
    showing_results?: string;
    status_pending?: string;
    status_expired?: string;
  };
  actions?: {
    menu_label?: string;
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
    email_limit_error?: string;
    email_invalid_error?: string;
    email_duplicate_error?: string;
    email_required_error?: string;
    roles_label?: string;
    roles_placeholder?: string;
    provider_label?: string;
    provider_placeholder?: string;
    submit_button?: string;
    creating?: string;
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
  error?: {
    fetch_failed?: string;
    create_failed?: string;
    revoke_failed?: string;
    resend_failed?: string;
    revoke_resend_failed?: string;
    copy_url_failed?: string;
  };
}

/** Props for OrganizationInvitationTab component. */
export interface OrganizationInvitationTabProps extends SharedComponentProps<
  OrganizationInvitationTabMessages,
  OrganizationInvitationTabClasses
> {
  createAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  revokeAction?: ComponentAction<MemberInvitation>;
}

/** Props for OrganizationInvitationTableActionsColumn component. */
export interface OrganizationInvitationTableActionsColumnProps {
  invitation: MemberInvitation;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  readOnly?: boolean;
  onViewDetails?: (invitation: MemberInvitation) => void;
  onCopyUrl?: (invitation: MemberInvitation) => void;
  onRevokeAndResend?: (invitation: MemberInvitation) => void;
  onRevoke?: (invitation: MemberInvitation) => void;
}

/** Props for OrganizationInvitationTable component. */
export interface OrganizationInvitationTableProps {
  invitations: MemberInvitation[];
  loading?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  pagination: InvitationPaginationState;
  filters?: InvitationFilterState;
  sortConfig?: InvitationSortConfig;
  availableRoles?: RoleOption[];
  readOnly?: boolean;
  onView?: (invitation: MemberInvitation) => void;
  onCopyUrl?: (invitation: MemberInvitation) => void;
  onRevokeAndResend?: (invitation: MemberInvitation) => void;
  onRevoke?: (invitation: MemberInvitation) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sortConfig: InvitationSortConfig) => void;
  onRoleFilterChange?: (roleId: string | undefined) => void;
  className?: string;
}

/** Props for InvitationSearchFilter component. */
export interface InvitationSearchFilterProps {
  filters?: InvitationFilterState;
  availableRoles?: RoleOption[];
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  className?: string;
  onRoleFilterChange?: (roleId: string | undefined) => void;
}
