/**
 * Organization member management types.
 * @module organization-member-management-types
 */

import type { ComponentAction, SharedComponentProps } from '@auth0/universal-components-core';

import type {
  Invitation,
  IdentityProviderOption,
  OrganizationInvitationTabProps,
  OrganizationInvitationTabClasses,
  OrganizationInvitationTabMessages,
  RoleOption,
} from './organization-invitation-table-types';
import type {
  OrganizationMemberTabProps,
  OrganizationMemberTabClasses,
  OrganizationMemberTabMessages,
} from './organization-member-table-types';

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

/** Extended invitation props for member management. */
export interface OrganizationMemberManagementInvitationProps
  extends Omit<OrganizationInvitationTabProps, 'styling' | 'customMessages'> {
  /** Action for resending an invitation */
  resendAction?: ComponentAction<Invitation, Invitation>;
  /** Available roles for filtering and creating invitations */
  availableRoles?: RoleOption[];
  /** Available identity providers for creating invitations */
  availableProviders?: IdentityProviderOption[];
}

/** Props for OrganizationMemberManagement component. */
export interface OrganizationMemberManagementProps
  extends SharedComponentProps<
    OrganizationMemberManagementMessages,
    OrganizationMemberManagementClasses
  > {
  hideHeader?: boolean;
  defaultTab?: 'member' | 'invitation';
  memberProps?: Omit<OrganizationMemberTabProps, 'styling' | 'customMessages'>;
  invitationProps?: OrganizationMemberManagementInvitationProps;
}
