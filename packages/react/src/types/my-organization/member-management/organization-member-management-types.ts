/**
 * Organization member management types.
 * @module organization-member-management-types
 */

import type { SharedComponentProps } from '@auth0/universal-components-core';

import type {
  OrganizationInvitationTabProps,
  OrganizationInvitationTabClasses,
  OrganizationInvitationTabMessages,
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

/** Props for OrganizationMemberManagement component. */
export interface OrganizationMemberManagementProps
  extends SharedComponentProps<
    OrganizationMemberManagementMessages,
    OrganizationMemberManagementClasses
  > {
  hideHeader?: boolean;
  defaultTab?: 'member' | 'invitation';
  memberProps?: Omit<OrganizationMemberTabProps, 'styling' | 'customMessages'>;
  invitationProps?: Omit<OrganizationInvitationTabProps, 'styling' | 'customMessages'>;
}

/** View props for OrganizationMemberManagement. */
export interface OrganizationMemberManagementViewProps {
  logic: OrganizationMemberManagementProps;
}
