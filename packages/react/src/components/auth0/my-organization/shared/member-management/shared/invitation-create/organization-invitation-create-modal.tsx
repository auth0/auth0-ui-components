/**
 * Organization invitation create modal component.
 * @module organization-invitation-create-modal
 */

import { createInvitationCreateSchema } from '@auth0/universal-components-core';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextFieldGroup } from '@/components/ui/text-field-group';
import type { ChipItem } from '@/components/ui/text-field-group';
import { useTranslator } from '@/hooks/shared/use-translator';
import { MAX_ROLES_PER_REQUEST } from '@/lib/constants/my-organization/member-management/member-management-constants';
import type { OrganizationInvitationCreateModalProps } from '@/types/my-organization/member-management/organization-invitation-table-types';

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
 * @param props.availableConnections - Merged identity providers + user stores for the picker.
 * @param props.inviterName - Name of the person sending the invitation.
 * @param props.schema - Schema overrides for validation (email regex, maxEmails, error messages).
 * @param props.onClose - Callback when modal is closed.
 * @param props.onCreate - Callback when invitation is created.
 * @param props.isSearchingRoles - Whether a role search request is in flight.
 * @param props.style - CSS variables computed by the parent.
 * @param props.className - Optional CSS class name.
 * @returns The modal component.
 */
