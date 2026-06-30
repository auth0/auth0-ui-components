/**
 * Confirmation modal for removing a role from a member.
 * @module organization-member-remove-role-modal
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
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
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { OrganizationMemberRemoveRoleModalProps } from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders the remove role confirmation dialog.
 * @param props - Component props
 * @param props.styling - Custom styling configuration with variables and classes
 * @returns The rendered confirmation dialog element
 */
export function OrganizationMemberRemoveRoleModal({
  isOpen,
  isLoading = false,
  roles,
  memberName,
  customMessages,
  className,
  styling,
  onClose,
  onConfirm,
}: OrganizationMemberRemoveRoleModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );
  const isPlural = roles.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={currentStyles.variables}
        className={cn(
          className,
          currentStyles.classes?.['OrganizationMemberRemoveRoleModal-dialogContent'],
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {t(
              isPlural
                ? 'member.detail.roles.remove_confirm.title_plural'
                : 'member.detail.roles.remove_confirm.title',
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-2">
          <>
            {t.trans('member.detail.roles.remove_confirm.description', {
              vars: { roleName: roles.map((r) => r.name).join(', '), memberName },
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
