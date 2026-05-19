/**
 * Organization invitation table component.
 * @module organization-invitation-table
 * @internal
 */

import type { MemberInvitation } from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationInvitationTableActionsColumn } from './organization-invitation-table-actions-column';

import { SearchFilter } from '@/components/auth0/my-organization/shared/member-management/shared/search-filter/search-filter';
import { DataPagination } from '@/components/auth0/shared/data-pagination';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import { getInvitationStatus } from '@/lib/utils/my-organization/member-management/member-management-utils';
import type { OrganizationInvitationTableProps } from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Organization invitation table component.
 * Displays invitations with search, filtering, and pagination.
 * @param props - The component props.
 * @param props.invitations - The list of invitations to display.
 * @param props.loading - Whether the table is loading.
 * @param props.customMessages - Custom translation messages.
 * @param props.pagination - Pagination state.
 * @param props.filters - Current filter state.
 * @param props.availableRoles - Available roles for filtering.
 * @param props.readOnly - Whether the component is in read-only mode.
 * @param props.onView - Callback when viewing invitation details.
 * @param props.onCopyUrl - Callback when copying invitation URL.
 * @param props.onRevokeAndResend - Callback when revoking and resending invitation.
 * @param props.onRevoke - Callback when revoking invitation.
 * @param props.onPageChange - Callback when page changes.
 * @param props.onPageSizeChange - Callback when page size changes.
 * @param props.onRoleFilterChange - Callback when role filter changes.
 * @param props.className - Optional CSS class name.
 * @returns The invitation table component.
 */
export function OrganizationInvitationTable({
  invitations,
  loading = false,
  customMessages = {},
  pagination,
  filters,
  availableRoles,
  readOnly = false,
  sortConfig,
  onSortChange,
  onView,
  onCopyUrl,
  onRevokeAndResend,
  onRevoke,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  onRoleFilterChange,
  className,
}: OrganizationInvitationTableProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const renderDate = (_invitation: MemberInvitation, value: string | number | Date) => (
    <span className="text-primary">
      {new Date(value).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })}
    </span>
  );

  const columns: Column<MemberInvitation>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'invitee',
        title: t('invitation.table.columns.email'),
        width: '25%',
        enableSorting: false,
        render: (invitation) => (
          <div className="font-medium text-primary truncate">{invitation.invitee?.email}</div>
        ),
      },
      {
        type: 'text',
        accessorKey: 'organization_id',
        title: t('invitation.table.columns.status'),
        width: '10%',
        enableSorting: false,
        render: (invitation) => {
          const status = getInvitationStatus(invitation);
          return (
            <Badge variant={status === 'expired' ? 'destructive' : 'warning'} size="sm">
              {status === 'pending'
                ? t('invitation.table.status_pending')
                : t('invitation.table.status_expired')}
            </Badge>
          );
        },
      },
      {
        type: 'date',
        accessorKey: 'created_at',
        title: t('invitation.table.columns.created_at'),
        enableSorting: true,
        format: 'medium',
        render: renderDate,
      },
      {
        type: 'date',
        accessorKey: 'expires_at',
        title: t('invitation.table.columns.expires_at'),
        enableSorting: false,
        format: 'medium',
        render: renderDate,
      },
      {
        type: 'text',
        accessorKey: 'inviter',
        title: t('invitation.table.columns.inviter'),
        enableSorting: false,
        render: (invitation) => (
          <span className="text-primary">{invitation.inviter?.name ?? '-'}</span>
        ),
      },
      {
        type: 'actions',
        title: '',
        enableSorting: false,
        render: (invitation) => (
          <OrganizationInvitationTableActionsColumn
            invitation={invitation}
            customMessages={customMessages}
            readOnly={readOnly}
            onViewDetails={onView}
            onCopyUrl={onCopyUrl}
            onRevokeAndResend={onRevokeAndResend}
            onRevoke={onRevoke}
          />
        ),
      },
    ],
    [t, customMessages, readOnly, onView, onCopyUrl, onRevokeAndResend, onRevoke],
  );

  return (
    <div className={cn('flex flex-col', className)}>
      <SearchFilter
        filters={filters}
        availableRoles={availableRoles}
        customMessages={customMessages}
        onRoleFilterChange={onRoleFilterChange}
      />

      <DataTable
        columns={columns}
        data={invitations}
        loading={loading}
        emptyState={{ title: t('invitation.table.empty_message') }}
        sortConfig={sortConfig}
        onSortChange={onSortChange}
      />

      {!loading && invitations.length > 0 && (
        <div className="mt-4">
          <DataPagination
            type="checkpoint"
            paginationState={{
              pageSize: pagination.pageSize,
              currentPage: pagination.currentPage,
              totalItems: pagination.totalItems,
              hasNextPage: pagination.hasNextPage,
              hasPreviousPage: pagination.hasPreviousPage,
            }}
            pageSizeOptions={[10, 25, 50]}
            showPageSizeSelector
            showPageInfo
            onNextPage={onNextPage}
            onPreviousPage={onPreviousPage}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
