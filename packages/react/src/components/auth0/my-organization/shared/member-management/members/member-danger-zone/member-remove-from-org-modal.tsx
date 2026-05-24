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
  memberName,
  memberUserId,
  orgName,
  customMessages,
  onClose,
  onConfirm,
  className,
}: MemberRemoveFromOrgModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const handleSubmit = React.useCallback(() => {
    onConfirm(memberUserId, memberName, orgName);
  }, [onConfirm, memberUserId, memberName, orgName]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle className="mb-9">
            {t('member.detail.actions.remove_from_org.modal.title', { orgName })}
          </DialogTitle>
          <DialogDescription>
            <>
              {t.trans('member.detail.actions.remove_from_org.modal.description', {
                components: {
                  bold: (children: string) => <strong key="memberName">{children}</strong>,
                },
                vars: { memberName },
              })}
            </>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.detail.actions.remove_from_org.modal.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              t('member.detail.actions.remove_from_org.modal.confirm_button')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
