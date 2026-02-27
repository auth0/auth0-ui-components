/**
 * Organization member table component.
 * @module organization-member-table
 */

import * as React from 'react';

import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { Member, OrganizationMemberTabMessages } from '@/types';

export interface OrganizationMemberTableProps {
  members: Member[];
  loading?: boolean;
  customMessages?: Partial<OrganizationMemberTabMessages>;
  onRemove?: (member: Member) => void;
  className?: string;
}

/**
 * Displays organization members in a table format.
 * @param root0 - The component props.
 * @param root0.members - The list of members to display.
 * @param root0.loading - Whether the table is loading.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.onRemove - Callback when removing a member.
 * @param root0.className - Optional CSS class name.
 * @returns The table component.
 */
export function OrganizationMemberTable({
  members,
  loading = false,
  customMessages = {},
  onRemove,
  className,
}: OrganizationMemberTableProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const columns: Column<Member>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('member.table.columns.name'),
        width: '30%',
        render: (member) => (
          <div className="flex items-center gap-2">
            {member.picture && (
              <img src={member.picture} alt={member.name ?? ''} className="h-8 w-8 rounded-full" />
            )}
            <span className="font-medium">{member.name ?? 'Unknown'}</span>
          </div>
        ),
      },
      {
        type: 'text',
        accessorKey: 'email',
        title: t('member.table.columns.email'),
        width: '35%',
        render: (member) => <span>{member.email ?? '-'}</span>,
      },
      {
        type: 'text',
        accessorKey: 'roles',
        title: t('member.table.columns.roles'),
        width: '25%',
        render: (member) => <span>{member.roles?.join(', ') ?? '-'}</span>,
      },
      {
        type: 'actions',
        title: '',
        width: '10%',
        render: (member) => (
          <button
            type="button"
            onClick={() => onRemove?.(member)}
            className="text-sm text-destructive hover:underline"
          >
            {t('member.remove.confirm_button')}
          </button>
        ),
      },
    ],
    [t, onRemove],
  );

  return (
    <DataTable
      columns={columns}
      data={members}
      loading={loading}
      emptyState={{ title: t('member.table.empty_message') }}
      className={className}
    />
  );
}
