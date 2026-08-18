/**
 * Domain table row actions dropdown.
 * @module domain-table-actions-column
 * @internal
 */

import { MoreHorizontal, Trash2, PencilLine, Eye, RefreshCcw } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { DomainTableActionsColumnProps } from '@/types/my-organization/domain-management/domain-table-types';

/**
 * DomainTableActionsColumn Component
 * Handles the actions column for Domain table with dropdown menu
 * @param props - Component props.
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.permissions - What the current user is allowed to do
 * @param props.domain - Domain object or domain name
 * @param props.onView - Callback fired when view action is triggered
 * @param props.onConfigure - Callback fired when configure action is triggered
 * @param props.onVerify - Callback fired when verify action is triggered
 * @param props.onDelete - Callback fired when delete action is triggered
 * @returns JSX element, or `null` when no action is available
 */
export function DomainTableActionsColumn({
  customMessages = {},
  permissions,
  domain,
  onConfigure,
  onVerify,
  onDelete,
}: DomainTableActionsColumnProps) {
  const { t } = useTranslator('domain_management.domain_table', customMessages);

  const handleView = React.useCallback(() => {
    onConfigure(domain);
  }, [domain, onConfigure]);

  const handleConfigure = React.useCallback(() => {
    onConfigure(domain);
  }, [domain, onConfigure]);

  const handleVerify = React.useCallback(() => {
    onVerify(domain);
  }, [domain, onVerify]);

  const handleDelete = React.useCallback(() => {
    onDelete(domain);
  }, [domain, onDelete]);

  if (!permissions.canShowDomainMenu) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-xl bg-primary border border-primary/20 shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50">
          <MoreHorizontal className="h-4 w-4 text-primary-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {domain.status === 'verified' && permissions.canConfigureDomain && (
            <DropdownMenuItem onClick={handleConfigure}>
              <PencilLine className="mr-2 h-4 w-4" />
              {t('table.actions.configure_button_text')}
            </DropdownMenuItem>
          )}
          {domain.status === 'pending' && (
            <>
              {permissions.canConfigureDomain && (
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('table.actions.view_button_text')}
                </DropdownMenuItem>
              )}
              {permissions.canVerifyDomain && (
                <DropdownMenuItem onClick={handleVerify}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {t('table.actions.verify_button_text')}
                </DropdownMenuItem>
              )}
            </>
          )}
          {permissions.canDeleteDomain && (
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive-foreground focus:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive-foreground focus:text-destructive-foreground" />
              {t('table.actions.delete_button_text')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
