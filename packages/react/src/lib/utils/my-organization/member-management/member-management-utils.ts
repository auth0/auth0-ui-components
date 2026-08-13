/**
 * Member management utility functions.
 * @module member-management-utils
 * @internal
 */

import {
  type EnhancedTranslationFunction,
  type MemberInvitation,
  type OrgMember,
  type Role,
} from '@auth0/universal-components-core';

import { showToast } from '@/components/auth0/shared/toast';
import {
  type MemberAccessLevel,
  MAX_ROLES_PER_MEMBER,
  MAX_ROLES_PER_REQUEST,
  MEMBER_COUNT_CAP,
} from '@/lib/constants/my-organization/member-management/member-management-constants';
import type { InvitationStatus } from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Resolves the best display name for a member.
 * @param member - The organization member.
 * @returns The member display name.
 */
export function getMemberDisplayName(member: OrgMember): string {
  const fullName = `${member.given_name ?? ''} ${member.family_name ?? ''}`.trim();

  return fullName || member.name || member.email || member.user_id || '-';
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
 * Formats a member's last login time as a label.
 * @param lastLogin - The member last login timestamp.
 * @param t - Translator function (namespace: `member_management`).
 * @returns A human readable relative time label.
 */
export function getRelativeLastLoginLabel(
  lastLogin: string | undefined,
  t: EnhancedTranslationFunction,
): string {
  const never = t('member.table.never', undefined, 'Never');
  const ago = t('member.table.ago', undefined, 'ago');
  const justNow = t('member.table.just_now', undefined, 'Just now');

  if (!lastLogin) {
    return never;
  }

  const lastLoginDate = new Date(lastLogin);

  if (Number.isNaN(lastLoginDate.getTime())) {
    return never;
  }

  const diffInMs = Date.now() - lastLoginDate.getTime();

  if (diffInMs < 60 * 1000) {
    return justNow;
  }

  const translateUnit = (
    count: number,
    singularKey: string,
    pluralKey: string,
    singularFallback: string,
    pluralFallback: string,
  ): string => {
    const unit =
      count === 1
        ? t(`member.table.${singularKey}`, undefined, singularFallback)
        : t(`member.table.${pluralKey}`, undefined, pluralFallback);
    return `${count} ${unit} ${ago}`;
  };

  const diffInMinutes = Math.floor(diffInMs / (60 * 1000));
  if (diffInMinutes < 60) {
    return translateUnit(diffInMinutes, 'minute', 'minutes', 'minute', 'minutes');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return translateUnit(diffInHours, 'hour', 'hours', 'hour', 'hours');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return translateUnit(diffInDays, 'day', 'days', 'day', 'days');
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return translateUnit(diffInWeeks, 'week', 'weeks', 'week', 'weeks');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return translateUnit(diffInMonths, 'month', 'months', 'month', 'months');
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return translateUnit(diffInYears, 'year', 'years', 'year', 'years');
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

/**
 * Formats a total that has reached {@link MEMBER_COUNT_CAP} as an approximation.
 * @param total - The total reported by the API.
 * @param t - Translator function (namespace: `member_management`).
 * @returns The approximate total (such as `1,000+`), or `undefined` when the total is exact or unavailable.
 */
export function formatMemberCount(
  total: number | undefined,
  t: EnhancedTranslationFunction,
): string | undefined {
  return total !== undefined && total >= MEMBER_COUNT_CAP ? t('count_capped') : undefined;
}

/**
 * Validates if a userId follows Auth0's userId format (provider|id).
 * @param userId - The user ID to validate.
 * @returns `true` if valid, `false` otherwise.
 */
export function isValidUserId(userId: string | undefined | null): boolean {
  return !!userId && /^(?=.{1,1024}$).+\|.+$/.test(userId);
}

/**
 * Validates a role assign/remove request
 * @param t - Translator function
 * @param roleIds - Role ids to assign/remove
 * @param memberRoles - Current roles of the member
 * @param assign - `true` for assignment requests
 * @returns `{ aborted: true }` when validation fails and `null` if the request may proceed.
 */
export const validateRequestRoleForMember = (
  t: EnhancedTranslationFunction,
  roleIds: string[],
  memberRoles?: Role[] | null,
  assign: boolean = false,
): { aborted: true } | null => {
  let errorKey: string | null = null;

  if (roleIds.length > MAX_ROLES_PER_REQUEST) {
    errorKey = assign
      ? 'member.error.too_many_roles_per_assignment'
      : 'member.error.too_many_roles_per_removal';
  } else if (assign) {
    const existingIds = new Set(memberRoles?.map((r) => r.id));
    const newRoleCount = roleIds.filter((id) => !existingIds.has(id)).length;
    if ((memberRoles?.length ?? 0) + newRoleCount > MAX_ROLES_PER_MEMBER) {
      errorKey = 'member.error.member_role_limit_exceeded';
    }
  }

  if (!errorKey) return null;

  showToast({ type: 'error', message: t(errorKey) });
  return { aborted: true };
};

/**
 * @param accessLevel - The member's access level.
 * @returns True if 'limited' or 'full', false otherwise.
 */
export const canMutateMember = (accessLevel?: MemberAccessLevel | string): boolean => {
  return accessLevel === 'limited' || accessLevel === 'full';
};
