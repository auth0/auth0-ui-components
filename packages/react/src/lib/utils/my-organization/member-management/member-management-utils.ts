/**
 * Member management utility functions.
 * @module member-management-utils
 * @internal
 */

import type { MemberInvitation, OrgMember } from '@auth0/universal-components-core';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { InvitationStatus } from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Resolves the best display name for a member.
 * @param member - The organization member.
 * @returns The member display name.
 */
export function getMemberDisplayName(member: OrgMember): string {
  const fullName = `${member.given_name ?? ''} ${member.family_name ?? ''}`.trim();

  return fullName || member.name || member.email || '-';
}

/**
 * Builds a member's initials for avatar fallback rendering.
 * @param member - The organization member.
 * @returns The member initials.
 */
export function getMemberInitials(member: OrgMember): string {
  if (member.given_name && member.family_name) {
    return `${member.given_name.charAt(0)}${member.family_name.charAt(0)}`.toUpperCase();
  }

  const normalizedNameParts = member.name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (normalizedNameParts.length >= 2) {
    return `${normalizedNameParts[0]?.charAt(0) ?? ''}${normalizedNameParts[1]?.charAt(0) ?? ''}`.toUpperCase();
  }

  const initials = `${normalizedNameParts[0]?.charAt(0) ?? member.email?.charAt(0) ?? ''}`
    .trim()
    .toUpperCase();

  return initials || '-';
}

/**
 * Reads the optional profile picture URL from a member.
 * @param member - The organization member.
 * @returns The picture URL when available.
 */
export function getMemberPicture(member: OrgMember): string | undefined {
  return (member as OrgMember & { picture?: string }).picture;
}

/**
 * Member avatar with profile image fallback.
 * @param props - Component props.
 * @param props.member - The organization member to render.
 * @returns The member avatar element.
 */
export function MemberAvatar({ member }: { member: OrgMember }): React.JSX.Element {
  const [imageFailed, setImageFailed] = React.useState(false);
  const displayName = getMemberDisplayName(member);
  const picture = getMemberPicture(member);

  return React.createElement(
    Avatar,
    { className: 'size-12' },
    !imageFailed && picture
      ? React.createElement(AvatarImage, {
          src: picture,
          alt: displayName,
          onError: () => setImageFailed(true),
        })
      : null,
    imageFailed || !picture
      ? React.createElement(
          AvatarFallback,
          { className: 'bg-muted text-lg font-medium text-primary' },
          getMemberInitials(member),
        )
      : null,
  );
}

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
 * Formats a member's last login time as a relative label.
 * @param lastLogin - The member last login timestamp.
 * @returns A human readable relative time label.
 */
export function getRelativeLastLoginLabel(lastLogin?: string): string {
  if (!lastLogin) {
    return 'Never';
  }

  const lastLoginDate = new Date(lastLogin);

  if (Number.isNaN(lastLoginDate.getTime())) {
    return 'Never';
  }

  const diffInMs = Date.now() - lastLoginDate.getTime();

  if (diffInMs < 60 * 1000) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInMs / (60 * 1000));
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
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
