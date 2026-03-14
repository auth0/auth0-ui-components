/**
 * Search and filter component for invitations.
 * @module search-filter
 * @internal
 */

import { X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { InvitationSearchFilterProps } from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Filter bar for invitation table.
 * Shows a right-aligned role filter dropdown with a reset button.
 * @param props - The component props.
 * @param props.filters - Current filter state.
 * @param props.availableRoles - Available roles for filtering.
 * @param props.customMessages - Custom translation messages.
 * @param props.className - Optional CSS class name.
 * @param props.onRoleFilterChange - Callback fired when role filter changes.
 * @returns The filter bar component.
 */
export function InvitationSearchFilter({
  filters,
  availableRoles = [],
  customMessages = {},
  className,
  onRoleFilterChange,
}: InvitationSearchFilterProps): React.JSX.Element | null {
  const { t } = useTranslator('member_management', customMessages);

  const handleRoleFilterChange = React.useCallback(
    (value: string) => {
      onRoleFilterChange?.(value === 'all' ? undefined : value);
    },
    [onRoleFilterChange],
  );

  const handleReset = React.useCallback(() => {
    onRoleFilterChange?.(undefined);
  }, [onRoleFilterChange]);

  const hasActiveFilter = !!filters?.roleId;

  if (availableRoles.length === 0) {
    return null;
  }

  return (
    <div className={className ?? 'mb-4 flex items-center justify-end gap-2'}>
      <Select value={filters?.roleId ?? 'all'} onValueChange={handleRoleFilterChange}>
        <SelectTrigger className="w-auto min-w-[180px]">
          <span className="text-muted-foreground mr-1">
            {t('invitation.table.filter_by_role')}:
          </span>
          <SelectValue placeholder={t('invitation.table.all_roles')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('invitation.table.all_roles')}</SelectItem>
          {availableRoles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleReset} disabled={!hasActiveFilter} className="gap-1">
        {t('invitation.table.reset_filter')}
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
