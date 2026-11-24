/**
 * Organization table row actions dropdown.
 * @module organization-table-actions-column
 * @internal
 */

import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { OrganizationTableActionsColumnProps } from '@/types/my-account/organization-management/organization-table-types';

/**
 * Row actions menu for an organization.
 * @param props - Component props.
 * @param props.organization - Organization for this row
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.onEdit - Callback fired when the edit action is selected
 * @param props.deleteState - Whether the delete action is available; shows it when set
 * @param props.onDelete - Callback fired when the delete action is selected
 * @returns JSX element, or `null` when no action is available
 */
export function OrganizationTableActionsColumn({
  organization,
  customMessages = {},
  onEdit,
  deleteState,
  onDelete,
}: OrganizationTableActionsColumnProps) {
  const { t } = useTranslator('organization_management.organization_table', customMessages);
  const { t: tCommon } = useTranslator('common', customMessages?.common);
  const deleteHintId = React.useId();

  if (!onEdit && !deleteState) {
    return null;
  }

  // An unavailable Delete stays focusable (aria-disabled, not disabled) so keyboard and screen reader
  // users reach the reason, and only its icon and label are dimmed so the reason stays readable.
  const isDeleteUnavailable = deleteState !== 'enabled' && deleteState !== 'switch_required';
  const deleteHint =
    deleteState === 'other_organization'
      ? t('table.actions.delete_other_organization_hint')
      : deleteState === 'forbidden'
        ? tCommon('error.forbidden')
        : undefined;

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label={t('table.actions.menu_label', {
            organizationName: organization.display_name || organization.name,
          })}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(organization)}>
              <PencilLine className="mr-2 h-4 w-4" />
              {t('table.actions.edit_button_text')}
            </DropdownMenuItem>
          )}
          {deleteState && (
            <DropdownMenuItem
              aria-disabled={isDeleteUnavailable || undefined}
              aria-describedby={deleteHint ? deleteHintId : undefined}
              onSelect={(event) => {
                if (isDeleteUnavailable) {
                  event.preventDefault();
                  return;
                }
                onDelete?.(organization);
              }}
              className={cn(
                'items-start text-destructive-foreground focus:text-destructive-foreground',
                isDeleteUnavailable && 'cursor-not-allowed',
              )}
            >
              <Trash2
                className={cn(
                  'mr-2 mt-0.5 h-4 w-4 shrink-0 text-destructive-foreground',
                  isDeleteUnavailable && 'opacity-50',
                )}
              />
              <span className="flex flex-col">
                <span className={cn(isDeleteUnavailable && 'opacity-50')}>
                  {t('table.actions.delete_button_text')}
                </span>
                {deleteHint && (
                  <span id={deleteHintId} className="max-w-56 text-xs text-muted-foreground">
                    {deleteHint}
                  </span>
                )}
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
