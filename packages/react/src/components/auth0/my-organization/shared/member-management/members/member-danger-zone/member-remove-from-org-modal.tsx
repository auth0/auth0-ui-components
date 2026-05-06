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
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { MemberRemoveFromOrgModalProps } from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders the remove from organization confirmation dialog.
 * @param props - Component props
 * @returns The rendered confirmation dialog element
 */
export function MemberRemoveFromOrgModal({
  isOpen,
  isLoading = false,
  customMessages,
  onClose,
  onConfirm,
}: MemberRemoveFromOrgModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

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
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              t('member.detail.danger_zone.remove_from_org.confirm_button')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
