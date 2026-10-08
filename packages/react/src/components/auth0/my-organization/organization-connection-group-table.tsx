/** @module organization-connection-group-table */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationConnectionGroupTableActionsColumn } from '@/components/auth0/my-organization/shared/connection-group-management/connection-group-table/organization-connection-group-table-actions-column';
import {
  DataTable,
  type Column,
  type DataTableSortConfig,
} from '@/components/auth0/shared/data-table';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOrganizationConnectionGroupTable } from '@/hooks/my-organization/use-organization-connection-group-table';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  ConnectionGroup,
  ConnectionGroupRole,
  OrganizationConnectionGroupTableProps,
  OrganizationConnectionGroupTableViewProps,
} from '@/types/my-organization/connection-group/organization-connection-group-table-types';

const DEFAULT_MAX_VISIBLE_ROLES = 3;

const DEFAULT_STYLING = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/**
 * Renders a group's assigned roles as comma-separated text, collapsing any
 * roles beyond `maxVisible` into a tooltip-backed "+N more" indicator.
 * @param props - Component props.
 * @param props.roles - Roles assigned to the group.
 * @param props.maxVisible - Max role names to show before collapsing.
 * @param props.overflowLabel - Builds the "+N more" label from the overflow count.
 * @param props.emptyLabel - Shown when the group has no roles.
 * @returns JSX element.
 * @internal
 */
function AssignedRolesCell({
  roles,
  maxVisible,
  overflowLabel,
  emptyLabel,
}: {
  roles: ConnectionGroupRole[];
  maxVisible: number;
  overflowLabel: (count: number) => string;
  emptyLabel: string;
}): React.JSX.Element {
  if (roles.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>;
  }

  const visibleText = roles
    .slice(0, maxVisible)
    .map((role) => role.name)
    .join(', ');
  const overflowCount = roles.length - Math.min(roles.length, maxVisible);

  if (overflowCount <= 0) {
    return <span className="text-muted-foreground truncate">{visibleText}</span>;
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
      <span className="truncate">{visibleText}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="shrink-0 cursor-default underline decoration-dotted">
            {overflowLabel(overflowCount)}
          </span>
        </TooltipTrigger>
        <TooltipContent>{roles.map((role) => role.name).join(', ')}</TooltipContent>
      </Tooltip>
    </span>
  );
}

/**
 * Sorts groups by name. Name is the only sortable column (per design), so any
 * other sort key is a no-op.
 * @param groups - The groups to sort.
 * @param sortConfig - The active sort key and direction.
 * @returns A new sorted array, or the original when no sort is active.
 * @internal
 */
function sortGroups(groups: ConnectionGroup[], sortConfig: DataTableSortConfig): ConnectionGroup[] {
  if (sortConfig.key !== 'name') {
    return groups;
  }

  const direction = sortConfig.direction === 'asc' ? 1 : -1;
  return [...groups].sort((a, b) => a.name.localeCompare(b.name) * direction);
}

/**
 * Internal connection group table view component.
 * @param props - {@link OrganizationConnectionGroupTableViewProps}
 * @returns JSX element.
 * @internal
 */
