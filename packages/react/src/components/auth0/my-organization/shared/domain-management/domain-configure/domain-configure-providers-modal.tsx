/**
 * Domain configure providers modal.
 * @module domain-configure-providers-modal
 * @internal
 */

import {
  DEFAULT_DOMAIN_VERIFICATION_MODE,
  type IdentityProviderAssociatedWithDomain,
} from '@auth0/universal-components-core';
import { Info } from 'lucide-react';
import React from 'react';

import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import { ASSOCIATION_BLOCK_REASONS } from '@/lib/constants/my-organization/domain-management/domain-management-constants';
import { cn } from '@/lib/utils';
import {
  getAssociationBlockReason,
  getAssociationBlockReasonMessages,
  isDomainAssociationUnavailable,
  isLastRequiredDomainLocked,
} from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import { getProviderAccess } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
import { useId } from '@/lib/utils/use-id-compat';
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
 * @param props.domainVerificationMode - How providers use verified domains: `none` disables Assign, `required` keeps a provider's last domain
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
  domainVerificationMode = DEFAULT_DOMAIN_VERIFICATION_MODE,
  onClose,
  onAssign,
  onRemove,
  onOpenProvider,
  onCreateProvider,
}: DomainConfigureProvidersModalProps) {
  const { t } = useTranslator('domain_management.domain_configure_providers.modal', customMessages);

  const { t: tCommon } = useTranslator('common', customMessages?.common);
  const idPrefix = useId();
  const noneAlertId = `${idPrefix}-none`;

  const [selectedProviderId, setSelectedProviderId] = React.useState('');

  const isAssociationUnavailable = isDomainAssociationUnavailable(domainVerificationMode);

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
  const hasLockedLastDomain = assignedProviders.some((provider) =>
    isLastRequiredDomainLocked(domainVerificationMode, provider),
  );
  const showProviderField = assignedProviders.length === 0 && providers.length > 0;
  const showAssignedDescription = !isLoading && assignedProviders.length > 0;
  const showDescription = !isAssociationUnavailable && !hasLockedLastDomain;

  React.useEffect(() => {
    if (!isOpen || assignedProviders.length > 0) setSelectedProviderId('');
  }, [isOpen, assignedProviders.length]);

  const handleSave = () => {
    if (!domain || !selectedProvider || !permissions.canAssociateProvider) return;
    if (isAssociationUnavailable || !getProviderAccess(selectedProvider).canManageDomains) return;
    onAssign(domain, selectedProvider);
  };

  const blockReasonMessages = getAssociationBlockReasonMessages(t, tCommon);

  const renderRemoveButton = (provider: IdentityProviderAssociatedWithDomain) => {
    const blockReason = getAssociationBlockReason({
      hasPermission: permissions.canDissociateProvider,
      isProviderAccessRestricted: !getProviderAccess(provider).canManageDomains,
      isAssociationUnavailable: false,
      isLastDomainLocked: isLastRequiredDomainLocked(domainVerificationMode, provider),
    });
    const reasonId = `${idPrefix}-${provider.id ?? provider.name}-reason`;
    const reason = blockReason ? blockReasonMessages[blockReason] : null;
    const button = (
      <Button
        type="button"
        variant="link"
        size="sm"
        className={cn(
          'text-destructive-foreground px-0',
          blockReason && 'aria-disabled:pointer-events-none aria-disabled:opacity-50',
        )}
        disabled={isSaving}
        aria-disabled={blockReason ? true : undefined}
        onClick={() => {
          if (domain && !blockReason) onRemove(domain, provider);
        }}
        aria-label={t('actions.remove_button_aria_label', {
          provider: getProviderLabel(provider),
        })}
        aria-describedby={reason ? reasonId : undefined}
      >
        {t('actions.remove_button_text')}
      </Button>
    );

    if (!blockReason || !reason) return button;

    const reasonText = (
      <span id={reasonId} className="sr-only">
        {reason}
      </span>
    );

    if (blockReason === ASSOCIATION_BLOCK_REASONS.FORBIDDEN) {
      return (
        <>
          <PermissionDeniedTooltip customMessages={customMessages} enabled>
            {button}
          </PermissionDeniedTooltip>
          {reasonText}
        </>
      );
    }

    return (
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <span>
            {button}
            {reasonText}
          </span>
        </TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
    );
  };

  const renderAssignedProviders = () => (
    <div className="space-y-3">
      <ul className="space-y-2">
        {assignedProviders.map((provider) => (
          <li
            key={provider.id ?? provider.name}
            className="flex items-center justify-between gap-4 rounded-2xl border border-(--color-border) bg-background px-6 py-4 shadow-sm"
          >
            <span className="text-paragraph font-medium truncate text-foreground">
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
              {renderRemoveButton(provider)}
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
          disabled={isSaving || !permissions.canAssociateProvider || isAssociationUnavailable}
        >
          <SelectTrigger
            id={PROVIDER_FIELD_ID}
            autoFocus
            aria-describedby={isAssociationUnavailable ? noneAlertId : undefined}
          >
            <SelectValue placeholder={t('field.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {selectableProviders.map((provider) => (
              <SelectItem
                key={provider.id}
                value={provider.id!}
                disabled={!getProviderAccess(provider).canManageDomains}
              >
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
            {isAssociationUnavailable && (
              <Alert variant="warning" id={noneAlertId}>
                <Info />
                <AlertDescription className="text-warning-foreground">
                  {t('alerts.domain_verification_none')}
                </AlertDescription>
              </Alert>
            )}
            {hasLockedLastDomain && (
              <Alert variant="warning">
                <Info />
                <AlertDescription className="text-warning-foreground">
                  {t('table.actions.last_verified_domain_tooltip')}
                </AlertDescription>
              </Alert>
            )}
            {showDescription && (
              <p className="text-muted-foreground text-paragraph">
                {showAssignedDescription
                  ? t('assigned_description')
                  : t('description', { domain: domain?.domain ?? '' })}
              </p>
            )}
            <p role="status" className="sr-only">
              {showProviderField && !isAssociationUnavailable
                ? t('no_connection_status', { domain: domain.domain })
                : ''}
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
          disabled:
            isSaving ||
            !selectedProvider ||
            !permissions.canAssociateProvider ||
            isAssociationUnavailable ||
            !getProviderAccess(selectedProvider).canManageDomains,
          onClick: handleSave,
        },
      }}
    />
  );
}
