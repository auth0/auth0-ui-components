/**
 * Organization table row actions dropdown.
 * @module organization-table-actions-column
 * @internal
 */

import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/shared/use-translator';
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

  if (!onEdit && !deleteState) {
    return null;
  }

  // Disabled menu items ignore the pointer, so the reason is shown in the item instead of a tooltip.
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
              disabled={deleteState !== 'enabled'}
              onClick={() => onDelete?.(organization)}
              className="items-start text-destructive-foreground focus:text-destructive-foreground"
            >
              <Trash2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-destructive-foreground" />
              <span className="flex flex-col">
                {t('table.actions.delete_button_text')}
                {deleteHint && (
                  <span className="max-w-56 text-xs text-muted-foreground">{deleteHint}</span>
                )}
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
