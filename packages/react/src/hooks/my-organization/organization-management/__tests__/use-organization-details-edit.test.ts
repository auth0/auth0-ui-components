import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  createMockOrganization,
  createQueryClientWrapper,
  mockCore,
  mockToast,
} from '../../../../internals';
import type { UseOrganizationDetailsEditOptions } from '../../../../types/my-organization/organization-management/organization-details-edit-types';
import * as useCoreClientModule from '../../../use-core-client';
import { useOrganizationDetailsEdit } from '../use-organization-details-edit';

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

async function renderUseOrganizationDetailsEdit(options: UseOrganizationDetailsEditOptions = {}) {
  const mockCoreClient = initMockCoreClient();
  const { apiService, mockOrganization } = createMockApiService(mockCoreClient);

  vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
    coreClient: mockCoreClient,
  });

  const { wrapper, queryClient } = createQueryClientWrapper();
  const hookResult = renderHook(() => useOrganizationDetailsEdit(options), { wrapper });

  await waitFor(() => {
    expect(hookResult.result.current.isFetchLoading).toBe(false);
  });

  return { ...hookResult, queryClient, mockCoreClient, apiService, mockOrganization };
}

describe('useOrganizationDetailsEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading organization data', () => {
    it('should fetch organization details on mount', async () => {
      const { apiService } = await renderUseOrganizationDetailsEdit();

      expect(apiService.organizationDetails.get).toHaveBeenCalledTimes(1);
    });

    it('should return organization details after successful load', async () => {
      const { result, mockOrganization } = await renderUseOrganizationDetailsEdit();

      expect(result.current.organization).toEqual(mockOrganization);
    });

    it('should allow manual refetch of organization data', async () => {
      const { result, apiService } = await renderUseOrganizationDetailsEdit();

      vi.clearAllMocks();

      await act(async () => {
        await result.current.fetchOrgDetails();
      });

      expect(apiService.organizationDetails.get).toHaveBeenCalledTimes(1);
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
      const { result } = renderHook(() => useOrganizationDetailsEdit({}), { wrapper });

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
    it('should update organization successfully', async () => {
      const { result, apiService, mockOrganization } = await renderUseOrganizationDetailsEdit();

      const updatedData = {
        branding: mockOrganization.branding,
        display_name: 'Updated Name',
      };

      await act(async () => {
        await result.current.formActions.nextAction?.onClick?.(updatedData);
      });

      expect(apiService.organizationDetails.update).toHaveBeenCalledWith(updatedData);
    });

    it('should show success toast on successful save', async () => {
      const { result, mockOrganization } = await renderUseOrganizationDetailsEdit();

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
      const { result, apiService, mockOrganization } = await renderUseOrganizationDetailsEdit();

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
        const { result, apiService, mockOrganization } = await renderUseOrganizationDetailsEdit({
          saveAction: { onBefore },
        });

        await act(async () => {
          await result.current.formActions.nextAction?.onClick?.(mockOrganization);
        });

        expect(onBefore).toHaveBeenCalledWith(mockOrganization);
        expect(apiService.organizationDetails.update).toHaveBeenCalled();
      });

      it('should cancel save when returning false', async () => {
        const onBefore = vi.fn(() => false);
        const { result, apiService, mockOrganization } = await renderUseOrganizationDetailsEdit({
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
      const { result, mockOrganization } = await renderUseOrganizationDetailsEdit({
        saveAction: { onBefore: () => true, onAfter },
      });

      await act(async () => {
        await result.current.formActions.nextAction?.onClick?.(mockOrganization);
      });

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockOrganization);
      });
    });
  });

  describe('canceling changes', () => {
    it('should call cancelAction.onAfter callback when cancel is triggered', async () => {
      const onAfter = vi.fn();
      const { result, mockOrganization } = await renderUseOrganizationDetailsEdit({
        cancelAction: { onAfter },
      });

      result.current.formActions.previousAction?.onClick?.({} as Event);

      expect(onAfter).toHaveBeenCalledWith(mockOrganization);
    });

    it('should not call update API when canceling', async () => {
      const onAfter = vi.fn();
      const { result, apiService } = await renderUseOrganizationDetailsEdit({
        cancelAction: { onAfter },
      });

      vi.clearAllMocks();
      result.current.formActions.previousAction?.onClick?.({} as Event);

      expect(apiService.organizationDetails.update).not.toHaveBeenCalled();
    });

    it('should handle cancel with null organization response', async () => {
      const onAfter = vi.fn();
      const mockCoreClient = initMockCoreClient();
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: mockCoreClient,
      });

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(
        () => useOrganizationDetailsEdit({ cancelAction: { onAfter } }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      result.current.formActions.previousAction?.onClick?.({} as Event);

      expect(onAfter).toHaveBeenCalledWith(result.current.organization);
    });
  });

  describe('form actions disabled state', () => {
    it('should enable actions after data loads', async () => {
      const { result } = await renderUseOrganizationDetailsEdit();

      expect(result.current.formActions.nextAction?.disabled).toBe(false);
      expect(result.current.formActions.previousAction?.disabled).toBe(false);
    });

    it('should disable both actions in readOnly mode', async () => {
      const { result } = await renderUseOrganizationDetailsEdit({ readOnly: true });

      expect(result.current.formActions.nextAction?.disabled).toBe(true);
      expect(result.current.formActions.previousAction?.disabled).toBe(true);
    });

    it.each([
      { action: 'saveAction', formAction: 'nextAction' as const },
      { action: 'cancelAction', formAction: 'previousAction' as const },
    ])('should respect custom disabled prop for $action', async ({ action, formAction }) => {
      const options = {
        [action]: { disabled: true, onAfter: vi.fn() },
      };

      const { result } = await renderUseOrganizationDetailsEdit(options);

      expect(result.current.formActions[formAction]?.disabled).toBe(true);
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
      const { result } = renderHook(() => useOrganizationDetailsEdit({}), { wrapper });

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
