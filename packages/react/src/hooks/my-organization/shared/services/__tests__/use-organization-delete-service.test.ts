import { configQueryKeys, organizationDetailsQueryKeys } from '@auth0/universal-components-core';
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationDeleteService } from '@/hooks/my-organization/shared/services/use-organization-delete-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import { createQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

const createApiError = (status: number, type?: string) =>
  Object.assign(new Error('Request failed'), {
    statusCode: status,
    body: type ? { type, title: 'Forbidden', status, detail: 'Forbidden' } : undefined,
  });

async function renderUseOrganizationDeleteService(
  options: Parameters<typeof useOrganizationDeleteService>[0] = {},
  customQueryClient?: QueryClient,
) {
  const mockCoreClient = initMockCoreClient();
  const apiService = mockCoreClient.getMyOrganizationApiClient();
  const mockOrganization = createMockOrganization();

  (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
    mockOrganization,
  );
  (apiService.organizationDetails.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

  vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
    coreClient: mockCoreClient,
  });

  const { wrapper, queryClient } = createQueryClientWrapper(customQueryClient);
  const hookResult = renderHook(() => useOrganizationDeleteService(options), { wrapper });

  await waitFor(() => {
    expect(hookResult.result.current.organization.name).toBe(mockOrganization.name);
  });

  return { ...hookResult, queryClient, apiService, mockOrganization };
}

describe('useOrganizationDeleteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when the organization loads', () => {
    it('exposes the organization details', async () => {
      const { result, mockOrganization } = await renderUseOrganizationDeleteService();

      expect(result.current.organization.display_name).toBe(mockOrganization.display_name);
    });
  });

  describe('when the app retries mutations', () => {
    it('still sends a failed delete only once', async () => {
      const retryingClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: 3, retryDelay: 0 } },
      });
      const { result, apiService } = await renderUseOrganizationDeleteService({}, retryingClient);
      (apiService.organizationDetails.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
        createApiError(500),
      );

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.deleteOrganization();
      });

      expect(deleted).toBe(false);
      expect(apiService.organizationDetails.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('when deletion succeeds', () => {
    it('calls the delete endpoint and resolves to true', async () => {
      const { result, apiService } = await renderUseOrganizationDeleteService();

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.deleteOrganization();
      });

      expect(apiService.organizationDetails.delete).toHaveBeenCalledTimes(1);
      expect(deleted).toBe(true);
    });

    it('shows the success toast', async () => {
      const { result } = await renderUseOrganizationDeleteService();

      await act(async () => {
        await result.current.deleteOrganization();
      });

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'notifications.success',
      });
    });

    it('marks cached organization-scoped queries stale without requesting them again', async () => {
      // Keep unobserved data around, so the config entry is still there to be checked.
      const { result, queryClient, apiService } = await renderUseOrganizationDeleteService(
        {},
        new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } }),
      );
      queryClient.setQueryData(configQueryKeys.details(), { allowed_strategies: [] });
      const getOrganization = apiService.organizationDetails.get as ReturnType<typeof vi.fn>;
      const callsBeforeDelete = getOrganization.mock.calls.length;

      await act(async () => {
        await result.current.deleteOrganization();
      });
      // Give a refetch from the still-mounted hook time to start, if there were one.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(queryClient.getQueryState(organizationDetailsQueryKeys.details())?.isInvalidated).toBe(
        true,
      );
      expect(queryClient.getQueryState(configQueryKeys.details())?.isInvalidated).toBe(true);
      expect(getOrganization).toHaveBeenCalledTimes(callsBeforeDelete);
    });

    it('calls deleteAction.onAfter with the deleted organization', async () => {
      const onAfter = vi.fn();
      const { result, mockOrganization } = await renderUseOrganizationDeleteService({
        deleteAction: { onAfter },
      });

      await act(async () => {
        await result.current.deleteOrganization();
      });

      expect(onAfter).toHaveBeenCalledWith(
        expect.objectContaining({ name: mockOrganization.name }),
      );
    });
  });

  describe('when deleteAction.onBefore returns false', () => {
    it('skips the delete request and resolves to false', async () => {
      const { result, apiService } = await renderUseOrganizationDeleteService({
        deleteAction: { onBefore: () => false },
      });

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.deleteOrganization();
      });

      expect(apiService.organizationDetails.delete).not.toHaveBeenCalled();
      expect(deleted).toBe(false);
    });
  });

  describe('when deletion fails', () => {
    it('shows the not-empty message for a 403 that is not an insufficient-scope error', async () => {
      const { result, apiService } = await renderUseOrganizationDeleteService();
      (apiService.organizationDetails.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
        createApiError(403),
      );

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.deleteOrganization();
      });

      expect(deleted).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'notifications.not_empty_error',
      });
    });

    it('uses the shared error handler for an insufficient-scope 403', async () => {
      const { result, apiService } = await renderUseOrganizationDeleteService();
      (apiService.organizationDetails.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
        createApiError(403, 'https://auth0.com/api-errors#A0E-403-0002'),
      );

      await act(async () => {
        await result.current.deleteOrganization();
      });

      expect(mockedShowToast).toHaveBeenCalledTimes(1);
      expect(mockedShowToast).not.toHaveBeenCalledWith(
        expect.objectContaining({ message: 'notifications.not_empty_error' }),
      );
    });

    it('keeps cached data and skips onAfter', async () => {
      const onAfter = vi.fn();
      const { result, apiService, queryClient } = await renderUseOrganizationDeleteService({
        deleteAction: { onAfter },
      });
      (apiService.organizationDetails.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error'),
      );

      await act(async () => {
        await result.current.deleteOrganization();
      });

      expect(onAfter).not.toHaveBeenCalled();
      expect(queryClient.getQueryData(organizationDetailsQueryKeys.details())).toBeDefined();
    });
  });
});
