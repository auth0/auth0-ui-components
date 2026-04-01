/**
 * Confirmation modal for removing a member from the organization.
 * @module member-remove-from-org-modal
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
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationMemberDetailMessages } from '@/types/my-organization/member-management/organization-member-detail-types';

export interface MemberRemoveFromOrgModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  customMessages?: OrganizationMemberDetailMessages;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Renders the remove from organization confirmation dialog.
 * @param root0 - Component props
 * @returns The rendered confirmation dialog element
 */
export function MemberRemoveFromOrgModal({
  isOpen,
  isLoading = false,
  customMessages,
  onClose,
  onConfirm,
}: MemberRemoveFromOrgModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('member.detail.danger_zone.remove_from_org.confirm_title')}</DialogTitle>
          <DialogDescription>
            {t('member.detail.danger_zone.remove_from_org.confirm_description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.detail.danger_zone.remove_from_org.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '...' : t('member.detail.danger_zone.remove_from_org.confirm_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
