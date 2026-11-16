/**
 * Domain configure providers modal.
 * @module domain-configure-providers-modal
 * @internal
 */

import type { IdentityProviderAssociatedWithDomain } from '@auth0/universal-components-core';
import React from 'react';

import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { DomainConfigureProvidersModalProps } from '@/types/my-organization/domain-management/domain-configure-types';

const PROVIDER_FIELD_ID = 'domain-configure-provider';

/**
 * Formats a provider as "Display name (strategy)".
 * @param provider - Provider to format
 * @returns Provider label
 */
function getProviderLabel(provider: IdentityProviderAssociatedWithDomain): string {
  return `${provider.display_name || provider.name} (${provider.strategy})`;
}

/**
 * Modal for assigning a domain to a single identity provider.
 * @param props - Component props.
 * @param props.styling - Optional styling configuration with CSS classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.domain - Domain object or domain name
 * @param props.providers - Array of SSO providers
 * @param props.isOpen - Whether the modal/dialog is open
 * @param props.isLoading - Whether the component is in a loading state
 * @param props.isSaving - Whether an assign or remove request is in progress
 * @param props.permissions - What the current user is allowed to do
 * @param props.onClose - Callback fired when the component should close
 * @param props.onAssign - Callback fired on Save with the selected provider
 * @param props.onRemove - Callback fired when an assigned provider is removed
 * @param props.onOpenProvider - Callback fired when opening a provider
 * @param props.onCreateProvider - Callback fired when creating a new provider
 * @returns JSX element
 */
export function DomainConfigureProvidersModal({
  styling,
  customMessages,
  domain,
  providers,
  isOpen,
  isLoading,
  isSaving = false,
  permissions,
  onClose,
  onAssign,
  onRemove,
  onOpenProvider,
  onCreateProvider,
}: DomainConfigureProvidersModalProps) {
  const { t } = useTranslator('domain_management.domain_configure_providers.modal', customMessages);

  const [selectedProviderId, setSelectedProviderId] = React.useState('');

  const assignedProviders = React.useMemo(
    () => providers.filter((provider) => provider.is_associated),
    [providers],
  );
  const selectableProviders = React.useMemo(
    () => providers.filter((provider) => provider.id),
    [providers],
  );
  const selectedProvider = selectableProviders.find(
    (provider) => provider.id === selectedProviderId,
  );
  const showProviderField = assignedProviders.length === 0 && providers.length > 0;
  const showAssignedDescription = !isLoading && assignedProviders.length > 0;

  React.useEffect(() => {
    if (!isOpen || assignedProviders.length > 0) setSelectedProviderId('');
  }, [isOpen, assignedProviders.length]);

  const handleSave = () => {
    if (!domain || !selectedProvider || !permissions.canAssociateProvider) return;
    onAssign(domain, selectedProvider);
  };

  const renderAssignedProviders = () => (
    <div className="space-y-3">
      <ul className="space-y-2">
        {assignedProviders.map((provider) => (
          <li
            key={provider.id ?? provider.name}
            className="flex items-center justify-between gap-4 rounded-2xl border bg-background px-6 py-4 shadow-sm"
          >
            <span className="text-paragraph font-medium truncate">
              {getProviderLabel(provider)}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {onOpenProvider && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenProvider(provider)}
                >
                  {t('table.actions.view_provider_button_text')}
                </Button>
              )}
              <PermissionDeniedTooltip
                customMessages={customMessages}
                enabled={!permissions.canDissociateProvider}
              >
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-destructive-foreground px-0"
                  disabled={isSaving || !permissions.canDissociateProvider}
                  onClick={() => domain && onRemove(domain, provider)}
                  aria-label={t('actions.remove_button_aria_label', {
                    provider: getProviderLabel(provider),
                  })}
                >
                  {t('actions.remove_button_text')}
                </Button>
              </PermissionDeniedTooltip>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderProviderField = () => (
    <div className="space-y-2">
      <Label htmlFor={PROVIDER_FIELD_ID} className="text-label font-medium">
        {t('field.label')}
      </Label>
      <PermissionDeniedTooltip
        customMessages={customMessages}
        enabled={!permissions.canAssociateProvider}
        className="w-full"
      >
        <Select
          value={selectedProviderId}
          onValueChange={setSelectedProviderId}
          disabled={isSaving || !permissions.canAssociateProvider}
        >
          <SelectTrigger id={PROVIDER_FIELD_ID} autoFocus>
            <SelectValue placeholder={t('field.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {selectableProviders.map((provider) => (
              <SelectItem key={provider.id} value={provider.id!}>
                {getProviderLabel(provider)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PermissionDeniedTooltip>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      );
    }

    if (providers.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-muted-foreground text-paragraph">{t('table.empty_message')}</p>
          {onCreateProvider && (
            <Button type="button" variant="outline" onClick={onCreateProvider}>
              {t('table.actions.add_provider_button_text')}
            </Button>
          )}
        </div>
      );
    }

    return showProviderField ? renderProviderField() : renderAssignedProviders();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className={cn('p-10', styling?.classes?.['DomainTableConfigureModal-dialogContent'])}
      title={t('title', { domain: domain?.domain ?? '' })}
      content={
        domain && (
          <div className={cn('space-y-6', styling?.classes?.['DomainTable-configureModal'])}>
            <p className="text-muted-foreground text-paragraph">
              {showAssignedDescription
                ? t('assigned_description')
                : t('description', { domain: domain?.domain ?? '' })}
            </p>
            <p role="status" className="sr-only">
              {showProviderField ? t('no_connection_status', { domain: domain.domain }) : ''}
            </p>
            {renderContent()}
          </div>
        )
      }
      modalActions={{
        isLoading: isSaving,
        showNext: showProviderField,
        previousAction: {
          label: t('actions.close_button_text'),
          onClick: onClose,
        },
        nextAction: {
          type: 'button',
          label: t('actions.save_button_text'),
          disabled: isSaving || !selectedProvider || !permissions.canAssociateProvider,
          onClick: handleSave,
        },
      }}
    />
  );
}
