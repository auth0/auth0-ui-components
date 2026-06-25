import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useOrganizationDetailsEditService } from '@/hooks/my-organization/shared/services/use-organization-details-edit-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockOrganization,
  createQueryClientWrapper,
  mockCore,
  mockToast,
} from '@/tests/utils';

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

function createMockApiService(coreClient: ReturnType<typeof initMockCoreClient>) {
  const mockOrganization = createMockOrganization();
  const apiService = coreClient.getMyOrganizationApiClient();

  (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
    mockOrganization,
  );
  (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockResolvedValue(
    mockOrganization,
  );

  return { apiService, mockOrganization };
}

async function renderUseOrganizationDetailsEditService(
  options: Parameters<typeof useOrganizationDetailsEditService>[0] = {},
) {
  const mockCoreClient = initMockCoreClient();
  const { apiService, mockOrganization } = createMockApiService(mockCoreClient);

  vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
    coreClient: mockCoreClient,
  });

  const { wrapper, queryClient } = createQueryClientWrapper();
  const hookResult = renderHook(() => useOrganizationDetailsEditService(options), { wrapper });

  await waitFor(() => {
    expect(hookResult.result.current.isFetchLoading).toBe(false);
  });

  return { ...hookResult, queryClient, mockCoreClient, apiService, mockOrganization };
}

describe('useOrganizationDetailsEditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading organization data', () => {
    it('should fetch organization details on mount', async () => {
      const { apiService } = await renderUseOrganizationDetailsEditService();

      expect(apiService.organizationDetails.get).toHaveBeenCalledTimes(1);
    });

    it('should return organization details after successful load', async () => {
      const { result, mockOrganization } = await renderUseOrganizationDetailsEditService();

      expect(result.current.organization).toEqual(mockOrganization);
    });

    it('should read cached organization data without refetching', async () => {
      const { result, apiService } = await renderUseOrganizationDetailsEditService();

      vi.clearAllMocks();

      await act(async () => {
        await result.current.fetchOrgDetails();
      });

      expect(apiService.organizationDetails.get).not.toHaveBeenCalled();
    });

    it('should show error toast when loading fails', async () => {
      const mockCoreClient = initMockCoreClient();
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error'),
      );

      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: mockCoreClient,
      });

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useOrganizationDetailsEditService({}), { wrapper });

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: expect.any(String),
      });
    });
  });

  describe('saving changes', () => {
    it('should show success toast on successful save', async () => {
      const { result, mockOrganization } = await renderUseOrganizationDetailsEditService();

      const success = await act(async () => {
        return result.current.updateOrgDetails(mockOrganization);
      });

      expect(success).toBe(true);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
    });

    it('should handle save errors gracefully', async () => {
      const { result, apiService, mockOrganization } =
        await renderUseOrganizationDetailsEditService();

      (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Save failed'),
      );

      const success = await act(async () => {
        return result.current.updateOrgDetails(mockOrganization);
      });

      expect(success).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: expect.any(String),
      });
    });

    describe('onBefore callback', () => {
      it('should allow validation before save', async () => {
        const onBefore = vi.fn(() => true);
        const { result, apiService, mockOrganization } =
          await renderUseOrganizationDetailsEditService({
            saveAction: { onBefore },
          });

        await act(async () => {
          await result.current.updateOrgDetails(mockOrganization);
        });

        expect(onBefore).toHaveBeenCalledWith(mockOrganization);
        expect(apiService.organizationDetails.update).toHaveBeenCalled();
      });

      it('should cancel save when returning false', async () => {
        const onBefore = vi.fn(() => false);
        const { result, apiService, mockOrganization } =
          await renderUseOrganizationDetailsEditService({
            saveAction: { onBefore },
          });

        const success = await act(async () => {
          return result.current.updateOrgDetails(mockOrganization);
        });

        expect(success).toBe(false);
        expect(apiService.organizationDetails.update).not.toHaveBeenCalled();
      });
    });

    it('should call onAfter callback after successful save', async () => {
      const onAfter = vi.fn();
      const { result, mockOrganization } = await renderUseOrganizationDetailsEditService({
        saveAction: { onBefore: () => true, onAfter },
      });

      await act(async () => {
        await result.current.updateOrgDetails(mockOrganization);
      });

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockOrganization);
      });
    });

    it('should show loading state during save operation', async () => {
      const mockCoreClient = initMockCoreClient();
      const mockOrganization = createMockOrganization();
      const apiService = mockCoreClient.getMyOrganizationApiClient();

      let resolveUpdate: (value: typeof mockOrganization) => void;
      const updatePromise = new Promise<typeof mockOrganization>((resolve) => {
        resolveUpdate = resolve;
      });

      (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockOrganization,
      );
      (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockReturnValue(
        updatePromise,
      );

      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: mockCoreClient,
      });

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useOrganizationDetailsEditService({}), { wrapper });

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      let savePromise: Promise<boolean>;
      act(() => {
        savePromise = result.current.updateOrgDetails(mockOrganization);
      });

      await waitFor(() => {
        expect(result.current.isSaveLoading).toBe(true);
      });

      await act(async () => {
        resolveUpdate!(mockOrganization);
        await savePromise!;
      });

      await waitFor(() => {
        expect(result.current.isSaveLoading).toBe(false);
      });
    });
  });
});
