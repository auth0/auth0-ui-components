import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationDelete } from '@/hooks/my-organization/use-organization-delete';
import { PermissionContext } from '@/providers/permission-provider';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import type { UseOrganizationDeleteOptions } from '@/types/my-organization/organization-management/organization-delete-types';

const mockOrganization = createMockOrganization();
const mockServiceDelete = vi.fn();

vi.mock('@/hooks/my-organization/shared/services/use-organization-delete-service', () => ({
  useOrganizationDeleteService: () => ({
    organization: mockOrganization,
    isFetchLoading: false,
    isDeleteLoading: false,
    deleteOrganization: mockServiceDelete,
  }),
}));

const renderWithGranted = (permissions: string[], options: UseOrganizationDeleteOptions = {}) =>
  renderHook(() => useOrganizationDelete(options), {
    wrapper: ({ children }: React.PropsWithChildren) =>
      createElement(
        PermissionContext.Provider,
        { value: { permissions, isLoading: false } },
        children,
      ),
  });

describe('useOrganizationDelete', () => {
  beforeEach(() => {
    mockServiceDelete.mockResolvedValue(true);
  });

  describe('when the delete scope is granted', () => {
    it('allows deletion and delegates to the service', async () => {
      const { result } = renderWithGranted(['delete:my_org:organizations']);

      expect(result.current.canDelete).toBe(true);
      expect(result.current.permissionDenied).toBe(false);

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.deleteOrganization();
      });

      expect(mockServiceDelete).toHaveBeenCalledTimes(1);
      expect(deleted).toBe(true);
    });
  });

  describe('when the delete scope is missing', () => {
    it('flags the permission as denied', () => {
      const { result } = renderWithGranted(['update:my_org:details']);

      expect(result.current.canDelete).toBe(false);
      expect(result.current.permissionDenied).toBe(true);
    });

    it('does not call the service when deleteOrganization is invoked directly', async () => {
      const { result } = renderWithGranted(['update:my_org:details']);

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.deleteOrganization();
      });

      expect(mockServiceDelete).not.toHaveBeenCalled();
      expect(deleted).toBe(false);
    });
  });

  describe('when readOnly is true', () => {
    it('blocks deletion without reporting a permission denial', async () => {
      const { result } = renderWithGranted(['delete:my_org:organizations'], { readOnly: true });

      expect(result.current.canDelete).toBe(false);
      expect(result.current.permissionDenied).toBe(false);

      await act(async () => {
        await result.current.deleteOrganization();
      });

      expect(mockServiceDelete).not.toHaveBeenCalled();
    });
  });

  describe('when deleteAction.disabled is true', () => {
    it('blocks deletion without reporting a permission denial', async () => {
      const { result } = renderWithGranted(['delete:my_org:organizations'], {
        deleteAction: { disabled: true },
      });

      expect(result.current.canDelete).toBe(false);
      expect(result.current.permissionDenied).toBe(false);

      await act(async () => {
        await result.current.deleteOrganization();
      });

      expect(mockServiceDelete).not.toHaveBeenCalled();
    });
  });
});
