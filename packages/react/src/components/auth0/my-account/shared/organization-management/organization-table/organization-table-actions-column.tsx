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
 * Row actions menu for an organization. Shows one item per provided callback.
 * @param props - Component props.
 * @param props.organization - Organization for this row
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.onEdit - Callback fired when the edit action is selected
 * @param props.onDelete - Callback fired when the delete action is selected
 * @returns JSX element, or `null` when no action is available
 */
export function OrganizationTableActionsColumn({
  organization,
  customMessages = {},
  onEdit,
  onDelete,
}: OrganizationTableActionsColumnProps) {
  const { t } = useTranslator('organization_management.organization_table', customMessages);

  if (!onEdit && !onDelete) {
    return null;
  }

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
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(organization)}
              className="text-destructive-foreground focus:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive-foreground" />
              {t('table.actions.delete_button_text')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
