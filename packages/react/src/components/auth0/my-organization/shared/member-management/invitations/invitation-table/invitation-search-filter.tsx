/**
 * Search and filter component for invitations.
 * @module invitation-search-filter
 * @internal
 */

import { Search } from 'lucide-react';
import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { InvitationSearchFilterProps } from '@/types';

/**
 * Search and filter component for invitation table.
 * @param props - The component props.
 * @param props.filters - Current filter state.
 * @param props.availableRoles - Available roles for filtering.
 * @param props.customMessages - Custom translation messages.
 * @param props.className - Optional CSS class name.
 * @param props.onSearchChange - Callback fired when search query changes.
 * @param props.onRoleFilterChange - Callback fired when role filter changes.
 * @returns The search filter component.
 */
export function InvitationSearchFilter({
  filters,
  availableRoles = [],
  customMessages = {},
  className,
  onSearchChange,
  onRoleFilterChange,
}: InvitationSearchFilterProps): React.JSX.Element | null {
  const { t } = useTranslator('member_management', customMessages);
  const [localSearchQuery, setLocalSearchQuery] = React.useState(filters?.searchQuery ?? '');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearchQuery !== filters?.searchQuery) {
        onSearchChange(localSearchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearchChange, filters?.searchQuery]);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  }, []);

  const handleRoleFilterChange = React.useCallback(
    (value: string) => {
      onRoleFilterChange?.(value === 'all' ? undefined : value);
    },
    [onRoleFilterChange],
  );

  const showSearch = !!onSearchChange;
  const showRoleFilter = availableRoles.length > 0;

  if (!showSearch && !showRoleFilter) {
    return null;
  }

  return (
    <div className={className ?? 'mb-4 flex flex-wrap items-center gap-4'}>
      {showSearch && (
        <div className="flex-1 min-w-[200px] max-w-[300px]">
          <TextField
            type="text"
            placeholder={t('invitation.table.search_placeholder')}
            value={localSearchQuery}
            onChange={handleSearchChange}
            startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}

      {showRoleFilter && (
        <div className="w-[200px]">
          <Select value={filters?.roleId ?? 'all'} onValueChange={handleRoleFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('invitation.table.filter_by_role')} />
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
        </div>
      )}
    </div>
  );
}
