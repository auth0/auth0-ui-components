/**
 * Confirmation modal for removing a role from a member.
 * @module organization-member-remove-role-modal
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
import type { OrganizationMemberRemoveRoleModalProps } from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders the remove role confirmation dialog.
 * @param props - Component props
 * @returns The rendered confirmation dialog element
 */
export function OrganizationMemberRemoveRoleModal({
  isOpen,
  isLoading = false,
  role,
  customMessages,
  onClose,
  onConfirm,
}: OrganizationMemberRemoveRoleModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('member.detail.roles.remove_confirm.title')}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-2">
          <>
            {t.trans('member.detail.roles.remove_confirm.description', {
              vars: { roleName: role?.name ?? '' },
              components: { bold: (children: string) => <strong key="role">{children}</strong> },
            })}
          </>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.detail.roles.remove_confirm.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              t('member.detail.roles.remove_confirm.confirm_button')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
