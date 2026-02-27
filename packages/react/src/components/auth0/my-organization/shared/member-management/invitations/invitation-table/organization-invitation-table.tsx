/**
 * Organization invitation table component.
 * @module organization-invitation-table
 * @internal
 */

import * as React from 'react';

import { InvitationSearchFilter } from './invitation-search-filter';
import { OrganizationInvitationTableActionsColumn } from './organization-invitation-table-actions-column';

import { DataPagination } from '@/components/auth0/shared/data-pagination';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { Invitation, InvitationStatus, OrganizationInvitationTableProps } from '@/types';

/**
 * Determines the status of an invitation.
 * @param invitation - The invitation to check.
 * @returns The invitation status.
 */
function getInvitationStatus(invitation: Invitation): InvitationStatus {
  if (invitation.status) {
    return invitation.status;
  }
  if (invitation.expires_at) {
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return 'expired';
    }
  }
  return 'pending';
}

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
 * @param props.onSearchChange - Callback when search query changes.
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
  onView,
  onCopyUrl,
  onRevokeAndResend,
  onRevoke,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onRoleFilterChange,
  className,
}: OrganizationInvitationTableProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const columns: Column<Invitation>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'invitee',
        title: t('invitation.table.columns.email'),
        render: (invitation) => <div className="font-medium">{invitation.invitee.email}</div>,
      },
      {
        type: 'text',
        accessorKey: 'status',
        title: t('invitation.table.columns.status'),
        render: (invitation) => {
          const status = getInvitationStatus(invitation);
          return (
            <Badge variant={status === 'pending' ? 'default' : 'secondary'}>
              {status === 'pending'
                ? t('invitation.table.status_pending')
                : t('invitation.table.status_expired')}
            </Badge>
          );
        },
      },
      {
        type: 'text',
        accessorKey: 'roles',
        title: t('invitation.table.columns.roles'),
        render: (invitation) => invitation.roles?.join(', ') ?? '-',
      },
      {
        type: 'text',
        accessorKey: 'inviter',
        title: t('invitation.table.columns.inviter'),
        render: (invitation) => invitation.inviter?.name ?? '-',
      },
      {
        type: 'date',
        accessorKey: 'created_at',
        title: t('invitation.table.columns.created_at'),
        format: 'medium',
      },
      {
        type: 'date',
        accessorKey: 'expires_at',
        title: t('invitation.table.columns.expires_at'),
        format: 'medium',
      },
      {
        type: 'actions',
        title: '',
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
    <div className={className}>
      <InvitationSearchFilter
        filters={filters}
        availableRoles={availableRoles}
        customMessages={customMessages}
        onSearchChange={onSearchChange}
        onRoleFilterChange={onRoleFilterChange}
      />

      <DataTable
        columns={columns}
        data={invitations}
        loading={loading}
        emptyState={{ title: t('invitation.table.empty_message') }}
      />

      <div className="mt-4">
        <DataPagination
          type="regular"
          paginationState={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            pageSize: pagination.pageSize,
            totalItems: pagination.totalItems,
          }}
          pageSizeOptions={[10, 25, 50]}
          showPageSizeSelector
          showPageInfo
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}
