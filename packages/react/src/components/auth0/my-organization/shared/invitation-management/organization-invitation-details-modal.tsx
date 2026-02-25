/**
 * Organization invitation details modal component.
 * @module organization-invitation-details-modal
 */

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { Invitation, OrganizationInvitationTabMessages } from '@/types';

export interface OrganizationInvitationDetailsModalProps {
  invitation: Invitation | null;
  isOpen: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  onClose: () => void;
  className?: string;
}

/**
 * Modal for viewing invitation details.
 * @param root0 - The component props.
 * @param root0.invitation - The invitation to display.
 * @param root0.isOpen - Whether the modal is open.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.onClose - Callback when modal is closed.
 * @param root0.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationDetailsModal({
  invitation,
  isOpen,
  customMessages = {},
  onClose,
  className,
}: OrganizationInvitationDetailsModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{t('invitation.details.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <span className="text-sm font-medium">Email:</span>
            <p className="text-sm text-muted-foreground">{invitation?.invitee.email ?? '-'}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Invited by:</span>
            <p className="text-sm text-muted-foreground">{invitation?.inviter.name ?? '-'}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Created:</span>
            <p className="text-sm text-muted-foreground">
              {invitation?.created_at ? new Date(invitation.created_at).toLocaleString() : '-'}
            </p>
          </div>
          {invitation?.expires_at && (
            <div>
              <span className="text-sm font-medium">Expires:</span>
              <p className="text-sm text-muted-foreground">
                {new Date(invitation.expires_at).toLocaleString()}
              </p>
            </div>
          )}
          {invitation?.roles && invitation.roles.length > 0 && (
            <div>
              <span className="text-sm font-medium">Roles:</span>
              <p className="text-sm text-muted-foreground">{invitation.roles.join(', ')}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>{t('invitation.details.close_button')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
