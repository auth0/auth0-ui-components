import type {
  IdentityProvider,
  GetIdPProvisioningConfigResponseContent,
} from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useSsoProvisioning } from '@/hooks/my-organization/use-sso-provisioning';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { mockCore, mockToast, setupAllCommonMocks } from '@/tests/utils';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

describe('useSsoProvisioning', () => {
  const mockIdpId = 'idp_123';
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let mockHandleError: ReturnType<typeof vi.fn>;

  const mockProvider: IdentityProvider = {
    id: mockIdpId,
    name: 'test-provider',
    strategy: 'samlp',
    display_name: 'Test Provider',
    options: {},
  };

  const mockProvisioningConfig: GetIdPProvisioningConfigResponseContent = {
    enabled: true,
    attributes: [],
  } as unknown as GetIdPProvisioningConfigResponseContent;

  const mockProvisioningConfigWithWarning: GetIdPProvisioningConfigResponseContent = {
    enabled: true,
    attributes: [
      { id: 'attr_1', is_extra: true, is_missing: false },
      { id: 'attr_2', is_extra: false, is_missing: false },
    ],
  } as unknown as GetIdPProvisioningConfigResponseContent;

  const mockProvisioningConfigWithMissing: GetIdPProvisioningConfigResponseContent = {
    enabled: true,
    attributes: [{ id: 'attr_1', is_extra: false, is_missing: true }],
  } as unknown as GetIdPProvisioningConfigResponseContent;

  const mockProvisioningConfigNoWarning: GetIdPProvisioningConfigResponseContent = {
    enabled: true,
    attributes: [
      { id: 'attr_1', is_extra: false, is_missing: false },
      { id: 'attr_2', is_extra: false, is_missing: false },
    ],
  } as unknown as GetIdPProvisioningConfigResponseContent;

  const renderUseSsoProvisioning = (...args: Parameters<typeof useSsoProvisioning>) => {
    const { wrapper, queryClient } = createTestQueryClientWrapper();
    return { ...renderHook(() => useSsoProvisioning(...args), { wrapper }), queryClient };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();

    // Default: provisioning returns 404 (not configured)
    (
      apiService.organization.identityProviders.provisioning.get as ReturnType<typeof vi.fn>
    ).mockRejectedValue({ status: 404 });
    (
      apiService.organization.identityProviders.provisioning.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockProvisioningConfig);
    (
      apiService.organization.identityProviders.provisioning.delete as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);
    (
      apiService.organization.identityProviders.provisioning.updateAttributes as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue(undefined);

    const { mockHandleError: setupMockHandleError } = setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
    });

    mockHandleError = setupMockHandleError;
    vi.spyOn(useErrorHandlerModule, 'useErrorHandler').mockReturnValue(mockHandleError);
  });

  it('should initialize with correct default states', () => {
    const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

    expect(result.current.isProvisioningUpdating).toBe(false);
    expect(result.current.isProvisioningDeleting).toBe(false);
    expect(result.current.isProvisioningAttributesSyncing).toBe(false);
    expect(typeof result.current.createProvisioning).toBe('function');
    expect(typeof result.current.deleteProvisioning).toBe('function');
    expect(typeof result.current.syncProvisioningAttributes).toBe('function');
    expect(typeof result.current.fetchProvisioning).toBe('function');
  });

  describe('provisioningQuery', () => {
    it('should handle 404 and return null when provisioning is not configured', async () => {
      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => {
        expect(result.current.provisioningConfig).toBe(null);
        expect(result.current.isProvisioningLoading).toBe(false);
      });
    });

    it('should fetch provisioning config successfully', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .get as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockProvisioningConfig);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => {
        expect(result.current.provisioningConfig).toEqual(mockProvisioningConfig);
        expect(result.current.isProvisioningLoading).toBe(false);
      });
    });

    it('should handle non-404 errors with handleError', async () => {
      const error = new Error('Server error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .get as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error);
      });
    });

    it('should not fetch when coreClient is not available', () => {
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      expect(result.current.provisioningConfig).toBe(null);
      expect(result.current.isProvisioningLoading).toBe(false);
    });

    it('should not fetch when idpId is empty', () => {
      const { result } = renderUseSsoProvisioning('', mockProvider);

      expect(result.current.provisioningConfig).toBe(null);
      expect(result.current.isProvisioningLoading).toBe(false);
    });
  });

  describe('createProvisioning', () => {
    it('should create provisioning successfully', async () => {
      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      await result.current.createProvisioning();

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
            .create,
        ).toHaveBeenCalledWith(mockIdpId);
        expect(result.current.isProvisioningUpdating).toBe(false);
        expect(mockedShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'update_success',
        });
      });
    });

    it('should return early when provider is null', async () => {
      const { result } = renderUseSsoProvisioning(mockIdpId, null);

      await result.current.createProvisioning();

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .create,
      ).not.toHaveBeenCalled();
    });

    it('should return early when coreClient is not available', async () => {
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await result.current.createProvisioning();

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .create,
      ).not.toHaveBeenCalled();
    });

    it('should call onBefore callback and abort when it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider, {
        provisioning: {
          createAction: { onBefore },
        },
      });

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      await result.current.createProvisioning();

      expect(onBefore).toHaveBeenCalledWith(mockProvider);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .create,
      ).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should call onAfter callback after successful creation', async () => {
      const onAfter = vi.fn();

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider, {
        provisioning: {
          createAction: { onAfter },
        },
      });

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      await result.current.createProvisioning();

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockProvider, mockProvisioningConfig);
      });
    });

    it('should handle create error', async () => {
      const error = new Error('Create failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .create as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      await expect(result.current.createProvisioning()).rejects.toThrow('Create failed');

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('deleteProvisioning', () => {
    it('should delete provisioning successfully', async () => {
      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      await result.current.deleteProvisioning();

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
            .delete,
        ).toHaveBeenCalledWith(mockIdpId);
        expect(result.current.isProvisioningDeleting).toBe(false);
        expect(mockedShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'update_success',
        });
      });
    });

    it('should return early when provider is null', async () => {
      const { result } = renderUseSsoProvisioning(mockIdpId, null);

      await result.current.deleteProvisioning();

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .delete,
      ).not.toHaveBeenCalled();
    });

    it('should return early when coreClient is not available', async () => {
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await result.current.deleteProvisioning();

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .delete,
      ).not.toHaveBeenCalled();
    });

    it('should call onBefore callback and abort when it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider, {
        provisioning: {
          deleteAction: { onBefore },
        },
      });

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      await result.current.deleteProvisioning();

      expect(onBefore).toHaveBeenCalledWith(mockProvider);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .delete,
      ).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should call onAfter callback after successful deletion', async () => {
      const onAfter = vi.fn();

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider, {
        provisioning: {
          deleteAction: { onAfter },
        },
      });

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      await result.current.deleteProvisioning();

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockProvider);
      });
    });

    it('should handle delete error', async () => {
      const error = new Error('Delete failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .delete as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      await expect(result.current.deleteProvisioning()).rejects.toThrow('Delete failed');

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('syncProvisioningAttributes', () => {
    it('should sync provisioning attributes successfully', async () => {
      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      await result.current.syncProvisioningAttributes();

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
            .updateAttributes,
        ).toHaveBeenCalledWith(mockIdpId, {});
        expect(result.current.isProvisioningAttributesSyncing).toBe(false);
        expect(mockedShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'provisioning_attributes_sync_success',
        });
      });
    });

    it('should not sync when coreClient is not available', async () => {
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await result.current.syncProvisioningAttributes();

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .updateAttributes,
      ).not.toHaveBeenCalled();
    });

    it('should handle sync error', async () => {
      const error = new Error('Sync failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .updateAttributes as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      try {
        await result.current.syncProvisioningAttributes();
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('fetchProvisioning', () => {
    it('should fetch provisioning config imperatively', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .get as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockProvisioningConfig);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      const config = await result.current.fetchProvisioning();

      expect(config).toEqual(mockProvisioningConfig);
    });

    it('should return null on fetch error', async () => {
      const error = new Error('Fetch failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .get as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      const config = await result.current.fetchProvisioning();

      expect(config).toBeNull();
    });

    it('should handle 404 and return null', async () => {
      // Default mock already rejects with 404
      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      const config = await result.current.fetchProvisioning();

      expect(config).toBeNull();
    });
  });

  describe('hasProvisioningAttributeSyncWarning', () => {
    it('should return false when no provisioning config', async () => {
      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      expect(result.current.hasProvisioningAttributeSyncWarning).toBe(false);
    });

    it('should return true when attributes have is_extra flag', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .get as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockProvisioningConfigWithWarning);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => {
        expect(result.current.hasProvisioningAttributeSyncWarning).toBe(true);
      });
    });

    it('should return true when attributes have is_missing flag', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .get as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockProvisioningConfigWithMissing);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => {
        expect(result.current.hasProvisioningAttributeSyncWarning).toBe(true);
      });
    });

    it('should return false when no attributes have warnings', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .get as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockProvisioningConfigNoWarning);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => {
        expect(result.current.provisioningConfig).toEqual(mockProvisioningConfigNoWarning);
        expect(result.current.hasProvisioningAttributeSyncWarning).toBe(false);
      });
    });
  });

  describe('provisioningError', () => {
    it('should expose error from provisioning query (non-404)', async () => {
      const error = new Error('Query error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .get as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => {
        expect(result.current.provisioningError).toBe(error);
      });
    });

    it('should expose error from create mutation', async () => {
      const error = new Error('Create error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .create as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      try {
        await result.current.createProvisioning();
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.provisioningError).toEqual(error);
      });
    });

    it('should expose error from delete mutation', async () => {
      const error = new Error('Delete error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .delete as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      try {
        await result.current.deleteProvisioning();
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.provisioningError).toEqual(error);
      });
    });

    it('should expose error from sync attributes mutation', async () => {
      const error = new Error('Sync error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .updateAttributes as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseSsoProvisioning(mockIdpId, mockProvider);

      await waitFor(() => expect(result.current.isProvisioningLoading).toBe(false));

      try {
        await result.current.syncProvisioningAttributes();
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.provisioningError).toEqual(error);
      });
    });
  });
});
