/**
 * Confirmation modal for deleting a member (deletes the underlying user).
 * @module member-delete-modal
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
import type { OrganizationMemberDetailMessages } from '@/types/my-organization/member-management/organization-member-detail-types';

export interface MemberDeleteModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  customMessages?: OrganizationMemberDetailMessages;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Renders the delete member confirmation dialog.
 * @param root0 - Component props
 * @returns The rendered confirmation dialog element
 */
export function MemberDeleteModal({
  isOpen,
  isLoading = false,
  customMessages,
  onClose,
  onConfirm,
}: MemberDeleteModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('member.detail.danger_zone.delete_member.confirm_title')}</DialogTitle>
          <DialogDescription>
            {t('member.detail.danger_zone.delete_member.confirm_description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.detail.danger_zone.delete_member.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '...' : t('member.detail.danger_zone.delete_member.confirm_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
