/**
 * SSO provider edit tab component.
 * @module sso-provider-tab
 * @internal
 */

import {
  getComponentStyles,
  IDP_ACCESS_LEVELS,
  type IdpAccessLevel,
} from '@auth0/universal-components-core';
import { Info } from 'lucide-react';
import React from 'react';

import { SsoProviderDelete } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-delete/provider-delete';
import { SsoProviderAttributeSyncAlert } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-attribute-sync-alert';
import { SsoProviderDetails } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-details';
import { SsoProviderRemoveFromOrganization } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-remove/provider-remove';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getProviderAccess } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
import type { SsoProviderTabProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';

/**
 * SSO provider tab content for editing provider configuration.
 *
 * @param props - Component props.
 * @param props.customMessages - Custom i18n message overrides.
 * @param props.styling - CSS variables and class overrides.
 * @param props.permissions - What the current user is allowed to do.
 * @param props.providerAccess - What the organization's access level allows; read from the provider by default.
 * @param props.provider - The SSO provider being edited.
 * @param props.onDelete - Callback when provider is deleted.
 * @param props.onRemove - Callback when provider is removed from organization.
 * @param props.organization - Current organization context.
 * @param props.isDeleting - Whether deletion is in progress.
 * @param props.isRemoving - Whether removal is in progress.
 * @param props.idpConfig - Identity provider configuration.
 * @param props.shouldAllowDeletion - Whether deletion is allowed.
 * @param props.formActions - Form action handlers.
 * @param props.hasSsoAttributeSyncWarning - Whether to show attribute sync warning.
 * @param props.onAttributeSync - Callback for attribute sync.
 * @param props.isSyncingAttributes - Whether attribute sync is in progress.
 * @returns SSO provider tab content.
 * @internal
 */
export function SsoProviderTab({
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  permissions,
  providerAccess,
  readOnly = false,
  provider,
  onDelete,
  onRemove,
  organization,
  isDeleting,
  isRemoving,
  idpConfig,
  shouldAllowDeletion,
  hideDeleteProvider = false,
  hideRemoveFromOrganization = false,
  hideAttributeMappings = false,
  formActions,
  hasSsoAttributeSyncWarning,
  onAttributeSync,
  isSyncingAttributes = false,
  showThirdPartyAccess = false,
  showCrossAppAccess = false,
  isCrossAppAccessReadOnly = false,
  isOrganizationBlocked = false,
  connectionNamePrefix,
  resolveSamlMetadata,
  showSignRequest,
}: SsoProviderTabProps) {
  const { t } = useTranslator('idp_management.edit_sso_provider.tabs.sso', customMessages);

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const effectiveAccess = providerAccess ?? getProviderAccess(provider);
  const canUpdateProvider = permissions.canUpdateProvider;
  const isDetailsReadOnly = readOnly || !canUpdateProvider || !effectiveAccess.canEditDetails;
  const isLoginSettingsReadOnly =
    readOnly || !canUpdateProvider || !effectiveAccess.canEditLoginSettings;

  const accessAlertMessages: Partial<Record<IdpAccessLevel, string>> = {
    [IDP_ACCESS_LEVELS.LIMITED]: t('content.access_alerts.limited'),
    [IDP_ACCESS_LEVELS.READONLY]: t('content.access_alerts.readonly'),
  };
  const accessAlertMessage = accessAlertMessages[effectiveAccess.accessLevel];

  const isSyncAccessRestricted =
    !readOnly && canUpdateProvider && !effectiveAccess.canSyncAttributes;
  const isRemoveAccessRestricted =
    !readOnly && permissions.canDetachProvider && !effectiveAccess.canDetach;
  const isDeleteAccessRestricted =
    !readOnly && permissions.canDeleteProvider && !effectiveAccess.canDelete;

  return (
    <div style={currentStyles.variables} className="space-y-10">
      {accessAlertMessage && (
        <Alert variant="warning">
          <Info />
          <AlertDescription className="text-warning-foreground">
            {accessAlertMessage}
          </AlertDescription>
        </Alert>
      )}

      {hasSsoAttributeSyncWarning && (
        <SsoProviderAttributeSyncAlert
          canSync={canUpdateProvider && effectiveAccess.canSyncAttributes}
          permissionDenied={!readOnly && !canUpdateProvider}
          isAccessRestricted={isSyncAccessRestricted}
          onSync={onAttributeSync}
          isSyncing={isSyncingAttributes}
          customMessages={customMessages.attribute_sync_alert}
          classes={currentStyles.classes}
          style={currentStyles.variables}
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
              readOnly={isDetailsReadOnly}
              isLoginSettingsReadOnly={isLoginSettingsReadOnly}
              hideAttributeMappings={hideAttributeMappings}
              formActions={formActions}
              customMessages={customMessages.details}
              styling={styling}
              idpConfig={idpConfig}
              showThirdPartyAccess={showThirdPartyAccess}
              showCrossAppAccess={showCrossAppAccess}
              isCrossAppAccessReadOnly={isCrossAppAccessReadOnly}
              isOrganizationBlocked={isOrganizationBlocked}
              connectionNamePrefix={connectionNamePrefix}
              resolveSamlMetadata={resolveSamlMetadata}
              showSignRequest={showSignRequest}
            />
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {provider && organization?.name && !hideRemoveFromOrganization && (
          <SsoProviderRemoveFromOrganization
            provider={provider}
            organizationName={organization.name}
            onRemove={onRemove}
            isLoading={isRemoving}
            readOnly={!permissions.canDetachProvider || !effectiveAccess.canDetach}
            permissionDenied={!readOnly && !permissions.canDetachProvider}
            isAccessRestricted={isRemoveAccessRestricted}
            customMessages={customMessages.remove}
          />
        )}

        {provider && shouldAllowDeletion && !hideDeleteProvider && (
          <SsoProviderDelete
            provider={provider}
            onDelete={onDelete}
            isLoading={isDeleting}
            readOnly={!permissions.canDeleteProvider || !effectiveAccess.canDelete}
            permissionDenied={!readOnly && !permissions.canDeleteProvider}
            isAccessRestricted={isDeleteAccessRestricted}
            customMessages={customMessages.delete}
          />
        )}
      </div>
    </div>
  );
}
