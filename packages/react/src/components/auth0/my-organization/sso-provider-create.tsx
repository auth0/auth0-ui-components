/** @module sso-provider-create */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import ProviderConfigure from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/provider-configure';
import { ProviderDetails } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-details';
import { ProviderSelect } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-select';
import { GateKeeper } from '@/components/auth0/shared/gatekeeper';
import { Header } from '@/components/auth0/shared/header';
import { Wizard } from '@/components/auth0/shared/wizard';
import type { StepProps } from '@/components/auth0/shared/wizard';
import { useSsoProviderCreate } from '@/hooks/my-organization/use-sso-provider-create';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  FormState,
  SsoProviderCreateProps,
  SsoProviderCreateViewProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/**
 * SSO provider creation wizard.
 *
 * Multi-step wizard for creating new SSO identity providers. Guides users through
 * provider selection, configuration, and setup. Supports OIDC, SAML, Google Workspace,
 * Microsoft Entra ID, Okta, PingFederate, and ADFS strategies.
 *
 * @param props - {@link SsoProviderCreateProps}
 * @param props.createAction - Lifecycle hooks for provider creation
 * @param props.backButton - Back button configuration
 * @param props.onNext - Callback when moving to next step
 * @param props.onPrevious - Callback when moving to previous step
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @returns SSO provider creation wizard component
 *
 * @see {@link SsoProviderCreateProps} for full props documentation
 *
 * @example
 * ```tsx
 * <SsoProviderCreate
 *   createAction={{
 *     onBefore: (data) => true,
 *     onAfter: (provider) => navigate(`/providers/${provider.id}`),
 *   }}
 *   backButton={{
 *     onClick: () => navigate('/providers'),
 *   }}
 * />
 * ```
 */
export function SsoProviderCreate({
  createAction,
  backButton,
  customMessages = {},
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  onNext,
  onPrevious,
}: SsoProviderCreateProps): React.JSX.Element {
  const { error, retry, ...hook } = useSsoProviderCreate({
    createAction,
    customMessages,
    onNext,
    onPrevious,
  });

  return (
    <GateKeeper error={error} onRetry={retry}>
      <SsoProviderCreateView
        {...hook}
        styling={styling}
        customMessages={customMessages}
        backButton={backButton}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </GateKeeper>
  );
}

/**
 * Presentational view for SSO provider creation wizard.
 * @param props - Flat view props
 * @returns SSO provider create view element
 * @internal
 */
export function SsoProviderCreateView({
  styling,
  customMessages,
  backButton,
  isCreating,
  formData,
  isLoadingConfig,
  filteredStrategies,
  isLoadingIdpConfig,
  idpConfig,
  onNext,
  onPrevious,
  setFormData,
  detailsRef,
  configureRef,
  handleCreate,
  createStepActions,
}: SsoProviderCreateViewProps) {
  const { strategy, details, configure } = formData;

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('idp_management.create_sso_provider', customMessages);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const wizardSteps = React.useMemo(
    () => [
      {
        id: 'provider_select',
        title: t('steps.one'),
        content: ({ onNext: navigate }: StepProps) => (
          <ProviderSelect
            isLoading={isLoadingConfig}
            strategyList={filteredStrategies}
            onClickStrategy={(selected) => {
              setFormData((prev: FormState) => ({
                strategy: selected,
                details: prev.strategy === selected ? prev.details : null,
                configure: prev.strategy === selected ? prev.configure : null,
              }));
              onNext?.('provider_select', { strategy: selected });
              navigate?.();
            }}
            selectedStrategy={strategy}
            customMessages={customMessages?.provider_select}
            className={currentStyles?.classes?.['ProviderSelect-root']}
          />
        ),
        actions: { showNext: false },
      },
      {
        id: 'provider_details',
        title: t('steps.two'),
        content: () => (
          <ProviderDetails
            mode="create"
            ref={detailsRef}
            initialData={details ?? undefined}
            customMessages={customMessages?.provider_details}
            styling={styling}
            className={currentStyles?.classes?.['ProviderDetails-root']}
          />
        ),
        actions: createStepActions('provider_details', detailsRef),
      },
      {
        id: 'provider_configure',
        title: t('steps.three'),
        content: () =>
          strategy ? (
            <ProviderConfigure
              ref={configureRef}
              strategy={strategy}
              isLoading={isLoadingIdpConfig}
              initialData={configure ?? undefined}
              customMessages={customMessages?.provider_configure}
              idpConfig={idpConfig ?? null}
              className={currentStyles?.classes?.['ProviderConfigure-root']}
            />
          ) : null,
        actions: createStepActions('provider_configure', configureRef),
      },
    ],
    [
      t,
      strategy,
      details,
      configure,
      onNext,
      onPrevious,
      customMessages,
      currentStyles,
      styling,
      createStepActions,
    ],
  );

  return (
    <div style={currentStyles.variables} className="w-full">
      <Header
        title={t('header.title')}
        backButton={
          backButton && {
            ...backButton,
            text: t('header.back_button_text'),
          }
        }
        className={currentStyles?.classes?.['SsoProviderCreate-header']}
      />
      <div className="sso-provider-create__content" data-testid="sso-provider-create-content">
        <Wizard
          isLoading={isCreating}
          hideStepperNumbers
          steps={wizardSteps}
          onComplete={handleCreate}
          formActionLabels={{
            nextButtonLabel: t('nextButtonLabel'),
            previousButtonLabel: t('previousButtonLabel'),
            completeButtonLabel: t('completeButtonLabel'),
          }}
          className={currentStyles?.classes?.['SsoProviderCreate-wizard']}
        />
      </div>
    </div>
  );
}
