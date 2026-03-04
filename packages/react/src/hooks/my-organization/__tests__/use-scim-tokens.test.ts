import type {
  IdentityProvider,
  CreateIdpProvisioningScimTokenRequestContent,
} from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useScimTokens } from '@/hooks/my-organization/use-scim-tokens';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { mockCore, mockToast, setupAllCommonMocks } from '@/tests/utils';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

describe('useScimTokens', () => {
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

  const renderUseScimTokens = (...args: Parameters<typeof useScimTokens>) => {
    const { wrapper } = createTestQueryClientWrapper();
    return renderHook(() => useScimTokens(...args), { wrapper });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();

    (
      apiService.organization.identityProviders.provisioning.scimTokens.list as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue([]);
    (
      apiService.organization.identityProviders.provisioning.scimTokens.create as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue({ id: 'token_123', token: 'secret_token' });
    (
      apiService.organization.identityProviders.provisioning.scimTokens.delete as ReturnType<
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
    const { result } = renderUseScimTokens(mockIdpId, null);

    expect(result.current.isScimTokensLoading).toBe(false);
    expect(result.current.isScimTokenCreating).toBe(false);
    expect(result.current.isScimTokenDeleting).toBe(false);
    expect(result.current.scimTokensError).toBeNull();
    expect(typeof result.current.listScimTokens).toBe('function');
    expect(typeof result.current.createScimToken).toBe('function');
    expect(typeof result.current.deleteScimToken).toBe('function');
  });

  describe('listScimTokens', () => {
    it('should list SCIM tokens successfully', async () => {
      const mockTokens = [
        { id: 'token_1', scopes: ['read'] },
        { id: 'token_2', scopes: ['write'] },
      ];
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.list as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockTokens);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      const tokens = await result.current.listScimTokens();

      expect(tokens).toEqual(mockTokens);
      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
            .scimTokens.list,
        ).toHaveBeenCalledWith(mockIdpId);
        expect(result.current.isScimTokensLoading).toBe(false);
      });
    });

    it('should propagate list error', async () => {
      const error = new Error('List failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.list as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      await expect(result.current.listScimTokens()).rejects.toThrow('List failed');

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error);
      });
    });

    it('should return null when coreClient is not available', async () => {
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      const tokens = await result.current.listScimTokens();

      expect(tokens).toBeNull();
    });
  });

  describe('createScimToken', () => {
    it('should create SCIM token successfully', async () => {
      const mockToken = { id: 'token_123', token: 'secret_token' };
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.create as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockToken);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      const tokenData: CreateIdpProvisioningScimTokenRequestContent = {};
      const token = await result.current.createScimToken(tokenData);

      expect(token).toEqual(mockToken);
      await waitFor(() => {
        expect(result.current.isScimTokenCreating).toBe(false);
        expect(mockedShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'scim_token_create_success',
        });
      });
    });

    it('should call onBefore callback and abort when it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider, {
        provisioning: {
          createScimTokenAction: { onBefore },
        },
      });

      await expect(result.current.createScimToken({})).rejects.toThrow('ACTION_CANCELLED');

      expect(onBefore).toHaveBeenCalledWith(mockProvider);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.create,
      ).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should call onAfter callback after successful creation', async () => {
      const onAfter = vi.fn();
      const mockToken = { id: 'token_123', token: 'secret_token' };
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.create as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockToken);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider, {
        provisioning: {
          createScimTokenAction: { onAfter },
        },
      });

      await result.current.createScimToken({});

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockProvider, mockToken);
      });
    });

    it('should handle create error', async () => {
      const error = new Error('Create failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.create as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      await expect(result.current.createScimToken({})).rejects.toThrow('Create failed');

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('deleteScimToken', () => {
    it('should delete SCIM token successfully', async () => {
      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      await result.current.deleteScimToken('token_123');

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
            .scimTokens.delete,
        ).toHaveBeenCalledWith(mockIdpId, 'token_123');
        expect(result.current.isScimTokenDeleting).toBe(false);
        expect(mockedShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'scim_token_delete_sucess',
        });
      });
    });

    it('should return early when provider is null', async () => {
      const { result } = renderUseScimTokens(mockIdpId, null);

      await result.current.deleteScimToken('token_123');

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.delete,
      ).not.toHaveBeenCalled();
    });

    it('should return early when coreClient is not available', async () => {
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      await result.current.deleteScimToken('token_123');

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.delete,
      ).not.toHaveBeenCalled();
    });

    it('should call onBefore callback and abort when it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider, {
        provisioning: {
          deleteScimTokenAction: { onBefore },
        },
      });

      await result.current.deleteScimToken('token_123');

      expect(onBefore).toHaveBeenCalledWith(mockProvider);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.delete,
      ).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should call onAfter callback after successful deletion', async () => {
      const onAfter = vi.fn();

      const { result } = renderUseScimTokens(mockIdpId, mockProvider, {
        provisioning: {
          deleteScimTokenAction: { onAfter },
        },
      });

      await result.current.deleteScimToken('token_123');

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockProvider);
      });
    });

    it('should handle delete error', async () => {
      const error = new Error('Delete failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.delete as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      await expect(result.current.deleteScimToken('token_123')).rejects.toThrow('Delete failed');

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('scimTokensError', () => {
    it('should expose error from list mutation', async () => {
      const error = new Error('List error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.list as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      await expect(result.current.listScimTokens()).rejects.toThrow('List error');

      await waitFor(() => {
        expect(result.current.scimTokensError).toEqual(error);
      });
    });

    it('should expose error from create mutation', async () => {
      const error = new Error('Create error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.create as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      await expect(result.current.createScimToken({})).rejects.toThrow('Create error');

      await waitFor(() => {
        expect(result.current.scimTokensError).toEqual(error);
      });
    });

    it('should expose error from delete mutation', async () => {
      const error = new Error('Delete error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.delete as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseScimTokens(mockIdpId, mockProvider);

      await expect(result.current.deleteScimToken('token_123')).rejects.toThrow('Delete error');

      await waitFor(() => {
        expect(result.current.scimTokensError).toEqual(error);
      });
    });
  });
});
