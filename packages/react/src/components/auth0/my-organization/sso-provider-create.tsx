/** @module sso-provider-create */

import {
  getComponentStyles,
  getInstructionsLocale,
  getStrategyUserAttributes,
  toSsoAttributeMappings,
} from '@auth0/universal-components-core';
import { useMemo } from 'react';

import { SsoGuidedSetup } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup';
import { SsoGuidedSetupTestConnection } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup-test-connection';
import ProviderConfigure from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/provider-configure';
import { ProviderDetails } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-details';
import { ProviderSelect } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-select';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Wizard } from '@/components/auth0/shared/wizard';
import type { StepProps } from '@/components/auth0/shared/wizard';
import { useIdpInstructionsService } from '@/hooks/my-organization/shared/services/use-idp-instructions-service';
import { useSsoProviderCreate } from '@/hooks/my-organization/use-sso-provider-create';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoGuidedSetupConfigureForm } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';
import type {
  FormState,
  SsoProviderCreateProps,
  SsoProviderCreateViewProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/**
 * SSO provider creation container component.
 * @param props - Component props
 * @param props.createAction - Configuration for the create action
 * @param props.backButton - Configuration for the back button
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.onNext - Callback for next action
 * @param props.onPrevious - Callback for previous action
 * @param props.showSignRequest - Whether to show the SAML "Sign request" option (default: true)
 * @param props.guidedSetup - Guided setup on the Configure step (off by default)
 * @internal
 * @returns JSX element
 */
function SsoProviderCreate(props: SsoProviderCreateProps) {
  useTelemetry('sso-create-configuration');

  const {
    createAction,
    backButton,
    customMessages = {},
    styling = {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    onNext,
    onPrevious,
    resolveSamlMetadata,
    showSignRequest,
    connectionNamePrefix,
    guidedSetup,
  } = props;

  const ssoProviderCreate = useSsoProviderCreate({
    createAction,
    customMessages,
    onNext,
    onPrevious,
    guidedSetup,
  });

  const { strategy, details, configure } = ssoProviderCreate.formData;

  return (
    <GateKeeper styling={styling}>
      <SsoProviderCreateView
        {...ssoProviderCreate}
        strategy={strategy}
        details={details}
        configure={configure}
        styling={styling}
        customMessages={customMessages}
        backButton={backButton}
        onNext={onNext}
        onPrevious={onPrevious}
        resolveSamlMetadata={resolveSamlMetadata}
        showSignRequest={showSignRequest}
        connectionNamePrefix={connectionNamePrefix}
      />
    </GateKeeper>
  );
}

/**
 * Internal SSO provider creation view component
 * @param props - Component props
 * @internal
 * @returns JSX element
 */
function SsoProviderCreateView(props: SsoProviderCreateViewProps) {
  const {
    styling,
    customMessages,
    backButton,
    isCreating,
    strategy,
    details,
    configure,
    isLoadingConfig,
    filteredStrategies,
    isLoadingIdpConfig,
    idpConfig,
    showThirdPartyAccess,
    isThirdPartyAccessReadOnly,
    showCrossAppAccess,
    isCrossAppAccessReadOnly,
    crossAppAccessDefaultValue,
    isOrganizationBlocked,
    resolveSamlMetadata,
    showSignRequest,
    connectionNamePrefix,
    detailsRef,
    configureRef,
    onNext,
    onPrevious,
    setFormData,
    handleCreate,
    createStepActions,
    guidedSetup,
    permissions,
  } = props;

  const { isDarkMode } = useTheme();
  const { t, currentLanguage } = useTranslator(
    'idp_management.create_sso_provider',
    customMessages,
  );

  const { instructions } = useIdpInstructionsService({
    kind: 'creation',
    strategy,
    locale: getInstructionsLocale(currentLanguage),
    enabled: Boolean(guidedSetup?.isAvailable),
  });
  const canStartGuidedSetup = Boolean(guidedSetup?.isAvailable && instructions?.pages.length);
  const isGuidedSetupDeprecated = instructions?.version_info?.lifecycle_status === 'deprecated';
  const guidedMessages = useMemo(
    () => ({ ...customMessages?.guided_setup }),
    [customMessages?.guided_setup],
  );
  const { t: tGuided } = useTranslator('idp_management.sso_guided_setup', guidedMessages);

  const currentStyles = useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const wizardSteps = useMemo(
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
              connectionName={details?.name}
              connectionNamePrefix={connectionNamePrefix}
              customMessages={customMessages?.provider_configure}
              idpConfig={idpConfig ?? null}
              className={currentStyles?.classes?.['ProviderConfigure-root']}
              showThirdPartyAccess={showThirdPartyAccess}
              isThirdPartyAccessReadOnly={isThirdPartyAccessReadOnly}
              showCrossAppAccess={showCrossAppAccess}
              isCrossAppAccessReadOnly={isCrossAppAccessReadOnly}
              crossAppAccessDefaultValue={crossAppAccessDefaultValue}
              isOrganizationBlocked={isOrganizationBlocked}
              resolveSamlMetadata={resolveSamlMetadata}
              showSignRequest={showSignRequest}
              styling={styling}
              guidedSetupAction={
                guidedSetup && canStartGuidedSetup
                  ? {
                      onClick: guidedSetup.start,
                      className: currentStyles?.classes?.['SsoProviderCreate-guidedSetupButton'],
                      disabled: isGuidedSetupDeprecated,
                      tooltip:
                        isGuidedSetupDeprecated && !guidedSetup.hideLifecycleWarnings
                          ? tGuided('lifecycle.deprecated')
                          : undefined,
                    }
                  : undefined
              }
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
      isLoadingIdpConfig,
      idpConfig,
      showThirdPartyAccess,
      isThirdPartyAccessReadOnly,
      showCrossAppAccess,
      isCrossAppAccessReadOnly,
      crossAppAccessDefaultValue,
      isOrganizationBlocked,
      resolveSamlMetadata,
      showSignRequest,
      connectionNamePrefix,
      canStartGuidedSetup,
      guidedSetup,
      isGuidedSetupDeprecated,
      tGuided,
    ],
  );

  const guidedConfigure = useMemo<SsoGuidedSetupConfigureForm | undefined>(
    () =>
      guidedSetup && {
        ref: guidedSetup.configureRef,
        props: {
          initialData: configure ?? undefined,
          idpConfig: idpConfig ?? null,
          connectionName: details?.name,
          connectionNamePrefix,
          connectionSourceSelector: 'tabs',
          customMessages: { fields: customMessages?.provider_configure?.fields },
          showThirdPartyAccess: false,
          showCrossAppAccess: false,
          crossAppAccessDefaultValue,
          isOrganizationBlocked,
          resolveSamlMetadata,
          showSignRequest,
          styling,
        },
      },
    [
      guidedSetup,
      configure,
      idpConfig,
      details?.name,
      connectionNamePrefix,
      customMessages?.provider_configure?.fields,
      crossAppAccessDefaultValue,
      isOrganizationBlocked,
      resolveSamlMetadata,
      showSignRequest,
      styling,
    ],
  );

  const guidedAttributeMappings = useMemo(() => {
    const userAttributes = getStrategyUserAttributes(idpConfig, strategy);
    return userAttributes ? toSsoAttributeMappings(userAttributes) : undefined;
  }, [idpConfig, strategy]);
  const guidedAttributeMappingsError = !isLoadingIdpConfig && idpConfig === null;
  const guidedEntryContext = useMemo(() => {
    if (guidedAttributeMappingsError) return { hasMappings: true };
    return guidedAttributeMappings
      ? { hasMappings: guidedAttributeMappings.length > 0 }
      : undefined;
  }, [guidedAttributeMappings, guidedAttributeMappingsError]);

  const guidedProvider = guidedSetup?.provider;
  const guidedSlots = useMemo(
    () =>
      guidedProvider
        ? {
            testConnection: (
              <SsoGuidedSetupTestConnection
                provider={guidedProvider}
                canTest={permissions.canTestProvider}
              />
            ),
          }
        : undefined,
    [guidedProvider, permissions.canTestProvider],
  );

  const guidedConnectionName =
    connectionNamePrefix && details?.name
      ? `${connectionNamePrefix}-${details.name}`
      : details?.name;

  return (
    <StyledScope style={currentStyles.variables}>
      <div className="w-full">
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
          {guidedSetup?.isActive && strategy ? (
            <SsoGuidedSetup
              strategy={strategy}
              connectionName={guidedConnectionName}
              companyName={guidedSetup.companyName}
              hideLifecycleWarnings={guidedSetup.hideLifecycleWarnings}
              provider={guidedSetup.provider}
              resolveSamlMetadata={resolveSamlMetadata}
              configure={guidedConfigure}
              attributeMappings={guidedAttributeMappings}
              attributeMappingsError={guidedAttributeMappingsError}
              entryContext={guidedEntryContext}
              slots={guidedSlots}
              isSubmitting={isCreating}
              onBeforeCreate={guidedSetup.validate}
              onCreateProvider={guidedSetup.create}
              onLeavePage={guidedSetup.saveConfigure}
              onComplete={guidedSetup.complete}
              customMessages={customMessages?.guided_setup}
              className={currentStyles?.classes?.['SsoProviderCreate-guidedSetup']}
            />
          ) : (
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
          )}
        </div>
      </div>
    </StyledScope>
  );
}

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
 * @param props.showSignRequest - Whether to show the SAML "Sign request" option (default: true)
 * @param props.guidedSetup - Guided setup on the Configure step (off by default)
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
export { SsoProviderCreate, SsoProviderCreateView };
