/**
 * Organization invitation table types.
 * @module organization-invitation-table-types
 */

import type {
  SharedComponentProps,
  ComponentAction,
  MemberInvitation,
  InvitationCreateSchemas,
  OrganizationInvitationTabMessages,
  OrgMemberRole,
} from '@auth0/universal-components-core';

/** Invitation status. */
export type InvitationStatus = 'pending' | 'expired';

/** Identity provider option for invitation. */
export interface IdentityProviderOption {
  id: string;
  name: string;
  type?: string;
}

/** Input for creating invitation(s). Supports bulk invite via invitees array. */
export interface CreateInvitationInput {
  invitees: Array<{
    email: string;
    roles?: string[];
  }>;
  inviter?: {
    name?: string;
  };
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

/** Props for OrganizationInvitationTab component. */
export interface OrganizationInvitationTabProps
  extends SharedComponentProps<
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
  availableRoles?: OrgMemberRole[];
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

/** Props for SearchFilter component. */
export interface SearchFilterProps {
  filters?: InvitationFilterState;
  availableRoles?: OrgMemberRole[];
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  className?: string;
  onRoleFilterChange?: (roleId: string | undefined) => void;
}

/** Props for OrganizationInvitationCreateModal component. */
export interface OrganizationInvitationCreateModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  availableRoles?: OrgMemberRole[];
  availableProviders?: IdentityProviderOption[];
  inviterName?: string;
  schema?: InvitationCreateSchemas;
  onClose: () => void;
  onCreate: (data: CreateInvitationInput) => void;
  className?: string;
}

/** Props for OrganizationInvitationDetailsModal component. */
export interface OrganizationInvitationDetailsModalProps {
  invitation: MemberInvitation | null;
  isOpen: boolean;
  isRevoking?: boolean;
  isResending?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  availableRoles?: OrgMemberRole[];
  availableProviders?: IdentityProviderOption[];
  readOnly?: boolean;
  onClose: () => void;
  onCopyUrl?: (invitation: MemberInvitation) => void;
  onRevoke?: (invitation?: MemberInvitation) => void;
  onResend?: (invitation?: MemberInvitation) => void;
  className?: string;
}

/** Props for OrganizationInvitationRevokeModal component. */
export interface OrganizationInvitationRevokeModalProps {
  invitation: MemberInvitation | null;
  isOpen: boolean;
  isLoading?: boolean;
  isRevokeAndResend?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  onClose: () => void;
  onConfirm: (invitation: MemberInvitation) => void;
  className?: string;
}
