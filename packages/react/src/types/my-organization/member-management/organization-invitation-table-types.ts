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
  Role,
} from '@auth0/universal-components-core';
import type React from 'react';

import type {
  MemberManagementFilterState,
  MemberManagementPaginationState,
  MemberManagementSortConfig,
} from './organization-member-management-types';

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
  pagination: MemberManagementPaginationState;
  pageSizeOptions?: number[];
  filters?: MemberManagementFilterState;
  sortConfig?: MemberManagementSortConfig;
  availableRoles?: Role[];
  readOnly?: boolean;
  onView?: (invitation: MemberInvitation) => void;
  onCopyUrl?: (invitation: MemberInvitation) => void;
  onRevokeAndResend?: (invitation: MemberInvitation) => void;
  onRevoke?: (invitation: MemberInvitation) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sortConfig: MemberManagementSortConfig) => void;
  onRoleFilterChange?: (roleId: string | undefined) => void;
  className?: string;
}

/** Props for SearchFilter component. */
export interface SearchFilterProps {
  filters?: MemberManagementFilterState;
  availableRoles?: Role[];
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  className?: string;
  activeTab?: string | undefined;
  onRoleFilterChange?: (roleId: string | undefined) => void;
  onSearchTermChange?: (searchTerm: string) => void;
}

/** Props for OrganizationInvitationCreateModal component. */
export interface OrganizationInvitationCreateModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  availableRoles?: Role[];
  availableProviders?: IdentityProviderOption[];
  inviterName?: string;
  schema?: InvitationCreateSchemas;
  style?: React.CSSProperties;
  onClose: () => void;
  onCreate: (data: CreateInvitationInput) => void;
  className?: string;
  onRoleSearch?: (value: string) => void;
}

/** Props for OrganizationInvitationDetailsModal component. */
export interface OrganizationInvitationDetailsModalProps {
  invitation: MemberInvitation | null;
  isOpen: boolean;
  isRevoking?: boolean;
  isResending?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  availableRoles?: Role[];
  availableProviders?: IdentityProviderOption[];
  readOnly?: boolean;
  style?: React.CSSProperties;
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
  style?: React.CSSProperties;
  onClose: () => void;
  onConfirm: (invitation: MemberInvitation) => void;
  className?: string;
}
