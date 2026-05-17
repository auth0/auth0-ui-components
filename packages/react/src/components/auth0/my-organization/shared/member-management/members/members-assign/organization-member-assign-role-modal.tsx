/**
 * Modal for assigning roles to a member.
 * @module member-assign-roles-modal
 * @internal
 */

// import type { OrgMemberRole } from '@auth0/universal-components-core';
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
import type { OrganizationMemberAssignRoleModalProps } from '@/types/my-organization/member-management/organization-member-management-types';

/**
 * Renders the assign roles dialog for selecting and assigning roles to a member.
 * @param root0 - Component props
 * @returns The rendered assign roles dialog element
 */
export function OrganizationMemberAssignRolesModal({
  member,
  isOpen,
  isLoading = false,
  availableRoles,
  assignedRoles,
  className,
  customMessages = {},
  onClose,
  onAssign,
}: OrganizationMemberAssignRoleModalProps): React.JSX.Element {
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
    if (selectedRoles.length > 0 && member) {
      onAssign(member.user_id ?? '', selectedRoles);
    }
  }, [selectedRoles, onAssign]);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedRoles([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{t('member.assign_role_modal.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {unassignedRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('member.assign_role_modal.no_roles_available')}
            </p>
          ) : (
            <>
              <Label>{t('member.assign_role_modal.roles_label')}</Label>
              <Combobox
                multiple
                options={unassignedRoles.map((r) => ({ value: r.id, label: r.name }))}
                value={selectedRoles}
                onChange={(val) => setSelectedRoles(Array.isArray(val) ? val : [val])}
                placeholder={t('member.assign_role_modal.roles_placeholder')}
                disabled={isLoading}
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.assign_role_modal.cancel_button')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedRoles.length === 0 || unassignedRoles.length === 0}
          >
            {t('member.assign_role_modal.submit_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
