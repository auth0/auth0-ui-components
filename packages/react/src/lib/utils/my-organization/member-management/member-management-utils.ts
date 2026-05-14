/**
 * Member management utility functions.
 * @module member-management-utils
 * @internal
 */

import type { MemberInvitation } from '@auth0/universal-components-core';

import type { InvitationStatus } from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Determines the status of an invitation based on `expires_at`.
 * @param invitation - The invitation to check
 * @returns The invitation status
 */
export function getInvitationStatus(invitation: MemberInvitation): InvitationStatus {
  const isExpired = invitation.expires_at && new Date(invitation.expires_at) < new Date();

  return isExpired ? 'expired' : 'pending';
}

/**
 * Returns up to 2 uppercase initials from a display name, or 'U' if the name is empty.
 * @param name - The display name to extract initials from
 * @returns Up to 2 uppercase initials, or 'U' if the name is empty
 */
export function getInitials(name?: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return 'U';
  const parts = trimmed.split(/\s+/);
  const first = parts[0] ?? '';
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  const last = parts[parts.length - 1] ?? '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}
