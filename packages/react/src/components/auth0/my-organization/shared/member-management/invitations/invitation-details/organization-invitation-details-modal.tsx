/**
 * Organization invitation details modal component.
 * @module organization-invitation-details-modal
 */

import { Link, Copy, Check } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { TextFieldGroup } from '@/components/ui/text-field-group';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getInvitationStatus } from '@/lib/utils/my-organization/member-management/member-management-utils';
import type {
  InvitationStatus,
  OrganizationInvitationDetailsModalProps,
} from '@/types/my-organization/member-management/organization-invitation-table-types';

/**
 * Returns the badge variant for a given invitation status.
 * @param status - The invitation status.
 * @returns The badge variant string.
 */
function getStatusBadgeVariant(status: InvitationStatus): 'warning' | 'destructive' {
  return status === 'pending' ? 'warning' : 'destructive';
}

/**
 * Modal for viewing invitation details with revoke and resend actions.
 * @param props - The component props.
 * @param props.invitation - The invitation to display.
 * @param props.isOpen - Whether the modal is open.
 * @param props.isRevoking - Whether a revoke action is in progress.
 * @param props.isResending - Whether a resend action is in progress.
 * @param props.customMessages - Custom translation messages.
 * @param props.availableRoles - Available roles for display.
 * @param props.availableProviders - Available providers for display.
 * @param props.readOnly - Whether in read-only mode.
 * @param props.onClose - Callback when modal is closed.
 * @param props.onCopyUrl - Callback when copy URL is clicked.
 * @param props.onRevoke - Callback when revoke is clicked.
 * @param props.onResend - Callback when revoke and resend is clicked.
 * @param props.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationDetailsModal({
  invitation,
  isOpen,
  isRevoking = false,
  isResending = false,
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

  const status = invitation ? getInvitationStatus(invitation) : 'pending';
  const isPending = status === 'pending';
  const isActionInProgress = isRevoking || isResending;

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

  const [copied, setCopied] = React.useState(false);
  const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (isOpen) setCopied(false);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  }, [isOpen]);

  const handleCopyUrlClick = React.useCallback(() => {
    if (invitation) {
      onCopyUrl?.(invitation);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 3000);
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
          <div className="flex items-center gap-2">
            <DialogTitle>{t('invitation.details.title')}</DialogTitle>
            <Badge variant={getStatusBadgeVariant(status)} size="sm">
              {isPending
                ? t('invitation.table.status_pending')
                : t('invitation.table.status_expired')}
            </Badge>
          </div>
          <DialogDescription className="sr-only">{t('invitation.details.title')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t('invitation.details.email_label')}
            </Label>
            <TextField value={invitation?.invitee?.email ?? '-'} readOnly />
          </div>

          {/* Created At */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t('invitation.details.created_at_label')}
            </Label>
            <TextField
              value={
                invitation?.created_at ? new Date(invitation.created_at).toLocaleString() : '-'
              }
              readOnly
            />
          </div>

          {/* Expires At */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t('invitation.details.expires_at_label')}
            </Label>
            <TextField
              value={
                invitation?.expires_at ? new Date(invitation.expires_at).toLocaleString() : '-'
              }
              readOnly
            />
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t('invitation.details.roles_label')}
            </Label>
            {roleNames.length > 0 ? (
              <TextFieldGroup
                chips={roleNames.map((name) => ({ label: name, value: name }))}
                summarizeChips={false}
                disabled
                readOnly
              />
            ) : (
              <TextField value="-" readOnly />
            )}
          </div>

          {/* Invitation URL */}
          {invitation?.invitation_url && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {t('invitation.details.invitation_url_label')}
              </Label>
              <TextField
                value={invitation.invitation_url}
                readOnly
                startAdornment={<Link className="h-4 w-4 text-muted-foreground" />}
                endAdornment={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopyUrlClick}
                    aria-label={
                      copied
                        ? t('invitation.details.copied')
                        : t('invitation.details.copy_url_button')
                    }
                  >
                    {copied ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                }
              />
            </div>
          )}

          {/* Revoke / Resend Actions (inline, below invitation URL) */}
          {!readOnly && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleResend} disabled={isActionInProgress}>
                {isResending ? <Spinner size="sm" /> : null}
                {t('invitation.details.resend_button')}
              </Button>
              <Button variant="destructive" onClick={handleRevoke} disabled={isActionInProgress}>
                {isRevoking ? <Spinner size="sm" /> : null}
                {t('invitation.details.revoke_button')}
              </Button>
            </div>
          )}

          {/* Invited By */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t('invitation.details.invited_by_label')}
            </Label>
            <TextField value={invitation?.inviter?.name ?? '-'} readOnly />
          </div>

          {/* Identity Provider */}
          {providerName && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {t('invitation.details.provider_label')}
              </Label>
              <TextField value={providerName} readOnly />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>{t('invitation.details.close_button')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
