/**
 * Organization invitation details modal component.
 * @module organization-invitation-details-modal
 */

import { Copy, Check } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  Invitation,
  InvitationStatus,
  RoleOption,
  IdentityProviderOption,
  OrganizationInvitationTabMessages,
} from '@/types';

export interface OrganizationInvitationDetailsModalProps {
  invitation: Invitation | null;
  isOpen: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  availableRoles?: RoleOption[];
  availableProviders?: IdentityProviderOption[];
  readOnly?: boolean;
  onClose: () => void;
  onCopyUrl?: (invitation: Invitation) => void;
  onRevoke?: (invitation: Invitation) => void;
  onResend?: (invitation: Invitation) => void;
  className?: string;
}

/**
 * Determines the status of an invitation.
 * @param invitation - The invitation to check.
 * @returns The invitation status.
 */
function getInvitationStatus(invitation: Invitation): InvitationStatus {
  if (invitation.status) {
    return invitation.status;
  }

  if (invitation.expires_at) {
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return 'expired';
    }
  }

  return 'pending';
}

/**
 * Modal for viewing invitation details.
 * @param root0 - The component props.
 * @param root0.invitation - The invitation to display.
 * @param root0.isOpen - Whether the modal is open.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.availableRoles - Available roles for display.
 * @param root0.availableProviders - Available providers for display.
 * @param root0.readOnly - Whether in read-only mode.
 * @param root0.onClose - Callback when modal is closed.
 * @param root0.onCopyUrl - Callback when copy URL is clicked.
 * @param root0.onRevoke - Callback when revoke is clicked.
 * @param root0.onResend - Callback when resend is clicked.
 * @param root0.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationDetailsModal({
  invitation,
  isOpen,
  customMessages = {},
  availableRoles = [],
  availableProviders = [],
  readOnly = false,
  onClose,
  onCopyUrl,
  onRevoke,
  onResend,
  className,
}: OrganizationInvitationDetailsModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const [urlCopied, setUrlCopied] = React.useState(false);

  const status = invitation ? getInvitationStatus(invitation) : 'pending';
  const isPending = status === 'pending';

  // Get role and provider names
  const roleNames = React.useMemo(() => {
    if (!invitation?.roles || invitation.roles.length === 0) return [];
    return invitation.roles
      .map((roleId) => {
        const role = availableRoles.find((r) => r.id === roleId);
        return role?.name ?? roleId;
      })
      .filter(Boolean);
  }, [invitation?.roles, availableRoles]);

  const providerName = React.useMemo(() => {
    if (!invitation?.identity_provider_id) return null;
    const provider = availableProviders.find((p) => p.id === invitation.identity_provider_id);
    return provider?.name ?? invitation.identity_provider_id;
  }, [invitation?.identity_provider_id, availableProviders]);

  const handleCopyUrl = React.useCallback(() => {
    if (invitation) {
      onCopyUrl?.(invitation);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    }
  }, [invitation, onCopyUrl]);

  const handleRevoke = React.useCallback(() => {
    if (invitation) {
      onRevoke?.(invitation);
    }
  }, [invitation, onRevoke]);

  const handleResend = React.useCallback(() => {
    if (invitation) {
      onResend?.(invitation);
    }
  }, [invitation, onResend]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{t('invitation.details.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {t('invitation.details.email_label')}
            </Label>
            <p className="text-sm mt-1">{invitation?.invitee.email ?? '-'}</p>
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {t('invitation.details.status_label')}
            </Label>
            <div className="mt-1">
              <Badge variant={isPending ? 'warning' : 'destructive'} size="sm">
                {isPending
                  ? t('invitation.table.status_pending')
                  : t('invitation.table.status_expired')}
              </Badge>
            </div>
          </div>

          {/* Roles */}
          {roleNames.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('invitation.details.roles_label')}
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {roleNames.map((name, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Provider */}
          {providerName && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('invitation.details.provider_label')}
              </Label>
              <p className="text-sm mt-1">{providerName}</p>
            </div>
          )}

          {/* Created At */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {t('invitation.details.created_at_label')}
            </Label>
            <p className="text-sm mt-1">
              {invitation?.created_at ? new Date(invitation.created_at).toLocaleString() : '-'}
            </p>
          </div>

          {/* Expires At */}
          {invitation?.expires_at && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('invitation.details.expires_at_label')}
              </Label>
              <p className="text-sm mt-1">{new Date(invitation.expires_at).toLocaleString()}</p>
            </div>
          )}

          {/* Invited By */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              {t('invitation.details.invited_by_label')}
            </Label>
            <p className="text-sm mt-1">{invitation?.inviter.name ?? '-'}</p>
          </div>

          {/* Invitation URL */}
          {invitation?.invitation_url && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('invitation.details.invitation_url_label')}
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 text-xs bg-muted px-2 py-1 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                  {invitation.invitation_url}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  {urlCopied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-1">{t('invitation.details.copy_url_button')}</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!readOnly && isPending && (
            <>
              <Button variant="destructive" onClick={handleRevoke}>
                {t('invitation.details.revoke_button')}
              </Button>
              <Button variant="outline" onClick={handleResend}>
                {t('invitation.details.resend_button')}
              </Button>
            </>
          )}
          <Button onClick={onClose}>{t('invitation.details.close_button')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
