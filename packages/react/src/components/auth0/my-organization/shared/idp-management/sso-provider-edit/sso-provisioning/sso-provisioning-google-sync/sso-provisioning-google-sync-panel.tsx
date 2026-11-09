/**
 * Google Workspace provisioning tab content.
 * @module sso-provisioning-google-sync-panel
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Info } from 'lucide-react';
import * as React from 'react';

import { SsoProvisioningGoogleSyncDisableModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-google-sync/sso-provisioning-google-sync-disable-modal';
import { SsoProvisioningGoogleSyncEnableAutoSyncModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-google-sync/sso-provisioning-google-sync-enable-auto-sync-modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useGoogleWorkspaceProvisioning } from '@/hooks/my-organization/use-google-workspace-provisioning';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import { getRelativeTimeLabel } from '@/lib/utils/shared/helper-utils';
import type { SsoProvisioningGoogleSyncPanelProps } from '@/types/my-organization/idp-management/sso-provisioning/google-workspace-provisioning-types';

/**
 * Google Workspace provisioning tab content: enabling provisioning through Google consent,
 * automatic synchronization, and disabling.
 *
 * @param props - Component props.
 * @param props.provider - The SSO provider being configured.
 * @param props.permissions - What the current user is allowed to do.
 * @param props.readOnly - Whether the component is in read-only mode.
 * @param props.customMessages - Custom i18n message overrides.
 * @param props.notificationMessages - Custom notification messages for toasts.
 * @param props.styling - CSS variables and class overrides.
 * @returns The Google Workspace provisioning card.
 * @internal
 */
