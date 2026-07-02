import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useOrganizationDetailsEdit } from '@/hooks/my-organization/use-organization-details-edit';
import { createMockOrganization } from '@/tests/utils';

const mockOrganization = createMockOrganization();
const mockUpdateOrgDetails = vi.fn().mockResolvedValue(true);
const mockFetchOrgDetails = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/my-organization/shared/services/use-organization-details-edit-service', () => ({
  useOrganizationDetailsEditService: () => ({
    organization: mockOrganization,
    isFetchLoading: false,
    isSaveLoading: false,
    isInitializing: false,
    hasData: true,
    fetchOrgDetails: mockFetchOrgDetails,
    updateOrgDetails: mockUpdateOrgDetails,
  }),
}));

describe('useOrganizationDetailsEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('form actions', () => {
    it('should return formActions with correct structure', () => {
      const { result } = renderHook(() => useOrganizationDetailsEdit({}));

      expect(result.current.formActions).toBeDefined();
      expect(result.current.formActions.nextAction).toBeDefined();
      expect(result.current.formActions.previousAction).toBeDefined();
    });

    it('should enable actions when data is loaded', () => {
      const { result } = renderHook(() => useOrganizationDetailsEdit({}));

      expect(result.current.formActions.nextAction?.disabled).toBe(false);
      expect(result.current.formActions.previousAction?.disabled).toBe(false);
    });

    it('should disable both actions in readOnly mode', () => {
      const { result } = renderHook(() => useOrganizationDetailsEdit({ readOnly: true }));

      expect(result.current.formActions.nextAction?.disabled).toBe(true);
      expect(result.current.formActions.previousAction?.disabled).toBe(true);
    });

    it('should call updateOrgDetails when nextAction is clicked', async () => {
      const { result } = renderHook(() => useOrganizationDetailsEdit({}));

      await act(async () => {
        await result.current.formActions.nextAction?.onClick?.(mockOrganization);
      });

      expect(mockUpdateOrgDetails).toHaveBeenCalledWith(mockOrganization);
    });

    it.each([
      { action: 'saveAction', formAction: 'nextAction' as const },
      { action: 'cancelAction', formAction: 'previousAction' as const },
    ])('should respect custom disabled prop for $action', ({ action, formAction }) => {
      const options = {
        [action]: { disabled: true, onAfter: vi.fn() },
      };

      const { result } = renderHook(() => useOrganizationDetailsEdit(options));

      expect(result.current.formActions[formAction]?.disabled).toBe(true);
    });
  });

  describe('canceling changes', () => {
    it('should call cancelAction.onAfter callback when cancel is triggered', () => {
      const onAfter = vi.fn();
      const { result } = renderHook(() =>
        useOrganizationDetailsEdit({ cancelAction: { onAfter } }),
      );

      result.current.formActions.previousAction?.onClick?.({} as Event);

      expect(onAfter).toHaveBeenCalledWith(mockOrganization);
    });
  });

  describe('return values', () => {
    it('should pass through service return values', () => {
      const { result } = renderHook(() => useOrganizationDetailsEdit({}));

      expect(result.current.organization).toEqual(mockOrganization);
      expect(result.current.isFetchLoading).toBe(false);
      expect(result.current.isSaveLoading).toBe(false);
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.fetchOrgDetails).toBeDefined();
      expect(result.current.updateOrgDetails).toBeDefined();
    });
  });
});
