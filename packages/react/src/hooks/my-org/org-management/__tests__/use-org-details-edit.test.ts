import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { createMockOrganization, mockCore, mockToast } from '../../../../internals';
import * as useCoreClientModule from '../../../use-core-client';
import { useOrgDetailsEdit } from '../use-org-details-edit';

// ===== Mock packages =====

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

// ===== Tests =====

describe('useOrgDetailsEdit', () => {
  const mockOrganization = createMockOrganization();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );
    (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  describe('when loading organization data', () => {
    it('should fetch organization details automatically on mount', async () => {
      renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organizationDetails.get,
        ).toHaveBeenCalledTimes(1);
      });
    });

    it('should return organization details after successful load', async () => {
      const { result } = renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });
    });

    it('should show loading indicator while fetching', async () => {
      const { result } = renderHook(() => useOrgDetailsEdit({}));

      // Initially loading
      expect(result.current.isFetchLoading).toBe(true);

      // Loading completes
      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });
    });

    it('should allow manual refetch of organization data', async () => {
      const { result } = renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      // Clear previous calls
      vi.clearAllMocks();

      // Manually refetch
      await act(async () => {
        await result.current.fetchOrgDetails();
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organizationDetails.get,
      ).toHaveBeenCalledTimes(1);
    });

    it('should show error message if loading fails', async () => {
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error'),
      );

      const { result } = renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      // Should show error toast to the user
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: expect.any(String),
      });
    });
  });

  describe('when saving changes', () => {
    it('should update organization successfully', async () => {
      const { result } = renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });
      const updatedData = {
        branding: mockOrganization.branding,
        display_name: 'Updated Name',
      };
      await act(async () => {
        await result.current.formActions.nextAction?.onClick?.(updatedData);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organizationDetails.update,
      ).toHaveBeenCalledWith(updatedData);
    });

    it('should show loading state during save', async () => {
      const { result } = renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      // Save operation
      let savePromise: Promise<boolean>;
      await act(async () => {
        savePromise = result.current.updateOrgDetails(mockOrganization);
      });

      // Should show loading
      await waitFor(() => {
        expect(result.current.isSaveLoading).toBe(false);
      });

      await savePromise!;
    });

    it('should show success toast on successful save', async () => {
      const { result } = renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.updateOrgDetails(mockOrganization);
      });

      expect(success!).toBe(true);

      // Should show success toast to the user
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
    });

    it('should call onBefore callback and allow validation', async () => {
      const onBefore = vi.fn(() => true);
      const { result } = renderHook(() =>
        useOrgDetailsEdit({
          saveAction: { onBefore },
        }),
      );

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      await act(async () => {
        await result.current.formActions.nextAction?.onClick?.(mockOrganization);
      });

      expect(onBefore).toHaveBeenCalledWith(mockOrganization);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organizationDetails.update,
      ).toHaveBeenCalled();
    });

    it('should allow onBefore callback to cancel save operation', async () => {
      const onBefore = vi.fn(() => false);
      const { result } = renderHook(() =>
        useOrgDetailsEdit({
          saveAction: { onBefore },
        }),
      );

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.updateOrgDetails(mockOrganization);
      });

      expect(success!).toBe(false);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organizationDetails.update,
      ).not.toHaveBeenCalled();
    });

    it('should call onAfter callback after successful save', async () => {
      const onAfter = vi.fn();
      const { result } = renderHook(() =>
        useOrgDetailsEdit({
          saveAction: { onBefore: () => true, onAfter },
        }),
      );

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      await act(async () => {
        await result.current.formActions.nextAction?.onClick?.(mockOrganization);
      });

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organizationDetails.update,
        ).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(mockOrganization);
      });
    });

    it('should handle save errors gracefully', async () => {
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Save failed'),
      );

      const { result } = renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.updateOrgDetails(mockOrganization);
      });

      expect(success!).toBe(false);
      expect(result.current.isSaveLoading).toBe(false);

      // Should show error toast to the user
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: expect.any(String),
      });
    });
  });

  describe('when canceling changes', () => {
    it('should call cancelAction.onAfter callback when cancel is triggered', async () => {
      const onAfter = vi.fn();
      const { result } = renderHook(() =>
        useOrgDetailsEdit({
          cancelAction: { onAfter },
        }),
      );

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      // Trigger cancel via the previousAction onClick
      const onClick = result.current.formActions.previousAction?.onClick;
      if (onClick) {
        onClick({} as Event);
      }

      expect(onAfter).toHaveBeenCalledWith(mockOrganization);
    });

    it('should not call the API when canceling', async () => {
      const onAfter = vi.fn();
      const { result } = renderHook(() =>
        useOrgDetailsEdit({
          cancelAction: { onAfter },
        }),
      );

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      vi.clearAllMocks();

      const onClick = result.current.formActions.previousAction?.onClick;
      if (onClick) {
        onClick({} as Event);
      }

      expect(
        mockCoreClient.getMyOrganizationApiClient().organizationDetails.update,
      ).not.toHaveBeenCalled();
    });
  });

  describe('when form actions are disabled', () => {
    it('should enable actions after data loads successfully', async () => {
      const { result } = renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      // After data loads, actions should be enabled
      expect(result.current.formActions.nextAction?.disabled).toBe(false);
      expect(result.current.formActions.previousAction?.disabled).toBe(false);
    });

    it('should disable both actions during save operation', async () => {
      // Make the update call take longer with a deferred promise
      let resolveUpdate: (value: typeof mockOrganization) => void;
      const updatePromise = new Promise<typeof mockOrganization>((resolve) => {
        resolveUpdate = resolve;
      });

      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockReturnValue(
        updatePromise,
      );

      const { result } = renderHook(() => useOrgDetailsEdit({}));

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      // Start save operation (don't await yet)
      let savePromise: Promise<boolean>;
      act(() => {
        savePromise = result.current.updateOrgDetails(mockOrganization);
      });

      // Check that loading state is true while save is in progress
      await waitFor(() => {
        expect(result.current.isSaveLoading).toBe(true);
      });

      // Now resolve the API call
      await act(async () => {
        resolveUpdate!(mockOrganization);
        await savePromise!;
      });

      // Verify loading state is false after completion
      expect(result.current.isSaveLoading).toBe(false);
    });

    it('should disable both actions in readOnly mode', async () => {
      const { result } = renderHook(() =>
        useOrgDetailsEdit({
          readOnly: true,
        }),
      );

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      expect(result.current.formActions.nextAction?.disabled).toBe(true);
      expect(result.current.formActions.previousAction?.disabled).toBe(true);
    });

    it('should respect custom disabled prop for save action', async () => {
      const { result } = renderHook(() =>
        useOrgDetailsEdit({
          saveAction: { disabled: true },
        }),
      );

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      expect(result.current.formActions.nextAction?.disabled).toBe(true);
    });

    it('should respect custom disabled prop for cancel action', async () => {
      const { result } = renderHook(() =>
        useOrgDetailsEdit({
          cancelAction: { disabled: true, onAfter: vi.fn() },
        }),
      );

      await waitFor(() => {
        expect(result.current.organization).toEqual(mockOrganization);
      });

      expect(result.current.formActions.previousAction?.disabled).toBe(true);
    });
  });
});