export function OrganizationInvitationCreateModal({
  isOpen,
  isLoading = false,
  isSearchingRoles = false,
  customMessages = {},
  availableRoles = [],
  availableConnections = [],
  inviterName,
  schema,
  onClose,
  onCreate,
  style,
  className,
  onRoleSearch,
}: OrganizationInvitationCreateModalProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  const { userStoreConnections, identityProviderConnections } = React.useMemo(
    () => ({
      userStoreConnections: availableConnections.filter((c) => c.type === 'user_store'),
      identityProviderConnections: availableConnections.filter(
        (c) => c.type === 'identity_provider',
      ),
    }),
    [availableConnections],
  );

  const validationConfig = React.useMemo(
    () => createInvitationCreateSchema(schema, t('invitation.create.email_invalid_error')),
    [schema, t],
  );

  const [emailInput, setEmailInput] = React.useState('');
  const [emailChips, setEmailChips] = React.useState<ChipItem[]>([]);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = React.useState<string | undefined>();
  const [emailError, setEmailError] = React.useState<string | undefined>();

  const resetForm = React.useCallback(() => {
    setEmailInput('');
    setEmailChips([]);
    setSelectedRoles([]);
    setSelectedConnectionId(undefined);
    setEmailError(undefined);
    onRoleSearch?.('');
  }, [onRoleSearch]);

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  React.useEffect(() => {
    const singleConnection = availableConnections.length === 1 ? availableConnections[0] : null;
    if (isOpen && singleConnection) {
      setSelectedConnectionId(singleConnection.id);
    }
  }, [isOpen, availableConnections]);

  const handleEmailInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
    setEmailError(undefined);
  }, []);

  const hasInvalidChips = React.useMemo(
    () => emailChips.some((chip) => chip.variant === 'destructive'),
    [emailChips],
  );

  const handleEmailChipAdd = React.useCallback(
    (value: string) => {
      const trimmedEmail = value.trim().replace(/,/g, '');

      if (!trimmedEmail) return;

      if (emailChips.length >= validationConfig.maxEmails) {
        setEmailError(t('invitation.create.email_limit_error'));
        return;
      }

      if (emailChips.some((chip) => chip.value === trimmedEmail)) {
        setEmailError(t('invitation.create.email_duplicate_error'));
        return;
      }

      const result = validationConfig.emailSchema.safeParse(trimmedEmail);
      if (!result.success) {
        setEmailChips((prev) => [
          ...prev,
          { label: trimmedEmail, value: trimmedEmail, variant: 'destructive' },
        ]);
        setEmailInput('');
        setEmailError(t('invitation.create.email_invalid_error'));
        return;
      }

      setEmailChips((prev) => [...prev, { label: trimmedEmail, value: trimmedEmail }]);
      setEmailInput('');
      setEmailError(undefined);
    },
    [emailChips, validationConfig, t],
  );

  const handleEmailChipRemove = React.useCallback((value: string) => {
    setEmailChips((prev) => {
      const updated = prev.filter((chip) => chip.value !== value);
      if (!updated.some((chip) => chip.variant === 'destructive')) {
        setEmailError(undefined);
      }
      return updated;
    });
  }, []);

  const handleRoleChange = React.useCallback((value: string | string[]) => {
    setSelectedRoles(Array.isArray(value) ? value : value ? [value] : []);
  }, []);

  const handleConnectionChange = React.useCallback((value: string) => {
    setSelectedConnectionId(value || undefined);
  }, []);

  const handleSubmit = React.useCallback(() => {
    const finalEmails = emailChips
      .filter((chip) => chip.variant !== 'destructive')
      .map((chip) => chip.value);

    if (emailInput.trim()) {
      const trimmedEmail = emailInput.trim();
      const result = validationConfig.emailSchema.safeParse(trimmedEmail);
      if (result.success && !finalEmails.includes(trimmedEmail)) {
        finalEmails.push(trimmedEmail);
      } else if (!result.success) {
        setEmailError(t('invitation.create.email_invalid_error'));
        return;
      }
    }

    if (finalEmails.length === 0) {
      setEmailError(t('invitation.create.email_required_error'));
      return;
    }

    const selectedConnection = availableConnections.find((c) => c.id === selectedConnectionId);

    if (!selectedConnection) {
      return;
    }

    const user_store_id =
      selectedConnection.type === 'user_store' ? selectedConnection.id : undefined;
    const identity_provider_id =
      selectedConnection.type === 'identity_provider' ? selectedConnection.id : undefined;

    onCreate({
      invitees: finalEmails.map((email) => ({
        email,
        roles: selectedRoles.length > 0 ? selectedRoles : undefined,
      })),
      user_store_id,
      identity_provider_id,
      ...(inviterName && { inviter: { name: inviterName } }),
    });
  }, [
    emailChips,
    emailInput,
    validationConfig,
    selectedRoles,
    selectedConnectionId,
    availableConnections,
    inviterName,
    onCreate,
    t,
  ]);

  const handleClose = React.useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const canSubmit = React.useMemo(
    () =>
      !hasInvalidChips &&
      !!selectedConnectionId &&
      (emailChips.length > 0 ||
        (emailInput.trim() !== '' &&
          validationConfig.emailSchema.safeParse(emailInput.trim()).success)),
    [emailChips.length, emailInput, validationConfig, hasInvalidChips, selectedConnectionId],
  );

  const roleOptions = React.useMemo(
    () => availableRoles.map((role) => ({ label: role.name, value: role.id })),
    [availableRoles],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent style={style} className={className}>
        <DialogHeader>
          <DialogTitle>{t('invitation.create.title')}</DialogTitle>
          <DialogDescription>{t('invitation.create.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('invitation.create.email_label')}*</Label>
            <TextFieldGroup
              id="email"
              placeholder={t('invitation.create.email_placeholder')}
              value={emailInput}
              onChange={handleEmailInputChange}
              disabled={isLoading}
              variant={emailError || hasInvalidChips ? 'error' : 'default'}
              chips={emailChips}
              onChipAdd={handleEmailChipAdd}
              onChipRemove={handleEmailChipRemove}
              summarizeChips={false}
            />
            <p className="text-sm text-muted-foreground">{t('invitation.create.email_helper')}</p>
            {emailError && <p className="text-sm text-destructive-foreground">{emailError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roles">{t('invitation.create.roles_label')}</Label>
            <Combobox
              value={selectedRoles}
              onChange={handleRoleChange}
              onInputChange={onRoleSearch}
              filterLocally={!onRoleSearch}
              options={roleOptions}
              placeholder={t('invitation.create.roles_placeholder')}
              disabled={isLoading || (!onRoleSearch && availableRoles.length === 0)}
              multiple
              showSelectedCount
              maxSelections={MAX_ROLES_PER_REQUEST}
              maxSelectionsMessage={t('invitation.create.roles_max_selection_message')}
              loading={isSearchingRoles}
              loadingMessage={t('invitation.create.roles_searching_message')}
              retainQueryOnSelect
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection">{t('invitation.create.connection_label')}*</Label>
            <Select
              value={selectedConnectionId ?? ''}
              onValueChange={handleConnectionChange}
              disabled={isLoading || availableConnections.length === 0}
            >
              <SelectTrigger id="connection" aria-required="true">
                <SelectValue placeholder={t('invitation.create.connection_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {userStoreConnections.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>{t('invitation.create.connection_group_user_store')}</SelectLabel>
                    {userStoreConnections.map((connection) => (
                      <SelectItem key={connection.id} value={connection.id}>
                        {connection.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {identityProviderConnections.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>
                      {t('invitation.create.connection_group_identity_provider')}
                    </SelectLabel>
                    {identityProviderConnections.map((connection) => (
                      <SelectItem key={connection.id} value={connection.id}>
                        {connection.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('invitation.create.connection_helper')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('invitation.create.cancel_button')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || !canSubmit}>
            {isLoading ? t('invitation.create.creating') : t('invitation.create.submit_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
