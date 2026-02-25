/**
 * Organization invitation create modal component.
 * @module organization-invitation-create-modal
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
import type { CreateInvitationInput, OrganizationInvitationTabMessages } from '@/types';

export interface OrganizationInvitationCreateModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  onClose: () => void;
  onCreate: (data: CreateInvitationInput) => void;
  className?: string;
}

/**
 * Modal for creating a new invitation.
 * @param root0 - The component props.
 * @param root0.isOpen - Whether the modal is open.
 * @param root0.isLoading - Whether the form is loading.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.onClose - Callback when modal is closed.
 * @param root0.onCreate - Callback when invitation is created.
 * @param root0.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationCreateModal({
  isOpen,
  isLoading = false,
  customMessages = {},
  onClose,
  onCreate,
  className,
}: OrganizationInvitationCreateModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const [email, setEmail] = React.useState('');

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (email.trim()) {
        onCreate({ invitee: { email: email.trim() } });
        setEmail('');
      }
    },
    [email, onCreate],
  );

  const handleClose = React.useCallback(() => {
    setEmail('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={className}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('invitation.create.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="email" className="text-sm font-medium">
              {t('invitation.create.email_label')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t('invitation.create.email_placeholder')}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={isLoading}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {t('invitation.create.cancel_button')}
            </Button>
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? 'Creating...' : t('invitation.create.submit_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
