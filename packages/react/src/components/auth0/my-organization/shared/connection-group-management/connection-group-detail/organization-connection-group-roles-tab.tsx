/**
 * Roles tab for the connection group detail view.
 * @module organization-connection-group-roles-tab
 * @internal
 */

import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import { MAX_ROLES_PER_REQUEST } from '@/lib/constants/my-organization/member-management/member-management-constants';
import type {
  ConnectionGroupDetailRole,
  ConnectionGroupRolesTabProps,
} from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

/** Number of permissions shown inline before collapsing into a "+N more" tooltip. */
const MAX_VISIBLE_PERMISSIONS = 2;

/**
 * Renders the roles tab: header (assign / remove actions) and the roles table.
 * Modal rendering and state are owned by the parent view.
 * @param props - Component props
 * @param props.roles - Roles assigned to the group
 * @param props.selectedRoles - Currently selected roles
 * @param props.permissions - Capabilities derived from granted scopes
 * @param props.readOnly - Hide assign / remove controls
 * @param props.isLoading - Whether roles are loading
 * @param props.customMessages - Custom i18n message overrides
 * @param props.classes - Custom CSS class overrides
 * @param props.onSelectedRowsChange - Called when row selection changes
 * @param props.onAssignClick - Called when Assign Roles is clicked
 * @param props.onRemoveClick - Called with the roles to remove
 * @returns The rendered roles tab element
 */
export function OrganizationConnectionGroupRolesTab({
  roles,
  selectedRoles,
  permissions,
  readOnly = false,
  isLoading = false,
  customMessages,
  classes,
  onSelectedRowsChange,
  onAssignClick,
  onRemoveClick,
}: ConnectionGroupRolesTabProps): React.JSX.Element {
  const { t } = useTranslator('connection_group_management.detail', customMessages);
  const { t: tCommon } = useTranslator('common');
  const { canAssignRoles, canRemoveRoles } = permissions;

  const renderPermissions = React.useCallback(
    (role: ConnectionGroupDetailRole) => {
      const all = role.permissions;
      const visible = all.slice(0, MAX_VISIBLE_PERMISSIONS).join(', ');
      const remainingCount = all.length - MAX_VISIBLE_PERMISSIONS;

      if (remainingCount <= 0) {
        return <span className="text-muted-foreground truncate">{visible}</span>;
      }

      return (
        <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
          <span className="truncate">{visible}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 cursor-default underline decoration-dotted">
                {t('roles.permissions_overflow', { count: remainingCount })}
              </span>
            </TooltipTrigger>
            <TooltipContent>{all.slice(MAX_VISIBLE_PERMISSIONS).join(', ')}</TooltipContent>
          </Tooltip>
        </span>
      );
    },
    [t],
  );

  const columns: Column<ConnectionGroupDetailRole>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('roles.columns.name'),
        enableSorting: true,
        render: (role) => <span className="font-medium text-primary">{role.name}</span>,
      },
      {
        type: 'text',
        accessorKey: 'description',
        title: t('roles.columns.description'),
        enableSorting: true,
        render: (role) => <span className="text-primary">{role.description ?? '—'}</span>,
      },
      {
        type: 'text',
        accessorKey: 'permissions',
        title: t('roles.columns.permissions'),
        enableSorting: true,
        render: renderPermissions,
      },
      {
        type: 'actions',
        title: '',
        enableSorting: false,
        render: (role) =>
          !readOnly && (
            <div className="flex justify-end">
              <PermissionDeniedTooltip
                enabled={!canRemoveRoles || !role.removable}
                customMessage={canRemoveRoles ? t('roles.managed_role_tooltip') : undefined}
                className="shrink-0"
              >
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!canRemoveRoles || !role.removable}
                  onClick={() => onRemoveClick([role])}
                  aria-label={t('roles.remove_button_label', { roleName: role.name })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </PermissionDeniedTooltip>
            </div>
          ),
      },
    ],
    [t, renderPermissions, readOnly, canRemoveRoles, onRemoveClick],
  );

  // Managed (non-removable) roles can be selected but never reach removal.
  const removableSelectedRoles = React.useMemo(
    () => selectedRoles.filter((role) => role.removable),
    [selectedRoles],
  );

  const handleRemoveSelected = React.useCallback(() => {
    onRemoveClick(removableSelectedRoles);
  }, [onRemoveClick, removableSelectedRoles]);

  return (
    <div
      className={`flex flex-col gap-4 ${classes?.['OrganizationConnectionGroupDetail-rolesTab'] ?? ''}`.trim()}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-base font-semibold text-primary">{t('roles.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('roles.description')}</p>
        </div>
        {!readOnly && (
          <div className="flex shrink-0 items-center gap-2">
            {selectedRoles.length > 0 ? (
              <>
                <span className="text-sm text-muted-foreground shrink-0">
                  {t('roles.selected_count', { count: selectedRoles.length })}
                </span>
                <PermissionDeniedTooltip enabled={!canRemoveRoles} className="shrink-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveSelected}
                    disabled={!canRemoveRoles || removableSelectedRoles.length === 0}
                  >
                    {t('roles.remove_button')}
                  </Button>
                </PermissionDeniedTooltip>
              </>
            ) : (
              <PermissionDeniedTooltip enabled={!canAssignRoles} className="shrink-0">
                <Button
                  size="sm"
                  onClick={onAssignClick}
                  disabled={!canAssignRoles}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('roles.assign_button')}
                </Button>
              </PermissionDeniedTooltip>
            )}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={roles}
        loading={isLoading}
        emptyState={{ title: t('roles.empty_message') }}
        selectable={canRemoveRoles && !readOnly}
        selectionLabels={{
          selectAll: tCommon('data_table.select_all'),
          selectRow: (index) => tCommon('data_table.select_row', { index: index + 1 }),
        }}
        selectedRows={selectedRoles}
        onSelectedRowsChange={onSelectedRowsChange}
        getRowId={(role) => role.id}
        maxSelectionAllowed={MAX_ROLES_PER_REQUEST}
        maxSelectionAllowedMessage={t('roles.max_selection_message', {
          max: MAX_ROLES_PER_REQUEST,
        })}
      />
    </div>
  );
}