export function SsoProvisioningGoogleSyncPanel({
  provider,
  permissions,
  readOnly = false,
  customMessages = {},
  notificationMessages,
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
}: SsoProvisioningGoogleSyncPanelProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.google_workspace',
    customMessages,
  );
  const { t: tCommon } = useTranslator('common', customMessages.common);

  const { model, actions } = useGoogleWorkspaceProvisioning({
    provider,
    permissions,
    customMessages: notificationMessages,
  });
  const {
    state,
    config,
    consentPhase,
    isConsentPending,
    isGranted,
    wasDisabled,
    isLoading,
    isStartingConsent,
    isUpdating,
    isDeleting,
    isEnableAutoSyncModalOpen,
    isDisableModalOpen,
  } = model;

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );
  const classes = currentStyles.classes ?? {};

  const isProviderEnabled = !!provider.is_enabled;
  const hasFullAccessLevel = provider.access_level === 'full';
  const isConnected = state === 'connected';
  // The switch is on while connected, and once a consent ticket was created for this session.
  const isSwitchOn = isConnected || isConsentPending;
  const isWaiting = consentPhase === 'waiting';
  const isFailed = !isConnected && consentPhase === 'failed';
  const isAutoSyncEnabled = !!config?.synchronize_automatically;
  const isPreviouslyDisabled = !isSwitchOn && wasDisabled;

  const canStartConsent =
    !readOnly && isProviderEnabled && hasFullAccessLevel && permissions.canCreateProvisioning;
  // Turning provisioning on creates a consent ticket; turning it off deletes the configuration.
  const canToggle =
    !readOnly &&
    (isConnected ? permissions.canDeleteProvisioning : isConsentPending || canStartConsent);
  const canUpdateAutoSync = !readOnly && permissions.canUpdateProvisioning;
  const status = isFailed ? 'failed' : isGranted && isConnected ? 'granted' : undefined;
  const lastSyncedAt = config?.last_synchronization_at
    ? Date.parse(config.last_synchronization_at)
    : NaN;
  // A sync confirms the Google authorization; until one succeeds after the configuration was
  // created, the authorization may already be revoked.
  const syncAlert = !config
    ? undefined
    : config.last_synchronization_status === 'failed'
      ? 'sync_failed'
      : Number.isNaN(lastSyncedAt) || lastSyncedAt < Date.parse(config.created_at)
        ? 'unconfirmed_authorization'
        : undefined;

  const showConnect = !readOnly && isSwitchOn && !isWaiting;
  const connectDisabledReason = !isProviderEnabled
    ? t('header.provider_disabled_tooltip')
    : !permissions.canCreateProvisioning
      ? tCommon('error.forbidden')
      : !hasFullAccessLevel
        ? t('header.access_level_required_tooltip')
        : undefined;
  const connectButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!canStartConsent || isStartingConsent}
      onClick={
        isFailed
          ? actions.startConsent
          : isConnected
            ? actions.startConsent
            : actions.continueConsent
      }
    >
      {t(isFailed ? 'header.retry_button_label' : 'header.continue_button_label')}
    </Button>
  );

  const provisioningTooltip = !isProviderEnabled
    ? t('header.provider_disabled_tooltip')
    : !canToggle
      ? !isConnected && !hasFullAccessLevel
        ? t('header.access_level_required_tooltip')
        : tCommon('error.forbidden')
      : t(isSwitchOn ? 'header.disable_tooltip' : 'header.enable_tooltip');
  const provisioningSwitch = (
    <span>
      <Switch
        checked={isSwitchOn}
        onCheckedChange={actions.setProvisioningEnabled}
        disabled={isWaiting || !isProviderEnabled || !canToggle}
        aria-label={provisioningTooltip}
      />
    </span>
  );

  const autoSyncTooltip = !canUpdateAutoSync
    ? tCommon('error.forbidden')
    : t(isAutoSyncEnabled ? 'auto_sync.disable_tooltip' : 'auto_sync.enable_tooltip');
  const autoSyncSwitch = (
    <span>
      <Switch
        checked={isAutoSyncEnabled}
        onCheckedChange={actions.setAutoSync}
        disabled={!canUpdateAutoSync || isUpdating}
        aria-label={autoSyncTooltip}
      />
    </span>
  );

  return (
    <div style={currentStyles.variables}>
      <Card className={cn('relative', classes['SsoProvisioningGoogleSyncPanel-root'])}>
        <CardHeader className={classes['SsoProvisioningGoogleSyncPanel-header']}>
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground text-left">
            <span>{t('header.title')}</span>
            {status && (
              <Badge
                variant={status === 'granted' ? 'success' : 'warning'}
                size="sm"
                className={classes['SsoProvisioningGoogleSyncPanel-statusBadge']}
              >
                {t(`header.status.${status}`)}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-left">
            {t(isSwitchOn ? 'header.description_enabled' : 'header.description_disabled')}
          </CardDescription>
          {isConnected && !Number.isNaN(lastSyncedAt) && (
            <div
              className={cn(
                'flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground',
                classes['SsoProvisioningGoogleSyncPanel-connectionInfo'],
              )}
            >
              <span>
                {t('connection_info.last_synced_label')}{' '}
                <span className="text-foreground">
                  {getRelativeTimeLabel(lastSyncedAt, tCommon)}
                </span>
              </span>
            </div>
          )}
          <CardAction
            className={cn(
              'flex items-center gap-3 self-center',
              classes['SsoProvisioningGoogleSyncPanel-actions'],
            )}
          >
            {isLoading ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <>
                {showConnect &&
                  (connectDisabledReason ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{connectButton}</span>
                      </TooltipTrigger>
                      <TooltipContent>{connectDisabledReason}</TooltipContent>
                    </Tooltip>
                  ) : (
                    connectButton
                  ))}
                {isDeleting || (isStartingConsent && !isSwitchOn) ? (
                  <Spinner className="w-4 h-4" />
                ) : readOnly ? (
                  provisioningSwitch
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>{provisioningSwitch}</TooltipTrigger>
                    <TooltipContent>{provisioningTooltip}</TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </CardAction>
        </CardHeader>

        {(isPreviouslyDisabled || syncAlert) && (
          <CardContent>
            <Alert
              variant={syncAlert === 'sync_failed' ? 'destructive' : 'warning'}
              className={classes['SsoProvisioningGoogleSyncPanel-statusAlert']}
            >
              <Info />
              <AlertDescription>
                {isPreviouslyDisabled ? (
                  t('status_alert.previously_disabled')
                ) : (
                  <>
                    {t.trans(`status_alert.${syncAlert}`, {
                      components: {
                        link: (children: string) =>
                          canStartConsent ? (
                            <button
                              key="reverify-link"
                              type="button"
                              className="underline underline-offset-4"
                              onClick={actions.startConsent}
                            >
                              {children}
                            </button>
                          ) : (
                            <React.Fragment key="reverify-link">{children}</React.Fragment>
                          ),
                      },
                    })}
                  </>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        {isConnected && (
          <>
            <Separator />
            <div
              className={cn(
                'flex items-center justify-between gap-6 px-6',
                classes['SsoProvisioningGoogleSyncPanel-autoSync'],
              )}
            >
              <div className="space-y-1.5 text-left">
                <h3 className="text-lg font-medium text-foreground leading-none">
                  {t('auto_sync.title')}
                </h3>
                <p className="text-sm text-muted-foreground">{t('auto_sync.description')}</p>
              </div>
              {isUpdating ? (
                <Spinner className="w-4 h-4" />
              ) : readOnly ? (
                autoSyncSwitch
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>{autoSyncSwitch}</TooltipTrigger>
                  <TooltipContent>{autoSyncTooltip}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </>
        )}

        {isWaiting && (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              'bg-background/80 absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-4xl p-6 text-center backdrop-blur-sm',
              classes['SsoProvisioningGoogleSyncPanel-errorOverlay'],
            )}
          >
            <Spinner colorScheme="muted" className="border-muted" />
            <p className="text-lg font-medium text-foreground">{t('error.title')}</p>
            <Button
              type="button"
              variant="outline"
              disabled={isStartingConsent}
              onClick={actions.startConsent}
            >
              {t('error.retry_button_label')}
            </Button>
          </div>
        )}
      </Card>

      <SsoProvisioningGoogleSyncEnableAutoSyncModal
        open={isEnableAutoSyncModalOpen}
        isLoading={isUpdating}
        onDismiss={actions.dismissEnableAutoSyncModal}
        onConfirm={actions.confirmEnableAutoSyncModal}
        customMessages={customMessages.modals?.enable_auto_sync}
        className={classes['SsoProvisioningGoogleSyncPanel-enableAutoSyncModal']}
      />
      <SsoProvisioningGoogleSyncDisableModal
        open={isDisableModalOpen}
        isLoading={isDeleting}
        onOpenChange={actions.setDisableModalOpen}
        onConfirm={actions.confirmDisable}
        customMessages={customMessages.modals?.disable}
        className={classes['SsoProvisioningGoogleSyncPanel-disableModal']}
      />
    </div>
  );
}
