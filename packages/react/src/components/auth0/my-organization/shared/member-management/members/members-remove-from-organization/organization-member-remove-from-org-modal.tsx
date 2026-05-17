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
import type { OrganizationMemberRemoveFromOrgModalProps } from '@/types/my-organization/member-management/organization-member-management-types';

/**
 * Renders the confirmation dialog for removing a member from the organization.
 * @param root0 - Component props
 * @returns The rendered confirmation dialog element
 */
export function OrganizationMemberRemoveFromOrgModal({
  member,
  isOpen,
  className,
  customMessages = {},
  isLoading = false,
  onClose,
  onConfirm,
}: OrganizationMemberRemoveFromOrgModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const handleConfirm = React.useCallback(() => {
    if (!member?.user_id) return;
    onConfirm(member.user_id);
  }, [member?.user_id, onConfirm]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>
            {t('member.remove_from_org_modal.title', {
              vars: { orgName: member?.name ?? '' },
            })}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-2">
          <>
            {t.trans('member.remove_from_org_modal.description', {
              vars: { memberName: member?.name ?? '' },
              components: { bold: (children: string) => <strong key="role">{children}</strong> },
            })}
          </>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.remove_from_org_modal.cancel_button')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !member?.user_id}
          >
            {isLoading ? '...' : t('member.remove_from_org_modal.remove_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
