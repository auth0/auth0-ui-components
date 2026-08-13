/**
 * Organization member table component.
 * @module organization-member-table
 * @internal
 */

import type { OrgMember } from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationMemberTableActionsColumn } from './organization-member-table-actions-column';

import { formatDate } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-user-details/utils';
import { SearchFilter } from '@/components/auth0/my-organization/shared/member-management/shared/search-filter/search-filter';
import { DataPagination } from '@/components/auth0/shared/data-pagination';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import {
  getInitials,
  getMemberDisplayName,
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
 * @param props.onRemoveFromOrganization - Callback when removing a member from the organization.
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
  onRemoveFromOrganization,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  onRoleFilterChange,
  onSearchTermChange,
}: OrganizationMemberTableProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const renderName = React.useCallback((member: OrgMember) => {
    const displayName = getMemberDisplayName(member);
    const initials = getInitials(displayName);
    return (
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium text-primary">{displayName}</div>
          <div className="truncate text-muted-foreground">{member.email ?? '-'}</div>
        </div>
      </div>
    );
  }, []);

  const renderRoles = React.useCallback(
    (member: OrgMember) => {
      const roles = member.roles ?? [];

      if (roles.length === 0) {
        return <span className="text-primary">-</span>;
      }

      const visibleRoles = roles.slice(0, 2);
      const remainingCount = roles.length - 2;
      const visibleRoleNames = visibleRoles.map((r) => r.name).join(', ');

      const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onView && member.user_id) {
          onView({ userId: member.user_id, tab: 'roles' });
        }
      };

      return (
        <span className="text-primary">
          {visibleRoleNames}
          {remainingCount > 0 && (
            <>
              ,{' '}
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto cursor-pointer"
                onClick={handleMoreClick}
                aria-label={t('member.table.view_all_roles', { count: roles.length })}
              >
                +{t('member.table.more_roles')}
              </Button>
            </>
          )}
        </span>
      );
    },
    [onView, t],
  );

  const renderLastLogin = React.useCallback(
    (member: OrgMember) => {
      const label = getRelativeLastLoginLabel(member.last_login, t);
      if (!member.last_login || Number.isNaN(new Date(member.last_login).getTime())) {
        return <span className="text-primary">{label}</span>;
      }
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-primary">{label}</span>
          </TooltipTrigger>
          <TooltipContent>{formatDate(member.last_login)}</TooltipContent>
        </Tooltip>
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
        width: '40%',
        enableSorting: false,
        render: renderName,
      },
      {
        type: 'text',
        accessorKey: 'roles',
        title: t('member.table.columns.roles'),
        width: '35%',
        enableSorting: false,
        render: renderRoles,
      },
      {
        type: 'custom',
        accessorKey: 'last_login',
        title: t('member.table.columns.last_login'),
        width: '15%',
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
            onRemoveFromOrganization={onRemoveFromOrganization}
          />
        ),
      },
    ],
    [t, onView, onAssignRole, onRemoveFromOrganization, renderName, renderRoles, renderLastLogin],
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

      {!loading && (members.length > 0 || pagination.hasPreviousPage) && (
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
