import {
  GOOGLE_WORKSPACE_CONSENT_TIMING,
  type DirectoryProvisioningConfig,
  type DirectoryProvisioningConsentStatus,
  type IdpKnownResponse,
} from '@auth0/universal-components-core';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { useGoogleWorkspaceProvisioningService } from '@/hooks/my-organization/shared/services/use-google-workspace-provisioning-service';
import { useGoogleWorkspaceProvisioning } from '@/hooks/my-organization/use-google-workspace-provisioning';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  ALL_IDP_PERMISSIONS,
  createIdpPermissions,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { mockToast } from '@/tests/utils/test-setup';
import type { UseGoogleWorkspaceProvisioningServiceReturn } from '@/types/my-organization/idp-management/sso-provisioning/google-workspace-provisioning-types';

vi.mock('@/hooks/my-organization/shared/services/use-google-workspace-provisioning-service');

const { mockedShowToast } = mockToast();

const { VERIFY_INTERVAL_MS, MAX_POLL_MS } = GOOGLE_WORKSPACE_CONSENT_TIMING;

const TICKET_URL = 'https://auth0.example.com/provisioning-ticket';

const mockProvider: IdpKnownResponse = {
  id: 'idp_123',
  name: 'google-workspace',
  strategy: 'google-apps',
  display_name: 'Google Workspace',
  is_enabled: true,
  access_level: 'full',
  options: {},
  attributes: [],
} as IdpKnownResponse;

const mockConfig: DirectoryProvisioningConfig = {
  connection_id: 'con_123',
  connection_name: 'google-workspace',
  strategy: 'google-apps',
  synchronize_automatically: false,
  status: 'incomplete',
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
};

const syncedConfig: DirectoryProvisioningConfig = {
  ...mockConfig,
  synchronize_automatically: true,
  status: 'complete',
};

