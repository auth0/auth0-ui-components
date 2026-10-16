/**
 * Modal for assigning roles to a connection group.
 * @module organization-connection-group-assign-roles-modal
 * @internal
 */

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import { MAX_ROLES_PER_REQUEST } from '@/lib/constants/my-organization/member-management/member-management-constants';
import type { ConnectionGroupAssignRolesModalProps } from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

/**
 * Renders the assign roles dialog for selecting roles to grant to a connection group.
 * @param props - Component props
 * @param props.isOpen - Whether the dialog is open
 * @param props.isLoading - Whether the assign request is in flight
 * @param props.isSearchingRoles - Whether the available roles search is in flight
 * @param props.availableRoles - Roles that can be picked
 * @param props.assignedRoles - Roles already assigned; excluded from the options
 * @param props.customMessages - Custom i18n message overrides
 * @param props.classes - Custom CSS class overrides
 * @param props.style - CSS variables computed by the parent
 * @param props.onClose - Called when the dialog is dismissed
 * @param props.onAssign - Called with the selected role ids on submit
 * @param props.onRoleSearch - Optional server-side role search handler
 * @returns The rendered assign roles dialog element
 */
export function OrganizationConnectionGroupAssignRolesModal({
  isOpen,
  isLoading = false,
  isSearchingRoles = false,
  availableRoles,
  assignedRoles,
  customMessages,
  classes,
  style,
  onClose,
  onAssign,
  onRoleSearch,
}: ConnectionGroupAssignRolesModalProps): React.JSX.Element {
  const { t } = useTranslator('connection_group_management.detail', customMessages);
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);
  const [currentQuery, setCurrentQuery] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedRoleIds([]);
      setCurrentQuery('');
      onRoleSearch?.('');
    }
  }, [isOpen, onRoleSearch]);

  const handleRoleSearch = React.useCallback(
    (query: string) => {
      setCurrentQuery(query);
      onRoleSearch?.(query);
    },
    [onRoleSearch],
  );

  const unassignedRoles = React.useMemo(() => {
    const assignedIds = new Set(assignedRoles.map((r) => r.id));
    return availableRoles.filter((r) => !assignedIds.has(r.id));
  }, [availableRoles, assignedRoles]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setSelectedRoleIds([]);
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = React.useCallback(() => {
    if (selectedRoleIds.length > 0) {
      onAssign(selectedRoleIds);
    }
  }, [selectedRoleIds, onAssign]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        style={style}
        className={classes?.['ConnectionGroupAssignRolesModal-dialogContent']}
      >
        <DialogHeader>
          <DialogTitle className="mb-4">{t('assign_modal.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 w-full">
          {!onRoleSearch && unassignedRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('assign_modal.no_roles_available')}</p>
          ) : (
            <>
              <Label>{t('assign_modal.roles_label')}</Label>
              <Combobox
                multiple
                options={unassignedRoles.map((r) => ({ value: r.id, label: r.name }))}
                value={selectedRoleIds}
                onChange={(val) => setSelectedRoleIds(Array.isArray(val) ? val : [val])}
                onInputChange={handleRoleSearch}
                filterLocally={!onRoleSearch}
                placeholder={t('assign_modal.roles_placeholder')}
                noOptionsMessage={
                  onRoleSearch && unassignedRoles.length === 0
                    ? t('assign_modal.search_for_more')
                    : undefined
                }
                notFoundMessage={
                  currentQuery !== '' && availableRoles.length > 0 && unassignedRoles.length === 0
                    ? t('assign_modal.no_matching_roles')
                    : undefined
                }
                disabled={isLoading}
                showSelectedCount
                maxSelections={MAX_ROLES_PER_REQUEST}
                maxSelectionsMessage={t('assign_modal.max_selection_message', {
                  max: MAX_ROLES_PER_REQUEST,
                })}
                loading={isSearchingRoles}
                loadingMessage={t('assign_modal.searching_message')}
                retainQueryOnSelect
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('assign_modal.cancel_button')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || selectedRoleIds.length === 0}>
            {isLoading ? <Spinner size="sm" /> : t('assign_modal.submit_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
