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
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSsoProviderEdit } from '@/hooks/my-organization/use-sso-provider-edit';
import { useSsoProviderEditLogic } from '@/hooks/my-organization/use-sso-provider-edit-logic';
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
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.schema - Zod validation schema
 * @param props.readOnly - Whether the component is in read-only mode
 * @internal
 * @returns JSX element
 */
function SsoProviderEdit(props: SsoProviderEditProps) {
  const {
    providerId,
    backButton,
    sso,
    provisioning,
    domains,
    hideHeader = false,
    customMessages = {},
    styling = {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    schema,
    readOnly = false,
  } = props;

  const ssoProviderEdit = useSsoProviderEdit(providerId, {
    sso,
    provisioning,
    domains,
    customMessages,
  });

  const ssoProviderEditLogic = useSsoProviderEditLogic(ssoProviderEdit);

  const ssoProviderCreateLogicProps: Omit<SsoProviderEditLogicProps, 'handleToggleProvider'> = {
    ...ssoProviderEdit,
    shouldAllowDeletion: ssoProviderEditLogic.shouldAllowDeletion,
    isLoadingConfig: ssoProviderEditLogic.isLoadingConfig,
    idpConfig: ssoProviderEditLogic.idpConfig,
    isLoadingIdpConfig: ssoProviderEditLogic.isLoadingIdpConfig,
    showProvisioningTab: ssoProviderEditLogic.showProvisioningTab,
    styling,
    customMessages,
    backButton,
    schema,
    readOnly,
    providerId,
    domains,
    hideHeader,
  };

  const ssoProviderCreateHandlerProps: SsoProviderEditHandlerProps = {
    handleToggleProvider: ssoProviderEditLogic.handleToggleProvider,
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

  return (
    <GateKeeper isLoading={ssoProviderEdit.isLoading} styling={styling}>
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
    provider,
    organization,
    isLoading,
    isUpdating,
    isDeleting,
    isRemoving,
    idpConfig,
    customMessages,
    backButton,
    shouldAllowDeletion,
    isLoadingConfig,
    isLoadingIdpConfig,
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

  if (isLoading || isLoadingConfig || isLoadingIdpConfig) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <StyledScope style={currentStyles.variables}>
      <div className="w-full">
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
                disabled: isUpdating,
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
