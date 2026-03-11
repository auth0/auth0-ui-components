import type { IdentityProvider, OrganizationPrivate } from '@auth0/universal-components-core';
import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ssoProviderQueryKeys,
  useSsoProviderTable,
} from '@/hooks/my-organization/use-sso-provider-table';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { mockToast, createMockI18nService } from '@/tests/utils';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import { setupMockUseCoreClient, setupMockUseCoreClientNull } from '@/tests/utils/test-utilities';

// ===== Mock packages =====

vi.mock('@/hooks/my-organization/use-config', () => ({
  useConfig: () => ({
    isLoadingConfig: false,
    shouldAllowDeletion: true,
    isConfigValid: true,
  }),
}));
vi.mock('@/hooks/my-organization/use-idp-config', () => ({
  useIdpConfig: () => ({
    isLoadingIdpConfig: false,
    isIdpConfigValid: true,
  }),
}));

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

const renderUseSsoProviderTable = (...args: Parameters<typeof useSsoProviderTable>) => {
  const { wrapper } = createTestQueryClientWrapper();
  return renderHook(() => useSsoProviderTable(...args), { wrapper });
};

const renderUseSsoProviderTableWithClient = (...args: Parameters<typeof useSsoProviderTable>) => {
  const { wrapper, queryClient } = createTestQueryClientWrapper();
  return { queryClient, ...renderHook(() => useSsoProviderTable(...args), { wrapper }) };
};

