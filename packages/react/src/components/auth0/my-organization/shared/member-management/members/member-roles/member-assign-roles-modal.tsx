/**
 * Modal for assigning roles to a member.
 * @module member-assign-roles-modal
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
import { useTranslator } from '@/hooks/shared/use-translator';
import type { MemberAssignRolesModalProps } from '@/types/my-organization/member-management/organization-member-detail-types';

export type { MemberAssignRolesModalProps };

/**
 * Renders the assign roles dialog for selecting and assigning roles to a member.
 * @param props - Component props
 * @returns The rendered assign roles dialog element
 */
export function MemberAssignRolesModal({
  isOpen,
  isLoading = false,
  availableRoles,
  assignedRoles,
  customMessages,
  onClose,
  onAssign,
}: MemberAssignRolesModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);

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
      onAssign(selectedRoles);
    }
  }, [selectedRoles, onAssign]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('member.detail.roles.assign_modal.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {unassignedRoles.length === 0 ? (
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
                placeholder={t('member.detail.roles.assign_modal.roles_placeholder')}
                disabled={isLoading}
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.detail.roles.assign_modal.cancel_button')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedRoles.length === 0 || unassignedRoles.length === 0}
          >
            {t('member.detail.roles.assign_modal.submit_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
