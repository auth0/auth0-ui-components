import type { IdentityProvider, OrganizationPrivate } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { showToast } from '../../../../components/ui/toast';
import * as useCoreClientModule from '../../../use-core-client';
import * as useTranslatorModule from '../../../use-translator';
import { useSsoProviderTable } from '../use-sso-provider-table';

vi.mock('../../../../components/ui/toast', () => ({
  showToast: vi.fn(),
}));

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
  id: 'org-123',
  display_name: 'Test Organization',
  name: 'test-org',
  branding: {
    colors: {
      primary: '#0059d6',
      page_background: '#000000',
    },
    logo_url: '',
  },
};

describe('useSsoProviderTable', () => {
  const mockCoreClient = {
    getMyOrgApiClient: vi.fn(),
  };

  const mockTranslator = vi.fn((key: string, params?: Record<string, string>) => {
    if (key === 'general_error') return 'An error occurred';
    if (key === 'update_success') return `Updated ${params?.providerName}`;
    if (key === 'delete_success') return `Deleted ${params?.providerName}`;
    if (key === 'remove_success')
      return `Removed ${params?.providerName} from ${params?.organizationName}`;
    return key;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient as any,
    });

    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
      t: mockTranslator,
    } as any);
  });

  describe('fetchProviders', () => {
    // Test: Verifies that the hook successfully fetches identity providers from the API
    // and updates the providers state with the fetched data
    it('should fetch and set providers successfully', async () => {
      const mockList = vi.fn().mockResolvedValue({
        identity_providers: mockIdentityProviders,
      });

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: mockList,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

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

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: mockList,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
    });

    // Test: Ensures the hook doesn't attempt to fetch data when coreClient is unavailable
    // Loading state should remain true and providers array should stay empty
    it('should not fetch if coreClient is not available', async () => {
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: null as any,
      });

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

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: [] }),
          },
        },
        organizationDetails: {
          get: mockGet,
        },
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

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: [] }),
          },
        },
        organizationDetails: {
          get: mockGet,
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
    });
  });

  describe('onEnableProvider', () => {
    // Test: Verifies that a provider can be successfully enabled/disabled
    // Should call the update API, show success toast, and return true
    it('should enable provider successfully', async () => {
      const updatedProvider = { ...mockIdentityProviders[1], is_enabled: true };
      const mockUpdate = vi.fn().mockResolvedValue(updatedProvider);

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            update: mockUpdate,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.onEnableProvider(mockIdentityProviders[1]!, true);

      expect(success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith('idp-2', expect.any(Object));
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Updated Azure AD',
      });
    });

    // Test: Validates that enableAction callbacks (onBefore and onAfter) are properly invoked
    // during the enable/disable operation
    it('should call enableAction callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();
      const updatedProvider = { ...mockIdentityProviders[0], is_enabled: false };
      const mockUpdate = vi.fn().mockResolvedValue(updatedProvider);

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            update: mockUpdate,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() =>
        useSsoProviderTable(undefined, undefined, { onBefore, onAfter }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onEnableProvider(mockIdentityProviders[0]!, false);

      expect(onBefore).toHaveBeenCalledWith(mockIdentityProviders[0]);
      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    // Test: Ensures that if onBefore callback returns false, the enable operation is cancelled
    // and the update API is never called
    it('should not proceed if onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);
      const mockUpdate = vi.fn();

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            update: mockUpdate,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable(undefined, undefined, { onBefore }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.onEnableProvider(mockIdentityProviders[0]!, true);

      expect(success).toBe(false);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    // Test: Validates error handling when the provider update API call fails
    // Should display error toast and return false
    it('should handle enable provider error', async () => {
      const mockUpdate = vi.fn().mockRejectedValue(new Error('Update failed'));

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            update: mockUpdate,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.onEnableProvider(mockIdentityProviders[0]!, false);

      expect(success).toBe(false);
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
    });

    // Test: Ensures the function safely handles providers without an ID
    // Should return false without attempting any API calls
    it('should return false if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined };

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.onEnableProvider(providerWithoutId as any, true);

      expect(success).toBe(false);
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

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: mockList,
            delete: mockDelete,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onDeleteConfirm(mockIdentityProviders[0]!);

      expect(mockDelete).toHaveBeenCalledWith('idp-1');
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Deleted OKTA SSO',
      });
      expect(mockList).toHaveBeenCalledTimes(2); // Once on mount, once after delete
    });

    // Test: Validates that the deleteAction onAfter callback is invoked after deletion
    it('should call deleteAction onAfter callback', async () => {
      const onAfter = vi.fn();
      const mockDelete = vi.fn().mockResolvedValue(undefined);

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            delete: mockDelete,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable({ onAfter }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onDeleteConfirm(mockIdentityProviders[0]!);

      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    // Test: Validates error handling when the delete API call fails
    // Should display an error toast notification
    it('should handle delete provider error', async () => {
      const mockDelete = vi.fn().mockRejectedValue(new Error('Delete failed'));

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            delete: mockDelete,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onDeleteConfirm(mockIdentityProviders[0]!);

      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
    });

    // Test: Ensures the function safely handles providers without an ID
    // Should not attempt to call the delete API
    it('should not delete if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined };
      const mockDelete = vi.fn();

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            delete: mockDelete,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onDeleteConfirm(providerWithoutId as any);

      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('onRemoveConfirm', () => {
    // Test: Verifies that a provider can be successfully removed from an organization
    // Should call detach API, show success toast with org name, and refresh providers list
    it('should remove provider from organization successfully', async () => {
      const mockDetach = vi.fn().mockResolvedValue(undefined);
      const mockList = vi
        .fn()
        .mockResolvedValue({ identity_providers: [mockIdentityProviders[1]] });
      const mockOrgGet = vi.fn().mockResolvedValue(mockOrganization);

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: mockList,
            detach: mockDetach,
          },
        },
        organizationDetails: {
          get: mockOrgGet,
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onRemoveConfirm(mockIdentityProviders[0]!);

      expect(mockDetach).toHaveBeenCalledWith('idp-1');
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Removed OKTA SSO from Test Organization',
      });
      expect(mockList).toHaveBeenCalledTimes(2); // Once on mount, once after remove
    });

    // Test: Validates that the removeFromOrg onAfter callback is invoked after removal
    it('should call removeFromOrg onAfter callback', async () => {
      const onAfter = vi.fn();
      const mockDetach = vi.fn().mockResolvedValue(undefined);

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            detach: mockDetach,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable(undefined, { onAfter }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onRemoveConfirm(mockIdentityProviders[0]!);

      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    // Test: Validates error handling when the detach API call fails
    // Should display an error toast notification
    it('should handle remove provider error', async () => {
      const mockDetach = vi.fn().mockRejectedValue(new Error('Remove failed'));

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            detach: mockDetach,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onRemoveConfirm(mockIdentityProviders[0]!);

      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
    });

    // Test: Ensures the function safely handles providers without an ID
    // Should not attempt to call the detach API
    it('should not remove if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined };
      const mockDetach = vi.fn();

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            detach: mockDetach,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.onRemoveConfirm(providerWithoutId as any);

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

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            update: mockUpdate,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const enablePromise = result.current.onEnableProvider(mockIdentityProviders[0]!, false);

      await enablePromise;

      expect(result.current.isUpdating).toBe(true);
      expect(result.current.isUpdatingId).toBe('idp-1');
    });

    // Test: Validates that isDeleting state is correctly managed during deletion
    it('should set isDeleting when deleting provider', async () => {
      const mockDelete = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            delete: mockDelete,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const deletePromise = result.current.onDeleteConfirm(mockIdentityProviders[0]!);

      await deletePromise;

      expect(result.current.isDeleting).toBe(true);
    });

    // Test: Validates that isRemoving state is correctly managed during removal
    it('should set isRemoving when removing provider', async () => {
      const mockDetach = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
            detach: mockDetach,
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      const { result } = renderHook(() => useSsoProviderTable());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const removePromise = result.current.onRemoveConfirm(mockIdentityProviders[0]!);

      await removePromise;

      expect(result.current.isRemoving).toBe(true);
    });
  });

  describe('custom messages', () => {
    // Test: Verifies that custom toast messages are properly passed to the translator
    // for displaying localized notifications
    it('should pass custom messages to translator', () => {
      const customMessages = { update_success: 'Custom update message' };

      mockCoreClient.getMyOrgApiClient.mockReturnValue({
        organization: {
          identityProviders: {
            list: vi.fn().mockResolvedValue({ identity_providers: [] }),
          },
        },
        organizationDetails: {
          get: vi.fn().mockResolvedValue(mockOrganization),
        },
      });

      renderHook(() => useSsoProviderTable(undefined, undefined, undefined, customMessages));

      expect(useTranslatorModule.useTranslator).toHaveBeenCalledWith(
        'idp_management.notifications',
        customMessages,
      );
    });
  });
});
