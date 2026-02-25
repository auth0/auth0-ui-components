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
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  onClose: () => void;
  onRevoke: (invitation: Invitation) => void;
  className?: string;
}

/**
 * Modal for confirming invitation revocation.
 * @param root0 - The component props.
 * @param root0.invitation - The invitation to revoke.
 * @param root0.isOpen - Whether the modal is open.
 * @param root0.isLoading - Whether the form is loading.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.onClose - Callback when modal is closed.
 * @param root0.onRevoke - Callback when invitation is revoked.
 * @param root0.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationRevokeModal({
  invitation,
  isOpen,
  isLoading = false,
  customMessages = {},
  onClose,
  onRevoke,
  className,
}: OrganizationInvitationRevokeModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const handleRevoke = React.useCallback(() => {
    if (invitation) {
      onRevoke(invitation);
    }
  }, [invitation, onRevoke]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{t('invitation.revoke.title')}</DialogTitle>
          <DialogDescription>
            {t('invitation.revoke.description', { email: invitation?.invitee.email ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('invitation.revoke.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={handleRevoke} disabled={isLoading}>
            {isLoading ? 'Revoking...' : t('invitation.revoke.confirm_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
