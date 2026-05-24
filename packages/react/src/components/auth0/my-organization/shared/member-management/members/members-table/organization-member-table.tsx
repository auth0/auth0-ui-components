/**
 * Organization member table component.
 * @module organization-member-table
 * @internal
 */

import type { OrgMember } from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationMemberTableActionsColumn } from './organization-member-table-actions-column';

import { SearchFilter } from '@/components/auth0/my-organization/shared/member-management/shared/search-filter/search-filter';
import { DataPagination } from '@/components/auth0/shared/data-pagination';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import {
  getInitials,
  getMemberDisplayName,
  getMemberPicture,
  getRelativeLastLoginLabel,
} from '@/lib/utils/my-organization/member-management/member-management-utils';
import type { OrganizationMemberTableProps } from '@/types/my-organization/member-management/organization-member-table-types';

/**
 * Organization member table component.
 * Displays members with search, filtering, and pagination.
 * @param props - The component props.
 * @param props.members - The list of members to display.
 * @param props.loading - Whether the table is loading.
 * @param props.pagination - Pagination state.
 * @param props.pageSizeOptions - Options for page size selection.
 * @param props.filters - Current filter state.
 * @param props.availableRoles - Available roles for filtering.
 * @param props.onView - Callback when viewing member details.
 * @param props.onAssignRole - Callback when assigning a role to a member.
 * @param props.onRemoveFromOrg - Callback when removing a member from the organization.
 * @param props.onNextPage - Callback when navigating to the next page.
 * @param props.onPreviousPage - Callback when navigating to the previous page.
 * @param props.onPageSizeChange - Callback when page size changes.
 * @param props.onRoleFilterChange - Callback when role filter changes.
 * @param props.onSearchTermChange - Callback when search term changes.
 * @param props.className - Optional CSS class name.
 * @returns The member table component.
 */
export function OrganizationMemberTable({
  members,
  loading = false,
  pagination,
  pageSizeOptions,
  filters,
  customMessages = {},
  availableRoles,
  sortConfig,
  className,
  onSortChange,
  onView,
  onAssignRole,
  onRemoveFromOrg,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  onRoleFilterChange,
  onSearchTermChange,
}: OrganizationMemberTableProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const renderName = React.useCallback((member: OrgMember) => {
    const memberPictureUrl = getMemberPicture(member);
    const displayName = getMemberDisplayName(member);
    const initials = getInitials(displayName);
    return (
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={memberPictureUrl} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium text-primary">{displayName}</div>
          <div className="truncate text-muted-foreground">{member.email ?? '-'}</div>
        </div>
      </div>
    );
  }, []);

  const renderRoles = React.useCallback((member: OrgMember) => {
    const roleNames = member.roles?.map((role) => role.name) ?? [];

    if (roleNames.length === 0) {
      return <span className="text-primary">-</span>;
    }

    const visibleRoles = roleNames.slice(0, 2).join(', ');
    const remainingCount = roleNames.length - 2;

    return (
      <span className="text-primary">
        {visibleRoles}
        {remainingCount > 0 ? `, +${remainingCount}` : ''}
      </span>
    );
  }, []);

  const renderLastLogin = React.useCallback(
    (member: OrgMember) => {
      return (
        <span className="text-primary">{getRelativeLastLoginLabel(member.last_login, t)}</span>
      );
    },
    [t],
  );

  const columns: Column<OrgMember>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('member.table.columns.name'),
        enableSorting: false,
        render: renderName,
      },
      {
        type: 'text',
        accessorKey: 'roles',
        title: t('member.table.columns.roles'),
        enableSorting: false,
        render: renderRoles,
      },
      {
        type: 'text',
        accessorKey: 'last_login',
        title: t('member.table.columns.last_login'),
        enableSorting: false,
        render: renderLastLogin,
      },
      {
        type: 'actions',
        title: '',
        render: (member) => (
          <OrganizationMemberTableActionsColumn
            member={member}
            onViewDetails={onView}
            onAssignRole={onAssignRole}
            onRemoveFromOrg={onRemoveFromOrg}
          />
        ),
      },
    ],
    [t, onView, onAssignRole, onRemoveFromOrg, renderName, renderRoles, renderLastLogin],
  );

  return (
    <div className={cn('flex flex-col', className)}>
      <SearchFilter
        filters={filters}
        availableRoles={availableRoles}
        activeTab="members"
        onRoleFilterChange={onRoleFilterChange}
        onSearchTermChange={onSearchTermChange}
      />

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        emptyState={{ title: t('member.table.empty_message') }}
        sortConfig={sortConfig}
        onSortChange={onSortChange}
      />

      {members.length > 0 && (
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
