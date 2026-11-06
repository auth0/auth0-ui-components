import {
  ssoProviderQueryKeys,
  type DirectoryProvisioningConfig,
} from '@auth0/universal-components-core';
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';

import { useGoogleWorkspaceProvisioningService } from '@/hooks/my-organization/shared/services/use-google-workspace-provisioning-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockToast } from '@/tests/utils/test-setup';
import { setupMockUseCoreClient } from '@/tests/utils/test-utilities';

const { mockedShowToast } = mockToast();

describe('useGoogleWorkspaceProvisioningService', () => {
  const mockIdpId = 'idp_123';
  let mockHandleError: Mock;
  const mockGet = vi.fn();
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockVerify = vi.fn();
  const mockT = vi.fn((key: string) => key);

  const mockCoreClient = createMockCoreClient();
  const mockOrgClient = mockCoreClient.getMyOrganizationApiClient();

  const mockConfig: DirectoryProvisioningConfig = {
    connection_id: 'con_123',
    connection_name: 'google-workspace',
    strategy: 'google-apps',
    synchronize_automatically: false,
    status: 'incomplete',
    created_at: '2026-11-01T00:00:00.000Z',
    updated_at: '2026-11-01T00:00:00.000Z',
  };

  const renderService = (...args: Parameters<typeof useGoogleWorkspaceProvisioningService>) => {
    const { wrapper, queryClient } = createTestQueryClientWrapper();
    return {
      queryClient,
      ...renderHook(() => useGoogleWorkspaceProvisioningService(...args), { wrapper }),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (
      mockOrgClient.organization.identityProviders as unknown as Record<string, unknown>
    ).directoryProvisioning = {
      get: mockGet,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      verify: mockVerify,
    };
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);
    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({ t: mockT } as never);
    mockHandleError = vi.fn();
    vi.spyOn(useErrorHandlerModule, 'useErrorHandler').mockReturnValue(mockHandleError);
    mockGet.mockResolvedValue(mockConfig);
  });

  describe('config', () => {
    it('fetches the directory provisioning config', async () => {
      const { result } = renderService(mockIdpId);

      await waitFor(() => expect(result.current.config).toEqual(mockConfig));
      expect(mockGet).toHaveBeenCalledWith(mockIdpId);
      expect(result.current.isConfigLoading).toBe(false);
    });

    it('returns null when not configured (404)', async () => {
      mockGet.mockRejectedValue({ statusCode: 404 });
      const { result } = renderService(mockIdpId);

      await waitFor(() => expect(mockGet).toHaveBeenCalled());
      await waitFor(() => expect(result.current.isConfigLoading).toBe(false));
      expect(result.current.config).toBeNull();
    });

    it('refetches the config on demand', async () => {
      const { result } = renderService(mockIdpId);
      await waitFor(() => expect(result.current.config).toEqual(mockConfig));

      const updated = { ...mockConfig, synchronize_automatically: true };
      mockGet.mockResolvedValue(updated);
      let refetched: DirectoryProvisioningConfig | null = null;
      await act(async () => {
        refetched = await result.current.refetchConfig();
      });

      expect(refetched).toEqual(updated);
      await waitFor(() => expect(result.current.config).toEqual(updated));
    });
  });

  describe('load errors', () => {
    it('shows an error toast when the directory provisioning config is forbidden (403)', async () => {
      const error = { statusCode: 403 };
      mockGet.mockRejectedValue(error);
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      renderHook(() => useGoogleWorkspaceProvisioningService(mockIdpId), {
        wrapper: createTestQueryClientWrapper(queryClient).wrapper,
      });

      await waitFor(() =>
        expect(mockHandleError).toHaveBeenCalledWith(error, { fallbackMessage: 'general_error' }),
      );
    });

    it('shows an error toast for other load errors', async () => {
      const error = { statusCode: 500 };
      mockGet.mockRejectedValue(error);
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      renderHook(() => useGoogleWorkspaceProvisioningService(mockIdpId), {
        wrapper: createTestQueryClientWrapper(queryClient).wrapper,
      });

      await waitFor(() =>
        expect(mockHandleError).toHaveBeenCalledWith(error, { fallbackMessage: 'general_error' }),
      );
    });
  });

  describe('refetchConfig with cached data', () => {
    it('fetches again even when the cached config is not stale yet', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { staleTime: 2 * 60 * 1000, retry: false } },
      });
      mockGet.mockRejectedValueOnce({ statusCode: 404 }).mockResolvedValue(mockConfig);
      const { result } = renderHook(() => useGoogleWorkspaceProvisioningService(mockIdpId), {
        wrapper: createTestQueryClientWrapper(queryClient).wrapper,
      });
      await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));

      let refetched: DirectoryProvisioningConfig | null = null;
      await act(async () => {
        refetched = await result.current.refetchConfig();
      });

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(refetched).toEqual(mockConfig);
    });
  });

  describe('startConsent', () => {
    it('resolves to the provisioning ticket URL', async () => {
      mockCreate.mockResolvedValue({ provisioning_ticket_url: 'https://ticket.example.com' });
      const { result } = renderService(mockIdpId);

      let url = '';
      await act(async () => {
        url = await result.current.startConsent();
      });

      expect(mockCreate).toHaveBeenCalledWith(mockIdpId, {});
      expect(url).toBe('https://ticket.example.com');
    });

    it('rejects with the error', async () => {
      const error = { statusCode: 422 };
      mockCreate.mockRejectedValue(error);
      const { result } = renderService(mockIdpId);

      await act(async () => {
        await expect(result.current.startConsent()).rejects.toBe(error);
      });

      expect(mockHandleError).not.toHaveBeenCalled();
    });
  });

  describe('verifyConsent', () => {
    it.each(['waiting', 'complete'] as const)('returns the %s status', async (status) => {
      mockVerify.mockResolvedValue({ status });
      const { result } = renderService(mockIdpId);

      const signal = new AbortController().signal;
      await expect(result.current.verifyConsent(signal)).resolves.toEqual({ status });
      expect(mockVerify).toHaveBeenCalledWith(mockIdpId, {}, { abortSignal: signal });
    });

    it.each([401, 403, 404, 429, 500, 503])('rethrows a %i error', async (statusCode) => {
      const error = { statusCode };
      mockVerify.mockRejectedValue(error);
      const { result } = renderService(mockIdpId);

      await expect(result.current.verifyConsent()).rejects.toBe(error);
      expect(mockHandleError).not.toHaveBeenCalled();
    });
  });

  describe('setAutoSync', () => {
    it.each([true, false])('updates synchronize_automatically to %s', async (enabled) => {
      const updated = { ...mockConfig, synchronize_automatically: enabled };
      mockUpdate.mockResolvedValue(updated);
      const { result, queryClient } = renderService(mockIdpId);

      await act(async () => {
        await result.current.setAutoSync(enabled);
      });

      expect(mockUpdate).toHaveBeenCalledWith(mockIdpId, { synchronize_automatically: enabled });
      expect(
        queryClient.getQueryData(ssoProviderQueryKeys.directoryProvisioning(mockIdpId)),
      ).toEqual(updated);
      expect(mockedShowToast).not.toHaveBeenCalled();
    });

    it('rejects with the error', async () => {
      const error = { statusCode: 400 };
      mockUpdate.mockRejectedValue(error);
      const { result } = renderService(mockIdpId);

      await act(async () => {
        await expect(result.current.setAutoSync(true)).rejects.toBe(error);
      });

      expect(mockHandleError).not.toHaveBeenCalled();
    });
  });

  describe('deleteConfig', () => {
    it('deletes the configuration and clears the cache', async () => {
      mockDelete.mockResolvedValue(undefined);
      const { result, queryClient } = renderService(mockIdpId);
      await waitFor(() => expect(result.current.config).toEqual(mockConfig));

      await act(async () => {
        await result.current.deleteConfig();
      });

      expect(mockDelete).toHaveBeenCalledWith(mockIdpId);
      expect(
        queryClient.getQueryData(ssoProviderQueryKeys.directoryProvisioning(mockIdpId)),
      ).toBeNull();
      expect(mockedShowToast).not.toHaveBeenCalled();
    });

    it('rejects with the error', async () => {
      const error = { statusCode: 403 };
      mockDelete.mockRejectedValue(error);
      const { result } = renderService(mockIdpId);

      await act(async () => {
        await expect(result.current.deleteConfig()).rejects.toBe(error);
      });

      expect(mockHandleError).not.toHaveBeenCalled();
    });
  });
});
