import type { IdpKnownResponse, OrganizationPrivate } from '@auth0/universal-components-core';
import { BusinessError, ssoProviderQueryKeys } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSsoProviderTableService } from '@/hooks/my-organization/shared/services/use-sso-provider-table-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import {
  setupMockUseCoreClient,
  setupMockUseCoreClientNull,
  setupMockUseTranslator,
} from '@/tests/utils/test-utilities';

const mockIdentityProviders: IdpKnownResponse[] = [
  {
    id: 'idp-1',
    display_name: 'OKTA SSO',
    strategy: 'okta',
    is_enabled: true,
    options: {},
    attributes: [],
  },
  {
    id: 'idp-2',
    display_name: 'Azure AD',
    strategy: 'waad',
    is_enabled: false,
    options: {},
  },
];

const mockOrganization: OrganizationPrivate = {
  id: 'organization-123',
  display_name: 'Test Organization',
  name: 'test-organization',
  branding: {
    colors: {
      primary: '#0059d6',
      page_background: '#000000',
    },
    logo_url: '',
  },
};

const renderUseSsoProviderTableService = (
  ...args: Parameters<typeof useSsoProviderTableService>
) => {
  const { wrapper } = createTestQueryClientWrapper();
  return renderHook(() => useSsoProviderTableService(...args), { wrapper });
};

const renderUseSsoProviderTableServiceWithClient = (
  ...args: Parameters<typeof useSsoProviderTableService>
) => {
  const { wrapper, queryClient } = createTestQueryClientWrapper();
  return { queryClient, ...renderHook(() => useSsoProviderTableService(...args), { wrapper }) };
};