function OrganizationConnectionGroupTableView({
  styling = DEFAULT_STYLING,
  customMessages = {},
  groups,
  isLoading = false,
  hideHeader = false,
  permissions,
  maxVisibleRoles = DEFAULT_MAX_VISIBLE_ROLES,
  onAssignRoles,
  onViewDetails,
  className,
}: OrganizationConnectionGroupTableViewProps): React.JSX.Element {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('connection_group_management', customMessages);
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const [sortConfig, setSortConfig] = React.useState<DataTableSortConfig>({
    key: null,
    direction: 'asc',
  });

  const sortedGroups = React.useMemo(() => sortGroups(groups, sortConfig), [groups, sortConfig]);

  const columns: Column<ConnectionGroup>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('table.columns.name'),
        width: '30%',
        render: (group) => <div className="font-medium text-primary">{group.name}</div>,
      },
      {
        type: 'text',
        accessorKey: 'source',
        title: t('table.columns.source'),
        width: '25%',
        enableSorting: false,
        render: (group) => <div className="text-muted-foreground">{group.source}</div>,
      },
      {
        type: 'custom',
        accessorKey: 'assignedRoles',
        title: t('table.columns.assigned_roles'),
        width: '36%',
        enableSorting: false,
        render: (group) => (
          <AssignedRolesCell
            roles={group.assignedRoles}
            maxVisible={maxVisibleRoles}
            overflowLabel={(count) => t('table.assigned_roles_overflow', { count })}
            emptyLabel={t('table.assigned_roles_empty')}
          />
        ),
      },
      {
        type: 'actions',
        title: '',
        width: '64px',
        enableSorting: false,
        render: (group) => (
          <OrganizationConnectionGroupTableActionsColumn
            group={group}
            permissions={permissions}
            customMessages={customMessages}
            onAssignRoles={onAssignRoles}
            onViewDetails={onViewDetails}
          />
        ),
      },
    ],
    [t, maxVisibleRoles, permissions, customMessages, onAssignRoles, onViewDetails],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      {!hideHeader && (
        <div className={currentStyles.classes?.['OrganizationConnectionGroupTable-header']}>
          <Header title={t('header.title')} description={t('header.description')} />
        </div>
      )}

      <DataTable
        loading={isLoading}
        columns={columns}
        data={sortedGroups}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        emptyState={{ title: t('table.empty_message') }}
        className={className ?? currentStyles.classes?.['OrganizationConnectionGroupTable-table']}
      />
    </StyledScope>
  );
}

/**
 * Connection group list table.
 *
 * Displays the connection-level groups (SCIM / Google Workspace) for the current
 * organization with their source connection and assigned roles. Row actions are
 * opt-in: an item appears only when its action handler is supplied and the user
 * has the matching permission.
 *
 * @param props - {@link OrganizationConnectionGroupTableProps}
 * @param props.customMessages - Custom i18n message overrides.
 * @param props.styling - CSS variables and class overrides.
 * @param props.readOnly - Render in read-only mode (hides role-management actions).
 * @param props.hideHeader - Hide the title/description header.
 * @param props.maxVisibleRoles - Max role names per row before a "+N more" overflow.
 * @param props.assignRolesAction - Lifecycle hooks for the assign-roles action.
 * @param props.viewDetailsAction - Lifecycle hooks for the view-group action.
 * @returns Connection group table component.
 *
 * @example
 * ```tsx
 * <OrganizationConnectionGroupTable
 *   assignRolesAction={{ onAfter: (group) => navigate(`/groups/${group.id}/roles`) }}
 * />
 * ```
 */
function OrganizationConnectionGroupTable(
  props: OrganizationConnectionGroupTableProps,
): React.JSX.Element {
  useTelemetry('connection-group-table');

  const {
    customMessages = {},
    styling = DEFAULT_STYLING,
    readOnly = false,
    hideHeader = false,
    maxVisibleRoles,
    assignRolesAction,
    viewDetailsAction,
  } = props;

  const table = useOrganizationConnectionGroupTable({
    readOnly,
    customMessages,
    assignRolesAction,
    viewDetailsAction,
  });

  return (
    <GateKeeper isLoading={table.isLoading} styling={styling}>
      <OrganizationConnectionGroupTableView
        groups={table.groups}
        isLoading={table.isViewLoading}
        permissions={table.permissions}
        styling={styling}
        customMessages={customMessages}
        readOnly={readOnly}
        hideHeader={hideHeader}
        maxVisibleRoles={maxVisibleRoles}
        onAssignRoles={assignRolesAction ? table.handleAssignRoles : undefined}
        onViewDetails={viewDetailsAction ? table.handleViewDetails : undefined}
      />
    </GateKeeper>
  );
}

export { OrganizationConnectionGroupTable, OrganizationConnectionGroupTableView };
