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
import {
  getConnectBlockReason,
  getConsentBadge,
  getLastSyncedAt,
  getSyncAlert,
  getToggleBlockReason,
  type GoogleBlockReason,
} from '@/lib/utils/my-organization/idp-management/google-workspace-provisioning-utils';
import { getRelativeTimeLabel } from '@/lib/utils/shared/helper-utils';
import type { SsoProvisioningGoogleSyncPanelProps } from '@/types/my-organization/idp-management/sso-provisioning/google-workspace-provisioning-types';

const BLOCK_REASON_KEYS: Record<
  Exclude<GoogleBlockReason, 'forbidden' | 'action_disabled'>,
  string
> = {
  provider_disabled: 'google_workspace.header.provider_disabled_tooltip',
  access_level_required: 'google_workspace.header.access_level_required_tooltip',
};

/**
 * Google Workspace provisioning tab content: enabling provisioning through Google consent,
 * automatic synchronization, and disabling.
 *
 * @param props - Component props.
 * @param props.provider - The SSO provider being configured.
 * @param props.permissions - What the current user is allowed to do.
 * @param props.readOnly - Whether the component is in read-only mode.
 * @param props.createAction - Lifecycle hooks for creating provisioning; `onAfter` runs once consent completes.
 * @param props.deleteAction - Lifecycle hooks for deleting provisioning.
 * @param props.customMessages - Custom i18n message overrides, including toast notifications.
 * @param props.styling - CSS variables and class overrides.
 * @returns The Google Workspace provisioning card.
 * @internal
 */
