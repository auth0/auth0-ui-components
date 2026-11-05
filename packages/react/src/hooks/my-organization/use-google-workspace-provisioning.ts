/**
 * Google Workspace provisioning hook.
 * @module use-google-workspace-provisioning
 * @internal
 */

import { GOOGLE_WORKSPACE_CONSENT_TIMING } from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useGoogleWorkspaceProvisioningService } from '@/hooks/my-organization/shared/services/use-google-workspace-provisioning-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { usePollUntil } from '@/hooks/shared/use-poll-until';
import { useTranslator } from '@/hooks/shared/use-translator';
import { openHttpsUrlInNewTab } from '@/lib/utils/shared/helper-utils';
import type {
  GoogleWorkspaceConsentPhase,
  GoogleWorkspaceProvisioningState,
  UseGoogleWorkspaceProvisioningOptions,
  UseGoogleWorkspaceProvisioningReturn,
} from '@/types/my-organization/idp-management/sso-provisioning/google-workspace-provisioning-types';

const { VERIFY_INTERVAL_MS, MAX_POLL_MS, MAX_POLL_ATTEMPTS } = GOOGLE_WORKSPACE_CONSENT_TIMING;

/**
 * Hook for Google Workspace directory provisioning: the Google consent flow and its polling,
 * automatic synchronization, and disabling.
 *
 * @param options - Hook options.
 * @param options.provider - The SSO provider being configured.
 * @param options.permissions - What the current user is allowed to do.
 * @param options.customMessages - Custom notification messages for toasts.
 * @returns The UI state model and actions.
 * @internal
 */
