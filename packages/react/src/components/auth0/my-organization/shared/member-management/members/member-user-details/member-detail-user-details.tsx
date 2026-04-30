/**
 * Member detail user details card component.
 * @module member-detail-user-details
 * @internal
 */

import type { OrgMember } from '@auth0/universal-components-core';
import { Copy } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
 * Displays a value with a copy-to-clipboard button.
 * @param root0 - Component props
 * @param root0.value - The string value to display and copy
 * @param root0.copyLabel - Label for the copy button tooltip
 * @param root0.copiedLabel - Label shown after copying
 * @returns The rendered copyable value element
 */
function CopyableValue({
  value,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}): React.JSX.Element {
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  const [tooltipText, setTooltipText] = React.useState(copyLabel);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setTooltipText(copiedLabel);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipText(copyLabel);
      setTooltipOpen(false);
    }, 1000);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-primary">{value}</span>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopy}
            aria-label={copyLabel}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="end" sideOffset={5}>
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/**
 * Renders the user details card for a member showing name, email, phone, and login timestamps.
 * @param root0 - Component props
 * @returns The rendered user details card element
 */
export function MemberDetails({
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
    <>
      <h3 className="text-base font-semibold text-primary py-4">
        {t('member.detail.user_details.title')}
      </h3>
      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground shrink-0">{field.label}</span>
              {field.copyable && field.value !== '—' ? (
                <CopyableValue
                  value={field.value}
                  copyLabel={t('copy')}
                  copiedLabel={t('copied')}
                />
              ) : (
                <span className="text-sm text-primary">{field.value}</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
