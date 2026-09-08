/**
 * Organization member table row actions dropdown.
 * @module organization-member-table-actions-column
 * @internal
 */

import { MoreHorizontal, Eye, UserRoundCheck, Trash2 } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationMemberTableActionsColumnProps } from '@/types/my-organization/member-management/organization-member-table-types';

/**
 * OrganizationMemberTableActionsColumn Component
 * Handles the actions column for Member table with dropdown menu.
 * @param props - Component props.
 * @param props.member - The member to show actions for.
 * @param props.customMessages - Custom translation messages to override defaults.
 * @param props.onAssignRole - Callback fired when assign role action is triggered.
 * @param props.onRemoveFromOrganization - Callback fired when remove from organization action is triggered.
 * @returns JSX element.
 */
export function OrganizationMemberTableActionsColumn({
  member,
  customMessages = {},
  onViewDetails,
  onAssignRole,
  onRemoveFromOrganization,
}: OrganizationMemberTableActionsColumnProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const handleViewDetails = React.useCallback(() => {
    onViewDetails?.({ userId: member?.user_id ?? '' });
  }, [member, onViewDetails]);

  const handleAssignRole = React.useCallback(() => {
    onAssignRole?.(member);
  }, [member, onAssignRole]);

  const handleRemoveFromOrganization = React.useCallback(() => {
    onRemoveFromOrganization?.(member);
  }, [member, onRemoveFromOrganization]);

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('member.actions.menu_label')}
          className="relative h-8 w-8 overflow-hidden rounded-xl border border-primary/35 bg-background shadow-button-outlined-resting transition-all duration-150 ease-in-out hover:bg-muted hover:shadow-button-outlined-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 theme-default:before:absolute theme-default:before:top-0 theme-default:before:left-0 theme-default:before:block theme-default:before:h-full theme-default:before:w-full theme-default:before:bg-gradient-to-t theme-default:before:from-primary/5 theme-default:before:to-primary/0 theme-default:before:content-[''] flex items-center justify-center"
        >
          <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="sr-only">{t('member.actions.menu_label')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              {t('member.actions.view_details')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAssignRole}>
              <UserRoundCheck className="mr-2 h-4 w-4" />
              {t('member.actions.assign_role')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleRemoveFromOrganization}
              className="text-destructive-foreground focus:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive-foreground" />
              {t('member.actions.remove_from_organization')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}
