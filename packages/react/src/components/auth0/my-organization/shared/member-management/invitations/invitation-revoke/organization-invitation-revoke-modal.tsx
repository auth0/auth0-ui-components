/**
 * Organization invitation revoke modal component.
 * @module organization-invitation-revoke-modal
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
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationInvitationRevokeModalProps } from '@/types/my-organization/member-management/organization-invitation-table-types';

export type { OrganizationInvitationRevokeModalProps };

/**
 * Modal for confirming invitation revocation or revoke and resend.
 * @param props - The component props.
 * @param props.invitation - The invitation to revoke.
 * @param props.isOpen - Whether the modal is open.
 * @param props.isLoading - Whether the action is in progress.
 * @param props.isRevokeAndResend - Whether this is a revoke and resend action.
 * @param props.customMessages - Custom translation messages.
 * @param props.onClose - Callback when modal is closed.
 * @param props.onConfirm - Callback when action is confirmed.
 * @param props.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationRevokeModal({
  invitation,
  isOpen,
  isLoading = false,
  isRevokeAndResend = false,
  customMessages = {},
  onClose,
  onConfirm,
  className,
}: OrganizationInvitationRevokeModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const namespace = isRevokeAndResend ? 'invitation.revoke_resend' : 'invitation.revoke';

  const handleConfirm = React.useCallback(() => {
    if (invitation) {
      onConfirm(invitation);
    }
  }, [invitation, onConfirm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{t(`${namespace}.title`)}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-2">
          <>
            {t.trans(`${namespace}.description`, {
              components: {
                bold: (children: string) => <strong key="email">{children}</strong>,
              },
              vars: { email: invitation?.invitee?.email ?? '' },
            })}
          </>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t(`${namespace}.cancel_button`)}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {t(`${namespace}.confirm_button`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
