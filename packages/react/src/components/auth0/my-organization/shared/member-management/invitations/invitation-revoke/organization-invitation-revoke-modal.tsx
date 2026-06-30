/**
 * Organization invitation revoke modal component.
 * @module organization-invitation-revoke-modal
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
import type { OrganizationInvitationRevokeModalProps } from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Modal for confirming invitation revocation or revoke and resend.
 * @param props - The component props.
 * @param props.invitation - The invitation to revoke.
 * @param props.isOpen - Whether the modal is open.
 * @param props.isLoading - Whether the action is in progress.
 * @param props.isRevokeAndResend - Whether this is a revoke and resend action.
 * @param props.customMessages - Custom translation messages.
 * @param props.onClose - Callback when modal is closed.
 * @param props.onConfirm - Callback when action is confirmed.
 * @param props.className - Optional CSS class name.
 * @param props.styling - Custom styling configuration with variables and classes.
 * @returns The modal component.
 */
export function OrganizationInvitationRevokeModal({
  invitation,
  isOpen,
  isLoading = false,
  isRevokeAndResend = false,
  customMessages = {},
  onClose,
  onConfirm,
  className,
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
}: OrganizationInvitationRevokeModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const namespace = isRevokeAndResend ? 'invitation.revoke_resend' : 'invitation.revoke';

  const handleConfirm = React.useCallback(() => {
    if (invitation) {
      onConfirm(invitation);
    }
  }, [invitation, onConfirm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        style={currentStyles.variables}
        className={cn(
          className,
          currentStyles.classes?.['OrganizationInvitationRevokeModal-dialogContent'],
        )}
      >
        <DialogHeader>
          <DialogTitle>{t(`${namespace}.title`)}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-2">
          <>
            {t.trans(`${namespace}.description`, {
              components: {
                bold: (children: string) => <strong key="email">{children}</strong>,
              },
              vars: { email: invitation?.invitee?.email ?? '' },
            })}
          </>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t(`${namespace}.cancel_button`)}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : null}
            {t(`${namespace}.confirm_button`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
