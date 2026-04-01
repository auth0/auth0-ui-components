/**
 * Confirmation modal for removing a role from a member.
 * @module member-remove-role-modal
 * @internal
 */

import type { OrgMemberRole } from '@auth0/universal-components-core';
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

export interface MemberRemoveRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  role: OrgMemberRole | null;
  customMessages?: OrganizationMemberDetailMessages;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Renders the remove role confirmation dialog.
 * @param root0 - Component props
 * @returns The rendered confirmation dialog element
 */
export function MemberRemoveRoleModal({
  isOpen,
  isLoading = false,
  role,
  customMessages,
  onClose,
  onConfirm,
}: MemberRemoveRoleModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);

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
            {isLoading ? '...' : t('member.detail.roles.remove_confirm.confirm_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
