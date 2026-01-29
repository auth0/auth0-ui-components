import { getComponentStyles } from '@auth0/universal-components-core';
import React from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../../components/ui/card';
import { useTheme } from '../../../../hooks/use-theme';
import { useTranslator } from '../../../../hooks/use-translator';
import type { SsoProviderTabProps } from '../../../../types/my-organization/idp-management/sso-provider/sso-provider-tab-types';
import { SsoProviderDelete } from '../sso-provider-delete/provider-delete';
import { SsoProviderRemoveFromOrganization } from '../sso-provider-remove/provider-remove';

import { SsoProviderAttributeSyncAlert } from './sso-provider-attribute-sync-alert';
import { SsoProviderDetails } from './sso-provider-details';

/**
 * SsoProviderTab Component
 * @param root0
 * @param root0.customMessages
 * @param root0.styling
 * @param root0.readOnly
 * @param root0.provider
 * @param root0.onDelete
 * @param root0.onRemove
 * @param root0.organization
 * @param root0.isDeleting
 * @param root0.isRemoving
 * @param root0.idpConfig
 * @param root0.shouldAllowDeletion
 * @param root0.formActions
 * @param root0.hasSsoAttributeSyncWarning
 * @param root0.onAttributeSync
 * @param root0.isSyncingAttributes
 */
export function SsoProviderTab({
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  provider,
  onDelete,
  onRemove,
  organization,
  isDeleting,
  isRemoving,
  idpConfig,
  shouldAllowDeletion,
  formActions,
  hasSsoAttributeSyncWarning,
  onAttributeSync,
  isSyncingAttributes = false,
}: SsoProviderTabProps) {
  const { t } = useTranslator('idp_management.edit_sso_provider.tabs.sso', customMessages);

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <div style={currentStyles.variables} className="space-y-10">
      {hasSsoAttributeSyncWarning && (
        <SsoProviderAttributeSyncAlert
          onSync={onAttributeSync}
          isSyncing={isSyncingAttributes}
          customMessages={customMessages.attribute_sync_alert}
          className={currentStyles.classes?.['SsoProviderAttributeSyncAlert-root']}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg text-left font-medium">{t('content.title')}</CardTitle>
            <CardDescription className="text-sm text-left text-muted-foreground">
              {t('content.description')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {provider && (
            <SsoProviderDetails
              provider={provider}
              readOnly={readOnly}
              formActions={formActions}
              customMessages={customMessages.details}
              styling={styling}
              idpConfig={idpConfig}
            />
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {provider && organization && (
          <SsoProviderRemoveFromOrganization
            provider={provider}
            organizationName={organization?.name}
            onRemove={onRemove}
            isLoading={isRemoving}
            readOnly={readOnly}
            customMessages={customMessages.remove}
          />
        )}

        {provider && shouldAllowDeletion && (
          <SsoProviderDelete
            provider={provider}
            onDelete={onDelete}
            isLoading={isDeleting}
            readOnly={readOnly}
            customMessages={customMessages.delete}
          />
        )}
      </div>
    </div>
  );
}