export function useGoogleWorkspaceProvisioning({
  provider,
  permissions,
  customMessages = {},
}: UseGoogleWorkspaceProvisioningOptions): UseGoogleWorkspaceProvisioningReturn {
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const handleError = useErrorHandler();
  const service = useGoogleWorkspaceProvisioningService(provider.id ?? '', { customMessages });

  const [consentPhase, setConsentPhase] = useState<GoogleWorkspaceConsentPhase>('idle');
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [isGranted, setIsGranted] = useState(false);
  const [wasDisabled, setWasDisabled] = useState(false);
  const [isEnableAutoSyncModalOpen, setEnableAutoSyncModalOpen] = useState(false);
  const [isDisableModalOpen, setDisableModalOpen] = useState(false);

  const hasFullAccessLevel = provider.access_level === 'full';
  const canStartConsent = permissions.canCreateProvisioning && hasFullAccessLevel;

  const failConsent = (error?: unknown) => {
    setConsentPhase('failed');
    const message = t('google_workspace_provisioning.connect_error');
    if (error) {
      handleError(error, { fallbackMessage: message });
    } else {
      showToast({ type: 'error', message });
    }
  };

  const handleConsentComplete = async () => {
    try {
      const config = await service.refetchConfig();
      setConsentPhase('idle');
      setTicketUrl(null);
      setIsGranted(true);
      setWasDisabled(false);
      // The enable auto sync modal confirms the granted access itself.
      if (config && !config.synchronize_automatically && permissions.canUpdateProvisioning) {
        setEnableAutoSyncModalOpen(true);
      } else {
        showToast({
          type: 'success',
          message: t('google_workspace_provisioning.connected_success'),
        });
      }
    } catch (error) {
      failConsent(error);
    }
  };

  const consentPolling = usePollUntil({
    request: service.verifyConsent,
    // Any status other than `waiting` ends the consent flow; only `complete` grants access.
    isDone: (result) => result.status !== 'waiting',
    // Consent cannot complete before the administrator has acted in the new tab.
    immediate: false,
    // The verify endpoint must not be called more often than every 5000 ms, also on focus.
    focusThrottleMs: VERIFY_INTERVAL_MS,
    getInterval: ({ elapsedMs, attempts }) =>
      elapsedMs >= MAX_POLL_MS || attempts >= MAX_POLL_ATTEMPTS ? false : VERIFY_INTERVAL_MS,
    onDone: (result) => (result.status === 'complete' ? handleConsentComplete() : failConsent()),
    onExhausted: () => failConsent(),
    onError: failConsent,
  });

  const createTicket = useCallback(async (): Promise<string | null> => {
    if (!canStartConsent) return null;
    try {
      const url = await service.startConsent();
      setTicketUrl(url);
      return url;
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
      return null;
    }
  }, [canStartConsent, service.startConsent, handleError, t]);

  const openTicket = useCallback(
    (url: string) => {
      if (!openHttpsUrlInNewTab(url)) {
        showToast({ type: 'error', message: t('general_error') });
        return;
      }
      setConsentPhase('waiting');
      consentPolling.start();
    },
    [consentPolling.start, t],
  );

  const startConsent = useCallback(async (): Promise<void> => {
    const url = await createTicket();
    if (url) openTicket(url);
  }, [createTicket, openTicket]);

  const continueConsent = useCallback(() => {
    if (ticketUrl) openTicket(ticketUrl);
  }, [ticketUrl, openTicket]);

  const resetConsent = useCallback(() => {
    consentPolling.stop();
    setTicketUrl(null);
    setConsentPhase('idle');
  }, [consentPolling.stop]);

  const setProvisioningEnabled = useCallback(
    async (enabled: boolean): Promise<void> => {
      if (enabled) {
        await createTicket();
        return;
      }
      if (service.config) {
        if (permissions.canDeleteProvisioning) setDisableModalOpen(true);
        return;
      }
      // Without a configuration there is nothing to delete; only the consent flow is dropped.
      resetConsent();
    },
    [permissions, service.config, createTicket, resetConsent],
  );

  const updateAutoSync = useCallback(
    async (enabled: boolean, successMessage: string): Promise<boolean> => {
      if (!permissions.canUpdateProvisioning) return false;
      try {
        await service.setAutoSync(enabled);
        showToast({ type: 'success', message: successMessage });
        return true;
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
        return false;
      }
    },
    [permissions, service.setAutoSync, handleError, t],
  );

  const setAutoSync = useCallback(
    async (enabled: boolean): Promise<void> => {
      await updateAutoSync(
        enabled,
        t(
          enabled
            ? 'google_workspace_provisioning.auto_sync_enabled_success'
            : 'google_workspace_provisioning.auto_sync_disabled_success',
        ),
      );
    },
    [updateAutoSync, t],
  );

  const confirmEnableAutoSyncModal = useCallback(async (): Promise<void> => {
    const updated = await updateAutoSync(
      true,
      t('google_workspace_provisioning.connected_with_auto_sync_success'),
    );
    if (updated) setEnableAutoSyncModalOpen(false);
  }, [updateAutoSync, t]);

  const confirmDisable = useCallback(async (): Promise<void> => {
    if (!permissions.canDeleteProvisioning) return;
    try {
      await service.deleteConfig();
      showToast({ type: 'success', message: t('provisioning_disabled_success') });
      setDisableModalOpen(false);
      setIsGranted(false);
      setWasDisabled(true);
      resetConsent();
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
    }
  }, [permissions, service.deleteConfig, resetConsent, handleError, t]);

  const { config, isConfigLoading, isStartingConsent, isUpdating, isDeleting } = service;
  const state: GoogleWorkspaceProvisioningState = config ? 'connected' : 'not_connected';

  return {
    model: {
      state,
      config,
      consentPhase,
      isConsentPending: ticketUrl !== null,
      isGranted,
      wasDisabled,
      isLoading: isConfigLoading,
      isStartingConsent,
      isUpdating,
      isDeleting,
      isEnableAutoSyncModalOpen,
      isDisableModalOpen,
    },
    actions: {
      setProvisioningEnabled,
      startConsent,
      continueConsent,
      setAutoSync,
      confirmEnableAutoSyncModal,
      dismissEnableAutoSyncModal: () => setEnableAutoSyncModalOpen(false),
      setDisableModalOpen,
      confirmDisable,
    },
  };
}
