/**
 * Organization invitation create modal component.
 * @module organization-invitation-create-modal
 */

import { X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import type { ComboboxOption } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
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

const MAX_EMAILS = 10;

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
 * Modal for creating new invitations.
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

  const roleOptions: ComboboxOption[] = React.useMemo(
    () => availableRoles.map((role) => ({ label: role.name, value: role.id })),
    [availableRoles],
  );

  const addEmail = React.useCallback(
    (raw: string) => {
      const trimmed = raw.trim().replace(/,/g, '');
      if (!trimmed) return;

      if (!isValidEmail(trimmed)) {
        setEmailError(t('invitation.create.email_invalid_error'));
        return;
      }
      if (emails.includes(trimmed)) {
        setEmailError(t('invitation.create.email_duplicate_error'));
        return;
      }
      if (emails.length >= MAX_EMAILS) {
        setEmailError(t('invitation.create.email_limit_error'));
        return;
      }

      setEmails((prev) => [...prev, trimmed]);
      setEmailInput('');
      setEmailError(undefined);
    },
    [emails, t],
  );

  const handleEmailInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
    setEmailError(undefined);
  }, []);

  const handleEmailInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
        e.preventDefault();
        addEmail(emailInput);
      }
      if (e.key === 'Backspace' && !emailInput && emails.length > 0) {
        setEmails((prev) => prev.slice(0, -1));
      }
    },
    [emailInput, emails, addEmail],
  );

  const handleRemoveEmail = React.useCallback((emailToRemove: string) => {
    setEmails((prev) => prev.filter((e) => e !== emailToRemove));
  }, []);

  const handleProviderChange = React.useCallback((value: string) => {
    setSelectedProvider(value === 'none' ? undefined : value);
  }, []);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const finalEmails = [...emails];
      if (emailInput.trim()) {
        const trimmed = emailInput.trim();
        if (isValidEmail(trimmed) && !emails.includes(trimmed)) {
          finalEmails.push(trimmed);
        }
      }

      if (finalEmails.length === 0) {
        setEmailError(t('invitation.create.email_required_error'));
        return;
      }

      for (const email of finalEmails) {
        const data: CreateInvitationInput = {
          invitee: { email },
          roles: selectedRoles.length > 0 ? selectedRoles : undefined,
          identity_provider_id: selectedProvider,
        };
        if (inviterName) {
          data.inviter = { name: inviterName };
        }
        onCreate(data);
      }
    },
    [emails, emailInput, selectedRoles, selectedProvider, inviterName, onCreate, t],
  );

  const handleClose = React.useCallback(() => {
    setEmailInput('');
    setEmails([]);
    setSelectedRoles([]);
    setSelectedProvider(undefined);
    setEmailError(undefined);
    onClose();
  }, [onClose]);

  const canSubmit =
    emails.length > 0 || (emailInput.trim() !== '' && isValidEmail(emailInput.trim()));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={className}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('invitation.create.title')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {t('invitation.create.email_label')}
                <span className="text-destructive">*</span>
              </Label>
              <TextField
                id="email"
                value={emailInput}
                onChange={handleEmailInputChange}
                onKeyDown={handleEmailInputKeyDown}
                placeholder={emails.length === 0 ? t('invitation.create.email_placeholder') : ''}
                disabled={isLoading || emails.length >= MAX_EMAILS}
                error={!!emailError}
                helperText={emailError ?? t('invitation.create.email_helper')}
                startAdornment={
                  emails.length > 0 ? (
                    <div className="flex flex-wrap gap-1 py-0.5">
                      {emails.map((email) => (
                        <Badge key={email} variant="secondary" size="sm" className="gap-1">
                          {email}
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            className="hover:bg-muted rounded-full p-0.5"
                            disabled={isLoading}
                            aria-label={`Remove ${email}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : undefined
                }
                className={emails.length > 0 ? 'h-auto min-h-10 flex-wrap py-0.5 pl-1.5' : ''}
              />
            </div>

            {availableRoles.length > 0 && (
              <div className="space-y-2">
                <Label>{t('invitation.create.roles_label')}</Label>
                <Combobox
                  value={selectedRoles}
                  onChange={(val) => setSelectedRoles(Array.isArray(val) ? val : [val])}
                  options={roleOptions}
                  multiple
                  placeholder={t('invitation.create.roles_placeholder')}
                  disabled={isLoading}
                />
              </div>
            )}

            {availableProviders.length > 0 && (
              <div className="space-y-2">
                <Label>{t('invitation.create.provider_label')}</Label>
                <Select value={selectedProvider ?? 'none'} onValueChange={handleProviderChange}>
                  <SelectTrigger>
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
                <p className="text-xs text-muted-foreground">
                  {t('invitation.create.provider_helper')}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {t('invitation.create.cancel_button')}
            </Button>
            <Button type="submit" disabled={isLoading || !canSubmit}>
              {t('invitation.create.submit_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
