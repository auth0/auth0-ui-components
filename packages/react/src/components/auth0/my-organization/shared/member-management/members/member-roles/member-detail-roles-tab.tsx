/**
 * Member detail roles tab component.
 * @module member-detail-roles-tab
 * @internal
 */

import type { OrgMemberRole } from '@auth0/universal-components-core';
import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { MemberDetailRolesTabProps } from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders the roles tab for a member detail view with a table and assign/remove actions.
 * @param props - Component props
 * @returns The rendered roles tab element
 */
export function MemberDetailRolesTab({
  memberRoles,
  isLoading = false,
  removingRoleId = null,
  readOnly = false,
  customMessages,
  onAssignRolesClick,
  onRemoveRole,
}: MemberDetailRolesTabProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const columns: Column<OrgMemberRole>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('member.detail.roles.table.name'),
        enableSorting: false,
        render: (role) => <span className="font-medium text-primary">{role.name}</span>,
      },
      {
        type: 'text',
        accessorKey: 'description',
        title: t('member.detail.roles.table.description'),
        enableSorting: false,
        render: (role) => <span className="text-primary">{role.description ?? '—'}</span>,
      },
      {
        type: 'actions',
        title: '',
        enableSorting: false,
        render: (role) =>
          readOnly ? null : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={removingRoleId === role.id}
              onClick={() => onRemoveRole(role)}
              aria-label={`Remove role ${role.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ),
      },
    ],
    [t, readOnly, removingRoleId, onRemoveRole],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-primary">{t('member.detail.roles.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('member.detail.roles.description')}</p>
        </div>
        {!readOnly && (
          <Button size="sm" onClick={onAssignRolesClick} className="shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            {t('member.detail.roles.assign_button')}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={memberRoles}
        loading={isLoading}
        emptyState={{ title: t('member.detail.roles.table.empty_message') }}
      />
    </div>
  );
}
