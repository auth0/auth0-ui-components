/**
 * Confirmation modal for removing a member from the organization.
 * @module member-remove-from-organization-modal
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
import type { MemberRemoveFromOrganizationModalProps } from '@/types/my-organization/member-management/organization-member-detail-types';
import { cn } from '@/lib/utils';
/**
 * Renders the remove from organization confirmation dialog.
 * @param props - Component props
 * @param props.styling - Custom styling configuration with variables and classes
 * @returns The rendered confirmation dialog element
 */
export function MemberRemoveFromOrganizationModal({
  isOpen,
  isLoading = false,
  memberName,
  memberUserId,
  organizationName,
  className,
  customMessages,
  styling,
  onClose,
  onConfirm,
}: MemberRemoveFromOrganizationModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleSubmit = React.useCallback(() => {
    onConfirm(memberUserId, memberName, organizationName);
  }, [onConfirm, memberUserId, memberName, organizationName]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={currentStyles.variables}
        className={cn(className, currentStyles.classes?.['MemberRemoveFromOrgModal-dialogContent'])}
      >
        <DialogHeader>
          <DialogTitle className="mb-4">
            {t('member.detail.actions.remove_from_organization.modal.title', { organizationName })}
          </DialogTitle>
          <DialogDescription>
            <>
              {t.trans('member.detail.actions.remove_from_organization.modal.description', {
                components: {
                  bold: (children: string) => <strong key="memberName">{children}</strong>,
                },
                vars: { memberName },
              })}
            </>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('member.detail.actions.remove_from_organization.modal.cancel_button')}
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              t('member.detail.actions.remove_from_organization.modal.confirm_button')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
