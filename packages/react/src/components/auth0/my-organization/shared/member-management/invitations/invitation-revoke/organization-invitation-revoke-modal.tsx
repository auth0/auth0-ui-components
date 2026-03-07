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
import type { Invitation, OrganizationInvitationTabMessages } from '@/types';

export interface OrganizationInvitationRevokeModalProps {
  invitation: Invitation | null;
  isOpen: boolean;
  isLoading?: boolean;
  isRevokeAndResend?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  onClose: () => void;
  onConfirm: (invitation: Invitation) => void;
  className?: string;
}

/**
 * Modal for confirming invitation revocation or revoke and resend.
 * @param root0 - The component props.
 * @param root0.invitation - The invitation to revoke.
 * @param root0.isOpen - Whether the modal is open.
 * @param root0.isLoading - Whether the action is in progress.
 * @param root0.isRevokeAndResend - Whether this is a revoke and resend action.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.onClose - Callback when modal is closed.
 * @param root0.onConfirm - Callback when action is confirmed.
 * @param root0.className - Optional CSS class name.
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
          {t(`${namespace}.description`, { email: invitation?.invitee.email ?? '' })}
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
