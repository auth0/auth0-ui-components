import { getComponentStyles } from '@auth0/web-ui-components-core';
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
import type { SsoProviderTabProps } from '../../../../types/my-org/idp-management/sso-provider/sso-provider-tab-types';
import { SsoProviderDelete } from '../sso-provider-delete/provider-delete';
import { SsoProviderRemoveFromOrg } from '../sso-provider-remove/provider-remove';

import { SsoProviderDetails } from './sso-provider-details';

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
}: SsoProviderTabProps) {
  const { t } = useTranslator('idp_management.edit_sso_provider.tabs.sso', customMessages);

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <div style={currentStyles.variables} className="space-y-8">
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
        {provider && organization && shouldAllowDeletion && (
          <SsoProviderRemoveFromOrg
            provider={provider}
            organizationName={organization?.name}
            onRemove={onRemove}
            isLoading={isRemoving}
            readOnly={readOnly}
          />
        )}

        {provider && shouldAllowDeletion && (
          <SsoProviderDelete
            provider={provider}
            onDelete={onDelete}
            isLoading={isDeleting}
            readOnly={readOnly}
          />
        )}
      </div>
    </div>
  );
}
