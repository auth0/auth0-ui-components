/**
 * Member detail user details card component.
 * @module member-detail-user-details
 * @internal
 */

import type { OrgMember } from '@auth0/universal-components-core';
import * as React from 'react';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Card } from '@/components/ui/card';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationMemberDetailMessages } from '@/types/my-organization/member-management/organization-member-detail-types';

export interface MemberDetailUserDetailsProps {
  member: OrgMember;
  customMessages?: OrganizationMemberDetailMessages;
}

/**
 * Formats an ISO date string into a human-readable locale string.
 * @param dateStr - The ISO date string to format
 * @returns A formatted date/time string, or '—' if the input is empty
 */
function formatDate(dateStr?: string): string {
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
 * Renders the user details card for a member showing name, email, phone, and login timestamps.
 * @param root0 - Component props
 * @returns The rendered user details card element
 */
export function MemberDetailUserDetails({
  member,
  customMessages,
}: MemberDetailUserDetailsProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);

  const memberRecord = member as Record<string, unknown>;
  const phoneNumber = (memberRecord.phone_number as string | undefined) ?? '';
  const provider = (memberRecord.connection as string | undefined) ?? '';

  const fields = [
    {
      label: t('member.detail.user_details.name'),
      value: member.name ?? '—',
      copyable: false,
    },
    {
      label: t('member.detail.user_details.email'),
      value: member.email ?? '—',
      copyable: true,
    },
    {
      label: t('member.detail.user_details.phone_number'),
      value: phoneNumber || '—',
      copyable: !!phoneNumber,
    },
    {
      label: t('member.detail.user_details.provider'),
      value: provider || '—',
      copyable: false,
    },
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

  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-primary mb-4">
        {t('member.detail.user_details.title')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{field.label}</span>
            {field.copyable && field.value !== '—' ? (
              <CopyableTextField value={field.value} className="h-8 text-sm" />
            ) : (
              <span className="text-sm text-primary">{field.value}</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