describe('useGoogleWorkspaceProvisioning', () => {
  let service: UseGoogleWorkspaceProvisioningServiceReturn;
  let mockWindowOpen: Mock;
  let mockHandleError: Mock;

  const createService = (
    overrides: Partial<UseGoogleWorkspaceProvisioningServiceReturn> = {},
  ): UseGoogleWorkspaceProvisioningServiceReturn => ({
    config: null,
    isConfigLoading: false,
    isStartingConsent: false,
    isUpdating: false,
    isDeleting: false,
    startConsent: vi.fn().mockResolvedValue(TICKET_URL),
    verifyConsent: vi.fn().mockResolvedValue({ status: 'waiting' }),
    refetchConfig: vi.fn(async () => {
      service = { ...service, config: mockConfig };
      return mockConfig;
    }),
    setAutoSync: vi.fn(async (enabled: boolean) => {
      const config = enabled ? syncedConfig : mockConfig;
      service = { ...service, config };
      return config;
    }),
    deleteConfig: vi.fn(async () => {
      service = { ...service, config: null };
    }),
    ...overrides,
  });

  const renderProvisioning = (
    options: Partial<Parameters<typeof useGoogleWorkspaceProvisioning>[0]> = {},
  ) =>
    renderHook(() =>
      useGoogleWorkspaceProvisioning({
        provider: mockProvider,
        permissions: ALL_IDP_PERMISSIONS,
        ...options,
      }),
    );

  /** Advances fake timers and flushes the resulting promises. */
  const advance = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };

  const startConsent = async (result: ReturnType<typeof renderProvisioning>['result']) => {
    await act(async () => {
      await result.current.actions.startConsent();
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    service = createService();
    vi.mocked(useGoogleWorkspaceProvisioningService).mockImplementation(() => service);
    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
      t: (key: string) => key,
    } as never);
    mockHandleError = vi.fn();
    vi.spyOn(useErrorHandlerModule, 'useErrorHandler').mockReturnValue(mockHandleError);
    mockWindowOpen = vi.fn(() => ({ opener: window }) as unknown as Window);
    vi.spyOn(window, 'open').mockImplementation(mockWindowOpen);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it.each([
      ['not_connected', {}],
      ['connected', { config: mockConfig }],
      ['connected', { config: syncedConfig }],
    ] as const)('is %s for %j', (expected, overrides) => {
      service = createService(overrides);
      const { result } = renderProvisioning();

      expect(result.current.model.state).toBe(expected);
      expect(result.current.model.consentPhase).toBe('idle');
      expect(result.current.model.isGranted).toBe(false);
      expect(result.current.model.wasDisabled).toBe(false);
      expect(result.current.model.isConsentPending).toBe(false);
    });
  });

  describe('provisioning switch', () => {
    it('creates a consent ticket when turning provisioning on', async () => {
      const { result } = renderProvisioning();

      await act(async () => {
        await result.current.actions.setProvisioningEnabled(true);
      });

      expect(service.startConsent).toHaveBeenCalled();
      expect(mockWindowOpen).not.toHaveBeenCalled();
      expect(result.current.model.isConsentPending).toBe(true);
      expect(result.current.model.consentPhase).toBe('idle');
    });

    it('opens the created ticket and waits on continue', async () => {
      const { result } = renderProvisioning();
      await act(async () => {
        await result.current.actions.setProvisioningEnabled(true);
      });

      act(() => result.current.actions.continueConsent());

      expect(mockWindowOpen).toHaveBeenCalledWith(TICKET_URL, '_blank', 'noopener,noreferrer');
      expect(service.startConsent).toHaveBeenCalledTimes(1);
      expect(result.current.model.consentPhase).toBe('waiting');
      await advance(VERIFY_INTERVAL_MS);
      expect(service.verifyConsent).toHaveBeenCalledTimes(1);
    });

    it('does nothing on continue without a ticket', () => {
      const { result } = renderProvisioning();

      act(() => result.current.actions.continueConsent());

      expect(mockWindowOpen).not.toHaveBeenCalled();
      expect(result.current.model.consentPhase).toBe('idle');
    });

    it('drops the pending consent when turned off before connecting', async () => {
      const { result } = renderProvisioning();
      await act(async () => {
        await result.current.actions.setProvisioningEnabled(true);
      });
      act(() => result.current.actions.continueConsent());

      await act(async () => {
        await result.current.actions.setProvisioningEnabled(false);
      });

      expect(result.current.model.isConsentPending).toBe(false);
      expect(result.current.model.consentPhase).toBe('idle');
      expect(result.current.model.isDisableModalOpen).toBe(false);
      expect(service.deleteConfig).not.toHaveBeenCalled();
      await advance(MAX_POLL_MS);
      expect(service.verifyConsent).not.toHaveBeenCalled();
    });

    it('keeps provisioning off when creating the ticket fails', async () => {
      const error = { statusCode: 422 };
      service = createService({ startConsent: vi.fn().mockRejectedValue(error) });
      const { result } = renderProvisioning();

      await act(async () => {
        await result.current.actions.setProvisioningEnabled(true);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, { fallbackMessage: 'general_error' });
      expect(result.current.model.isConsentPending).toBe(false);
    });

    it('does not start consent without create permission', async () => {
      const { result } = renderProvisioning({ permissions: createIdpPermissions([]) });

      await act(async () => {
        await result.current.actions.setProvisioningEnabled(true);
      });

      expect(service.startConsent).not.toHaveBeenCalled();
      expect(result.current.model.isConsentPending).toBe(false);
    });

    it('opens the disable modal instead of turning provisioning off', async () => {
      service = createService({ config: syncedConfig });
      const { result } = renderProvisioning();

      await act(async () => {
        await result.current.actions.setProvisioningEnabled(false);
      });

      expect(result.current.model.isDisableModalOpen).toBe(true);
      expect(service.deleteConfig).not.toHaveBeenCalled();
    });

    it('does not open the disable modal without delete permission', async () => {
      service = createService({ config: syncedConfig });
      const { result } = renderProvisioning({ permissions: createIdpPermissions([]) });

      await act(async () => {
        await result.current.actions.setProvisioningEnabled(false);
      });

      expect(result.current.model.isDisableModalOpen).toBe(false);
    });
  });

  describe('consent flow', () => {
    it('starts consent, opens the ticket in a new tab and waits', async () => {
      const { result } = renderProvisioning();

      await startConsent(result);

      expect(service.startConsent).toHaveBeenCalled();
      expect(mockWindowOpen).toHaveBeenCalledWith(TICKET_URL, '_blank', 'noopener,noreferrer');
      expect(result.current.model.consentPhase).toBe('waiting');
      expect(result.current.model.consentPhase).toBe('waiting');
    });

    it('polls verify at the verify interval', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);

      await advance(VERIFY_INTERVAL_MS - 1);
      expect(service.verifyConsent).not.toHaveBeenCalled();
      await advance(1);
      expect(service.verifyConsent).toHaveBeenCalledTimes(1);
      await advance(VERIFY_INTERVAL_MS);
      expect(service.verifyConsent).toHaveBeenCalledTimes(2);
    });

    it('turns on, shows the granted badge and opens the enable auto sync modal on complete', async () => {
      const { result, rerender } = renderProvisioning();
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });

      await advance(VERIFY_INTERVAL_MS);
      rerender();

      expect(service.refetchConfig).toHaveBeenCalled();
      expect(result.current.model.state).toBe('connected');
      expect(result.current.model.isGranted).toBe(true);
      expect(result.current.model.isConsentPending).toBe(false);
      expect(result.current.model.consentPhase).not.toBe('waiting');
      expect(result.current.model.isEnableAutoSyncModalOpen).toBe(true);
      expect(mockedShowToast).not.toHaveBeenCalledWith({
        type: 'success',
        message: 'google_workspace_provisioning.connected_success',
      });

      await advance(MAX_POLL_MS);
      expect(service.verifyConsent).toHaveBeenCalledTimes(1);
    });

    it('enables auto sync after access is granted', async () => {
      const { result, rerender } = renderProvisioning();
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });

      await advance(VERIFY_INTERVAL_MS);
      await act(async () => {
        await result.current.actions.confirmEnableAutoSyncModal();
      });
      rerender();

      expect(service.setAutoSync).toHaveBeenCalledWith(true);
      expect(result.current.model.config?.synchronize_automatically).toBe(true);
      expect(result.current.model.isGranted).toBe(true);
    });

    it('does not open the enable auto sync modal when auto sync is already on', async () => {
      service = createService({ refetchConfig: vi.fn().mockResolvedValue(syncedConfig) });
      const { result } = renderProvisioning();
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });

      await advance(VERIFY_INTERVAL_MS);

      expect(result.current.model.isEnableAutoSyncModalOpen).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'google_workspace_provisioning.connected_success',
      });
    });

    it('does not open the enable auto sync modal without update permission', async () => {
      const { result } = renderProvisioning({
        permissions: createIdpPermissions(['create:my_org:identity_providers_provisioning']),
      });
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });

      await advance(VERIFY_INTERVAL_MS);

      expect(result.current.model.isGranted).toBe(true);
      expect(result.current.model.isEnableAutoSyncModalOpen).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'google_workspace_provisioning.connected_success',
      });
    });

    it('fails and stops at the polling limit', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);

      await advance(MAX_POLL_MS - VERIFY_INTERVAL_MS);
      expect(result.current.model.consentPhase).toBe('waiting');
      await advance(VERIFY_INTERVAL_MS);

      expect(result.current.model.consentPhase).toBe('failed');
      expect(result.current.model.consentPhase).not.toBe('waiting');
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'google_workspace_provisioning.connect_error',
      });
      const calls = vi.mocked(service.verifyConsent).mock.calls.length;
      expect(calls).toBe(MAX_POLL_MS / VERIFY_INTERVAL_MS);
      await advance(MAX_POLL_MS);
      expect(service.verifyConsent).toHaveBeenCalledTimes(calls);
    });

    it('fails and stops polling when a verify request fails', async () => {
      const error = { statusCode: 403 };
      const { result } = renderProvisioning();
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockRejectedValue(error);

      await advance(VERIFY_INTERVAL_MS);

      expect(result.current.model.consentPhase).toBe('failed');
      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'google_workspace_provisioning.connect_error',
      });
      expect(mockedShowToast).not.toHaveBeenCalled();
      await advance(MAX_POLL_MS);
      expect(service.verifyConsent).toHaveBeenCalledTimes(1);
    });

    it('fails and stops polling when verify reports an error', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({
        status: 'error' as DirectoryProvisioningConsentStatus,
      });

      await advance(VERIFY_INTERVAL_MS);

      expect(result.current.model.consentPhase).toBe('failed');
      expect(service.refetchConfig).not.toHaveBeenCalled();
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'google_workspace_provisioning.connect_error',
      });
      await advance(MAX_POLL_MS);
      expect(service.verifyConsent).toHaveBeenCalledTimes(1);
    });

    it('fails when the config cannot be fetched after consent completes', async () => {
      const error = { statusCode: 400 };
      service = createService({ refetchConfig: vi.fn().mockRejectedValue(error) });
      const { result } = renderProvisioning();
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });

      await advance(VERIFY_INTERVAL_MS);

      expect(result.current.model.consentPhase).toBe('failed');
      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'google_workspace_provisioning.connect_error',
      });
      expect(mockedShowToast).not.toHaveBeenCalled();
    });

    it('does not check on focus sooner than the verify interval after the last check', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);
      await advance(VERIFY_INTERVAL_MS);
      expect(service.verifyConsent).toHaveBeenCalledTimes(1);

      await advance(VERIFY_INTERVAL_MS - 2_000);
      await act(async () => {
        window.dispatchEvent(new Event('focus'));
      });

      expect(service.verifyConsent).toHaveBeenCalledTimes(1);
    });

    it('checks immediately when the window regains focus', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);

      await act(async () => {
        window.dispatchEvent(new Event('focus'));
      });

      expect(service.verifyConsent).toHaveBeenCalledTimes(1);
    });

    it('close stops polling and drops the consent flow', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);
      expect(result.current.model.consentPhase).toBe('waiting');
      vi.mocked(service.startConsent).mockClear();
      vi.mocked(service.verifyConsent).mockClear();

      act(() => result.current.actions.closeConsent());

      expect(result.current.model.consentPhase).toBe('idle');
      expect(result.current.model.isConsentPending).toBe(false);
      expect(service.startConsent).not.toHaveBeenCalled();
      await advance(MAX_POLL_MS);
      expect(service.verifyConsent).not.toHaveBeenCalled();
    });

    it('retry after a failure restarts polling at the verify interval', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);
      await advance(MAX_POLL_MS);
      expect(result.current.model.consentPhase).toBe('failed');
      const calls = vi.mocked(service.verifyConsent).mock.calls.length;

      await act(async () => {
        await result.current.actions.startConsent();
      });

      expect(service.startConsent).toHaveBeenCalledTimes(2);
      expect(result.current.model.consentPhase).toBe('waiting');
      await advance(VERIFY_INTERVAL_MS - 1);
      expect(service.verifyConsent).toHaveBeenCalledTimes(calls);
      await advance(1);
      expect(service.verifyConsent).toHaveBeenCalledTimes(calls + 1);
    });

    it('stops polling on unmount', async () => {
      const { result, unmount } = renderProvisioning();
      await startConsent(result);

      unmount();
      await advance(MAX_POLL_MS);

      expect(service.verifyConsent).not.toHaveBeenCalled();
    });

    it('keeps waiting when the browser blocks the new tab', async () => {
      mockWindowOpen.mockReturnValue(null);
      const { result } = renderProvisioning();

      await startConsent(result);

      expect(result.current.model.consentPhase).toBe('waiting');
      expect(result.current.model.consentPhase).toBe('waiting');
    });

    it('does not open a ticket URL that is not https', async () => {
      service = createService({ startConsent: vi.fn().mockResolvedValue('javascript:alert(1)') });
      const { result } = renderProvisioning();

      await startConsent(result);

      expect(mockWindowOpen).not.toHaveBeenCalled();
      expect(result.current.model.state).toBe('not_connected');
      expect(mockedShowToast).toHaveBeenCalledWith({ type: 'error', message: 'general_error' });
      await advance(MAX_POLL_MS);
      expect(service.verifyConsent).not.toHaveBeenCalled();
    });

    it('stays off when starting consent fails', async () => {
      service = createService({ startConsent: vi.fn().mockRejectedValue({ statusCode: 422 }) });
      const { result } = renderProvisioning();

      await startConsent(result);

      expect(mockWindowOpen).not.toHaveBeenCalled();
      expect(result.current.model.state).toBe('not_connected');
      expect(mockHandleError).toHaveBeenCalledWith(
        { statusCode: 422 },
        {
          fallbackMessage: 'general_error',
        },
      );
    });

    it('does not start consent without create permission', async () => {
      const { result } = renderProvisioning({ permissions: createIdpPermissions([]) });

      await startConsent(result);

      expect(service.startConsent).not.toHaveBeenCalled();
      expect(result.current.model.state).toBe('not_connected');
    });

    it('does not start consent without full access level', async () => {
      const { result } = renderProvisioning({
        provider: { ...mockProvider, access_level: 'limited' } as IdpKnownResponse,
      });

      await startConsent(result);

      expect(service.startConsent).not.toHaveBeenCalled();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('polls verify when re-verifying an existing config', async () => {
      service = createService({ config: mockConfig });
      const { result } = renderProvisioning();
      await startConsent(result);

      expect(mockWindowOpen).toHaveBeenCalledWith(TICKET_URL, '_blank', 'noopener,noreferrer');
      expect(result.current.model.consentPhase).toBe('waiting');

      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });
      await advance(VERIFY_INTERVAL_MS);

      expect(service.refetchConfig).toHaveBeenCalled();
      expect(result.current.model.consentPhase).toBe('idle');
      expect(result.current.model.isGranted).toBe(true);
    });
  });

  describe('auto sync', () => {
    it('enables auto sync from the modal and closes it', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });
      await advance(VERIFY_INTERVAL_MS);

      await act(async () => {
        await result.current.actions.confirmEnableAutoSyncModal();
      });

      expect(service.setAutoSync).toHaveBeenCalledWith(true);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'google_workspace_provisioning.connected_with_auto_sync_success',
      });
      expect(result.current.model.isEnableAutoSyncModalOpen).toBe(false);
    });

    it('keeps the modal open and shows the error when enabling auto sync fails', async () => {
      const error = { statusCode: 400 };
      service = createService({ setAutoSync: vi.fn().mockRejectedValue(error) });
      const { result } = renderProvisioning();
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });
      await advance(VERIFY_INTERVAL_MS);

      await act(async () => {
        await result.current.actions.confirmEnableAutoSyncModal();
      });

      expect(result.current.model.isEnableAutoSyncModalOpen).toBe(true);
      expect(mockHandleError).toHaveBeenCalledWith(error, { fallbackMessage: 'general_error' });
    });

    it('dismisses the modal without updating', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });
      await advance(VERIFY_INTERVAL_MS);

      act(() => result.current.actions.dismissEnableAutoSyncModal());

      expect(service.setAutoSync).not.toHaveBeenCalled();
      expect(result.current.model.isEnableAutoSyncModalOpen).toBe(false);
    });

    it.each([true, false])('sets auto sync to %s from the section switch', async (enabled) => {
      service = createService({ config: mockConfig });
      const { result } = renderProvisioning();

      await act(async () => {
        await result.current.actions.setAutoSync(enabled);
      });

      expect(service.setAutoSync).toHaveBeenCalledWith(enabled);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: enabled
          ? 'google_workspace_provisioning.auto_sync_enabled_success'
          : 'google_workspace_provisioning.auto_sync_disabled_success',
      });
    });

    it('shows the error when changing auto sync fails', async () => {
      const error = { statusCode: 400 };
      service = createService({
        config: mockConfig,
        setAutoSync: vi.fn().mockRejectedValue(error),
      });
      const { result } = renderProvisioning();

      await act(async () => {
        await result.current.actions.setAutoSync(true);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, { fallbackMessage: 'general_error' });
      expect(mockedShowToast).not.toHaveBeenCalled();
    });

    it('does not update auto sync without update permission', async () => {
      service = createService({ config: mockConfig });
      const { result } = renderProvisioning({ permissions: createIdpPermissions([]) });

      await act(async () => {
        await result.current.actions.setAutoSync(true);
      });

      expect(service.setAutoSync).not.toHaveBeenCalled();
    });
  });

  describe('disable', () => {
    it('deletes the configuration on confirm', async () => {
      service = createService({ config: syncedConfig });
      const { result, rerender } = renderProvisioning();
      act(() => result.current.actions.setDisableModalOpen(true));

      await act(async () => {
        await result.current.actions.confirmDisable();
      });
      rerender();

      expect(service.deleteConfig).toHaveBeenCalled();
      expect(service.setAutoSync).not.toHaveBeenCalled();
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'provisioning_disabled_success',
      });
      expect(result.current.model.isDisableModalOpen).toBe(false);
      expect(result.current.model.state).toBe('not_connected');
      expect(result.current.model.wasDisabled).toBe(true);
      expect(result.current.model.isConsentPending).toBe(false);
    });

    it('clears the disabled flag once access is granted again', async () => {
      service = createService({ config: syncedConfig });
      const { result, rerender } = renderProvisioning();
      await act(async () => {
        await result.current.actions.confirmDisable();
      });
      rerender();

      await startConsent(result);
      vi.mocked(service.verifyConsent).mockResolvedValue({ status: 'complete' });
      await advance(VERIFY_INTERVAL_MS);
      rerender();

      expect(result.current.model.state).toBe('connected');
      expect(result.current.model.wasDisabled).toBe(false);
    });

    it('keeps the modal open and shows the error when disabling fails', async () => {
      const error = { statusCode: 403 };
      service = createService({
        config: syncedConfig,
        deleteConfig: vi.fn().mockRejectedValue(error),
      });
      const { result } = renderProvisioning();
      act(() => result.current.actions.setDisableModalOpen(true));

      await act(async () => {
        await result.current.actions.confirmDisable();
      });

      expect(result.current.model.isDisableModalOpen).toBe(true);
      expect(result.current.model.state).toBe('connected');
      expect(result.current.model.wasDisabled).toBe(false);
      expect(mockHandleError).toHaveBeenCalledWith(error, { fallbackMessage: 'general_error' });
    });

    it('does not disable provisioning without delete permission', async () => {
      service = createService({ config: syncedConfig });
      const { result } = renderProvisioning({
        permissions: createIdpPermissions(['update:my_org:identity_providers_provisioning']),
      });

      await act(async () => {
        await result.current.actions.confirmDisable();
      });

      expect(service.deleteConfig).not.toHaveBeenCalled();
      expect(mockedShowToast).not.toHaveBeenCalled();
    });
  });

  describe('disabled actions', () => {
    it('does not create a ticket when createAction is disabled', async () => {
      const { result } = renderProvisioning({ createAction: { disabled: true } });

      await act(async () => {
        await result.current.actions.setProvisioningEnabled(true);
        await result.current.actions.startConsent();
      });

      expect(service.startConsent).not.toHaveBeenCalled();
      expect(result.current.model.isConsentPending).toBe(false);
    });

    it('does not delete when deleteAction is disabled', async () => {
      service = createService({ config: syncedConfig });
      const { result } = renderProvisioning({ deleteAction: { disabled: true } });

      await act(async () => {
        await result.current.actions.setProvisioningEnabled(false);
      });
      expect(result.current.model.isDisableModalOpen).toBe(false);

      await act(async () => {
        await result.current.actions.confirmDisable();
      });
      expect(service.deleteConfig).not.toHaveBeenCalled();
    });
  });

  describe('polling', () => {
    it('does not re-render while polls keep returning waiting', async () => {
      const { result } = renderProvisioning();
      await startConsent(result);
      const { model } = result.current;

      await advance(VERIFY_INTERVAL_MS * 10);

      expect(service.verifyConsent).toHaveBeenCalledTimes(10);
      expect(result.current.model).toBe(model);
    });
  });
});
