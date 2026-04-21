/**
 * Custom message type definitions for member management.
 * @module member-management-types
 * @internal
 */

import type { OrganizationInvitationTabMessages } from './invitation-tab-types';

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
