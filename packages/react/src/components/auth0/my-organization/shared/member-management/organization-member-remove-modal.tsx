/**
 * Organization member remove modal component.
 * @module organization-member-remove-modal
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
import type { Member, OrganizationMemberTabMessages } from '@/types';

export interface OrganizationMemberRemoveModalProps {
  member: Member | null;
  isOpen: boolean;
  isLoading?: boolean;
  customMessages?: Partial<OrganizationMemberTabMessages>;
  onClose: () => void;
  onRemove: (member: Member) => void;
  className?: string;
}

/**
 * Modal for confirming member removal.
 * @param root0 - The component props.
 * @param root0.member - The member to remove.
 * @param root0.isOpen - Whether the modal is open.
 * @param root0.isLoading - Whether the form is loading.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.onClose - Callback when modal is closed.
 * @param root0.onRemove - Callback when member is removed.
 * @param root0.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationMemberRemoveModal({
  member,
  isOpen,
  isLoading = false,
  customMessages = {},
  onClose,
  onRemove,
  className,
}: OrganizationMemberRemoveModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const handleRemove = React.useCallback(() => {
    if (member) {
      onRemove(member);
    }
  }, [member, onRemove]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{t('member.remove.title')}</DialogTitle>
          <DialogDescription>
            {t('member.remove.description', { name: member?.name ?? member?.email ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.remove.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={handleRemove} disabled={isLoading}>
            {isLoading ? 'Removing...' : t('member.remove.confirm_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
