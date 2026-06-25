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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

  const [copiedTooltipOpen, setCopiedTooltipOpen] = React.useState(false);

  const handleViewDetails = React.useCallback(() => {
    onViewDetails?.(invitation);
  }, [invitation, onViewDetails]);

  const handleCopyUrl = React.useCallback(() => {
    onCopyUrl?.(invitation);
    setCopiedTooltipOpen(true);
    setTimeout(() => setCopiedTooltipOpen(false), 1500);
  }, [invitation, onCopyUrl]);

  const handleRevokeAndResend = React.useCallback(() => {
    onRevokeAndResend?.(invitation);
  }, [invitation, onRevokeAndResend]);

  const handleRevoke = React.useCallback(() => {
    onRevoke?.(invitation);
  }, [invitation, onRevoke]);

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      <Tooltip open={copiedTooltipOpen}>
        <TooltipTrigger asChild>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t('invitation.actions.menu_label')}
                className="relative h-8 w-8 overflow-hidden rounded-xl border border-primary/35 bg-background shadow-button-outlined-resting transition-all duration-150 ease-in-out hover:bg-muted hover:shadow-button-outlined-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 theme-default:before:absolute theme-default:before:top-0 theme-default:before:left-0 theme-default:before:block theme-default:before:h-full theme-default:before:w-full theme-default:before:bg-gradient-to-t theme-default:before:from-primary/5 theme-default:before:to-primary/0 theme-default:before:content-[''] flex items-center justify-center"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="end">
                  {/* View Details - always available */}
                  <DropdownMenuItem onClick={handleViewDetails}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t('invitation.actions.view_details')}
                  </DropdownMenuItem>

                  {isPending && invitation.invitation_url && (
                    <DropdownMenuItem onClick={handleCopyUrl}>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('invitation.actions.copy_url')}
                    </DropdownMenuItem>
                  )}

                  {!readOnly && (
                    <>
                      <DropdownMenuItem onClick={handleRevokeAndResend}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        {t('invitation.actions.revoke_and_resend')}
                      </DropdownMenuItem>
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
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} className="z-[1000]">
          <span>{t('invitation.actions.copied')}</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