describe('useSsoProviderTableService', () => {
  const mockCoreClient = createMockCoreClient();
  const mockMyOrgClient = mockCoreClient.getMyOrganizationApiClient();

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);
    setupMockUseTranslator(useTranslatorModule);

    vi.mocked(mockMyOrgClient.organizationDetails.get).mockResolvedValue(mockOrganization);
  });

  describe('fetchProviders', () => {
    it('should fetch and set providers successfully', async () => {
      const mockList = vi.fn().mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });

      mockMyOrgClient.organization.identityProviders.list = mockList;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.providers).toEqual(mockIdentityProviders);
      expect(result.current.providersError).toBeNull();
      expect(mockList).toHaveBeenCalled();
    });

    it('should surface fetch providers error', async () => {
      const error = new Error('Network error');
      const mockList = vi.fn().mockRejectedValue(error);

      mockMyOrgClient.organization.identityProviders.list = mockList;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.providers).toEqual([]);
      expect(result.current.providersError).toBe(error);
    });

    it('should not fetch if coreClient is not available', async () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.providers).toEqual([]);
    });

    it('should read from cache without invalidating when fetchProviders is called', async () => {
      const mockList = vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders });

      mockMyOrgClient.organization.identityProviders.list = mockList;

      const { result, queryClient } = renderUseSsoProviderTableServiceWithClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      queryClient.setQueryData(ssoProviderQueryKeys.list(), mockIdentityProviders);

      await result.current.fetchProviders();

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('fetchOrganizationDetails', () => {
    it('should fetch and set organization details successfully', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockOrganization);

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: [],
      });
      mockMyOrgClient.organizationDetails.get = mockGet;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.organization).toEqual(mockOrganization);
      expect(result.current.organizationError).toBeNull();
      expect(mockGet).toHaveBeenCalled();
    });

    it('should surface fetch organization details error', async () => {
      const error = new Error('Not found');
      const mockGet = vi.fn().mockRejectedValue(error);

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: [],
      });
      mockMyOrgClient.organizationDetails.get = mockGet;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.organization).toBeNull();
      expect(result.current.organizationError).toBe(error);
    });

    it('should throw when fetchOrganizationDetails fails', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Not found'));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: [],
      });
      mockMyOrgClient.organizationDetails.get = mockGet;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.fetchOrganizationDetails()).rejects.toThrow('Not found');
    });
  });

  describe('onEnableProvider', () => {
    it('should enable provider successfully', async () => {
      const updatedProvider = { ...mockIdentityProviders[1], is_enabled: true };
      const mockUpdate = vi.fn().mockResolvedValue(updatedProvider);

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.update = mockUpdate;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onEnableProvider(mockIdentityProviders[1]!, true);

      expect(mockUpdate).toHaveBeenCalledWith('idp-2', expect.any(Object));
    });

    it('should call enableAction callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();
      const updatedProvider = { ...mockIdentityProviders[0], is_enabled: false };
      const mockUpdate = vi.fn().mockResolvedValue(updatedProvider);

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.update = mockUpdate;

      const { result } = renderUseSsoProviderTableService(undefined, undefined, {
        onBefore,
        onAfter,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onEnableProvider(mockIdentityProviders[0]!, false);

      expect(onBefore).toHaveBeenCalledWith(mockIdentityProviders[0]);
      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    it('should throw if onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);
      const mockUpdate = vi.fn();

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.update = mockUpdate;

      const { result } = renderUseSsoProviderTableService(undefined, undefined, { onBefore });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.onEnableProvider(mockIdentityProviders[0]!, true),
      ).rejects.toThrow(BusinessError);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw on enable provider error', async () => {
      const mockUpdate = vi.fn().mockRejectedValue(new Error('Update failed'));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.update = mockUpdate;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.onEnableProvider(mockIdentityProviders[0]!, false),
      ).rejects.toThrow('Update failed');
    });

    it('should throw if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdpKnownResponse;

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.onEnableProvider(providerWithoutId, true)).rejects.toThrow(
        'Invalid provider',
      );
    });

    it('should throw if coreClient is not available', async () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.onEnableProvider(mockIdentityProviders[0]!, true),
      ).rejects.toThrow('Invalid provider');
    });

    it('should update detail cache when enabling provider', async () => {
      const updatedProvider = { ...mockIdentityProviders[1], is_enabled: true };
      const mockUpdate = vi.fn().mockResolvedValue(updatedProvider);

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.update = mockUpdate;

      const { result, queryClient } = renderUseSsoProviderTableServiceWithClient();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      queryClient.setQueryData(ssoProviderQueryKeys.detail('idp-2'), mockIdentityProviders[1]);

      await result.current.onEnableProvider(mockIdentityProviders[1]!, true);

      const detailCache = queryClient.getQueryData<IdpKnownResponse>(
        ssoProviderQueryKeys.detail('idp-2'),
      );
      expect(detailCache?.is_enabled).toBe(true);
    });
  });

  describe('onDeleteConfirm', () => {
    it('should delete provider successfully', async () => {
      const mockDelete = vi.fn().mockResolvedValue(undefined);
      const mockList = vi
        .fn()
        .mockResolvedValue({ identity_providers: [mockIdentityProviders[1]] });

      mockMyOrgClient.organization.identityProviders.list = mockList;
      mockMyOrgClient.organization.identityProviders.delete = mockDelete;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onDeleteConfirm(mockIdentityProviders[0]!);

      expect(mockDelete).toHaveBeenCalledWith('idp-1');
      expect(mockList).toHaveBeenCalledTimes(2);
    });

    it('should call deleteAction onAfter callback', async () => {
      const onAfter = vi.fn();
      const mockDelete = vi.fn().mockResolvedValue(undefined);

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.delete = mockDelete;

      const { result } = renderUseSsoProviderTableService({ onAfter });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onDeleteConfirm(mockIdentityProviders[0]!);

      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    it('should throw on delete provider error', async () => {
      const mockDelete = vi.fn().mockRejectedValue(new Error('Delete failed'));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.delete = mockDelete;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.onDeleteConfirm(mockIdentityProviders[0]!)).rejects.toThrow(
        'Delete failed',
      );
    });

    it('should not delete if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdpKnownResponse;
      const mockDelete = vi.fn();

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.delete = mockDelete;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.onDeleteConfirm(providerWithoutId)).rejects.toThrow(
        'Invalid provider',
      );
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('onRemoveConfirm', () => {
    it('should remove provider from organization successfully', async () => {
      const mockDetach = vi.fn().mockResolvedValue(undefined);
      const mockList = vi
        .fn()
        .mockResolvedValue({ identity_providers: [mockIdentityProviders[1]] });

      mockMyOrgClient.organization.identityProviders.list = mockList;
      mockMyOrgClient.organization.identityProviders.detach = mockDetach;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onRemoveConfirm(mockIdentityProviders[0]!);

      expect(mockDetach).toHaveBeenCalledWith('idp-1');
      expect(mockList).toHaveBeenCalledTimes(2);
    });

    it('should call removeFromOrganization onAfter callback', async () => {
      const onAfter = vi.fn();
      const mockDetach = vi.fn().mockResolvedValue(undefined);

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.detach = mockDetach;

      const { result } = renderUseSsoProviderTableService(undefined, { onAfter });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onRemoveConfirm(mockIdentityProviders[0]!);

      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    it('should throw on remove provider error', async () => {
      const mockDetach = vi.fn().mockRejectedValue(new Error('Remove failed'));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.detach = mockDetach;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.onRemoveConfirm(mockIdentityProviders[0]!)).rejects.toThrow(
        'Remove failed',
      );
    });

    it('should not remove if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdpKnownResponse;
      const mockDetach = vi.fn();

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.detach = mockDetach;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.onRemoveConfirm(providerWithoutId)).rejects.toThrow(
        'Invalid provider',
      );
      expect(mockDetach).not.toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    it('should set isUpdating and isUpdatingId when enabling provider', async () => {
      const updatedProvider = { ...mockIdentityProviders[0], is_enabled: false };
      const mockUpdate = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(updatedProvider), 100)),
        );

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.update = mockUpdate;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        result.current.onEnableProvider(mockIdentityProviders[0]!, false).catch(() => undefined);
        expect(result.current.isUpdating).toBe(true);
        expect(result.current.isUpdatingId).toBe('idp-1');
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
        expect(result.current.isUpdatingId).toBe(null);
      });
    });

    it('should set isDeleting when deleting provider', async () => {
      const mockDelete = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.delete = mockDelete;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        result.current.onDeleteConfirm(mockIdentityProviders[0]!).catch(() => undefined);
        expect(result.current.isDeleting).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it('should set isRemoving when removing provider', async () => {
      const mockDetach = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.detach = mockDetach;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        result.current.onRemoveConfirm(mockIdentityProviders[0]!).catch(() => undefined);
        expect(result.current.isRemoving).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isRemoving).toBe(false);
      });
    });
  });
});
