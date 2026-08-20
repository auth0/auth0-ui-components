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
import { DataTable, type Column, type DataTableProps } from '@/components/auth0/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/shared/use-translator';
import { MAX_INVITATIONS_PER_REQUEST } from '@/lib/constants/my-organization/member-management/member-management-constants';
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
 * @param props.pageSizeOptions - Options for page size selection.
 * @param props.filters - Current filter state.
 * @param props.availableRoles - Available roles for filtering.
 * @param props.readOnly - Whether the component is in read-only mode.
 * @param props.selectedInvitations - The currently selected invitations.
 * @param props.onView - Callback when viewing invitation details.
 * @param props.onCopyUrl - Callback when copying invitation URL.
 * @param props.onRevokeAndResend - Callback when revoking and resending invitation.
 * @param props.onRevoke - Callback when revoking invitation.
 * @param props.onSelectedInvitationsChange - Callback when row selection changes.
 * @param props.onBulkRevoke - Callback when revoking the selected invitations.
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
  pageSizeOptions,
  filters,
  availableRoles,
  readOnly = false,
  selectedInvitations,
  sortConfig,
  onSortChange,
  onView,
  onCopyUrl,
  onRevokeAndResend,
  onRevoke,
  onSelectedInvitationsChange,
  onBulkRevoke,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  onRoleFilterChange,
  className,
}: OrganizationInvitationTableProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const selectionEnabled = !readOnly && !!onSelectedInvitationsChange;
  const selectedCount = selectedInvitations?.length ?? 0;

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
        width: '24%',
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
        width: '16%',
        enableSorting: true,
        format: 'medium',
        render: renderDate,
      },
      {
        type: 'date',
        accessorKey: 'expires_at',
        title: t('invitation.table.columns.expires_at'),
        width: '16%',
        enableSorting: false,
        format: 'medium',
        render: renderDate,
      },
      {
        type: 'text',
        accessorKey: 'inviter',
        title: t('invitation.table.columns.inviter'),
        width: '26%',
        enableSorting: false,
        render: (invitation) => (
          <div className="text-primary truncate">{invitation.inviter?.name ?? '-'}</div>
        ),
      },
      {
        type: 'actions',
        title: '',
        width: '64px',
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

  const baseTableProps = {
    columns,
    data: invitations,
    loading,
    emptyState: { title: t('invitation.table.empty_message') },
    sortConfig,
    onSortChange,
  };

  const tableProps: DataTableProps<MemberInvitation> = selectionEnabled
    ? {
        ...baseTableProps,
        selectable: true,
        selectionLabels: {
          selectAll: t('data_table.select_all'),
          selectRow: (index: number) => t('data_table.select_row', { index: index + 1 }),
        },
        selectedRows: selectedInvitations,
        onSelectedRowsChange: onSelectedInvitationsChange,
        getRowId: (invitation: MemberInvitation) => invitation.id!,
        maxSelectionAllowed: MAX_INVITATIONS_PER_REQUEST,
        maxSelectionAllowedMessage: t('invitation.bulk_revoke.max_selection_message'),
      }
    : baseTableProps;

  return (
    <div className={cn('flex flex-col', className)}>
      <SearchFilter
        filters={filters}
        availableRoles={availableRoles}
        customMessages={customMessages}
        onRoleFilterChange={onRoleFilterChange}
      />

      {selectionEnabled && selectedCount > 0 && (
        <div className="flex items-center justify-end gap-2 mb-2">
          <span className="text-sm text-muted-foreground shrink-0">
            {t(
              selectedCount === 1
                ? 'invitation.bulk_revoke.count'
                : 'invitation.bulk_revoke.count_plural',
              { count: selectedCount },
            )}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onBulkRevoke?.(selectedInvitations ?? [])}
          >
            {t(
              selectedCount === 1
                ? 'invitation.bulk_revoke.button'
                : 'invitation.bulk_revoke.button_plural',
            )}
          </Button>
        </div>
      )}

      <DataTable {...tableProps} />

      {!loading && invitations.length > 0 && (
        <div className="mt-4">
          <DataPagination
            type="checkpoint"
            paginationState={{
              pageSize: pagination.pageSize,
              currentPage: pagination.currentPage,
              totalItems: pagination.totalItems,
              totalItemsDisplay: pagination.totalItemsDisplay,
              hasNextPage: pagination.hasNextPage,
              hasPreviousPage: pagination.hasPreviousPage,
            }}
            pageSizeOptions={pageSizeOptions}
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