describe('useSsoProviderTable', () => {
  const mockCoreClient = createMockCoreClient();

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
      mockMyOrgClient.organizationDetails.get = vi.fn().mockResolvedValue(mockOrganization);
    }

    return mockMyOrgClient;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);

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
    it('should fetch and set providers successfully', async () => {
      const mockList = vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders });
      setupMockMyOrgClient({ list: mockList });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.providers).toEqual(mockIdentityProviders);
      expect(mockList).toHaveBeenCalled();
    });

    it('should handle fetch providers error', async () => {
      const mockList = vi.fn().mockRejectedValue(new Error('Network error'));
      setupMockMyOrgClient({ list: mockList });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({ type: 'error', message: 'general_error' });
    });

    it('should not fetch if coreClient is not available', async () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.providers).toEqual([]);
    });

    it('should read from cache without invalidating when fetchProviders is called', async () => {
      const mockList = vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders });
      setupMockMyOrgClient({ list: mockList });

      const { result, queryClient } = renderUseSsoProviderTableWithClient();
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
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: [] }),
        organizationGet: mockGet,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.organization).toEqual(mockOrganization);
      expect(mockGet).toHaveBeenCalled();
    });

    it('should handle fetch organization details error', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Not found'));
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: [] }),
        organizationGet: mockGet,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({ type: 'error', message: 'general_error' });
    });

    it('should return null and show toast when fetchOrganizationDetails fails', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Not found'));
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: [] }),
        organizationGet: mockGet,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const organization = await result.current.fetchOrganizationDetails();

      expect(organization).toBeNull();
      expect(mockedShowToast).toHaveBeenCalledWith({ type: 'error', message: 'general_error' });
    });
  });

  describe('handleToggleEnabled', () => {
    it('should enable provider successfully', async () => {
      const updatedProvider = { ...mockIdentityProviders[1], is_enabled: true };
      const mockUpdate = vi.fn().mockResolvedValue(updatedProvider);
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleToggleEnabled(mockIdentityProviders[1]!, true);
      });

      expect(mockUpdate).toHaveBeenCalledWith('idp-2', expect.any(Object));
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'update_success',
      });
    });

    it('should call enableProviderAction callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();
      const updatedProvider = { ...mockIdentityProviders[0], is_enabled: false };
      const mockUpdate = vi.fn().mockResolvedValue(updatedProvider);
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderUseSsoProviderTable({ enableProviderAction: { onBefore, onAfter } });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleToggleEnabled(mockIdentityProviders[0]!, false);
      });

      expect(onBefore).toHaveBeenCalledWith(mockIdentityProviders[0]);
      expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
    });

    it('should not proceed if enableProviderAction.onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);
      const mockUpdate = vi.fn();
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderUseSsoProviderTable({ enableProviderAction: { onBefore } });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleToggleEnabled(mockIdentityProviders[0]!, true);
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle enable provider error', async () => {
      const mockUpdate = vi.fn().mockRejectedValue(new Error('Update failed'));
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleToggleEnabled(mockIdentityProviders[0]!, false);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({ type: 'error', message: 'general_error' });
    });

    it('should not enable provider if readOnly is true', async () => {
      const mockUpdate = vi.fn();
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderUseSsoProviderTable({ readOnly: true });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleToggleEnabled(mockIdentityProviders[0]!, true);
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should do nothing if coreClient is not available when toggling', async () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { result } = renderUseSsoProviderTable();

      await act(async () => {
        await result.current.handleToggleEnabled(mockIdentityProviders[0]!, true);
      });

      expect(mockedShowToast).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });
  });

  describe('handleDeleteConfirm', () => {
    it('should delete provider successfully', async () => {
      const mockDelete = vi.fn().mockResolvedValue(undefined);
      const mockList = vi
        .fn()
        .mockResolvedValue({ identity_providers: [mockIdentityProviders[1]] });
      setupMockMyOrgClient({ list: mockList, delete: mockDelete });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.handleDeleteConfirm(mockIdentityProviders[0]!);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('idp-1');
        expect(mockedShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'delete_success',
        });
      });

      expect(mockList).toHaveBeenCalledTimes(2);
    });

    it('should call deleteAction.onAfter callback', async () => {
      const onAfter = vi.fn();
      const mockDelete = vi.fn().mockResolvedValue(undefined);
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        delete: mockDelete,
      });

      const { result } = renderUseSsoProviderTable({ deleteAction: { onAfter } });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.handleDeleteConfirm(mockIdentityProviders[0]!);

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
      });
    });

    it('should handle delete provider error', async () => {
      const mockDelete = vi.fn().mockRejectedValue(new Error('Delete failed'));
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        delete: mockDelete,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.handleDeleteConfirm(mockIdentityProviders[0]!);

      await waitFor(() => {
        expect(mockedShowToast).toHaveBeenCalledWith({ type: 'error', message: 'general_error' });
      });
    });

    it('should close delete modal and clear selectedIdp', async () => {
      const mockDelete = vi.fn().mockResolvedValue(undefined);
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        delete: mockDelete,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setShowDeleteModal(true);
        result.current.setSelectedIdp(mockIdentityProviders[0]!);
      });

      await act(async () => {
        await result.current.handleDeleteConfirm(mockIdentityProviders[0]!);
      });

      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.selectedIdp).toBeNull();
    });

    it('should not delete if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdentityProvider;
      const mockDelete = vi.fn();
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        delete: mockDelete,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDeleteConfirm(providerWithoutId);
      });

      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('handleRemoveConfirm', () => {
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

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.handleRemoveConfirm(mockIdentityProviders[0]!);

      await waitFor(() => {
        expect(mockDetach).toHaveBeenCalledWith('idp-1');
        expect(mockedShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'remove_success',
        });
      });

      expect(mockList).toHaveBeenCalledTimes(2);
    });

    it('should call deleteFromOrganizationAction.onAfter callback', async () => {
      const onAfter = vi.fn();
      const mockDetach = vi.fn().mockResolvedValue(undefined);
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        detach: mockDetach,
      });

      const { result } = renderUseSsoProviderTable({ deleteFromOrganizationAction: { onAfter } });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.handleRemoveConfirm(mockIdentityProviders[0]!);

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockIdentityProviders[0]);
      });
    });

    it('should handle remove provider error', async () => {
      const mockDetach = vi.fn().mockRejectedValue(new Error('Remove failed'));
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        detach: mockDetach,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.handleRemoveConfirm(mockIdentityProviders[0]!);

      await waitFor(() => {
        expect(mockedShowToast).toHaveBeenCalledWith({ type: 'error', message: 'general_error' });
      });
    });

    it('should close remove modal and clear selectedIdp', async () => {
      const mockDetach = vi.fn().mockResolvedValue(undefined);
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        detach: mockDetach,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setShowRemoveModal(true);
        result.current.setSelectedIdp(mockIdentityProviders[0]!);
      });

      await act(async () => {
        await result.current.handleRemoveConfirm(mockIdentityProviders[0]!);
      });

      expect(result.current.showRemoveModal).toBe(false);
      expect(result.current.selectedIdp).toBeNull();
    });

    it('should not remove if provider has no id', async () => {
      const providerWithoutId = { ...mockIdentityProviders[0], id: undefined } as IdentityProvider;
      const mockDetach = vi.fn();
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        detach: mockDetach,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleRemoveConfirm(providerWithoutId);
      });

      expect(mockDetach).not.toHaveBeenCalled();
    });
  });

  describe('modal state', () => {
    it('should initialize with no modals open', async () => {
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: [] }),
      });

      const { result } = renderUseSsoProviderTable();

      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.showRemoveModal).toBe(false);
      expect(result.current.selectedIdp).toBeNull();
    });

    it('handleDelete should set selectedIdp and open delete modal', async () => {
      const idp = mockIdentityProviders[0]!;
      setupMockMyOrgClient({ list: vi.fn().mockResolvedValue({ identity_providers: [] }) });

      const { result } = renderUseSsoProviderTable({ deleteAction: { onBefore: () => true } });

      act(() => {
        result.current.handleDelete(idp);
      });

      expect(result.current.selectedIdp).toEqual(idp);
      expect(result.current.showDeleteModal).toBe(true);
    });

    it('handleDelete should not open modal if deleteAction.onBefore returns false', async () => {
      const idp = mockIdentityProviders[0]!;
      setupMockMyOrgClient({ list: vi.fn().mockResolvedValue({ identity_providers: [] }) });

      const { result } = renderUseSsoProviderTable({ deleteAction: { onBefore: () => false } });

      act(() => {
        result.current.handleDelete(idp);
      });

      expect(result.current.showDeleteModal).toBe(false);
    });

    it('handleDeleteFromOrganization should set selectedIdp and open remove modal', async () => {
      const idp = mockIdentityProviders[0]!;
      setupMockMyOrgClient({ list: vi.fn().mockResolvedValue({ identity_providers: [] }) });

      const { result } = renderUseSsoProviderTable({
        deleteFromOrganizationAction: { onBefore: () => true },
      });

      act(() => {
        result.current.handleDeleteFromOrganization(idp);
      });

      expect(result.current.selectedIdp).toEqual(idp);
      expect(result.current.showRemoveModal).toBe(true);
    });
  });

  describe('handleCreate and handleEdit', () => {
    it('should call createAction.onAfter on handleCreate', () => {
      const onAfter = vi.fn();
      setupMockMyOrgClient({ list: vi.fn().mockResolvedValue({ identity_providers: [] }) });

      const { result } = renderUseSsoProviderTable({ createAction: { onAfter } });

      act(() => {
        result.current.handleCreate();
      });

      expect(onAfter).toHaveBeenCalled();
    });

    it('should call editAction.onAfter on handleEdit', () => {
      const onAfter = vi.fn();
      const idp = mockIdentityProviders[0]!;
      setupMockMyOrgClient({ list: vi.fn().mockResolvedValue({ identity_providers: [] }) });

      const { result } = renderUseSsoProviderTable({ editAction: { onAfter } });

      act(() => {
        result.current.handleEdit(idp);
      });

      expect(onAfter).toHaveBeenCalledWith(idp);
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
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        update: mockUpdate,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        result.current.handleToggleEnabled(mockIdentityProviders[0]!, false);
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
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        delete: mockDelete,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        result.current.handleDeleteConfirm(mockIdentityProviders[0]!);
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
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: mockIdentityProviders }),
        detach: mockDetach,
      });

      const { result } = renderUseSsoProviderTable();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        result.current.handleRemoveConfirm(mockIdentityProviders[0]!);
        expect(result.current.isRemoving).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isRemoving).toBe(false);
      });
    });
  });

  describe('custom messages', () => {
    it('should pass custom messages to translator', async () => {
      const customMessages = {};
      setupMockMyOrgClient({
        list: vi.fn().mockResolvedValue({ identity_providers: [] }),
      });

      renderUseSsoProviderTable({ customMessages });

      await waitFor(() => {
        expect(useTranslatorModule.useTranslator).toHaveBeenCalledWith(
          'idp_management.notifications',
          customMessages,
        );
      });
    });
  });
});
