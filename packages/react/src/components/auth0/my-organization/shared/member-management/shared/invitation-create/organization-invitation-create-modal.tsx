/**
 * Organization invitation create modal component.
 * @module organization-invitation-create-modal
 */

import {
  createInvitationCreateSchema,
  type InvitationCreateSchemas,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
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
import { TextFieldGroup } from '@/components/ui/text-field-group';
import type { ChipItem } from '@/components/ui/text-field-group';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  CreateInvitationInput,
  RoleOption,
  IdentityProviderOption,
  OrganizationInvitationTabMessages,
} from '@/types/my-organization/member-management/organization-invitation-table-types';

export interface OrganizationInvitationCreateModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  customMessages?: Partial<OrganizationInvitationTabMessages>;
  availableRoles?: RoleOption[];
  availableProviders?: IdentityProviderOption[];
  inviterName?: string;
  schema?: InvitationCreateSchemas;
  onClose: () => void;
  onCreate: (data: CreateInvitationInput) => void;
  className?: string;
}

/**
 * Modal for creating a new invitation.
 * Supports multiple email addresses, role selection, and provider selection.
 * Validation rules can be overridden via the `schema` prop.
 *
 * @param props - The component props.
 * @param props.isOpen - Whether the modal is open.
 * @param props.isLoading - Whether the form is loading.
 * @param props.customMessages - Custom translation messages.
 * @param props.availableRoles - Available roles for selection.
 * @param props.availableProviders - Available identity providers.
 * @param props.inviterName - Name of the person sending the invitation.
 * @param props.schema - Schema overrides for validation (email regex, maxEmails, error messages).
 * @param props.onClose - Callback when modal is closed.
 * @param props.onCreate - Callback when invitation is created.
 * @param props.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationCreateModal({
  isOpen,
  isLoading = false,
  customMessages = {},
  availableRoles = [],
  availableProviders = [],
  inviterName,
  schema,
  onClose,
  onCreate,
  className,
}: OrganizationInvitationCreateModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const validationConfig = React.useMemo(
    () => createInvitationCreateSchema(schema, t('invitation.create.email_invalid_error')),
    [schema, t],
  );

  const [emailInput, setEmailInput] = React.useState('');
  const [emailChips, setEmailChips] = React.useState<ChipItem[]>([]);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = React.useState<string | undefined>();
  const [emailError, setEmailError] = React.useState<string | undefined>();

  const handleEmailInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
    setEmailError(undefined);
  }, []);

  const handleEmailChipAdd = React.useCallback(
    (value: string) => {
      const trimmedEmail = value.trim().replace(/,/g, '');

      if (!trimmedEmail) return;

      if (emailChips.length >= validationConfig.maxEmails) {
        setEmailError(t('invitation.create.email_limit_error'));
        return;
      }

      const result = validationConfig.emailSchema.safeParse(trimmedEmail);
      if (!result.success) {
        setEmailError(result.error.errors[0]?.message ?? validationConfig.emailErrorMessage);
        return;
      }

      if (emailChips.some((chip) => chip.value === trimmedEmail)) {
        setEmailError(t('invitation.create.email_duplicate_error'));
        return;
      }

      setEmailChips((prev) => [...prev, { label: trimmedEmail, value: trimmedEmail }]);
      setEmailInput('');
      setEmailError(undefined);
    },
    [emailChips, validationConfig, t],
  );

  const handleEmailChipRemove = React.useCallback((value: string) => {
    setEmailChips((prev) => prev.filter((chip) => chip.value !== value));
  }, []);

  const handleRoleChange = React.useCallback((value: string | string[]) => {
    setSelectedRoles(Array.isArray(value) ? value : value ? [value] : []);
  }, []);

  const handleProviderChange = React.useCallback((value: string) => {
    setSelectedProvider(value || undefined);
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Add any remaining input to emails
      const finalEmails = emailChips.map((chip) => chip.value);
      if (emailInput.trim()) {
        const trimmedEmail = emailInput.trim();
        const result = validationConfig.emailSchema.safeParse(trimmedEmail);
        if (result.success && !finalEmails.includes(trimmedEmail)) {
          finalEmails.push(trimmedEmail);
        }
      }

      if (finalEmails.length === 0) {
        setEmailError(t('invitation.create.email_required_error'));
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
    [
      emailChips,
      emailInput,
      validationConfig,
      selectedRoles,
      selectedProvider,
      inviterName,
      onCreate,
      t,
    ],
  );

  const handleClose = React.useCallback(() => {
    setEmailInput('');
    setEmailChips([]);
    setSelectedRoles([]);
    setSelectedProvider(undefined);
    setEmailError(undefined);
    onClose();
  }, [onClose]);

  const canSubmit = React.useMemo(
    () =>
      emailChips.length > 0 ||
      (emailInput.trim() !== '' &&
        validationConfig.emailSchema.safeParse(emailInput.trim()).success),
    [emailChips.length, emailInput, validationConfig],
  );

  const roleOptions = React.useMemo(
    () => availableRoles.map((role) => ({ label: role.name, value: role.id })),
    [availableRoles],
  );

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
              <TextFieldGroup
                id="email"
                placeholder={t('invitation.create.email_placeholder')}
                value={emailInput}
                onChange={handleEmailInputChange}
                disabled={isLoading}
                variant={emailError ? 'error' : 'default'}
                chips={emailChips}
                onChipAdd={handleEmailChipAdd}
                onChipRemove={handleEmailChipRemove}
                summarizeChips={false}
              />
              <p
                className={cn('text-xs', emailError ? 'text-destructive' : 'text-muted-foreground')}
              >
                {emailError ?? t('invitation.create.email_helper')}
              </p>
            </div>

            {/* Roles Combobox */}
            {availableRoles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="roles">{t('invitation.create.roles_label')}</Label>
                <Combobox
                  value={selectedRoles}
                  onChange={handleRoleChange}
                  options={roleOptions}
                  placeholder={t('invitation.create.roles_placeholder')}
                  disabled={isLoading}
                  multiple
                />
              </div>
            )}

            {/* Provider Dropdown */}
            {availableProviders.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="provider">{t('invitation.create.provider_label')}</Label>
                <Select value={selectedProvider ?? ''} onValueChange={handleProviderChange}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder={t('invitation.create.provider_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
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
              {isLoading ? t('invitation.create.creating') : t('invitation.create.submit_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
