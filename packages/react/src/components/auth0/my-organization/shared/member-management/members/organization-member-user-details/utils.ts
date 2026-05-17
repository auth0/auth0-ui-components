import type { OrgMember } from '@auth0/universal-components-core';

/**
 * Formats an ISO date string into a human-readable locale string.
 * @param dateStr - ISO date string to format
 * @returns Formatted date string, or an em dash if the input is absent
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Builds the list of display fields for an org member's detail view.
 * @param member - The organization member whose details to display
 * @param t - Translation function used to look up field labels
 * @returns Array of label/value/copyable field descriptors
 */
export function buildMemberDetailFields(member: OrgMember, t: (key: string) => string) {
  const phoneNumber = member.phone_number ?? '';
  const provider = member.provider ?? '';

  return [
    { label: t('member.detail.user_details.name'), value: member.name ?? '—', copyable: false },
    { label: t('member.detail.user_details.email'), value: member.email ?? '—', copyable: true },
    {
      label: t('member.detail.user_details.phone_number'),
      value: phoneNumber || '—',
      copyable: !!phoneNumber,
    },
    { label: t('member.detail.user_details.provider'), value: provider || '—', copyable: false },
    {
      label: t('member.detail.user_details.created_at'),
      value: formatDate(member.created_at),
      copyable: false,
    },
    {
      label: t('member.detail.user_details.last_login'),
      value: formatDate(member.last_login),
      copyable: false,
    },
  ];
}
