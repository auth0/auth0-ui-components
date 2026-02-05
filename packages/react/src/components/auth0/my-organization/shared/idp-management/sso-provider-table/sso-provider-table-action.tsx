import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoProviderTableActionsColumnProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

/**
 * SsoProviderTableActionsColumn Component
 * Handles the actions column for SSO Provider table with enable/disable toggle and dropdown menu
 */
export function SsoProviderTableActionsColumn({
  provider,
  shouldAllowDeletion,
  readOnly = false,
  isUpdating = false,
  isUpdatingId,
  customMessages = {},
  edit,
  onToggleEnabled,
  onEdit,
  onDelete,
  onRemoveFromOrganization,
}: SsoProviderTableActionsColumnProps) {
  const { t } = useTranslator('idp_management.sso_provider_table', customMessages);

  const handleToggleEnabled = React.useCallback(
    (checked: boolean) => {
      onToggleEnabled(provider, checked);
    },
    [provider, onToggleEnabled],
  );

  const handleEdit = React.useCallback(() => {
    onEdit(provider);
  }, [provider, onEdit]);

  const handleDelete = React.useCallback(() => {
    onDelete(provider);
  }, [provider, onDelete]);

  const handleRemoveFromOrganization = React.useCallback(() => {
    onRemoveFromOrganization(provider);
  }, [provider, onRemoveFromOrganization]);

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      {isUpdating && isUpdatingId === provider.id ? (
        <Spinner size="sm" className="m-auto" />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Switch
                checked={provider.is_enabled ?? false}
                onCheckedChange={handleToggleEnabled}
                disabled={readOnly || isUpdating}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {provider.is_enabled
              ? t('table.actions.enabled_tooltip')
              : t('table.actions.disabled_tooltip')}
          </TooltipContent>
        </Tooltip>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit} disabled={readOnly || !edit || edit.disabled}>
              <Edit className="mr-2 h-4 w-4" />
              {t('table.actions.edit_button_text')}
            </DropdownMenuItem>
            {shouldAllowDeletion && (
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive-foreground focus:text-destructive-foreground"
                disabled={readOnly}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('table.actions.delete_button_text')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleRemoveFromOrganization}
              className="text-destructive-foreground focus:text-destructive-foreground"
              disabled={readOnly}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('table.actions.remove_button_text')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}
