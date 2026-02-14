import { getComponentStyles } from '@auth0/universal-components-core';
import React from 'react';

import { SsoProviderDelete } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-delete/provider-delete';
import { SsoProviderAttributeSyncAlert } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-attribute-sync-alert';
import { SsoProviderDetails } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-details';
import { SsoProviderRemoveFromOrganization } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-remove/provider-remove';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoProviderTabProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';

/**
 * SsoProviderTab Component
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
