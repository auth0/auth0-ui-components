/**
 * Connection group table row actions dropdown.
 * @module organization-connection-group-table-actions-column
 * @internal
 */

import { MoreHorizontal, Eye, ShieldCheck } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationConnectionGroupTableActionsColumnProps } from '@/types/my-organization/connection-group/organization-connection-group-table-types';

/**
 * Renders the actions dropdown for a connection group row.
 *
 * Each item is gated by both a caller-provided handler and the relevant
 * permission. When no item is available the menu is not rendered.
 * @param props - Component props.
 * @param props.group - The group the actions apply to.
 * @param props.permissions - What the current user is allowed to do.
 * @param props.customMessages - Custom translation messages to override defaults.
 * @param props.onAssignRoles - Callback fired when the assign-roles action is triggered.
 * @param props.onViewDetails - Callback fired when the view-group action is triggered.
 * @returns JSX element, or `null` when no action is available.
 */
export function OrganizationConnectionGroupTableActionsColumn({
  group,
  permissions,
  customMessages = {},
  onAssignRoles,
  onViewDetails,
}: OrganizationConnectionGroupTableActionsColumnProps): React.JSX.Element | null {
  const { t } = useTranslator('connection_group_management', customMessages);

  const canViewDetails = !!onViewDetails;
  const canAssignRoles = permissions.canManageGroupRoles && !!onAssignRoles;

  const handleViewDetails = React.useCallback(() => {
    onViewDetails?.(group);
  }, [group, onViewDetails]);

  const handleAssignRoles = React.useCallback(() => {
    onAssignRoles?.(group);
  }, [group, onAssignRoles]);

  if (!canViewDetails && !canAssignRoles) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('table.actions.menu_label')}
          className="relative h-8 w-8 overflow-hidden rounded-xl border border-primary/35 bg-background shadow-button-outlined-resting transition-all duration-150 ease-in-out hover:bg-muted hover:shadow-button-outlined-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 theme-default:before:absolute theme-default:before:top-0 theme-default:before:left-0 theme-default:before:block theme-default:before:h-full theme-default:before:w-full theme-default:before:bg-gradient-to-t theme-default:before:from-primary/5 theme-default:before:to-primary/0 theme-default:before:content-[''] flex items-center justify-center"
        >
          <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end">
            {canViewDetails && (
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="mr-2 h-4 w-4" />
                {t('table.actions.view_details')}
              </DropdownMenuItem>
            )}

            {canAssignRoles && (
              <DropdownMenuItem onClick={handleAssignRoles}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {t('table.actions.assign_roles')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}
