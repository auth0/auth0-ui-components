/** @module sso-provider-edit */

'use client';

import { PROVISIONING_METHODS, getComponentStyles } from '@auth0/universal-components-core';
import { useEffect, useMemo, useRef, useState } from 'react';

import { SsoDomainTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-tab';
import { SsoProviderTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-tab';
import { SsoProvisioningGoogleSyncPanel } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-google-sync/sso-provisioning-google-sync-panel';
import { SsoProvisioningGuidedSetup } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-guided-setup';
import { SsoProvisioningTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-tab';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSsoProviderEdit } from '@/hooks/my-organization/use-sso-provider-edit';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { SSO_PROVIDER_EDIT_TAB_GRID_COLUMNS } from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import { cn } from '@/lib/utils';
import type {
  SsoProviderEditProps,
  SsoProviderEditViewProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

/**
 * SSO provider edit container component.
 * @param props - Component props
 * @param props.providerId - ID of the SSO provider
 * @param props.backButton - Configuration for the back button
 * @param props.sso - SSO configuration
 * @param props.provisioning - Provisioning configuration
 * @param props.domains - Array of domains
 * @param props.hideHeader - Whether to hide the header
 * @param props.hideProvisioningTab - Whether to hide the provisioning tab
 * @param props.hideGuidedSetup - Whether to hide Guided Setup on the provisioning tab
 * @param props.hideDomainsTab - Whether to hide the domains tab
 * @param props.hideDeleteProvider - Whether to hide the delete provider action
 * @param props.hideRemoveFromOrganization - Whether to hide the remove from organization action
 * @param props.hideTestProvider - Whether to hide the test provider action
 * @param props.hideAttributeMappings - Whether to hide the attribute mappings section
 * @param props.showSignRequest - Whether to show the SAML "Sign request" option (default: true)
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.schema - Zod validation schema
 * @param props.readOnly - Whether the component is in read-only mode
 * @internal
 * @returns JSX element
 */
function SsoProviderEdit(props: SsoProviderEditProps) {
  useTelemetry('sso-edit-configuration');

  const {
    providerId,
    backButton,
    sso,
    provisioning,
    domains,
    hideHeader = false,
    hideProvisioningTab = false,
    hideGuidedSetup = false,
    hideDomainsTab = false,
    hideDeleteProvider = false,
    hideRemoveFromOrganization = false,
    hideTestProvider = false,
    hideAttributeMappings = false,
    customMessages = {},
    styling = {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    schema,
    readOnly = false,
    enableProviderAction,
    connectionNamePrefix,
    resolveSamlMetadata,
    showSignRequest,
  } = props;

  const ssoProviderEdit = useSsoProviderEdit(providerId, {
    sso,
    provisioning,
    domains,
    customMessages,
    readOnly,
    skipProvisioningFetch: hideProvisioningTab && hideAttributeMappings,
    enableProviderAction,
  });

  const isLoading =
    ssoProviderEdit.isLoading ||
    ssoProviderEdit.isLoadingConfig ||
    ssoProviderEdit.isLoadingIdpConfig;

  return (
    <GateKeeper isLoading={isLoading} styling={styling}>
      <SsoProviderEditView
        {...ssoProviderEdit}
        styling={styling}
        customMessages={customMessages}
        backButton={backButton}
        schema={schema}
        readOnly={readOnly}
        providerId={providerId}
        domains={domains}
        provisioning={provisioning}
        hideHeader={hideHeader}
        hideProvisioningTab={hideProvisioningTab}
        hideGuidedSetup={hideGuidedSetup}
        hideDomainsTab={hideDomainsTab}
        hideDeleteProvider={hideDeleteProvider}
        hideRemoveFromOrganization={hideRemoveFromOrganization}
        hideTestProvider={hideTestProvider}
        hideAttributeMappings={hideAttributeMappings}
        enableProviderAction={enableProviderAction}
        connectionNamePrefix={connectionNamePrefix}
        resolveSamlMetadata={resolveSamlMetadata}
        showSignRequest={showSignRequest}
      />
    </GateKeeper>
  );
}

/**
 * Internal SSO provider edition view component
 * @param props - Component props
 * @internal
 * @returns JSX element
 */
function SsoProviderEditView(props: SsoProviderEditViewProps) {
  const {
    styling,
    schema,
    permissions,
    readOnly,
    providerId,
    domains,
    provisioning,
    hideHeader,
    hideProvisioningTab,
    hideGuidedSetup,
    hideDeleteProvider,
    hideRemoveFromOrganization,
    hideTestProvider,
    hideAttributeMappings,
    provider,
    organization,
    provisioningConfig,
    isLoading,
    isUpdating,
    isEnabling,
    isDeleting,
    isRemoving,
    idpConfig,
    discoveryPolicy,
    domainVerificationMode,
    isEnableBlockedByDomains,
    providerAccess,
    customMessages,
    backButton,
    shouldAllowDeletion,
    provisioningMethod,
    hideDomainsTab = false,
    showThirdPartyAccess,
    isThirdPartyAccessReadOnly,
    showCrossAppAccess,
    isCrossAppAccessReadOnly,
    isOrganizationBlocked,
    isProvisioningUpdating,
    isProvisioningDeleting,
    isScimTokensLoading,
    isScimTokenCreating,
    isScimTokenDeleting,
    isSsoAttributesSyncing,
    isProvisioningAttributesSyncing,
    hasSsoAttributeSyncWarning,
    hasProvisioningAttributeSyncWarning,
    enableProviderAction,
    connectionNamePrefix,
    updateProvider,
    listScimTokens,
    syncSsoAttributes,
    onDeleteConfirm,
    onRemoveConfirm,
    handleToggleProvider,
    createProvisioning,
    deleteProvisioning,
    createScimToken,
    deleteScimToken,
    syncProvisioningAttributes,
    resolveSamlMetadata,
    showSignRequest,
  } = props;

  const showProvisioningTab = !!provisioningMethod && !hideProvisioningTab;

  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('sso');
  const [isProvisioningGuidedSetup, setProvisioningGuidedSetup] = useState(false);
  const organizationDisplayName = organization?.display_name || undefined;
  const [hasLeftProvisioningGuidedSetup, setLeftProvisioningGuidedSetup] = useState(false);
  const guidedSetupTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isProvisioningGuidedSetup) guidedSetupTitleRef.current?.focus();
  }, [isProvisioningGuidedSetup]);
  const { t } = useTranslator('idp_management.edit_sso_provider', customMessages);
  const { t: tCommon } = useTranslator('common', customMessages?.common);
  const currentStyles = useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const isProviderSwitchDisabled =
    isUpdating ||
    isEnabling ||
    enableProviderAction?.disabled ||
    !permissions.canUpdateProvider ||
    !providerAccess.canToggle ||
    isEnableBlockedByDomains;

  const providerSwitchLabel = provider?.is_enabled
    ? t('header.disable_provider_tooltip_text')
    : t('header.enable_provider_tooltip_text');

  const getProviderSwitchBlockedReason = () => {
    if (!permissions.canUpdateProvider) return tCommon('error.forbidden');
    if (!providerAccess.canToggle)
      return t('header.enable_provider_access_restricted_tooltip_text');
    if (isEnableBlockedByDomains) return t('header.enable_provider_blocked_domains_tooltip_text');
    return undefined;
  };
  const providerSwitchBlockedReason = getProviderSwitchBlockedReason();

  if (isProvisioningGuidedSetup && provider) {
    const closeGuidedSetup = () => {
      setLeftProvisioningGuidedSetup(true);
      setProvisioningGuidedSetup(false);
    };
    return (
      <StyledScope style={currentStyles.variables}>
        <div className="w-full overflow-y-auto space-y-6">
          <Header
            title={t('provisioning_setup.title')}
            titleRef={guidedSetupTitleRef}
            backButton={{
              onClick: closeGuidedSetup,
              text: t('provisioning_setup.back_button_text', {
                providerName: provider.display_name || provider.name || '',
              }),
            }}
            className={currentStyles?.classes?.['SsoProviderEdit-header']}
          />
          <SsoProvisioningGuidedSetup
            provider={provider}
            provisioningConfig={provisioningConfig}
            idpConfig={idpConfig}
            organizationDisplayName={organizationDisplayName}
            hideLifecycleWarnings={provisioning?.guidedSetup?.hideLifecycleWarnings}
            onComplete={closeGuidedSetup}
            isScimTokensLoading={isScimTokensLoading}
            isScimTokenCreating={isScimTokenCreating}
            isScimTokenDeleting={isScimTokenDeleting}
            onListScimTokens={listScimTokens}
            onCreateScimToken={createScimToken}
            onDeleteScimToken={deleteScimToken}
            permissions={permissions}
            readOnly={readOnly}
            styling={styling}
            customMessages={customMessages?.provisioning_setup?.guided_setup}
            manageTokenMessages={
              customMessages?.tabs?.provisioning?.content?.details?.manage_tokens
            }
            className={currentStyles?.classes?.['SsoProviderEdit-provisioningGuidedSetup']}
          />
        </div>
      </StyledScope>
    );
  }

  return (
    <StyledScope style={currentStyles.variables}>
      <div className="w-full overflow-y-auto">
        {!hideHeader && (
          <Header
            title={provider?.display_name || provider?.name || ''}
            backButton={
              backButton && {
                ...backButton,
                text: t('header.back_button_text'),
              }
            }
            isLoading={isUpdating}
            actions={[
              {
                type: 'switch',
                checked: provider?.is_enabled ?? false,
                onCheckedChange: handleToggleProvider,
                hidden: readOnly,
                disabled: isProviderSwitchDisabled,
                'aria-label': providerSwitchLabel,
                description: providerSwitchBlockedReason,
                tooltip: { content: providerSwitchBlockedReason ?? providerSwitchLabel },
              },
            ]}
            className={currentStyles?.classes?.['SsoProviderEdit-header']}
          />
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className={cn('space-y-10', currentStyles?.classes?.['SsoProviderEdit-tabs'])}
        >
          <TabsList
            className={cn(
              'grid w-full',
              SSO_PROVIDER_EDIT_TAB_GRID_COLUMNS[
                1 + Number(showProvisioningTab) + Number(!hideDomainsTab)
              ],
            )}
          >
            <TabsTrigger value="sso" className="text-sm">
              {t('tabs.sso.name')}
            </TabsTrigger>
            {showProvisioningTab && (
              <TabsTrigger value="provisioning" className="text-sm">
                {t('tabs.provisioning.name')}
              </TabsTrigger>
            )}
            {!hideDomainsTab && (
              <TabsTrigger value="domain" className="text-sm">
                {t('tabs.domains.name')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="sso">
            <SsoProviderTab
              provider={provider}
              organization={organization}
              onDelete={onDeleteConfirm}
              onRemove={onRemoveConfirm}
              isDeleting={isDeleting}
              isRemoving={isRemoving}
              idpConfig={idpConfig}
              shouldAllowDeletion={shouldAllowDeletion}
              hideDeleteProvider={hideDeleteProvider}
              hideRemoveFromOrganization={hideRemoveFromOrganization}
              hideTestProvider={hideTestProvider}
              hideAttributeMappings={hideAttributeMappings}
              hasSsoAttributeSyncWarning={hasSsoAttributeSyncWarning}
              onAttributeSync={syncSsoAttributes}
              isSyncingAttributes={isSsoAttributesSyncing}
              customMessages={customMessages?.tabs?.sso?.content}
              styling={styling}
              formActions={{
                isLoading: isUpdating,
                showNext: !readOnly,
                nextActionTooltip:
                  !readOnly && !permissions.canUpdateProvider
                    ? tCommon('error.forbidden')
                    : undefined,
                nextAction: {
                  disabled: isUpdating || !provider || isLoading,
                  onClick: updateProvider,
                },
              }}
              permissions={permissions}
              providerAccess={providerAccess}
              readOnly={readOnly}
              showThirdPartyAccess={showThirdPartyAccess}
              isThirdPartyAccessReadOnly={isThirdPartyAccessReadOnly}
              showCrossAppAccess={showCrossAppAccess}
              isCrossAppAccessReadOnly={isCrossAppAccessReadOnly}
              isOrganizationBlocked={isOrganizationBlocked}
              connectionNamePrefix={connectionNamePrefix}
              resolveSamlMetadata={resolveSamlMetadata}
              showSignRequest={showSignRequest}
            />
          </TabsContent>

          {showProvisioningTab && (
            <TabsContent value="provisioning">
              {provisioningMethod === PROVISIONING_METHODS.GOOGLE_WORKSPACE ? (
                <SsoProvisioningGoogleSyncPanel
                  key={provider!.id}
                  provider={provider!}
                  permissions={permissions}
                  readOnly={readOnly}
                  createAction={provisioning?.createAction}
                  deleteAction={provisioning?.deleteAction}
                  customMessages={customMessages?.tabs?.provisioning?.content}
                  styling={styling}
                />
              ) : (
                <SsoProvisioningTab
                  provider={provider!}
                  readOnly={readOnly}
                  isProvisioningUpdating={isProvisioningUpdating}
                  isProvisioningDeleting={isProvisioningDeleting}
                  isScimTokensLoading={isScimTokensLoading}
                  isScimTokenCreating={isScimTokenCreating}
                  isScimTokenDeleting={isScimTokenDeleting}
                  hideAttributeMappings={hideAttributeMappings}
                  hasProvisioningAttributeSyncWarning={hasProvisioningAttributeSyncWarning}
                  onAttributeSync={syncProvisioningAttributes}
                  isSyncingAttributes={isProvisioningAttributesSyncing}
                  onCreateProvisioning={createProvisioning}
                  onDeleteProvisioning={deleteProvisioning}
                  onListScimTokens={listScimTokens}
                  onCreateScimToken={createScimToken}
                  onDeleteScimToken={deleteScimToken}
                  focusGuidedSetupButton={hasLeftProvisioningGuidedSetup}
                  onStartGuidedSetup={
                    !hideGuidedSetup
                      ? () => {
                          setLeftProvisioningGuidedSetup(false);
                          setProvisioningGuidedSetup(true);
                        }
                      : undefined
                  }
                  hideGuidedSetupLifecycleWarnings={
                    provisioning?.guidedSetup?.hideLifecycleWarnings
                  }
                  organizationDisplayName={organizationDisplayName}
                  customMessages={customMessages?.tabs?.provisioning?.content}
                  styling={styling}
                  permissions={permissions}
                />
              )}
            </TabsContent>
          )}

          {!hideDomainsTab && (
            <TabsContent value="domain">
              <SsoDomainTab
                customMessages={customMessages?.tabs?.domains?.content}
                styling={styling}
                domains={domains}
                schema={schema?.domains}
                idpId={providerId}
                provider={provider}
                permissions={permissions}
                readOnly={readOnly}
                domainVerificationMode={domainVerificationMode}
                discoveryPolicy={discoveryPolicy}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </StyledScope>
  );
}

/**
 * SSO provider edit interface with tabbed navigation.
 *
 * Provides a complete interface for editing SSO provider settings including:
 * - SSO tab: Provider configuration, attribute mappings, delete/remove actions
 * - Provisioning tab: SCIM configuration and token management
 * - Domains tab: Domain association and verification
 *
 * @param props - {@link SsoProviderEditProps}
 * @param props.providerId - Identity provider ID to edit
 * @param props.backButton - Back button configuration
 * @param props.sso - SSO tab lifecycle hooks (save, delete, remove actions)
 * @param props.provisioning - Provisioning tab lifecycle hooks
 * @param props.domains - Domains tab configuration
 * @param props.hideHeader - Hide the header section
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.schema - Validation schema overrides
 * @param props.readOnly - Render in read-only mode
 * @returns SSO provider edit component
 *
 * @see {@link SsoProviderEditProps} for full props documentation
 *
 * @example
 * ```tsx
 * <SsoProviderEdit
 *   providerId="con_abc123"
 *   sso={{
 *     saveAction: { onAfter: (provider) => console.log('Saved:', provider) },
 *     deleteAction: { onAfter: () => navigate('/providers') },
 *   }}
 *   backButton={{
 *     onClick: () => navigate('/providers'),
 *   }}
 * />
 * ```
 */
export { SsoProviderEdit, SsoProviderEditView };
