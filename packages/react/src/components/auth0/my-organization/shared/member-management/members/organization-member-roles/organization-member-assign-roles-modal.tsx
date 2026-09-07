/**
 * Modal for assigning roles to a member.
 * @module organization-member-assign-roles-modal
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
import {
  MAX_ROLES_PER_MEMBER,
  MAX_ROLES_PER_REQUEST,
} from '@/lib/constants/my-organization/member-management/member-management-constants';
import type { OrganizationMemberAssignRolesModalProps } from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders the assign roles dialog for selecting and assigning roles to a member.
 * @param props - Component props
 * @param props.classes - Custom CSS class overrides
 * @param props.style - CSS variables computed by the parent
 * @returns The rendered assign roles dialog element
 */
export function OrganizationMemberAssignRolesModal({
  isOpen,
  isLoading = false,
  isSearchingRoles = false,
  isLoadingRoles = false,
  availableRoles,
  assignedRoles,
  customMessages,
  selectedMember,
  classes,
  style,
  onClose,
  onAssign,
  onRoleSearch,
}: OrganizationMemberAssignRolesModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  const [currentQuery, setCurrentQuery] = React.useState('');
  const userId = selectedMember?.user_id ?? null;
  const memberRoles = selectedMember?.roles ?? assignedRoles ?? [];

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedRoles([]);
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

  const assignedRoleIds = React.useMemo(
    () => new Set(assignedRoles.map((r) => r.id)),
    [assignedRoles],
  );

  const unassignedRoles = React.useMemo(
    () => availableRoles.filter((r) => !assignedRoleIds.has(r.id)),
    [availableRoles, assignedRoleIds],
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setSelectedRoles([]);
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = React.useCallback(() => {
    if (selectedRoles.length > 0) {
      onAssign(selectedRoles, memberRoles, userId);
    }
  }, [selectedRoles, onAssign, memberRoles, userId]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        style={style}
        className={classes?.['OrganizationMemberAssignRolesModal-dialogContent']}
      >
        <DialogHeader>
          <DialogTitle className="mb-4">{t('member.detail.roles.assign_modal.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 w-full">
          {isLoadingRoles ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : (!onRoleSearch && unassignedRoles.length === 0) ||
            (availableRoles.length >= MAX_ROLES_PER_MEMBER &&
              unassignedRoles.length === 0 &&
              !currentQuery) ? (
            <p className="text-sm text-muted-foreground">
              {t('member.detail.roles.assign_modal.no_roles_available')}
            </p>
          ) : (
            <>
              <Label>{t('member.detail.roles.assign_modal.roles_label')}</Label>
              <Combobox
                multiple
                options={unassignedRoles.map((r) => ({ value: r.id, label: r.name }))}
                value={selectedRoles}
                onChange={(val) => setSelectedRoles(Array.isArray(val) ? val : [val])}
                onInputChange={handleRoleSearch}
                filterLocally={!onRoleSearch}
                placeholder={t('member.detail.roles.assign_modal.roles_placeholder')}
                noOptionsMessage={
                  onRoleSearch && unassignedRoles.length === 0
                    ? t('member.detail.roles.assign_modal.search_for_more')
                    : undefined
                }
                notFoundMessage={
                  currentQuery !== '' && availableRoles.length > 0 && unassignedRoles.length === 0
                    ? t('member.detail.roles.assign_modal.no_matching_roles')
                    : undefined
                }
                disabled={isLoading}
                showSelectedCount
                maxSelections={MAX_ROLES_PER_REQUEST}
                maxSelectionsMessage={t('member.detail.roles.assign_modal.max_selection_message')}
                loading={isSearchingRoles}
                loadingMessage={t('member.detail.roles.assign_modal.searching_message')}
                retainQueryOnSelect
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.detail.roles.assign_modal.cancel_button')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || selectedRoles.length === 0}>
            {t('member.detail.roles.assign_modal.submit_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
