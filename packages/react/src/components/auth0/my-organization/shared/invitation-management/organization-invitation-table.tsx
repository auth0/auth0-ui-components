/**
 * Organization invitation table component.
 * @module organization-invitation-table
 */

import * as React from 'react';

import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { Invitation, OrganizationInvitationTabMessages } from '@/types';

export interface OrganizationInvitationTableProps {
  invitations: Invitation[];
  loading?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  onView?: (invitation: Invitation) => void;
  onRevoke?: (invitation: Invitation) => void;
  className?: string;
}

/**
 * Displays organization invitations in a table format.
 * @param root0 - The component props.
 * @param root0.invitations - The list of invitations to display.
 * @param root0.loading - Whether the table is loading.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.onView - Callback when viewing an invitation.
 * @param root0.onRevoke - Callback when revoking an invitation.
 * @param root0.className - Optional CSS class name.
 * @returns The table component.
 */
export function OrganizationInvitationTable({
  invitations,
  loading = false,
  customMessages = {},
  onView,
  onRevoke,
  className,
}: OrganizationInvitationTableProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const columns: Column<Invitation>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'id',
        title: t('invitation.table.columns.email'),
        width: '35%',
        render: (invitation) => <span className="font-medium">{invitation.invitee.email}</span>,
      },
      {
        type: 'text',
        accessorKey: 'id',
        title: t('invitation.table.columns.inviter'),
        width: '25%',
        render: (invitation) => <span>{invitation.inviter.name ?? '-'}</span>,
      },
      {
        type: 'text',
        accessorKey: 'created_at',
        title: t('invitation.table.columns.created_at'),
        width: '20%',
        render: (invitation) => (
          <span>
            {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString() : '-'}
          </span>
        ),
      },
      {
        type: 'actions',
        title: '',
        width: '20%',
        render: (invitation) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onView?.(invitation)}
              className="text-sm text-primary hover:underline"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => onRevoke?.(invitation)}
              className="text-sm text-destructive hover:underline"
            >
              {t('invitation.revoke.confirm_button')}
            </button>
          </div>
        ),
      },
    ],
    [t, onView, onRevoke],
  );

  return (
    <DataTable
      columns={columns}
      data={invitations}
      loading={loading}
      emptyState={{ title: t('invitation.table.empty_message') }}
      className={className}
    />
  );
}
