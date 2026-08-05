/** @module sso-provider-edit */

'use client';

import { getComponentStyles } from '@auth0/universal-components-core';
import { useState, useMemo } from 'react';

import { SsoDomainTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-tab';
import { SsoProviderTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-tab';
import { SsoProvisioningTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-tab';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSsoProviderEdit } from '@/hooks/my-organization/use-sso-provider-edit';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  SsoProviderEditHandlerProps,
  SsoProviderEditLogicProps,
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
 * @param props.hideDeleteProvider - Whether to hide the delete provider action
 * @param props.hideRemoveFromOrganization - Whether to hide the remove from organization action
 * @param props.hideAttributeMappings - Whether to hide the attribute mappings section
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
    hideDeleteProvider = false,
    hideRemoveFromOrganization = false,
    hideAttributeMappings = false,
    customMessages = {},
    styling = {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    schema,
    readOnly = false,
    enableProviderAction,
  } = props;

  const ssoProviderEdit = useSsoProviderEdit(providerId, {
    sso,
    provisioning,
    domains,
    customMessages,
    skipProvisioningFetch: hideProvisioningTab && hideAttributeMappings,
    enableProviderAction,
  });

  const ssoProviderCreateLogicProps: Omit<SsoProviderEditLogicProps, 'handleToggleProvider'> = {
    ...ssoProviderEdit,
    shouldAllowDeletion: ssoProviderEdit.shouldAllowDeletion,
    idpConfig: ssoProviderEdit.idpConfig,
    showProvisioningTab: ssoProviderEdit.showProvisioningTab && !hideProvisioningTab,
    styling,
    customMessages,
    backButton,
    schema,
    readOnly,
    providerId,
    domains,
    hideHeader,
    hideProvisioningTab,
    hideDeleteProvider,
    hideRemoveFromOrganization,
    hideAttributeMappings,
    enableProviderAction,
  };

  const ssoProviderCreateHandlerProps: SsoProviderEditHandlerProps = {
    handleToggleProvider: ssoProviderEdit.handleToggleProvider,
    updateProvider: ssoProviderEdit.updateProvider,
    listScimTokens: ssoProviderEdit.listScimTokens,
    syncSsoAttributes: ssoProviderEdit.syncSsoAttributes,
    onDeleteConfirm: ssoProviderEdit.onDeleteConfirm,
    onRemoveConfirm: ssoProviderEdit.onRemoveConfirm,
    createScimTokenAction: ssoProviderEdit.createScimToken,
    deleteScimTokenAction: ssoProviderEdit.deleteScimToken,
    createProvisioningAction: ssoProviderEdit.createProvisioning,
    deleteProvisioningAction: ssoProviderEdit.deleteProvisioning,
    syncProvisioningAttributes: ssoProviderEdit.syncProvisioningAttributes,
  };

  const isLoading =
    ssoProviderEdit.isLoading ||
    ssoProviderEdit.isLoadingConfig ||
    ssoProviderEdit.isLoadingIdpConfig;

  return (
    <GateKeeper isLoading={isLoading} styling={styling}>
      <SsoProviderEditView
        logic={ssoProviderCreateLogicProps}
        handlers={ssoProviderCreateHandlerProps}
      />
    </GateKeeper>
  );
}

/**
 * Internal SSO provider edition view component
 * @param props - Component props
 * @param props.logic - Component logic props
 * @param props.handlers - Component handler props
 * @internal
 * @returns JSX element
 */
function SsoProviderEditView({ logic, handlers }: SsoProviderEditViewProps) {
  const {
    styling,
    schema,
    readOnly,
    providerId,
    domains,
    hideHeader,
    hideDeleteProvider,
    hideRemoveFromOrganization,
    hideAttributeMappings,
    provider,
    organization,
    isLoading,
    isUpdating,
    isEnabling,
    isDeleting,
    isRemoving,
    idpConfig,
    customMessages,
    backButton,
    shouldAllowDeletion,
    showProvisioningTab,
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
  } = logic;

  const {
    updateProvider,
    listScimTokens,
    syncSsoAttributes,
    onDeleteConfirm,
    onRemoveConfirm,
    handleToggleProvider,
    createProvisioningAction,
    deleteProvisioningAction,
    createScimTokenAction,
    deleteScimTokenAction,
    syncProvisioningAttributes,
  } = handlers;

  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('sso');
  const { t } = useTranslator('idp_management.edit_sso_provider', customMessages);
  const currentStyles = useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

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
                disabled: isUpdating || isEnabling || enableProviderAction?.disabled,
                tooltip: {
                  content: provider?.is_enabled
                    ? t('header.disable_provider_tooltip_text')
                    : t('header.enable_provider_tooltip_text'),
                },
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
            className={cn('grid w-full', showProvisioningTab ? 'grid-cols-3' : 'grid-cols-2')}
          >
            <TabsTrigger value="sso" className="text-sm">
              {t('tabs.sso.name')}
            </TabsTrigger>
            {showProvisioningTab && (
              <TabsTrigger value="provisioning" className="text-sm">
                {t('tabs.provisioning.name')}
              </TabsTrigger>
            )}
            <TabsTrigger value="domain" className="text-sm">
              {t('tabs.domains.name')}
            </TabsTrigger>
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
              hideAttributeMappings={hideAttributeMappings}
              hasSsoAttributeSyncWarning={hasSsoAttributeSyncWarning}
              onAttributeSync={syncSsoAttributes}
              isSyncingAttributes={isSsoAttributesSyncing}
              customMessages={customMessages?.tabs?.sso?.content}
              styling={styling}
              formActions={{
                isLoading: isUpdating,
                nextAction: {
                  disabled: isUpdating || !provider || isLoading,
                  onClick: updateProvider,
                },
              }}
              readOnly={readOnly}
            />
          </TabsContent>

          {showProvisioningTab && (
            <TabsContent value="provisioning">
              <SsoProvisioningTab
                provider={provider!}
                isProvisioningUpdating={isProvisioningUpdating}
                isProvisioningDeleting={isProvisioningDeleting}
                isScimTokensLoading={isScimTokensLoading}
                isScimTokenCreating={isScimTokenCreating}
                isScimTokenDeleting={isScimTokenDeleting}
                hideAttributeMappings={hideAttributeMappings}
                hasProvisioningAttributeSyncWarning={hasProvisioningAttributeSyncWarning}
                onAttributeSync={syncProvisioningAttributes}
                isSyncingAttributes={isProvisioningAttributesSyncing}
                onCreateProvisioning={createProvisioningAction}
                onDeleteProvisioning={deleteProvisioningAction}
                onListScimTokens={listScimTokens}
                onCreateScimToken={createScimTokenAction}
                onDeleteScimToken={deleteScimTokenAction}
                customMessages={customMessages?.tabs?.provisioning?.content}
                styling={styling}
              />
            </TabsContent>
          )}

          <TabsContent value="domain">
            <SsoDomainTab
              customMessages={customMessages?.tabs?.domains?.content}
              styling={styling}
              domains={domains}
              schema={schema?.domains}
              idpId={providerId}
              provider={provider}
              readOnly={readOnly}
            />
          </TabsContent>
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
