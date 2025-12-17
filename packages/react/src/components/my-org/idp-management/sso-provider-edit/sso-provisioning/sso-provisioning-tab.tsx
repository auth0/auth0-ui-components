import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { useSsoProviderEdit } from '../../../../../hooks/my-org/idp-management/use-sso-provider-edit';
import { useTheme } from '../../../../../hooks/use-theme';
import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/theme-utils';
import type { SsoProvisioningTabProps } from '../../../../../types/my-org/idp-management/sso-provisioning/sso-provisioning-tab-types';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../../ui/card';
import { Spinner } from '../../../../ui/spinner';
import { Switch } from '../../../../ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../../../ui/tooltip';

import { SsoProvisioningDeleteModal } from './sso-provisioning-delete-modal';
import { SsoProvisioningDetails } from './sso-provisioning-details';

export function SsoProvisioningTab({
  provider,
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages = {},
}: SsoProvisioningTabProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content',
    customMessages,
  );

  const {
    provisioningConfig,
    isProvisioningLoading,
    isProvisioningUpdating,
    isProvisioningDeleting,
    isScimTokensLoading,
    isScimTokenCreating,
    isScimTokenDeleting,
    fetchProvisioning,
    createProvisioning,
    deleteProvisioning,
    listScimTokens,
    createScimToken,
    deleteScimToken,
  } = useSsoProviderEdit(provider?.id || '');

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (provider?.id) {
      fetchProvisioning();
    }
  }, [provider?.id]);

  const handleProvisioningToggle = async (enabled: boolean) => {
    if (!provider?.id) return;

    if (enabled) {
      await createProvisioning();
      await fetchProvisioning();
    } else {
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteProvisioningConfirm = async () => {
    await deleteProvisioning();
    setDeleteModalOpen(false);
  };

  const isLoading = isProvisioningLoading || isProvisioningUpdating || isProvisioningDeleting;
  const isProvisioningEnabled = !!provisioningConfig;
  const enableProvisioningToggle = isLoading || !provider?.id || !provider.is_enabled;

  return (
    <div
      style={currentStyles.variables}
      className={cn('space-y-8', currentStyles.classes?.['SsoProvisioningTab-root'])}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground text-left">
            {t('header.title')}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-left">
            {t('header.description')}
          </CardDescription>
          <CardAction>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <>
                    {!provider.is_enabled ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Switch
                            checked={isProvisioningEnabled}
                            onCheckedChange={handleProvisioningToggle}
                            disabled={enableProvisioningToggle}
                          />
                        </TooltipTrigger>
                        <TooltipContent>{t('header.enable_provisioning_tooltip')}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Switch
                        checked={isProvisioningEnabled}
                        onCheckedChange={handleProvisioningToggle}
                        disabled={enableProvisioningToggle}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isProvisioningEnabled && (
            <SsoProvisioningDetails
              provider={provider}
              provisioningConfig={provisioningConfig}
              isScimTokensLoading={isScimTokensLoading}
              isScimTokenCreating={isScimTokenCreating}
              isScimTokenDeleting={isScimTokenDeleting}
              onListScimTokens={listScimTokens}
              onCreateScimToken={createScimToken}
              onDeleteScimToken={deleteScimToken}
              customMessages={customMessages.details}
              styling={styling}
            />
          )}
        </CardContent>
      </Card>

      <SsoProvisioningDeleteModal
        open={isDeleteModalOpen}
        isLoading={isProvisioningDeleting}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteProvisioningConfirm}
        customMessages={customMessages.delete}
      />
    </div>
  );
}
