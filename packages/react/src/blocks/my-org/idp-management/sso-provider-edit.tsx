'use client';

import { getComponentStyles, MY_ORG_SSO_PROVIDER_EDIT_SCOPES } from '@auth0-web-ui-components/core';
import React, { useState } from 'react';

import { SsoProviderTab } from '../../../components/my-org/idp-management/sso-provider-edit/sso-provider-tab';
import { SsoProvisioningTab } from '../../../components/my-org/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-tab';
import { Header } from '../../../components/ui/header';
import { Spinner } from '../../../components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { withMyOrgService } from '../../../hoc';
import { useTheme } from '../../../hooks';
import { useTranslator } from '../../../hooks';
import { useSsoProviderEdit } from '../../../hooks/my-org/idp-management/use-sso-provider-edit';
import { cn } from '../../../lib';
import type { SsoProviderEditProps } from '../../../types/my-org/idp-management/sso-provider/sso-provider-edit-types';

export function SsoProviderEditComponent({
  idpId,
  backButton,
  update,
  delete: deleteAction,
  removeFromOrg,
  createProvisioning,
  deleteProvisioning,
  createScimToken,
  deleteScimToken,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
}: SsoProviderEditProps) {
  const { t } = useTranslator('idp_management.edit_sso_provider', customMessages);
  const { isDarkMode } = useTheme();

  const {
    provider,
    organization,
    isLoading,
    isUpdating,
    isDeleting,
    isRemoving,
    isProvisioningUpdating,
    isProvisioningDeleting,
    isScimTokensLoading,
    isScimTokenCreating,
    isScimTokenDeleting,
    updateProvider,
    createProvisioning: createProvisioningAction,
    deleteProvisioning: deleteProvisioningAction,
    listScimTokens,
    createScimToken: createScimTokenAction,
    deleteScimToken: deleteScimTokenAction,
    onDeleteConfirm,
    onRemoveConfirm,
  } = useSsoProviderEdit(idpId, {
    update,
    deleteAction,
    removeFromOrg,
    createProvisioning,
    deleteProvisioning,
    createScimToken,
    deleteScimToken,
    customMessages,
  });

  const [activeTab, setActiveTab] = useState('sso');

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleToggleProvider = async (enabled: boolean) => {
    if (!provider?.strategy) return;

    await updateProvider({
      strategy: provider.strategy,
      is_enabled: enabled,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div style={currentStyles.variables} className="w-full">
      <Header
        title={provider?.display_name || provider?.name || ''}
        backButton={
          backButton && {
            ...backButton,
            text: t('header.back_button_text'),
          }
        }
        actions={[
          {
            type: 'switch',
            checked: provider?.is_enabled ?? false,
            onCheckedChange: handleToggleProvider,
            disabled: isUpdating,
          },
        ]}
        className={currentStyles?.classes?.['SsoProviderEdit-header']}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className={cn('space-y-10', currentStyles?.classes?.['SsoProviderEdit-tabs'])}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sso" className="text-sm">
            {t('tabs.sso.name')}
          </TabsTrigger>
          <TabsTrigger value="provisioning" className="text-sm">
            {t('tabs.provisioning.name')}
          </TabsTrigger>
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
            customMessages={customMessages.tabs?.sso?.content}
            styling={styling}
            formActions={{
              isLoading: isUpdating,
              nextAction: {
                disabled: isUpdating || !provider || isLoading,
                onClick: updateProvider,
              },
            }}
          />
        </TabsContent>

        <TabsContent value="provisioning">
          <SsoProvisioningTab
            provider={provider!}
            isProvisioningUpdating={isProvisioningUpdating}
            isProvisioningDeleting={isProvisioningDeleting}
            isScimTokensLoading={isScimTokensLoading}
            isScimTokenCreating={isScimTokenCreating}
            isScimTokenDeleting={isScimTokenDeleting}
            onCreateProvisioning={createProvisioningAction}
            onDeleteProvisioning={deleteProvisioningAction}
            onListScimTokens={listScimTokens}
            onCreateScimToken={createScimTokenAction}
            onDeleteScimToken={deleteScimTokenAction}
            customMessages={customMessages.tabs?.provisioning?.content}
            styling={styling}
          />
        </TabsContent>

        <TabsContent value="domain">
          <></>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const SsoProviderEdit = withMyOrgService(
  SsoProviderEditComponent,
  MY_ORG_SSO_PROVIDER_EDIT_SCOPES,
);
