/**
 * Organization invitation table row actions dropdown.
 * @module organization-invitation-table-actions-column
 * @internal
 */

import { MoreHorizontal, Eye, Copy, RefreshCcw, Trash2 } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getInvitationStatus } from '@/lib/utils/my-organization/member-management/member-management-utils';
import type { OrganizationInvitationTableActionsColumnProps } from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * OrganizationInvitationTableActionsColumn Component
 * Handles the actions column for Invitation table with dropdown menu.
 * @param props - Component props.
 * @param props.invitation - The invitation to show actions for.
 * @param props.customMessages - Custom translation messages to override defaults.
 * @param props.readOnly - Whether the component is in read-only mode.
 * @param props.onViewDetails - Callback fired when view details action is triggered.
 * @param props.onCopyUrl - Callback fired when copy URL action is triggered.
 * @param props.onRevokeAndResend - Callback fired when revoke and resend action is triggered.
 * @param props.onRevoke - Callback fired when revoke action is triggered.
 * @returns JSX element.
 */
export function OrganizationInvitationTableActionsColumn({
  invitation,
  customMessages = {},
  readOnly = false,
  onViewDetails,
  onCopyUrl,
  onRevokeAndResend,
  onRevoke,
}: OrganizationInvitationTableActionsColumnProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const status = getInvitationStatus(invitation);
  const isPending = status === 'pending';

  const handleViewDetails = React.useCallback(() => {
    onViewDetails?.(invitation);
  }, [invitation, onViewDetails]);

  const handleCopyUrl = React.useCallback(() => {
    onCopyUrl?.(invitation);
  }, [invitation, onCopyUrl]);

  const handleRevokeAndResend = React.useCallback(() => {
    onRevokeAndResend?.(invitation);
  }, [invitation, onRevokeAndResend]);

  const handleRevoke = React.useCallback(() => {
    onRevoke?.(invitation);
  }, [invitation, onRevoke]);

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('invitation.actions.menu_label')}
          className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="sr-only">{t('invitation.actions.menu_label')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end">
            {/* View Details - always available */}
            <DropdownMenuItem onClick={handleViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              {t('invitation.actions.view_details')}
            </DropdownMenuItem>

            {/* Copy URL - only for pending invitations with URL */}
            {isPending && invitation.invitation_url && (
              <DropdownMenuItem onClick={handleCopyUrl}>
                <Copy className="mr-2 h-4 w-4" />
                {t('invitation.actions.copy_url')}
              </DropdownMenuItem>
            )}

            {!readOnly && (
              <DropdownMenuItem onClick={handleRevokeAndResend}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {t('invitation.actions.revoke_and_resend')}
              </DropdownMenuItem>
            )}

            {!readOnly && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleRevoke}
                  className="text-destructive-foreground focus:text-destructive-foreground"
                >
                  <Trash2 className="mr-2 h-4 w-4 text-destructive-foreground" />
                  {t('invitation.actions.revoke')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}
