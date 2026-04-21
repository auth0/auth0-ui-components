import type { IdentityProvider, OrganizationPrivate } from '@auth0/universal-components-core';
import { ssoProviderQueryKeys } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSsoProviderTableService } from '@/hooks/my-organization/shared/services/use-sso-provider-table-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { mockToast } from '@/tests/utils';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import {
  setupMockUseCoreClient,
  setupMockUseCoreClientNull,
  setupMockUseErrorHandler,
  setupMockUseTranslator,
} from '@/tests/utils/test-utilities';

const { mockedShowToast } = mockToast();

const mockIdentityProviders: IdentityProvider[] = [
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
  let mockHandleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);
    mockHandleError = setupMockUseErrorHandler(useErrorHandlerModule);
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
      expect(mockList).toHaveBeenCalled();
    });
    it('should handle fetch providers error', async () => {
      const mockList = vi.fn().mockRejectedValue(new Error('Network error'));

      mockMyOrgClient.organization.identityProviders.list = mockList;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), {
        fallbackMessage: 'general_error',
      });
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
      expect(mockGet).toHaveBeenCalled();
    });
    it('should handle fetch organization details error', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Not found'));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: [],
      });
      mockMyOrgClient.organizationDetails.get = mockGet;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), {
        fallbackMessage: 'general_error',
      });
    });

    it('should return null and show toast when fetchOrganizationDetails fails', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Not found'));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: [],
      });
      mockMyOrgClient.organizationDetails.get = mockGet;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const organization = await result.current.fetchOrganizationDetails();

      expect(organization).toBeNull();
      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), {
        fallbackMessage: 'general_error',
      });
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

      await waitFor(() => result.current.onEnableProvider(mockIdentityProviders[1]!, true));

      expect(mockUpdate).toHaveBeenCalledWith('idp-2', expect.any(Object));
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'update_success',
      });
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

      await waitFor(() => result.current.onEnableProvider(mockIdentityProviders[0]!, false));

      expect(onBefore).toHaveBeenCalledWith(mockIdentityProviders[0]);
      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });
    it('should not proceed if onBefore returns false', async () => {
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

      await waitFor(() => result.current.onEnableProvider(mockIdentityProviders[0]!, true));

      expect(mockUpdate).not.toHaveBeenCalled();
    });
    it('should handle enable provider error', async () => {
      const mockUpdate = vi.fn().mockRejectedValue(new Error('Update failed'));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.update = mockUpdate;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onEnableProvider(mockIdentityProviders[0]!, false));

      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), {
        fallbackMessage: 'general_error',
      });
    });
    it('should return false if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdentityProvider;

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onEnableProvider(providerWithoutId, true));
    });

    it('should return false if coreClient is not available', async () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const resultValue = await result.current.onEnableProvider(mockIdentityProviders[0]!, true);

      expect(resultValue).toBe(false);
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

      await waitFor(() => result.current.onDeleteConfirm(mockIdentityProviders[0]!));

      expect(mockDelete).toHaveBeenCalledWith('idp-1');
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'delete_success',
      });
      expect(mockList).toHaveBeenCalledTimes(2); // Once on mount, once after delete
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

      await waitFor(() => result.current.onDeleteConfirm(mockIdentityProviders[0]!));

      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });
    it('should handle delete provider error', async () => {
      const mockDelete = vi.fn().mockRejectedValue(new Error('Delete failed'));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.delete = mockDelete;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onDeleteConfirm(mockIdentityProviders[0]!));

      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), {
        fallbackMessage: 'general_error',
      });
    });
    it('should not delete if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdentityProvider;
      const mockDelete = vi.fn();

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.delete = mockDelete;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onDeleteConfirm(providerWithoutId));

      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('onRemoveConfirm', () => {
    it('should remove provider from organization successfully', async () => {
      const mockDetach = vi.fn().mockResolvedValue(undefined);
      const mockList = vi
        .fn()
        .mockResolvedValue({ identity_providers: [mockIdentityProviders[1]] });
      const mockOrganizationGet = vi.fn().mockResolvedValue(mockOrganization);

      mockMyOrgClient.organization.identityProviders.list = mockList;
      mockMyOrgClient.organization.identityProviders.detach = mockDetach;
      mockMyOrgClient.organizationDetails.get = mockOrganizationGet;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onRemoveConfirm(mockIdentityProviders[0]!));

      expect(mockDetach).toHaveBeenCalledWith('idp-1');
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'remove_success',
      });
      expect(mockList).toHaveBeenCalledTimes(2); // Once on mount, once after remove
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

      await waitFor(() => result.current.onRemoveConfirm(mockIdentityProviders[0]!));

      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });
    it('should handle remove provider error', async () => {
      const mockDetach = vi.fn().mockRejectedValue(new Error('Remove failed'));

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.detach = mockDetach;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onRemoveConfirm(mockIdentityProviders[0]!));

      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), {
        fallbackMessage: 'general_error',
      });
    });
    it('should not remove if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdentityProvider;
      const mockDetach = vi.fn();

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });
      mockMyOrgClient.organization.identityProviders.detach = mockDetach;

      const { result } = renderUseSsoProviderTableService();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onRemoveConfirm(providerWithoutId));

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
        result.current.onEnableProvider(mockIdentityProviders[0]!, false);
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
        result.current.onDeleteConfirm(mockIdentityProviders[0]!);
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
        result.current.onRemoveConfirm(mockIdentityProviders[0]!);
        expect(result.current.isRemoving).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isRemoving).toBe(false);
      });
    });
  });

  describe('custom messages', () => {
    it('should pass custom messages to translator', async () => {
      const customMessages = { update_success: 'Custom update message' };

      vi.mocked(mockMyOrgClient.organization.identityProviders.list).mockResolvedValue({
        identity_providers: [],
      });

      renderUseSsoProviderTableService(undefined, undefined, undefined, customMessages);

      await waitFor(() => {
        expect(useTranslatorModule.useTranslator).toHaveBeenCalledWith(
          'idp_management.notifications',
          customMessages,
        );
      });
    });
  });
});
