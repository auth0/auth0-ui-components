/**
 * Member management utility functions.
 * @module member-management-utils
 * @internal
 */

import type {
  Invitation,
  InvitationStatus,
} from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Determines the status of an invitation.
 * If the invitation has an explicit status, it is returned directly.
 * Otherwise, the status is computed from `expires_at`.
 * @param invitation - The invitation to check.
 * @returns The invitation status.
 */
export function getInvitationStatus(invitation: Invitation): InvitationStatus {
  if (invitation.status) {
    return invitation.status;
  }

  if (invitation.expires_at) {
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return 'expired';
    }
  }

  return 'pending';
}
