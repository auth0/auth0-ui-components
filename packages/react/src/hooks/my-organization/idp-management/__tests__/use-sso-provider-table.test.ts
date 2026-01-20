import type { IdentityProvider, OrganizationPrivate } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockToast, createMockI18nService } from '../../../../internals';
import { createMockCoreClient } from '../../../../internals/__mocks__/core/core-client.mocks';
import {
  setupMockUseCoreClient,
  setupMockUseCoreClientNull,
} from '../../../../internals/test-utilities';
import * as useCoreClientModule from '../../../use-core-client';
import * as useTranslatorModule from '../../../use-translator';
import { useSsoProviderTable } from '../use-sso-provider-table';

// ===== Mock packages =====

const { mockedShowToast } = mockToast();

// ===== Mock Data =====

const mockIdentityProviders: IdentityProvider[] = [
  {
    id: 'idp-1',
    display_name: 'OKTA SSO',
    strategy: 'okta',
    is_enabled: true,
    options: {},
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

// ===== Tests =====

describe('useSsoProviderTable', () => {
  const mockCoreClient = createMockCoreClient();

  // Helper function to setup the mock organization client with common mocks
  const setupMockMyOrgClient = (
    overrides: {
      list?: ReturnType<typeof vi.fn>;
      update?: ReturnType<typeof vi.fn>;
      delete?: ReturnType<typeof vi.fn>;
      detach?: ReturnType<typeof vi.fn>;
      organizationGet?: ReturnType<typeof vi.fn>;
    } = {},
  ) => {
    const mockMyOrgClient = mockCoreClient.getMyOrganizationApiClient();

    if (overrides.list) {
      mockMyOrgClient.organization.identityProviders.list = overrides.list;
    }
    if (overrides.update) {
      mockMyOrgClient.organization.identityProviders.update = overrides.update;
    }
    if (overrides.delete) {
      mockMyOrgClient.organization.identityProviders.delete = overrides.delete;
    }
    if (overrides.detach) {
      mockMyOrgClient.organization.identityProviders.detach = overrides.detach;
    }
    if (overrides.organizationGet) {
      mockMyOrgClient.organizationDetails.get = overrides.organizationGet;
    } else {
      // Default organization get
      mockMyOrgClient.organizationDetails.get = vi.fn().mockResolvedValue(mockOrganization);
    }

    return mockMyOrgClient;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);

    // Setup translator using createMockI18nService
    // The translator will return the key itself (no interpolation needed for tests)
    vi.spyOn(useTranslatorModule, 'useTranslator').mockImplementation((namespace, messages) => {
      const mockT = createMockI18nService().translator(namespace, messages);
      return {
        t: mockT,
        changeLanguage: vi.fn(),
        currentLanguage: 'en-US',
        fallbackLanguage: 'en-US',
      };
    });
  });

  describe('fetchProviders', () => {
    // Test: Verifies that the hook successfully fetches identity providers from the API
    // and updates the providers state with the fetched data
    it('should fetch and set providers successfully', async () => {
      const mockList = vi.fn().mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });

      setupMockMyOrgClient({ list: mockList });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.providers).toEqual(mockIdentityProviders);
      expect(mockList).toHaveBeenCalled();
    });

    // Test: Validates error handling when the API call to fetch providers fails
    // Should display an error toast notification to the user
    it('should handle fetch providers error', async () => {
      const mockList = vi.fn().mockRejectedValue(new Error('Network error'));

      setupMockMyOrgClient({ list: mockList });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'general_error',
      });
    });

    // Test: Ensures the hook doesn't attempt to fetch data when coreClient is unavailable
    // Loading state should remain true and providers array should stay empty
    it('should not fetch if coreClient is not available', async () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      expect(result.current.providers).toEqual([]);
    });
  });

  describe('fetchOrganizationDetails', () => {
    // Test: Verifies that organization details are successfully fetched and stored in state
    it('should fetch and set organization details successfully', async () => {
      const mockGet = vi.fn().mockResolvedValue(mockOrganization);

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: [] }),
        organizationGet: mockGet,
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.organization).toEqual(mockOrganization);
      expect(mockGet).toHaveBeenCalled();
    });

    // Test: Validates error handling when fetching organization details fails
    // Should display an error toast notification
    it('should handle fetch organization details error', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Not found'));

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: [] }),
        organizationGet: mockGet,
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'general_error',
      });
    });
  });

  describe('onEnableProvider', () => {
    // Test: Verifies that a provider can be successfully enabled/disabled
    // Should call the update API, show success toast, and return true
    it('should enable provider successfully', async () => {
      const updatedProvider = { ...mockIdentityProviders[1], is_enabled: true };
      const mockUpdate = vi.fn().mockResolvedValue(updatedProvider);

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderHook(() => useSsoProviderTable());

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

    // Test: Validates that enableAction callbacks (onBefore and onAfter) are properly invoked
    // during the enable/disable operation
    it('should call enableAction callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();
      const updatedProvider = { ...mockIdentityProviders[0], is_enabled: false };
      const mockUpdate = vi.fn().mockResolvedValue(updatedProvider);

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderHook(() =>
        useSsoProviderTable(undefined, undefined, { onBefore, onAfter }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onEnableProvider(mockIdentityProviders[0]!, false));

      expect(onBefore).toHaveBeenCalledWith(mockIdentityProviders[0]);
      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    // Test: Ensures that if onBefore callback returns false, the enable operation is cancelled
    // and the update API is never called
    it('should not proceed if onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);
      const mockUpdate = vi.fn();

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderHook(() => useSsoProviderTable(undefined, undefined, { onBefore }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onEnableProvider(mockIdentityProviders[0]!, true));

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    // Test: Validates error handling when the provider update API call fails
    // Should display error toast and return false
    it('should handle enable provider error', async () => {
      const mockUpdate = vi.fn().mockRejectedValue(new Error('Update failed'));

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onEnableProvider(mockIdentityProviders[0]!, false));

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'general_error',
      });
    });

    // Test: Ensures the function safely handles providers without an ID
    // Should return false without attempting any API calls
    it('should return false if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdentityProvider;

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onEnableProvider(providerWithoutId, true));
    });
  });

  describe('onDeleteConfirm', () => {
    // Test: Verifies that a provider can be successfully deleted
    // Should call delete API, show success toast, and refresh the providers list
    it('should delete provider successfully', async () => {
      const mockDelete = vi.fn().mockResolvedValue(undefined);
      const mockList = vi
        .fn()
        .mockResolvedValue({ identity_providers: [mockIdentityProviders[1]] });

      setupMockMyOrgClient({
        list: mockList,
        delete: mockDelete,
      });

      const { result } = renderHook(() => useSsoProviderTable());

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

    // Test: Validates that the deleteAction onAfter callback is invoked after deletion
    it('should call deleteAction onAfter callback', async () => {
      const onAfter = vi.fn();
      const mockDelete = vi.fn().mockResolvedValue(undefined);

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        delete: mockDelete,
      });

      const { result } = renderHook(() => useSsoProviderTable({ onAfter }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onDeleteConfirm(mockIdentityProviders[0]!));

      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    // Test: Validates error handling when the delete API call fails
    // Should display an error toast notification
    it('should handle delete provider error', async () => {
      const mockDelete = vi.fn().mockRejectedValue(new Error('Delete failed'));

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        delete: mockDelete,
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onDeleteConfirm(mockIdentityProviders[0]!));

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'general_error',
      });
    });

    // Test: Ensures the function safely handles providers without an ID
    // Should not attempt to call the delete API
    it('should not delete if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdentityProvider;
      const mockDelete = vi.fn();

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        delete: mockDelete,
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onDeleteConfirm(providerWithoutId));

      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('onRemoveConfirm', () => {
    // Test: Verifies that a provider can be successfully removed from an organization
    // Should call detach API, show success toast with organization name, and refresh providers list
    it('should remove provider from organization successfully', async () => {
      const mockDetach = vi.fn().mockResolvedValue(undefined);
      const mockList = vi
        .fn()
        .mockResolvedValue({ identity_providers: [mockIdentityProviders[1]] });
      const mockOrganizationGet = vi.fn().mockResolvedValue(mockOrganization);

      setupMockMyOrgClient({
        list: mockList,
        detach: mockDetach,
        organizationGet: mockOrganizationGet,
      });

      const { result } = renderHook(() => useSsoProviderTable());

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

    // Test: Validates that the removeFromOrganization onAfter callback is invoked after removal
    it('should call removeFromOrganization onAfter callback', async () => {
      const onAfter = vi.fn();
      const mockDetach = vi.fn().mockResolvedValue(undefined);

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        detach: mockDetach,
      });

      const { result } = renderHook(() => useSsoProviderTable(undefined, { onAfter }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onRemoveConfirm(mockIdentityProviders[0]!));

      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    // Test: Validates error handling when the detach API call fails
    // Should display an error toast notification
    it('should handle remove provider error', async () => {
      const mockDetach = vi.fn().mockRejectedValue(new Error('Remove failed'));

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        detach: mockDetach,
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onRemoveConfirm(mockIdentityProviders[0]!));

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'general_error',
      });
    });

    // Test: Ensures the function safely handles providers without an ID
    // Should not attempt to call the detach API
    it('should not remove if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdentityProvider;
      const mockDetach = vi.fn();

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        detach: mockDetach,
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => result.current.onRemoveConfirm(providerWithoutId));

      expect(mockDetach).not.toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    // Test: Validates that isUpdating and isUpdatingId states are correctly managed
    // during the enable/disable operation lifecycle
    it('should set isUpdating and isUpdatingId when enabling provider', async () => {
      const updatedProvider = { ...mockIdentityProviders[0], is_enabled: false };
      const mockUpdate = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(updatedProvider), 100)),
        );

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderHook(() => useSsoProviderTable());

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

    // Test: Validates that isDeleting state is correctly managed during deletion
    it('should set isDeleting when deleting provider', async () => {
      const mockDelete = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        delete: mockDelete,
      });

      const { result } = renderHook(() => useSsoProviderTable());

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

    // Test: Validates that isRemoving state is correctly managed during removal
    it('should set isRemoving when removing provider', async () => {
      const mockDetach = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        detach: mockDetach,
      });

      const { result } = renderHook(() => useSsoProviderTable());

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
    // Test: Verifies that custom toast messages are properly passed to the translator
    // for displaying localized notifications
    it('should pass custom messages to translator', async () => {
      const customMessages = { update_success: 'Custom update message' };

      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: [] }),
      });

      renderHook(() => useSsoProviderTable(undefined, undefined, undefined, customMessages));

      await waitFor(() => {
        expect(useTranslatorModule.useTranslator).toHaveBeenCalledWith(
          'idp_management.notifications',
          customMessages,
        );
      });
    });
  });
});
