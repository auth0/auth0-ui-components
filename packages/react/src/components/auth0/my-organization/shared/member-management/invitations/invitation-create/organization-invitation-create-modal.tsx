/**
 * Organization invitation create modal component.
 * @module organization-invitation-create-modal
 */

import { X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  CreateInvitationInput,
  RoleOption,
  IdentityProviderOption,
  OrganizationInvitationTabMessages,
} from '@/types';

export interface OrganizationInvitationCreateModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  availableRoles?: RoleOption[];
  availableProviders?: IdentityProviderOption[];
  inviterName?: string;
  onClose: () => void;
  onCreate: (data: CreateInvitationInput) => void;
  className?: string;
}

/**
 * Validates an email address.
 * @param email - The email to validate.
 * @returns Whether the email is valid.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Modal for creating a new invitation.
 * Supports multiple email addresses, role selection, and provider selection.
 * @param root0 - The component props.
 * @param root0.isOpen - Whether the modal is open.
 * @param root0.isLoading - Whether the form is loading.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.availableRoles - Available roles for selection.
 * @param root0.availableProviders - Available identity providers.
 * @param root0.inviterName - Name of the person sending the invitation.
 * @param root0.onClose - Callback when modal is closed.
 * @param root0.onCreate - Callback when invitation is created.
 * @param root0.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationCreateModal({
  isOpen,
  isLoading = false,
  customMessages = {},
  availableRoles = [],
  availableProviders = [],
  inviterName,
  onClose,
  onCreate,
  className,
}: OrganizationInvitationCreateModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const [emailInput, setEmailInput] = React.useState('');
  const [emails, setEmails] = React.useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = React.useState<string | undefined>();
  const [emailError, setEmailError] = React.useState<string | undefined>();

  const handleEmailInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
    setEmailError(undefined);
  }, []);

  const handleEmailInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
        e.preventDefault();
        const trimmedEmail = emailInput.trim().replace(/,/g, '');

        if (trimmedEmail) {
          if (!isValidEmail(trimmedEmail)) {
            setEmailError('Please enter a valid email address');
            return;
          }

          if (emails.includes(trimmedEmail)) {
            setEmailError('This email has already been added');
            return;
          }

          setEmails((prev) => [...prev, trimmedEmail]);
          setEmailInput('');
          setEmailError(undefined);
        }
      }
    },
    [emailInput, emails],
  );

  const handleRemoveEmail = React.useCallback((emailToRemove: string) => {
    setEmails((prev) => prev.filter((email) => email !== emailToRemove));
  }, []);

  const handleRoleChange = React.useCallback((value: string) => {
    if (value === 'none') {
      setSelectedRoles([]);
    } else {
      setSelectedRoles((prev) => {
        if (prev.includes(value)) {
          return prev.filter((r) => r !== value);
        }
        return [...prev, value];
      });
    }
  }, []);

  const handleProviderChange = React.useCallback((value: string) => {
    setSelectedProvider(value === 'none' ? undefined : value);
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Add any remaining input to emails
      const finalEmails = [...emails];
      if (emailInput.trim()) {
        const trimmedEmail = emailInput.trim();
        if (isValidEmail(trimmedEmail) && !emails.includes(trimmedEmail)) {
          finalEmails.push(trimmedEmail);
        }
      }

      if (finalEmails.length === 0) {
        setEmailError('Please enter at least one email address');
        return;
      }

      // Create invitations for each email
      for (const email of finalEmails) {
        const invitationData: CreateInvitationInput = {
          invitee: { email },
          roles: selectedRoles.length > 0 ? selectedRoles : undefined,
          identity_provider_id: selectedProvider,
        };

        if (inviterName) {
          invitationData.inviter = { name: inviterName };
        }

        onCreate(invitationData);
      }
    },
    [emails, emailInput, selectedRoles, selectedProvider, inviterName, onCreate],
  );

  const handleClose = React.useCallback(() => {
    setEmailInput('');
    setEmails([]);
    setSelectedRoles([]);
    setSelectedProvider(undefined);
    setEmailError(undefined);
    onClose();
  }, [onClose]);

  const canSubmit = emails.length > 0 || (emailInput.trim() && isValidEmail(emailInput.trim()));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={className}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('invitation.create.title')}</DialogTitle>
            <DialogDescription>{t('invitation.create.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('invitation.create.email_label')}</Label>
              <TextField
                id="email"
                type="text"
                placeholder={t('invitation.create.email_placeholder')}
                value={emailInput}
                onChange={handleEmailInputChange}
                onKeyDown={handleEmailInputKeyDown}
                disabled={isLoading}
                error={!!emailError}
                helperText={emailError ?? t('invitation.create.email_helper')}
              />

              {/* Email Tags */}
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {emails.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1 pr-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="hover:bg-muted rounded p-0.5"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Roles Dropdown */}
            {availableRoles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="roles">{t('invitation.create.roles_label')}</Label>
                <Select
                  value={selectedRoles.length > 0 ? selectedRoles[0] : 'none'}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger id="roles">
                    <SelectValue placeholder={t('invitation.create.roles_placeholder')}>
                      {selectedRoles.length > 0
                        ? availableRoles
                            .filter((r) => selectedRoles.includes(r.id))
                            .map((r) => r.name)
                            .join(', ')
                        : t('invitation.create.roles_placeholder')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('invitation.create.roles_placeholder')}</SelectItem>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Role Tags */}
                {selectedRoles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRoles.map((roleId) => {
                      const role = availableRoles.find((r) => r.id === roleId);
                      return role ? (
                        <Badge
                          key={roleId}
                          variant="outline"
                          className="flex items-center gap-1 pr-1"
                        >
                          {role.name}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedRoles((prev) => prev.filter((r) => r !== roleId))
                            }
                            className="hover:bg-muted rounded p-0.5"
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Provider Dropdown */}
            {availableProviders.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="provider">{t('invitation.create.provider_label')}</Label>
                <Select value={selectedProvider ?? 'none'} onValueChange={handleProviderChange}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder={t('invitation.create.provider_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('invitation.create.provider_placeholder')}
                    </SelectItem>
                    {availableProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {t('invitation.create.cancel_button')}
            </Button>
            <Button type="submit" disabled={isLoading || !canSubmit}>
              {isLoading ? 'Creating...' : t('invitation.create.submit_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
