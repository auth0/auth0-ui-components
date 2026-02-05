import type {
  IdentityProvider,
  CreateIdpProvisioningScimTokenRequestContent,
  OrganizationPrivate,
} from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';

import { useSsoProviderEdit } from '../use-sso-provider-edit';

import { showToast } from '@/components/ui/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';

vi.mock('@/hooks/shared/use-core-client');
vi.mock('@/hooks/shared/use-translator');
vi.mock('@/components/ui/toast');

describe('useSsoProviderEdit', () => {
  const mockIdpId = 'idp_123';
  const mockGet = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockDetach = vi.fn();
  const mockGetOrgDetails = vi.fn();
  const mockProvisioningGet = vi.fn();
  const mockProvisioningCreate = vi.fn();
  const mockProvisioningDelete = vi.fn();
  const mockScimTokensList = vi.fn();
  const mockScimTokensCreate = vi.fn();
  const mockScimTokensDelete = vi.fn();

  const mockT = vi.fn((key: string, params?: Record<string, string>) => {
    if (key === 'update_success') {
      return `Provider ${params?.providerName} updated successfully`;
    }
    if (key === 'delete_success') {
      return `Provider ${params?.providerName} deleted successfully`;
    }
    if (key === 'remove_success') {
      return `Provider ${params?.providerName} removed from ${params?.organizationName}`;
    }
    if (key === 'scim_token_create_success') {
      return 'SCIM token created successfully';
    }
    if (key === 'scim_token_delete_sucess') {
      return 'SCIM token deleted successfully';
    }
    if (key === 'general_error') {
      return 'An error occurred';
    }
    return key;
  });

  const mockCoreClient = {
    getMyOrganizationApiClient: () => ({
      organization: {
        identityProviders: {
          get: mockGet,
          update: mockUpdate,
          delete: mockDelete,
          detach: mockDetach,
          provisioning: {
            get: mockProvisioningGet,
            create: mockProvisioningCreate,
            delete: mockProvisioningDelete,
            scimTokens: {
              list: mockScimTokensList,
              create: mockScimTokensCreate,
              delete: mockScimTokensDelete,
            },
          },
        },
      },
      organizationDetails: {
        get: mockGetOrgDetails,
      },
    }),
  };

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

  beforeEach(() => {
    vi.clearAllMocks();
    (useCoreClient as Mock).mockReturnValue({ coreClient: mockCoreClient });
    (useTranslator as Mock).mockReturnValue({ t: mockT });
    mockGet.mockResolvedValue(mockProvider);
    mockGetOrgDetails.mockResolvedValue(mockOrganization);
  });

  it('should initialize with correct default states', () => {
    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    expect(result.current.provider).toBe(null);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.isRemoving).toBe(false);
    expect(result.current.isProvisioningUpdating).toBe(false);
    expect(result.current.isProvisioningDeleting).toBe(false);
    expect(result.current.isProvisioningLoading).toBe(false);
    expect(result.current.isScimTokensLoading).toBe(false);
    expect(result.current.isScimTokenCreating).toBe(false);
    expect(result.current.isScimTokenDeleting).toBe(false);
    expect(typeof result.current.fetchProvider).toBe('function');
    expect(typeof result.current.updateProvider).toBe('function');
    expect(typeof result.current.onDeleteConfirm).toBe('function');
    expect(typeof result.current.onRemoveConfirm).toBe('function');
  });

  it('should fetch provider on mount', async () => {
    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(mockIdpId);
      expect(result.current.provider).toEqual(mockProvider);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should fetch organization details on mount', async () => {
    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(mockGetOrgDetails).toHaveBeenCalled();
      expect(result.current.organization).toEqual(mockOrganization);
    });
  });

  it('should delete provider successfully', async () => {
    mockDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    await result.current.onDeleteConfirm();

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(mockIdpId);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Provider Test Provider deleted successfully',
      });
      expect(result.current.isDeleting).toBe(false);
    });
  });

  it('should set isDeleting to true during deletion', async () => {
    mockDelete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    const deletePromise = result.current.onDeleteConfirm();

    await deletePromise;

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });
  });

  it('should remove provider from organization successfully', async () => {
    mockDetach.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    await result.current.onRemoveConfirm();

    await waitFor(() => {
      expect(mockDetach).toHaveBeenCalledWith(mockIdpId);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.stringContaining('removed'),
      });
      expect(result.current.isRemoving).toBe(false);
    });
  });

  it('should fetch provisioning config', async () => {
    mockProvisioningGet.mockResolvedValue({
      enabled: true,
    });

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    const provisioningResult = await result.current.fetchProvisioning();

    await waitFor(() => {
      expect(mockProvisioningGet).toHaveBeenCalledWith(mockIdpId);
      expect(provisioningResult).toEqual({
        enabled: true,
      });
      expect(result.current.provisioningConfig).toEqual({
        enabled: true,
      });
      expect(result.current.isProvisioningLoading).toBe(false);
    });
  });

  it('should handle 404 when fetching provisioning config', async () => {
    mockProvisioningGet.mockRejectedValue({
      body: { status: 404 },
    });

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    const provisioningResult = await result.current.fetchProvisioning();

    await waitFor(() => {
      expect(provisioningResult).toBe(null);
      expect(result.current.provisioningConfig).toBe(null);
      expect(result.current.isProvisioningLoading).toBe(false);
    });
  });

  it('should create provisioning successfully', async () => {
    mockProvisioningCreate.mockResolvedValue({
      enabled: true,
    });
    mockGet.mockResolvedValue(mockProvider);

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    await result.current.createProvisioning();

    await waitFor(() => {
      expect(mockProvisioningCreate).toHaveBeenCalledWith(mockIdpId);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Provider Test Provider updated successfully',
      });
      expect(result.current.isProvisioningUpdating).toBe(false);
    });
  });

  it('should call onBefore callback for provisioning create and abort when it returns false', async () => {
    const onBefore = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() =>
      useSsoProviderEdit(mockIdpId, {
        provisioning: {
          createAction: { onBefore },
        },
      }),
    );

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    await result.current.createProvisioning();

    expect(onBefore).toHaveBeenCalledWith(mockProvider);
    expect(mockProvisioningCreate).not.toHaveBeenCalled();
  });

  it('should delete provisioning successfully', async () => {
    mockProvisioningDelete.mockResolvedValue(undefined);
    mockGet.mockResolvedValue(mockProvider);

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    await result.current.deleteProvisioning();

    await waitFor(() => {
      expect(mockProvisioningDelete).toHaveBeenCalledWith(mockIdpId);
      expect(result.current.provisioningConfig).toBe(null);
      expect(result.current.isProvisioningDeleting).toBe(false);
    });
  });

  it('should list SCIM tokens', async () => {
    const mockTokens = [{ id: 'token_1', name: 'Token 1' }];
    mockScimTokensList.mockResolvedValue(mockTokens);

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    const tokens = await result.current.listScimTokens();

    await waitFor(() => {
      expect(mockScimTokensList).toHaveBeenCalledWith(mockIdpId);
      expect(tokens).toEqual(mockTokens);
      expect(result.current.isScimTokensLoading).toBe(false);
    });
  });

  it('should create SCIM token successfully', async () => {
    const tokenData: CreateIdpProvisioningScimTokenRequestContent = {};

    const mockNewToken = { id: 'token_123', name: 'New Token', token: 'secret_token' };
    mockScimTokensCreate.mockResolvedValue(mockNewToken);

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    const token = await result.current.createScimToken(tokenData);

    await waitFor(() => {
      expect(mockScimTokensCreate).toHaveBeenCalledWith(mockIdpId, tokenData);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'SCIM token created successfully',
      });
      expect(token).toEqual(mockNewToken);
      expect(result.current.isScimTokenCreating).toBe(false);
    });
  });

  it('should call onBefore callback for SCIM token create and abort when it returns false', async () => {
    const tokenData = {} as CreateIdpProvisioningScimTokenRequestContent;

    const onBefore = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() =>
      useSsoProviderEdit(mockIdpId, {
        provisioning: {
          createScimTokenAction: { onBefore },
        },
      }),
    );

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    await result.current.createScimToken(tokenData);

    expect(onBefore).toHaveBeenCalledWith(mockProvider);
    expect(mockScimTokensCreate).not.toHaveBeenCalled();
  });

  it('should delete SCIM token successfully', async () => {
    const tokenId = 'token_123';
    mockScimTokensDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    await result.current.deleteScimToken(tokenId);

    await waitFor(() => {
      expect(mockScimTokensDelete).toHaveBeenCalledWith(mockIdpId, tokenId);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'SCIM token deleted successfully',
      });
      expect(result.current.isScimTokenDeleting).toBe(false);
    });
  });

  it('should return early if coreClient is not available', async () => {
    (useCoreClient as Mock).mockReturnValue({ coreClient: null });

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    const provider = await result.current.fetchProvider();

    expect(provider).toBe(null);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should return early if idpId is not provided', async () => {
    const { result } = renderHook(() => useSsoProviderEdit(''));

    const provider = await result.current.fetchProvider();

    expect(provider).toBe(null);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should handle fetch provider error', async () => {
    mockGet.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should use custom messages when provided', async () => {
    const customMessages = {
      update_success: 'Custom update message',
    };

    renderHook(() => useSsoProviderEdit(mockIdpId, { customMessages }));

    await waitFor(() => {
      expect(useTranslator).toHaveBeenCalledWith('idp_management.notifications', customMessages);
    });
  });

  it('should update provider successfully', async () => {
    const updateData = {
      display_name: 'Updated Provider',
      strategy: mockProvider.strategy,
    };

    const updatedProvider = {
      ...mockProvider,
      display_name: 'Updated Provider',
      strategy: mockProvider.strategy,
    };

    mockUpdate.mockResolvedValue(updatedProvider);

    const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

    await waitFor(() => {
      expect(result.current.provider).toEqual(mockProvider);
    });

    await result.current.updateProvider(updateData);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(mockIdpId, expect.any(Object));
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Provider Test Provider updated successfully',
      });
      expect(result.current.provider).toEqual(updatedProvider);
      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe('syncSsoAttributes', () => {
    const mockUpdateAttributes = vi.fn();

    beforeEach(() => {
      mockCoreClient.getMyOrganizationApiClient = () => ({
        organization: {
          identityProviders: {
            get: mockGet,
            update: mockUpdate,
            delete: mockDelete,
            detach: mockDetach,
            updateAttributes: mockUpdateAttributes,
            provisioning: {
              get: mockProvisioningGet,
              create: mockProvisioningCreate,
              delete: mockProvisioningDelete,
              updateAttributes: vi.fn(),
              scimTokens: {
                list: mockScimTokensList,
                create: mockScimTokensCreate,
                delete: mockScimTokensDelete,
              },
            },
          },
        },
        organizationDetails: {
          get: mockGetOrgDetails,
        },
      });
    });

    it('should sync SSO attributes successfully', async () => {
      mockUpdateAttributes.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.syncSsoAttributes();

      await waitFor(() => {
        expect(mockUpdateAttributes).toHaveBeenCalledWith(mockIdpId, {});
        expect(showToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'sso_attributes_sync_success',
        });
        expect(result.current.isSsoAttributesSyncing).toBe(false);
      });
    });

    it('should handle error when syncing SSO attributes', async () => {
      mockUpdateAttributes.mockRejectedValue(new Error('Sync failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await expect(result.current.syncSsoAttributes()).rejects.toThrow();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should return early if coreClient is not available', async () => {
      (useCoreClient as Mock).mockReturnValue({ coreClient: null });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await result.current.syncSsoAttributes();

      expect(mockUpdateAttributes).not.toHaveBeenCalled();
    });
  });

  describe('syncProvisioningAttributes', () => {
    const mockProvisioningUpdateAttributes = vi.fn();

    beforeEach(() => {
      mockCoreClient.getMyOrganizationApiClient = () => ({
        organization: {
          identityProviders: {
            get: mockGet,
            update: mockUpdate,
            delete: mockDelete,
            detach: mockDetach,
            updateAttributes: vi.fn(),
            provisioning: {
              get: mockProvisioningGet,
              create: mockProvisioningCreate,
              delete: mockProvisioningDelete,
              updateAttributes: mockProvisioningUpdateAttributes,
              scimTokens: {
                list: mockScimTokensList,
                create: mockScimTokensCreate,
                delete: mockScimTokensDelete,
              },
            },
          },
        },
        organizationDetails: {
          get: mockGetOrgDetails,
        },
      });
    });

    it('should sync provisioning attributes successfully', async () => {
      mockProvisioningUpdateAttributes.mockResolvedValue(undefined);
      mockProvisioningGet.mockResolvedValue({ enabled: true });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.syncProvisioningAttributes();

      await waitFor(() => {
        expect(mockProvisioningUpdateAttributes).toHaveBeenCalledWith(mockIdpId, {});
        expect(showToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'provisioning_attributes_sync_success',
        });
        expect(result.current.isProvisioningAttributesSyncing).toBe(false);
      });
    });

    it('should handle error when syncing provisioning attributes', async () => {
      mockProvisioningUpdateAttributes.mockRejectedValue(new Error('Sync failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await expect(result.current.syncProvisioningAttributes()).rejects.toThrow();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should return early if coreClient is not available', async () => {
      (useCoreClient as Mock).mockReturnValue({ coreClient: null });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await result.current.syncProvisioningAttributes();

      expect(mockProvisioningUpdateAttributes).not.toHaveBeenCalled();
    });

    it('should return early if idpId is not provided', async () => {
      const { result } = renderHook(() => useSsoProviderEdit(''));

      await result.current.syncProvisioningAttributes();

      expect(mockProvisioningUpdateAttributes).not.toHaveBeenCalled();
    });
  });

  describe('hasSsoAttributeSyncWarning', () => {
    it('should return true when provider has extra attributes', async () => {
      const providerWithExtraAttr = {
        ...mockProvider,
        attributes: [{ is_extra: true, is_missing: false }],
      };
      mockGet.mockResolvedValue(providerWithExtraAttr);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.hasSsoAttributeSyncWarning).toBe(true);
      });
    });

    it('should return true when provider has missing attributes', async () => {
      const providerWithMissingAttr = {
        ...mockProvider,
        attributes: [{ is_extra: false, is_missing: true }],
      };
      mockGet.mockResolvedValue(providerWithMissingAttr);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.hasSsoAttributeSyncWarning).toBe(true);
      });
    });

    it('should return false when provider has no attribute issues', async () => {
      const providerWithNoIssues = {
        ...mockProvider,
        attributes: [{ is_extra: false, is_missing: false }],
      };
      mockGet.mockResolvedValue(providerWithNoIssues);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.hasSsoAttributeSyncWarning).toBe(false);
      });
    });

    it('should return false when provider has no attributes property', async () => {
      mockGet.mockResolvedValue(mockProvider);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.hasSsoAttributeSyncWarning).toBe(false);
      });
    });

    it('should return false when provider is null', async () => {
      mockGet.mockResolvedValue(null);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.hasSsoAttributeSyncWarning).toBe(false);
      });
    });
  });

  describe('hasProvisioningAttributeSyncWarning', () => {
    it('should return true when provisioning config has extra attributes', async () => {
      mockProvisioningGet.mockResolvedValue({
        enabled: true,
        attributes: [{ is_extra: true, is_missing: false }],
      });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.fetchProvisioning();

      await waitFor(() => {
        expect(result.current.hasProvisioningAttributeSyncWarning).toBe(true);
      });
    });

    it('should return true when provisioning config has missing attributes', async () => {
      mockProvisioningGet.mockResolvedValue({
        enabled: true,
        attributes: [{ is_extra: false, is_missing: true }],
      });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.fetchProvisioning();

      await waitFor(() => {
        expect(result.current.hasProvisioningAttributeSyncWarning).toBe(true);
      });
    });

    it('should return false when provisioning config has no attribute issues', async () => {
      mockProvisioningGet.mockResolvedValue({
        enabled: true,
        attributes: [{ is_extra: false, is_missing: false }],
      });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.fetchProvisioning();

      await waitFor(() => {
        expect(result.current.hasProvisioningAttributeSyncWarning).toBe(false);
      });
    });

    it('should return false when provisioning config is null', async () => {
      mockProvisioningGet.mockRejectedValue({ body: { status: 404 } });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.fetchProvisioning();

      await waitFor(() => {
        expect(result.current.hasProvisioningAttributeSyncWarning).toBe(false);
      });
    });
  });

  describe('onBefore callbacks', () => {
    it('should call onBefore callback for update and abort when it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderHook(() =>
        useSsoProviderEdit(mockIdpId, {
          sso: {
            updateAction: { onBefore },
            deleteAction: {},
            deleteFromOrganizationAction: {},
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.updateProvider({ display_name: 'Test', strategy: 'samlp' });

      expect(onBefore).toHaveBeenCalledWith(mockProvider);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should call onBefore callback for provisioning delete and abort when it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderHook(() =>
        useSsoProviderEdit(mockIdpId, {
          provisioning: {
            deleteAction: { onBefore },
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.deleteProvisioning();

      expect(onBefore).toHaveBeenCalledWith(mockProvider);
      expect(mockProvisioningDelete).not.toHaveBeenCalled();
    });

    it('should call onBefore callback for SCIM token delete and abort when it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderHook(() =>
        useSsoProviderEdit(mockIdpId, {
          provisioning: {
            deleteScimTokenAction: { onBefore },
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.deleteScimToken('token_123');

      expect(onBefore).toHaveBeenCalledWith(mockProvider);
      expect(mockScimTokensDelete).not.toHaveBeenCalled();
    });

    it('should call onBefore callback for remove from org and abort when it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderHook(() =>
        useSsoProviderEdit(mockIdpId, {
          sso: {
            deleteAction: {},
            deleteFromOrganizationAction: { onBefore },
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.onRemoveConfirm();

      expect(onBefore).toHaveBeenCalledWith(mockProvider);
      expect(mockDetach).not.toHaveBeenCalled();
    });
  });

  describe('onAfter callbacks', () => {
    it('should call onAfter callback after successful update', async () => {
      const updatedProvider = { ...mockProvider, display_name: 'Updated' };
      mockUpdate.mockResolvedValue(updatedProvider);
      const onAfter = vi.fn();

      const { result } = renderHook(() =>
        useSsoProviderEdit(mockIdpId, {
          sso: {
            updateAction: { onAfter },
            deleteAction: {},
            deleteFromOrganizationAction: {},
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.updateProvider({ display_name: 'Updated', strategy: 'samlp' });

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockProvider, updatedProvider);
      });
    });

    it('should call onAfter callback after successful provisioning create', async () => {
      const provisioningResult = { enabled: true };
      mockProvisioningCreate.mockResolvedValue(provisioningResult);
      const onAfter = vi.fn();

      const { result } = renderHook(() =>
        useSsoProviderEdit(mockIdpId, {
          provisioning: {
            createAction: { onAfter },
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.createProvisioning();

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockProvider, provisioningResult);
      });
    });

    it('should call onAfter callback after successful provisioning delete', async () => {
      mockProvisioningDelete.mockResolvedValue(undefined);
      const onAfter = vi.fn();

      const { result } = renderHook(() =>
        useSsoProviderEdit(mockIdpId, {
          provisioning: {
            deleteAction: { onAfter },
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.deleteProvisioning();

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockProvider);
      });
    });

    it('should call onAfter callback after successful SCIM token create', async () => {
      const newToken = { id: 'token_123', token: 'secret' };
      mockScimTokensCreate.mockResolvedValue(newToken);
      const onAfter = vi.fn();

      const { result } = renderHook(() =>
        useSsoProviderEdit(mockIdpId, {
          provisioning: {
            createScimTokenAction: { onAfter },
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.createScimToken({});

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockProvider, newToken);
      });
    });

    it('should call onAfter callback after successful SCIM token delete', async () => {
      mockScimTokensDelete.mockResolvedValue(undefined);
      const onAfter = vi.fn();

      const { result } = renderHook(() =>
        useSsoProviderEdit(mockIdpId, {
          provisioning: {
            deleteScimTokenAction: { onAfter },
          },
        }),
      );

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.deleteScimToken('token_123');

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockProvider);
      });
    });
  });

  describe('error handling', () => {
    it('should handle update provider error', async () => {
      mockUpdate.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await expect(
        result.current.updateProvider({ display_name: 'Test', strategy: 'samlp' }),
      ).rejects.toThrow();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it('should handle create provisioning error', async () => {
      mockProvisioningCreate.mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await expect(result.current.createProvisioning()).rejects.toThrow();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should handle delete provisioning error', async () => {
      mockProvisioningDelete.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await expect(result.current.deleteProvisioning()).rejects.toThrow();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should handle list SCIM tokens error', async () => {
      mockScimTokensList.mockRejectedValue(new Error('List failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      const tokens = await result.current.listScimTokens();

      expect(tokens).toBe(null);
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
    });

    it('should handle create SCIM token error', async () => {
      mockScimTokensCreate.mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await expect(result.current.createScimToken({})).rejects.toThrow();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should handle delete SCIM token error', async () => {
      mockScimTokensDelete.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await expect(result.current.deleteScimToken('token_123')).rejects.toThrow();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should handle delete provider error', async () => {
      mockDelete.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await expect(result.current.onDeleteConfirm()).rejects.toThrow();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should handle remove from organization error', async () => {
      mockDetach.mockRejectedValue(new Error('Remove failed'));

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await expect(result.current.onRemoveConfirm()).rejects.toThrow();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should handle fetch organization details error', async () => {
      mockGetOrgDetails.mockRejectedValue(new Error('Fetch failed'));

      renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should handle non-404 error when fetching provisioning config', async () => {
      mockProvisioningGet.mockRejectedValue({
        body: { status: 500 },
      });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await waitFor(() => {
        expect(result.current.provider).toEqual(mockProvider);
      });

      await result.current.fetchProvisioning();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });
  });

  describe('early returns', () => {
    it('should return early from updateProvider if provider is null', async () => {
      mockGet.mockResolvedValue(null);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await result.current.updateProvider({ display_name: 'Test', strategy: 'samlp' });

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return early from createProvisioning if provider is null', async () => {
      mockGet.mockResolvedValue(null);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await result.current.createProvisioning();

      expect(mockProvisioningCreate).not.toHaveBeenCalled();
    });

    it('should return early from deleteProvisioning if provider is null', async () => {
      mockGet.mockResolvedValue(null);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await result.current.deleteProvisioning();

      expect(mockProvisioningDelete).not.toHaveBeenCalled();
    });

    it('should return early from listScimTokens if coreClient is null', async () => {
      (useCoreClient as Mock).mockReturnValue({ coreClient: null });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      const tokens = await result.current.listScimTokens();

      expect(tokens).toBe(null);
      expect(mockScimTokensList).not.toHaveBeenCalled();
    });

    it('should return early from createScimToken if coreClient is null', async () => {
      (useCoreClient as Mock).mockReturnValue({ coreClient: null });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await result.current.createScimToken({});

      expect(mockScimTokensCreate).not.toHaveBeenCalled();
    });

    it('should return early from deleteScimToken if coreClient is null', async () => {
      (useCoreClient as Mock).mockReturnValue({ coreClient: null });

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await result.current.deleteScimToken('token_123');

      expect(mockScimTokensDelete).not.toHaveBeenCalled();
    });

    it('should return early from onDeleteConfirm if provider is null', async () => {
      mockGet.mockResolvedValue(null);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await result.current.onDeleteConfirm();

      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should return early from onRemoveConfirm if provider is null', async () => {
      mockGet.mockResolvedValue(null);

      const { result } = renderHook(() => useSsoProviderEdit(mockIdpId));

      await result.current.onRemoveConfirm();

      expect(mockDetach).not.toHaveBeenCalled();
    });
  });
});
