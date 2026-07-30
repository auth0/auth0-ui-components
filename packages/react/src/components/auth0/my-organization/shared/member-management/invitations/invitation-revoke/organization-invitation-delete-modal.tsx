/**
 * Organization invitation bulk delete modal component.
 * @module organization-invitation-delete-modal
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
import type { OrganizationInvitationDeleteModalProps } from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Modal for confirming bulk deletion of selected invitations.
 * @param props - The component props.
 * @param props.invitations - The invitations to delete.
 * @param props.isOpen - Whether the modal is open.
 * @param props.isLoading - Whether the action is in progress.
 * @param props.customMessages - Custom translation messages.
 * @param props.onClose - Callback when modal is closed.
 * @param props.onConfirm - Callback when deletion is confirmed.
 * @param props.style - CSS variables computed by the parent.
 * @param props.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationDeleteModal({
  invitations,
  isOpen,
  isLoading = false,
  customMessages = {},
  onClose,
  onConfirm,
  style,
  className,
}: OrganizationInvitationDeleteModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const count = invitations.length;
  const isPlural = count > 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent style={style} className={className}>
        <DialogHeader>
          <DialogTitle>
            {t(
              isPlural
                ? 'invitation.bulk_revoke.confirm.title_plural'
                : 'invitation.bulk_revoke.confirm.title',
              { count },
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-2">
          {t(
            isPlural
              ? 'invitation.bulk_revoke.confirm.description_plural'
              : 'invitation.bulk_revoke.confirm.description',
            { count, email: invitations[0]?.invitee?.email ?? '' },
          )}
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('invitation.bulk_revoke.confirm.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : null}
            {t(
              isPlural
                ? 'invitation.bulk_revoke.confirm.confirm_button_plural'
                : 'invitation.bulk_revoke.confirm.confirm_button',
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
