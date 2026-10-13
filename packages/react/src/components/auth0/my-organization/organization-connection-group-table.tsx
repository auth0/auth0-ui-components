/** @module organization-connection-group-table */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationConnectionGroupTableActionsColumn } from '@/components/auth0/my-organization/shared/connection-group-management/connection-group-table/organization-connection-group-table-actions-column';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
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
  OrganizationConnectionGroupTableProps,
  OrganizationConnectionGroupTableViewProps,
} from '@/types/my-organization/connection-group-management/organization-connection-group-table-types';

const DEFAULT_MAX_VISIBLE_ROLES = 3;

const DEFAULT_STYLING = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

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
  onRemoveFromOrganization,
  onViewDetails,
  className,
}: OrganizationConnectionGroupTableViewProps): React.JSX.Element {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('connection_group_management', customMessages);
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const renderRoles = React.useCallback(
    (group: ConnectionGroup) => {
      const roles = group.assignedRoles;

      if (roles.length === 0) {
        return <span className="text-muted-foreground">{t('table.assigned_roles_empty')}</span>;
      }

      const visibleRoleNames = roles
        .slice(0, maxVisibleRoles)
        .map((role) => role.name)
        .join(', ');
      const remainingCount = roles.length - maxVisibleRoles;

      if (remainingCount <= 0) {
        return <span className="text-muted-foreground truncate">{visibleRoleNames}</span>;
      }

      return (
        <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
          <span className="truncate">{visibleRoleNames}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 cursor-default underline decoration-dotted">
                {t('table.assigned_roles_overflow', { count: remainingCount })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {roles
                .slice(maxVisibleRoles)
                .map((role) => role.name)
                .join(', ')}
            </TooltipContent>
          </Tooltip>
        </span>
      );
    },
    [t, maxVisibleRoles],
  );

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
        render: renderRoles,
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
            onRemoveFromOrganization={onRemoveFromOrganization}
            onViewDetails={onViewDetails}
          />
        ),
      },
    ],
    [t, renderRoles, permissions, customMessages, onRemoveFromOrganization, onViewDetails],
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
        data={groups}
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
 * @param props.readOnly - Render in read-only mode (hides the remove-from-organization action).
 * @param props.hideHeader - Hide the title/description header.
 * @param props.maxVisibleRoles - Max role names per row before a "+N more" overflow.
 * @param props.removeFromOrganizationAction - Lifecycle hooks for the remove-from-organization action.
 * @param props.viewDetailsAction - Lifecycle hooks for the view-details action.
 * @returns Connection group table component.
 *
 * @example
 * ```tsx
 * <OrganizationConnectionGroupTable
 *   removeFromOrganizationAction={{ onAfter: (group) => openRemoveDialog(group) }}
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
    removeFromOrganizationAction,
    viewDetailsAction,
  } = props;

  const table = useOrganizationConnectionGroupTable({
    readOnly,
    customMessages,
    removeFromOrganizationAction,
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
        onRemoveFromOrganization={
          removeFromOrganizationAction ? table.handleRemoveFromOrganization : undefined
        }
        onViewDetails={viewDetailsAction ? table.handleViewDetails : undefined}
      />
    </GateKeeper>
  );
}

export { OrganizationConnectionGroupTable, OrganizationConnectionGroupTableView };