export function SsoProvisioningGoogleSyncPanel({
  provider,
  permissions,
  readOnly = false,
  createAction,
  deleteAction,
  customMessages = {},
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
}: SsoProvisioningGoogleSyncPanelProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content',
    customMessages,
  );
  const { t: tCommon } = useTranslator('common', customMessages.common);

  const { model, actions } = useGoogleWorkspaceProvisioning({
    provider,
    permissions,
    createAction,
    deleteAction,
    customMessages: customMessages.notifications,
  });
  const {
    state,
    config,
    consentPhase,
    isConsentPending,
    isGranted,
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

  const isSwitchOn = isConnected || isConsentPending;
  const isWaiting = consentPhase === 'waiting';
  const isFailed = !isConnected && consentPhase === 'failed';
  const isAutoSyncEnabled = !!config?.synchronize_automatically;

  const describeBlockReason = (reason: GoogleBlockReason): string | undefined => {
    if (reason === 'forbidden') return tCommon('error.forbidden');
    if (reason === 'action_disabled') return undefined;
    return t(BLOCK_REASON_KEYS[reason]);
  };

  const connectBlockReason = getConnectBlockReason({
    isProviderEnabled,
    canCreateProvisioning: permissions.canCreateProvisioning,
    hasFullAccessLevel,
    isActionDisabled: !!createAction?.disabled,
  });
  const canStartConsent = !readOnly && !connectBlockReason;

  const hasTogglePermission = isConnected
    ? permissions.canDeleteProvisioning
    : permissions.canCreateProvisioning;
  const canDelete = permissions.canDeleteProvisioning && !deleteAction?.disabled;
  const canToggle = !readOnly && (isConnected ? canDelete : isConsentPending || canStartConsent);
  const canUpdateAutoSync = !readOnly && permissions.canUpdateProvisioning;

  const badge = getConsentBadge({ isFailed, isGranted, isConnected });
  const lastSyncedAt = getLastSyncedAt(config);
  const syncAlert = getSyncAlert(config);

  const showConnect = !readOnly && isSwitchOn && !isWaiting;
  const connectDisabledReason = connectBlockReason && describeBlockReason(connectBlockReason);

  const connectAction = isFailed || isConnected ? actions.startConsent : actions.continueConsent;

  const connectButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!canStartConsent || isStartingConsent}
      onClick={connectAction}
    >
      {t('google_workspace.header.continue_button_label')}
    </Button>
  );

  const toggleBlockReason = getToggleBlockReason({
    isProviderEnabled,
    canToggle,
    isConnected,
    hasFullAccessLevel,
    hasTogglePermission,
    readOnly,
  });
  const provisioningLabel = t(
    isSwitchOn
      ? 'google_workspace.header.disable_tooltip'
      : 'google_workspace.header.enable_tooltip',
  );
  const provisioningTooltip = toggleBlockReason
    ? describeBlockReason(toggleBlockReason)
    : provisioningLabel;
  const connectControl = connectDisabledReason ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{connectButton}</span>
      </TooltipTrigger>
      <TooltipContent>{connectDisabledReason}</TooltipContent>
    </Tooltip>
  ) : (
    connectButton
  );
  const isProvisioningBusy = isDeleting || (isStartingConsent && !isSwitchOn);
  const provisioningSwitch = (
    <span>
      <Switch
        checked={isSwitchOn}
        onCheckedChange={actions.setProvisioningEnabled}
        disabled={isWaiting || !isProviderEnabled || !canToggle}
        aria-label={provisioningTooltip ?? provisioningLabel}
      />
    </span>
  );

  const provisioningControl =
    readOnly || !provisioningTooltip ? (
      provisioningSwitch
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>{provisioningSwitch}</TooltipTrigger>
        <TooltipContent>{provisioningTooltip}</TooltipContent>
      </Tooltip>
    );

  const autoSyncTooltip = !canUpdateAutoSync
    ? tCommon('error.forbidden')
    : t(
        isAutoSyncEnabled
          ? 'google_workspace.auto_sync.disable_tooltip'
          : 'google_workspace.auto_sync.enable_tooltip',
      );
  const autoSyncSwitch = (
    <span>
      <Switch
        checked={isAutoSyncEnabled}
        onCheckedChange={actions.setAutoSync}
        disabled={!canUpdateAutoSync || isUpdating || isDeleting || isStartingConsent || isWaiting}
        aria-label={autoSyncTooltip}
      />
    </span>
  );

  const autoSyncControl = readOnly ? (
    autoSyncSwitch
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>{autoSyncSwitch}</TooltipTrigger>
      <TooltipContent>{autoSyncTooltip}</TooltipContent>
    </Tooltip>
  );

  return (
    <div style={currentStyles.variables}>
      <Card
        className={cn(
          isWaiting && 'pointer-events-none select-none blur-sm',
          classes['SsoProvisioningGoogleSyncPanel-root'],
        )}
      >
        <CardHeader className={classes['SsoProvisioningGoogleSyncPanel-header']}>
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground text-left">
            <span>{t('google_workspace.header.title')}</span>
            {badge && (
              <Badge
                variant={badge === 'granted' ? 'success' : 'warning'}
                size="sm"
                className={classes['SsoProvisioningGoogleSyncPanel-statusBadge']}
              >
                {t(`google_workspace.header.status.${badge}`)}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-left">
            {t(
              isSwitchOn
                ? 'google_workspace.header.description_enabled'
                : 'google_workspace.header.description_disabled',
            )}
          </CardDescription>
          {isConnected && !Number.isNaN(lastSyncedAt) && (
            <div
              className={cn(
                'flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground',
                classes['SsoProvisioningGoogleSyncPanel-connectionInfo'],
              )}
            >
              <span>
                {t('google_workspace.connection_info.last_synced_label')}{' '}
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
                {showConnect && connectControl}
                {isProvisioningBusy ? <Spinner className="w-4 h-4" /> : provisioningControl}
              </>
            )}
          </CardAction>
        </CardHeader>

        {syncAlert && (
          <CardContent>
            <Alert
              variant={syncAlert === 'sync_failed' ? 'destructive' : 'warning'}
              className={classes['SsoProvisioningGoogleSyncPanel-statusAlert']}
            >
              <Info />
              <AlertDescription>
                <p>
                  <>
                    {t.trans(`google_workspace.status_alert.${syncAlert}`, {
                      components: {
                        link: (children: string) =>
                          canStartConsent && !isWaiting ? (
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
                </p>
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
                  {t('google_workspace.auto_sync.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('google_workspace.auto_sync.description')}
                </p>
              </div>
              {isUpdating ? <Spinner className="w-4 h-4" /> : autoSyncControl}
            </div>
          </>
        )}
      </Card>

      {isWaiting && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'flex flex-col items-center gap-4 pt-8 text-center',
            classes['SsoProvisioningGoogleSyncPanel-errorOverlay'],
          )}
        >
          <Spinner colorScheme="muted" className="border-border" />
          <p className="text-lg font-medium text-foreground">{t('google_workspace.error.title')}</p>
          <Button
            type="button"
            variant="outline"
            disabled={isStartingConsent}
            onClick={actions.closeConsent}
          >
            {t('google_workspace.error.retry_button_label')}
          </Button>
        </div>
      )}

      <SsoProvisioningGoogleSyncEnableAutoSyncModal
        open={isEnableAutoSyncModalOpen}
        isLoading={isUpdating}
        onDismiss={actions.dismissEnableAutoSyncModal}
        onConfirm={actions.confirmEnableAutoSyncModal}
        customMessages={customMessages.google_workspace?.modals?.enable_auto_sync}
        className={classes['SsoProvisioningGoogleSyncPanel-enableAutoSyncModal']}
      />
      <SsoProvisioningGoogleSyncDisableModal
        open={isDisableModalOpen}
        isLoading={isDeleting}
        onOpenChange={actions.setDisableModalOpen}
        onConfirm={actions.confirmDisable}
        customMessages={customMessages.google_workspace?.modals?.disable}
        className={classes['SsoProvisioningGoogleSyncPanel-disableModal']}
      />
    </div>
  );
}
