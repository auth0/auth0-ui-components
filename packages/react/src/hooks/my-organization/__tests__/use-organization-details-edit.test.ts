import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useOrganizationDetailsEdit } from '@/hooks/my-organization/use-organization-details-edit';
import { PermissionContext } from '@/providers/permission-provider';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import { ALL_MY_ORG_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import type { UseOrganizationDetailsEditOptions } from '@/types/my-organization/organization-management/organization-details-edit-types';

const mockOrganization = createMockOrganization();
const mockUpdateOrgDetails = vi.fn().mockResolvedValue(true);
const mockFetchOrgDetails = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

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

  const renderWithGranted = (permissions: string[], options: UseOrganizationDetailsEditOptions) =>
    renderHook(() => useOrganizationDetailsEdit(options), {
      wrapper: ({ children }: React.PropsWithChildren) =>
        createElement(
          PermissionContext.Provider,
          { value: { permissions, isLoading: false } },
          children,
        ),
    });

  const render = (options: UseOrganizationDetailsEditOptions = {}) =>
    renderWithGranted(ALL_MY_ORG_PERMISSIONS, options);

  describe('form actions', () => {
    it('should return formActions with correct structure', () => {
      const { result } = render();

      expect(result.current.formActions).toBeDefined();
      expect(result.current.formActions.nextAction).toBeDefined();
      expect(result.current.formActions.previousAction).toBeDefined();
    });

    it('should enable actions when data is loaded', () => {
      const { result } = render();

      expect(result.current.formActions.nextAction?.disabled).toBe(false);
      expect(result.current.formActions.previousAction?.disabled).toBe(false);
    });

    it('should disable both actions in readOnly mode', () => {
      const { result } = render({ readOnly: true });

      expect(result.current.formActions.nextAction?.disabled).toBe(true);
      expect(result.current.formActions.previousAction?.disabled).toBe(true);
    });

    it('should call updateOrgDetails when nextAction is clicked', async () => {
      const { result } = render();

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

      const { result } = render(options);

      expect(result.current.formActions[formAction]?.disabled).toBe(true);
    });
  });

  describe('canceling changes', () => {
    it('should call cancelAction.onAfter callback when cancel is triggered', () => {
      const onAfter = vi.fn();
      const { result } = render({ cancelAction: { onAfter } });

      result.current.formActions.previousAction?.onClick?.({} as Event);

      expect(onAfter).toHaveBeenCalledWith(mockOrganization);
    });
  });

  describe('return values', () => {
    it('should pass through service return values', () => {
      const { result } = render();

      expect(result.current.organization).toEqual(mockOrganization);
      expect(result.current.isFetchLoading).toBe(false);
      expect(result.current.isSaveLoading).toBe(false);
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.fetchOrgDetails).toBeDefined();
      expect(result.current.updateOrgDetails).toBeDefined();
    });
  });

  describe('granted permissions', () => {
    const renderWithPermissions = (permissions: string[], readOnly = false) =>
      renderWithGranted(permissions, { readOnly });

    describe('when update:my_org:details is granted', () => {
      it('should allow editing and enable both actions', () => {
        const { result } = renderWithPermissions(['update:my_org:details']);

        expect(result.current.canEdit).toBe(true);
        expect(result.current.formActions.nextAction?.disabled).toBe(false);
        expect(result.current.formActions.previousAction?.disabled).toBe(false);
      });
    });

    describe('when only read permissions are granted', () => {
      it('should block editing and disable both actions', () => {
        const { result } = renderWithPermissions(['read:my_org:details']);

        expect(result.current.canEdit).toBe(false);
        expect(result.current.formActions.nextAction?.disabled).toBe(true);
        expect(result.current.formActions.previousAction?.disabled).toBe(true);
      });
    });

    describe('when no permissions are granted', () => {
      it('should block editing', () => {
        const { result } = renderWithPermissions([]);

        expect(result.current.canEdit).toBe(false);
      });
    });

    describe('when the permission is granted but readOnly is set', () => {
      it('should still block editing', () => {
        const { result } = renderWithPermissions(['update:my_org:details'], true);

        expect(result.current.canEdit).toBe(false);
      });
    });
  });

  describe('readOnly versus a missing scope', () => {
    it('should hide both actions when readOnly is set', () => {
      const { result } = render({ readOnly: true });

      expect(result.current.formActions.showNext).toBe(false);
      expect(result.current.formActions.showPrevious).toBe(false);
    });

    it('should keep both actions visible when only the scope is missing', () => {
      const { result } = renderWithGranted(['read:my_org:details'], {});

      expect(result.current.formActions.showNext).toBe(true);
      expect(result.current.formActions.showPrevious).toBe(true);
      expect(result.current.formActions.nextAction?.disabled).toBe(true);
      expect(result.current.formActions.previousAction?.disabled).toBe(true);
    });

    it('should explain a missing scope with the forbidden tooltip', () => {
      const { result } = renderWithGranted(['read:my_org:details'], {});

      expect(result.current.formActions.nextActionTooltip).toBe('error.forbidden');
    });

    it('should not claim a permission problem when readOnly is the reason', () => {
      const { result } = render({ readOnly: true });

      expect(result.current.formActions.nextActionTooltip).toBeUndefined();
    });

    it('should not show a tooltip when the scope is granted', () => {
      const { result } = renderWithGranted(['update:my_org:details'], {});

      expect(result.current.formActions.nextActionTooltip).toBeUndefined();
    });

    it('should show and enable both actions when the scope is granted', () => {
      const { result } = renderWithGranted(['update:my_org:details'], {});

      expect(result.current.formActions.showNext).toBe(true);
      expect(result.current.formActions.nextAction?.disabled).toBe(false);
    });
  });
});
