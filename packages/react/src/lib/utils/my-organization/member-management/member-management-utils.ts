/**
 * Member management utility functions.
 * @module member-management-utils
 * @internal
 */

import type { MemberInvitation } from '@auth0/universal-components-core';

import type { InvitationStatus } from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Determines the status of an invitation based on `expires_at`.
 * @param invitation - The invitation to check.
 * @returns The invitation status.
 */
export function getInvitationStatus(invitation: MemberInvitation): InvitationStatus {
  if (invitation.expires_at) {
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return 'expired';
    }
  }

  return 'pending';
}
