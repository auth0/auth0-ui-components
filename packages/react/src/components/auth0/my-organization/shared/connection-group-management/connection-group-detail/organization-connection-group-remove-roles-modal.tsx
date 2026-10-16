/**
 * Confirmation modal for removing roles from a connection group.
 * @module organization-connection-group-remove-roles-modal
 * @internal
 */

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ConnectionGroupRemoveRolesModalProps } from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

/**
 * Renders the remove roles confirmation dialog, listing the roles to be removed.
 * @param props - Component props
 * @param props.isOpen - Whether the dialog is open
 * @param props.isLoading - Whether the remove request is in flight
 * @param props.roles - Roles that will be removed
 * @param props.groupName - Name of the group the roles are removed from
 * @param props.customMessages - Custom i18n message overrides
 * @param props.classes - Custom CSS class overrides
 * @param props.style - CSS variables computed by the parent
 * @param props.onClose - Called when the dialog is dismissed
 * @param props.onConfirm - Called when removal is confirmed
 * @returns The rendered confirmation dialog element
 */
export function OrganizationConnectionGroupRemoveRolesModal({
  isOpen,
  isLoading = false,
  roles,
  groupName = '',
  customMessages,
  classes,
  style,
  onClose,
  onConfirm,
}: ConnectionGroupRemoveRolesModalProps): React.JSX.Element {
  const { t } = useTranslator('connection_group_management.detail', customMessages);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={style}
        className={classes?.['ConnectionGroupRemoveRolesModal-dialogContent']}
      >
        <DialogHeader>
          <DialogTitle>{t('remove_modal.title')}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-2">
          <>
            {t.trans('remove_modal.description', {
              vars: { groupName },
              components: {
                groupBold: (children: string) => <strong key="group-name">{children}</strong>,
              },
            })}
          </>
        </DialogDescription>
        <ul className="list-disc pl-6 text-sm">
          {roles.map((role) => (
            <li key={role.id}>{role.name}</li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('remove_modal.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : t('remove_modal.confirm_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
