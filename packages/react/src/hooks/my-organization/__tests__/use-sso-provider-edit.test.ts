import type {
  IdentityProvider,
  CreateIdpProvisioningScimTokenRequestContent,
  OrganizationPrivate,
} from '@auth0/universal-components-core';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import * as useConfigModule from '@/hooks/my-organization/use-config';
import * as useIdpConfigModule from '@/hooks/my-organization/use-idp-config';
import { useSsoProviderEdit } from '@/hooks/my-organization/use-sso-provider-edit';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { mockCore, setupAllCommonMocks } from '@/tests/utils';
import { createMockUseConfig } from '@/tests/utils/__mocks__/my-organization/config/config.mocks';
import { createMockUseIdpConfig } from '@/tests/utils/__mocks__/my-organization/idp-management/idp-config.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

const { initMockCoreClient } = mockCore();

describe('useSsoProviderEdit', () => {
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

  const mockOrganization: OrganizationPrivate = {
    id: 'organization_123',
    name: 'test-organization',
    display_name: 'Test Organization',
    branding: {
      colors: {
        primary: '#0059d6',
        page_background: '#000000',
      },
      logo_url: '',
    },
  };

  const renderUseSsoProviderEdit = (...args: Parameters<typeof useSsoProviderEdit>) => {
    const { wrapper } = createTestQueryClientWrapper();
    return renderHook(() => useSsoProviderEdit(...args), { wrapper });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();

    // Mock API calls
    (apiService.organization.identityProviders.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockProvider,
    );
    (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );
    (
      apiService.organization.identityProviders.provisioning.get as ReturnType<typeof vi.fn>
    ).mockRejectedValue({ status: 404 });
    (
      apiService.organization.identityProviders.update as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockProvider);
    (
      apiService.organization.identityProviders.delete as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);
    (
      apiService.organization.identityProviders.detach as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);
    (
      apiService.organization.identityProviders.provisioning.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ enabled: true });
    (
      apiService.organization.identityProviders.provisioning.delete as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);
    (
      apiService.organization.identityProviders.provisioning.updateAttributes as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue(undefined);
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
    (
      apiService.organization.identityProviders.provisioning.scimTokens.list as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue([]);

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
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    expect(result.current.provider).toBe(null);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.isRemoving).toBe(false);
    expect(result.current.isProvisioningUpdating).toBe(false);
    expect(result.current.isProvisioningDeleting).toBe(false);
    expect(typeof result.current.updateProvider).toBe('function');
    expect(typeof result.current.onDeleteConfirm).toBe('function');
    expect(typeof result.current.onRemoveConfirm).toBe('function');
    expect(typeof result.current.retry).toBe('function');
  });

  it('should fetch provider on mount', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should update provider successfully', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    const updateData = { strategy: 'samlp' as const, is_enabled: true };
    await result.current.updateProvider(updateData);

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.update,
      ).toHaveBeenCalledWith(mockIdpId, expect.any(Object));
      expect(result.current.isUpdating).toBe(false);
    });
  });

  it('should delete provider successfully', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.onDeleteConfirm();

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.delete,
      ).toHaveBeenCalledWith(mockIdpId);
      expect(result.current.isDeleting).toBe(false);
    });
  });

  it('should remove provider from organization successfully', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.onRemoveConfirm();

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.detach,
      ).toHaveBeenCalledWith(mockIdpId);
      expect(result.current.isRemoving).toBe(false);
    });
  });

  it('should handle fetch provider error', async () => {
    const error = new Error('Fetch failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.get as ReturnType<
        typeof vi.fn
      >
    ).mockRejectedValue(error);

    renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(error);
    });
  });

  it('should handle update provider error', async () => {
    const error = new Error('Update failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .update as ReturnType<typeof vi.fn>
    ).mockRejectedValue(error);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await expect(
      result.current.updateProvider({ strategy: 'samlp', is_enabled: true }),
    ).rejects.toThrow('Update failed');

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(error);
    });
  });

  it('should create provisioning successfully', async () => {
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
        .create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ enabled: true });

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.createProvisioning();

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .create,
      ).toHaveBeenCalledWith(mockIdpId);
      expect(result.current.isProvisioningUpdating).toBe(false);
    });
  });

  it('should delete provisioning successfully', async () => {
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
        .delete as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.deleteProvisioning();

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .delete,
      ).toHaveBeenCalledWith(mockIdpId);
      expect(result.current.isProvisioningDeleting).toBe(false);
    });
  });

  it('should create SCIM token successfully', async () => {
    const mockToken = { id: 'token_123', token: 'secret_token' };
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
        .scimTokens.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockToken);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    const tokenData: CreateIdpProvisioningScimTokenRequestContent = {};
    const token = await result.current.createScimToken(tokenData);

    expect(token).toEqual(mockToken);
    await waitFor(() => {
      expect(result.current.isScimTokenCreating).toBe(false);
    });
  });

  it('should delete SCIM token successfully', async () => {
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
        .scimTokens.delete as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.deleteScimToken('token_123');

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
          .scimTokens.delete,
      ).toHaveBeenCalledWith(mockIdpId, 'token_123');
      expect(result.current.isScimTokenDeleting).toBe(false);
    });
  });

  it('should list SCIM tokens successfully', async () => {
    const mockTokens = [
      { id: 'token_1', scopes: ['read'] },
      { id: 'token_2', scopes: ['write'] },
    ];
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
        .scimTokens.list as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockTokens);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

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

  it('should handle list SCIM tokens error', async () => {
    const error = new Error('List failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
        .scimTokens.list as ReturnType<typeof vi.fn>
    ).mockRejectedValue(error);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await expect(result.current.listScimTokens()).rejects.toThrow('List failed');

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(error);
    });
  });

  it('should expose granular SCIM token loading states', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    expect(result.current.isScimTokensLoading).toBe(false);
    expect(result.current.isScimTokenCreating).toBe(false);
    expect(result.current.isScimTokenDeleting).toBe(false);
  });

  it('should sync SSO attributes successfully', async () => {
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.provisioning
        .scimTokens.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.syncSsoAttributes();

    await waitFor(() => {
      expect(result.current.isSsoAttributesSyncing).toBe(false);
    });
  });

  it('should sync provisioning attributes successfully', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.syncProvisioningAttributes();

    await waitFor(() => {
      expect(result.current.isProvisioningAttributesSyncing).toBe(false);
    });
  });

  it('should return early if coreClient is not available', () => {
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    expect(result.current.provider).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return early if idpId is not provided', () => {
    const { result } = renderUseSsoProviderEdit('');

    expect(result.current.provider).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle 404 when fetching provisioning config', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => {
      expect(result.current.provisioningConfig).toBe(null);
    });
  });

  it('should call onBefore callback and abort when it returns false', async () => {
    const onBefore = vi.fn().mockReturnValue(false);

    const { result } = renderUseSsoProviderEdit(mockIdpId, {
      sso: {
        updateAction: { onBefore },
        deleteAction: {},
        deleteFromOrganizationAction: {},
      },
    });

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await act(async () => {
      await result.current.updateProvider({ strategy: 'samlp', is_enabled: true });
    });

    await waitFor(() => {
      expect(onBefore).toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled(); // Should NOT call handleError for cancelled actions
    });
  });

  it('should call onAfter callback after successful update', async () => {
    const onAfter = vi.fn();

    const { result } = renderUseSsoProviderEdit(mockIdpId, {
      sso: {
        updateAction: { onAfter },
        deleteAction: {},
        deleteFromOrganizationAction: {},
      },
    });

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.updateProvider({ strategy: 'samlp', is_enabled: true });

    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith(mockProvider, mockProvider);
    });
  });

  it('should expose error from queries', async () => {
    const error = new Error('Query error');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.get as ReturnType<
        typeof vi.fn
      >
    ).mockRejectedValue(error);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });
  });

  it('should retry on error', async () => {
    const error = new Error('Query error');
    const mockGet = mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
      .get as ReturnType<typeof vi.fn>;
    mockGet.mockRejectedValueOnce(error).mockResolvedValue(mockProvider);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    await result.current.retry();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.provider).toEqual(mockProvider);
    });
  });

  it('should fetch provider imperatively', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    const provider = await result.current.fetchProvider();

    expect(provider).toEqual(mockProvider);
    expect(
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.get,
    ).toHaveBeenCalledWith(mockIdpId);
  });

  it('should compute hasSsoAttributeSyncWarning as false when no attributes', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    expect(result.current.hasSsoAttributeSyncWarning).toBe(false);
  });

  it('should compute hasSsoAttributeSyncWarning as true when attributes have warnings', async () => {
    const providerWithAttributes: IdentityProvider = {
      ...mockProvider,
      attributes: [
        { id: 'attr_1', is_extra: true, is_missing: false },
        { id: 'attr_2', is_extra: false, is_missing: false },
      ],
    } as unknown as IdentityProvider;

    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.get as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue(providerWithAttributes);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => {
      expect(result.current.hasSsoAttributeSyncWarning).toBe(true);
    });
  });

  it('should toggle provider enabled state', async () => {
    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.handleToggleProvider(false);

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.update,
      ).toHaveBeenCalledWith(mockIdpId, expect.objectContaining({ is_enabled: false }));
    });
  });

  it('should not toggle provider if strategy is missing', async () => {
    const providerNoStrategy = {
      ...mockProvider,
      strategy: undefined,
    } as unknown as IdentityProvider;
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.get as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue(providerNoStrategy);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(providerNoStrategy));

    await result.current.handleToggleProvider(true);

    expect(
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.update,
    ).not.toHaveBeenCalled();
  });

  it('should show provisioning tab when provisioning is enabled', async () => {
    vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(
      createMockUseIdpConfig({
        isProvisioningEnabled: vi.fn(() => true),
        isProvisioningMethodEnabled: vi.fn(() => true),
      }),
    );

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    expect(result.current.showProvisioningTab).toBe(true);
  });

  it('should hide provisioning tab when provisioning is not enabled', async () => {
    vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(
      createMockUseIdpConfig({
        isProvisioningEnabled: vi.fn(() => false),
        isProvisioningMethodEnabled: vi.fn(() => false),
      }),
    );

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    expect(result.current.showProvisioningTab).toBe(false);
  });

  it('should retry configError by calling configRetry', async () => {
    const mockConfigRetry = vi.fn(async () => undefined);
    const configError = new Error('Config error');
    vi.spyOn(useConfigModule, 'useConfig').mockReturnValue(
      createMockUseConfig({
        error: configError,
        retry: mockConfigRetry,
      }),
    );

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.error).toBe(configError));

    await result.current.retry();

    expect(mockConfigRetry).toHaveBeenCalled();
  });

  it('should retry idpConfigError by calling idpConfigRetry', async () => {
    const mockIdpConfigRetry = vi.fn(async () => undefined);
    const idpConfigError = new Error('IDP config error');
    vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(
      createMockUseIdpConfig({
        error: idpConfigError,
        retry: mockIdpConfigRetry,
      }),
    );

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.error).toBe(idpConfigError));

    await result.current.retry();

    expect(mockIdpConfigRetry).toHaveBeenCalled();
  });

  it('should retry failed update mutation', async () => {
    const error = new Error('Update failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .update as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(error);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await expect(
      result.current.updateProvider({ strategy: 'samlp', is_enabled: true }),
    ).rejects.toThrow('Update failed');

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    // Reset the mock to succeed on retry
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .update as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockProvider);

    await result.current.retry();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('should retry failed delete mutation', async () => {
    const error = new Error('Delete failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .delete as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(error);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await expect(result.current.onDeleteConfirm()).rejects.toThrow('Delete failed');

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .delete as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);

    await result.current.retry();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('should retry failed detach mutation', async () => {
    const error = new Error('Detach failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .detach as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(error);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await expect(result.current.onRemoveConfirm()).rejects.toThrow('Detach failed');

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .detach as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);

    await result.current.retry();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('should retry failed sync SSO attributes mutation', async () => {
    const error = new Error('Sync failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .updateAttributes as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(error);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await expect(result.current.syncSsoAttributes()).rejects.toThrow('Sync failed');

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .updateAttributes as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);

    await result.current.retry();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('should call onAfter callback after successful delete', async () => {
    const onAfter = vi.fn();

    const { result } = renderUseSsoProviderEdit(mockIdpId, {
      sso: {
        updateAction: {},
        deleteAction: { onAfter },
        deleteFromOrganizationAction: {},
      },
    });

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.onDeleteConfirm();

    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith(mockProvider);
    });
  });

  it('should call onBefore and abort detach when it returns false', async () => {
    const onBefore = vi.fn().mockReturnValue(false);

    const { result } = renderUseSsoProviderEdit(mockIdpId, {
      sso: {
        updateAction: {},
        deleteAction: {},
        deleteFromOrganizationAction: { onBefore },
      },
    });

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.onRemoveConfirm();

    expect(onBefore).toHaveBeenCalled();
    expect(
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.detach,
    ).not.toHaveBeenCalled();
  });

  it('should call onAfter callback after successful detach', async () => {
    const onAfter = vi.fn();

    const { result } = renderUseSsoProviderEdit(mockIdpId, {
      sso: {
        updateAction: {},
        deleteAction: {},
        deleteFromOrganizationAction: { onAfter },
      },
    });

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    await result.current.onRemoveConfirm();

    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith(mockProvider);
    });
  });

  it('should handle organization query error', async () => {
    const error = new Error('Org fetch failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organizationDetails.get as ReturnType<
        typeof vi.fn
      >
    ).mockRejectedValue(error);

    renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(error);
    });
  });

  it('should compute hasSsoAttributeSyncWarning as false when attributes key exists but is null', async () => {
    const providerWithNullAttributes = {
      ...mockProvider,
      attributes: null,
    } as unknown as IdentityProvider;

    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.get as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue(providerWithNullAttributes);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(providerWithNullAttributes));

    expect(result.current.hasSsoAttributeSyncWarning).toBe(false);
  });

  it('should compute hasSsoAttributeSyncWarning as true when attributes have is_missing flag', async () => {
    const providerWithMissingAttributes: IdentityProvider = {
      ...mockProvider,
      attributes: [{ id: 'attr_1', is_extra: false, is_missing: true }],
    } as unknown as IdentityProvider;

    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.get as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue(providerWithMissingAttributes);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => {
      expect(result.current.hasSsoAttributeSyncWarning).toBe(true);
    });
  });

  it('should return default organization when organization query has no data', async () => {
    (
      mockCoreClient.getMyOrganizationApiClient().organizationDetails.get as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue(undefined);

    const { result } = renderUseSsoProviderEdit(mockIdpId);

    await waitFor(() => expect(result.current.provider).toEqual(mockProvider));

    expect(result.current.organization).toBeDefined();
    expect(result.current.organization.id).toBeDefined();
  });
});
