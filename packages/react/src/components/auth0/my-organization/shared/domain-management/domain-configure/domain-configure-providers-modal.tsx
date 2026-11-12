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

import { type Column, DataTable } from '@/components/auth0/shared/data-table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ASSOCIATION_BLOCK_REASONS,
  type AssociationBlockReason,
} from '@/lib/constants/my-organization/domain-management/domain-management-constants';
import { cn } from '@/lib/utils';
import {
  getAssociationBlockReason,
  isDomainAssociationUnavailable,
  isLastRequiredDomainLocked,
} from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import { getProviderAccess } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
import { useId } from '@/lib/utils/use-id-compat';
import type { DomainConfigureProvidersModalProps } from '@/types/my-organization/domain-management/domain-configure-types';

/**
 * Modal for configuring domain providers.
 * @param props - Component props.
 * @param props.styling - Optional styling configuration with CSS classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.domain - Domain object or domain name
 * @param props.providers - Array of SSO providers
 * @param props.isOpen - Whether the modal/dialog is open
 * @param props.isLoading - Whether the component is in a loading state
 * @param props.isLoadingSwitch - The is loading switch
 * @param props.permissions - What the current user is allowed to do
 * @param props.onClose - Callback fired when the component should close
 * @param props.onToggleSwitch - Callback fired when switch is toggled
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
  isLoadingSwitch,
  permissions,
  domainVerificationMode = DEFAULT_DOMAIN_VERIFICATION_MODE,
  onClose,
  onToggleSwitch,
  onOpenProvider,
  onCreateProvider,
}: DomainConfigureProvidersModalProps) {
  const { t } = useTranslator('domain_management.domain_configure_providers.modal', customMessages);
  const { t: tCommon } = useTranslator('common', customMessages?.common);
  const idPrefix = useId();

  const handleToggleSwitch = React.useCallback(
    (provider: IdentityProviderAssociatedWithDomain, newCheckedValue: boolean) => {
      onToggleSwitch(domain!, provider, newCheckedValue); // Switch component is not rendered if domain is null
    },
    [domain, onToggleSwitch],
  );

  const isAssociationUnavailable = isDomainAssociationUnavailable(domainVerificationMode);
  const hasLockedLastDomain = providers.some(
    (provider) =>
      provider.is_associated && isLastRequiredDomainLocked(domainVerificationMode, provider),
  );

  const blockReasonMessages = React.useMemo<Record<AssociationBlockReason, string>>(
    () => ({
      [ASSOCIATION_BLOCK_REASONS.FORBIDDEN]: tCommon('error.forbidden'),
      [ASSOCIATION_BLOCK_REASONS.ACCESS_RESTRICTED]: t(
        'table.actions.provider_access_restricted_tooltip',
      ),
      [ASSOCIATION_BLOCK_REASONS.ASSOCIATION_UNAVAILABLE]: t(
        'table.actions.domain_association_unavailable_tooltip',
      ),
      [ASSOCIATION_BLOCK_REASONS.LAST_DOMAIN]: t('table.actions.last_verified_domain_tooltip'),
    }),
    [t, tCommon],
  );

  const getToggleState = React.useCallback(
    (provider: IdentityProviderAssociatedWithDomain) => {
      const isAssociated = provider.is_associated;
      const hasPermission = isAssociated
        ? permissions.canDissociateProvider
        : permissions.canAssociateProvider;
      const isLastDomainLocked =
        isAssociated && isLastRequiredDomainLocked(domainVerificationMode, provider);

      const isProviderAccessRestricted = !getProviderAccess(provider).canManageDomains;

      const blockReason = getAssociationBlockReason({
        hasPermission,
        isProviderAccessRestricted,
        isAssociationUnavailable,
        isLastDomainLocked,
      });
      const label = isAssociated
        ? t('table.actions.disable_provider_tooltip')
        : t('table.actions.enable_provider_tooltip');
      const disabledReason = blockReason ? blockReasonMessages[blockReason] : null;

      return { label, disabledReason };
    },
    [permissions, isAssociationUnavailable, domainVerificationMode, blockReasonMessages, t],
  );

  const columns: Column<IdentityProviderAssociatedWithDomain>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'display_name',
        title: t('table.columns.name'),
        width: '25%',
        render: (provider) => (
          <div className="font-medium text-muted-foreground">{provider.display_name}</div>
        ),
      },
      {
        type: 'text',
        accessorKey: 'strategy',
        title: t('table.columns.provider'),
        width: '40%',
        render: (provider) => <div className="text-muted-foreground">{provider.strategy}</div>,
      },
      {
        type: 'actions',
        title: '',
        width: '30%',
        render: (provider) => {
          const { label, disabledReason } = getToggleState(provider);
          const disabledReasonId = `${idPrefix}-${provider.id}-reason`;
          const isSwitchDisabled = isLoadingSwitch || !!disabledReason;
          const describedBy = disabledReason ? disabledReasonId : undefined;

          return (
            <div className="flex items-center justify-end gap-4 min-w-0">
              {onOpenProvider && (
                <Button
                  type="button"
                  variant={'outline'}
                  size={'sm'}
                  onClick={() => onOpenProvider(provider)}
                >
                  {t('table.actions.view_provider_button_text')}
                </Button>
              )}
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <span>
                    <Switch
                      checked={provider.is_associated ?? false}
                      onCheckedChange={(checked) => handleToggleSwitch(provider, checked)}
                      disabled={isSwitchDisabled}
                      aria-label={label}
                      aria-describedby={describedBy}
                    />
                    {disabledReason && (
                      <span id={disabledReasonId} className="sr-only">
                        {disabledReason}
                      </span>
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{disabledReason ?? label}</TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [t, idPrefix, onOpenProvider, isLoadingSwitch, getToggleState, handleToggleSwitch],
  );

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
              <Alert variant="warning">
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
            <p className="text-muted-foreground text-paragraph">
              {t('description', { domain: domain?.domain ?? '' })}
            </p>
            <div className="max-h-[400px] overflow-y-auto">
              <DataTable
                columns={columns}
                data={providers}
                loading={isLoading}
                emptyState={{
                  title: t('table.empty_message'),
                  action: onCreateProvider
                    ? {
                        label: t('table.actions.add_provider_button_text'),
                        variant: 'outline',
                        onClick: onCreateProvider,
                      }
                    : undefined,
                }}
              />
            </div>
          </div>
        )
      }
      modalActions={{
        showNext: false,
        previousAction: {
          label: t('actions.close_button_text'),
          onClick: onClose,
        },
      }}
    />
  );
}
