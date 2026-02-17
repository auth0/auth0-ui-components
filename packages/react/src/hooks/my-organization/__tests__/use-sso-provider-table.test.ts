import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderTable } from '@/hooks/my-organization/use-sso-provider-table';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  mockCore,
  createMockIdentityProvider,
  setupAllCommonMocks,
  setupMockUseCoreClientNull,
} from '@/tests/utils';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

const { initMockCoreClient } = mockCore();

describe('useSsoProviderTable', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let mockHandleError: ReturnType<typeof vi.fn>;

  const mockProvider1 = createMockIdentityProvider({ id: 'idp-1', name: 'Provider 1' });
  const mockProvider2 = createMockIdentityProvider({ id: 'idp-2', name: 'Provider 2' });
  const mockIdentityProviders = [mockProvider1, mockProvider2];

  const renderUseSsoProviderTable = (...args: Parameters<typeof useSsoProviderTable>) => {
    const { wrapper } = createTestQueryClientWrapper();
    return renderHook(() => useSsoProviderTable(...args), { wrapper });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();

    // Mock API calls
    (apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      identity_providers: mockIdentityProviders,
    });
    (
      apiService.organization.identityProviders.update as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockProvider1);
    (
      apiService.organization.identityProviders.delete as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);
    (
      apiService.organization.identityProviders.detach as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);
    (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'org-1',
      name: 'Test Org',
      display_name: 'Test Organization',
    });

    const { mockHandleError: setupMockHandleError } = setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
    });

    mockHandleError = setupMockHandleError;
    vi.spyOn(useErrorHandlerModule, 'useErrorHandler').mockReturnValue(mockHandleError);
  });

  it('should fetch and set providers successfully', async () => {
    const { result } = renderUseSsoProviderTable();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.providers).toEqual(mockIdentityProviders);
  });

  it('should handle fetch providers error', async () => {
    const error = new Error('Network error');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list as ReturnType<
        typeof vi.fn
      >
    ).mockRejectedValue(error);

    renderUseSsoProviderTable();

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(error);
    });
  });

  it('should not fetch if coreClient is not available', async () => {
    setupMockUseCoreClientNull(useCoreClientModule);

    const { result } = renderUseSsoProviderTable();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.providers).toEqual([]);
  });

  it('should enable provider successfully', async () => {
    const { result } = renderUseSsoProviderTable();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.onEnableProvider(mockProvider1, true);
    });

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.update,
      ).toHaveBeenCalledWith(mockProvider1.id, expect.any(Object));
      expect(result.current.isUpdating).toBe(false);
    });
  });

  it('should delete provider successfully', async () => {
    const { result } = renderUseSsoProviderTable();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onDeleteConfirm(mockProvider1);
    });

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.delete,
      ).toHaveBeenCalledWith(mockProvider1.id);
      expect(result.current.isDeleting).toBe(false);
    });
  });

  it('should remove provider from organization successfully', async () => {
    const { result } = renderUseSsoProviderTable();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onRemoveConfirm(mockProvider1);
    });

    await waitFor(() => {
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.detach,
      ).toHaveBeenCalledWith(mockProvider1.id);
      expect(result.current.isRemoving).toBe(false);
    });
  });

  it('should handle enable provider error', async () => {
    const error = new Error('Enable failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .update as ReturnType<typeof vi.fn>
    ).mockRejectedValue(error);

    const { result } = renderUseSsoProviderTable();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      try {
        await result.current.onEnableProvider(mockProvider1, true);
      } catch (e) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(error);
    });
  });

  it('should handle delete provider error', async () => {
    const error = new Error('Delete failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .delete as ReturnType<typeof vi.fn>
    ).mockRejectedValue(error);

    const { result } = renderUseSsoProviderTable();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onDeleteConfirm(mockProvider1);
    });

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(error);
    });
  });

  it('should handle remove provider error', async () => {
    const error = new Error('Remove failed');
    (
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .detach as ReturnType<typeof vi.fn>
    ).mockRejectedValue(error);

    const { result } = renderUseSsoProviderTable();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onRemoveConfirm(mockProvider1);
    });

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(error);
    });
  });

  it('should set isUpdating and isUpdatingId when enabling provider', async () => {
    const mockUpdate = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockProvider1), 50)),
      );

    (mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
      .update as ReturnType<typeof vi.fn>) = mockUpdate;

    const { result } = renderUseSsoProviderTable();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      const promise = result.current.onEnableProvider(mockProvider1, true);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
        expect(result.current.isUpdatingId).toBe(mockProvider1.id);
      });

      await promise;
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBe(null);
    });
  });

  it('should set isDeleting when deleting provider', async () => {
    const mockDelete = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 50)));

    (mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
      .delete as ReturnType<typeof vi.fn>) = mockDelete;

    const { result } = renderUseSsoProviderTable();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onDeleteConfirm(mockProvider1);
    });

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });
  });

  it('should set isRemoving when removing provider', async () => {
    const mockDetach = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 50)));

    (mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
      .detach as ReturnType<typeof vi.fn>) = mockDetach;

    const { result } = renderUseSsoProviderTable();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onRemoveConfirm(mockProvider1);
    });

    await waitFor(() => {
      expect(result.current.isRemoving).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isRemoving).toBe(false);
    });
  });

  it('should call enableAction callbacks', async () => {
    const onBefore = vi.fn().mockReturnValue(true);
    const onAfter = vi.fn();

    const { result } = renderUseSsoProviderTable(undefined, undefined, { onBefore, onAfter });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.onEnableProvider(mockProvider1, true);
    });

    await waitFor(() => {
      expect(onBefore).toHaveBeenCalledWith(mockProvider1);
      expect(onAfter).toHaveBeenCalledWith(mockProvider1);
    });
  });

  it('should call deleteAction onAfter callback', async () => {
    const onAfter = vi.fn();

    const { result } = renderUseSsoProviderTable({ onAfter });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onDeleteConfirm(mockProvider1);
    });

    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith(mockProvider1);
    });
  });

  it('should call removeFromOrganization onAfter callback', async () => {
    const onAfter = vi.fn();

    const { result } = renderUseSsoProviderTable(undefined, { onAfter });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onRemoveConfirm(mockProvider1);
    });

    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith(mockProvider1);
    });
  });

  it('should expose error and retry', async () => {
    const error = new Error('Query error');
    const mockList = mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
      .list as ReturnType<typeof vi.fn>;
    mockList
      .mockRejectedValueOnce(error)
      .mockResolvedValue({ identity_providers: mockIdentityProviders });

    const { result } = renderUseSsoProviderTable();

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.providers).toEqual(mockIdentityProviders);
    });
  });
});
