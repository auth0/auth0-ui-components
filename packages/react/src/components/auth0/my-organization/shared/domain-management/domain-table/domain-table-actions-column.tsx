import { MoreHorizontal, Trash2, PencilLine, Eye, RefreshCcw } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { DomainTableActionsColumnProps } from '@/types/my-organization/domain-management/domain-table-types';

/**
 * DomainTableActionsColumn Component
 * Handles the actions column for Domain table with dropdown menu
 */
export function DomainTableActionsColumn({
  customMessages = {},
  readOnly = false,
  domain,
  onView,
  onConfigure,
  onVerify,
  onDelete,
}: DomainTableActionsColumnProps) {
  const { t } = useTranslator('domain_management.domain_table', customMessages);

  const handleView = React.useCallback(() => {
    onConfigure(domain);
  }, [domain, onView]);

  const handleConfigure = React.useCallback(() => {
    onConfigure(domain);
  }, [domain, onConfigure]);

  const handleVerify = React.useCallback(() => {
    onVerify(domain);
  }, [domain, onVerify]);

  const handleDelete = React.useCallback(() => {
    onDelete(domain);
  }, [domain, onDelete]);

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end">
            {domain.status === 'verified' && (
              <DropdownMenuItem onClick={handleConfigure} disabled={readOnly}>
                <PencilLine className="mr-2 h-4 w-4" />
                {t('table.actions.configure_button_text')}
              </DropdownMenuItem>
            )}
            {domain.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={handleView} disabled={readOnly}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('table.actions.view_button_text')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleVerify} disabled={readOnly}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {t('table.actions.verify_button_text')}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive-foreground focus:text-destructive-foreground"
              disabled={readOnly}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive-foreground focus:text-destructive-foreground" />
              {t('table.actions.delete_button_text')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}
