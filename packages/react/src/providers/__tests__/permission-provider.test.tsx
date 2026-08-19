import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePermissions } from '@/hooks/my-organization/use-permissions';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { PermissionProvider } from '@/providers/permission-provider';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';

vi.mock('@/hooks/shared/use-core-client', () => ({
  useCoreClient: vi.fn(),
}));

const mockUseCoreClient = vi.mocked(useCoreClient);

const renderPermissions = (isAuthenticated = true) => {
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <PermissionProvider isAuthenticated={isAuthenticated}>{children}</PermissionProvider>
  );
  return renderHook(() => usePermissions(), { wrapper });
};

describe('PermissionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when permissions are fetched successfully', () => {
    it('exposes them to descendants', async () => {
      const mockCoreClient = createMockCoreClient();
      const mockGetPermissions = vi
        .fn()
        .mockResolvedValue(['read:my_org:members', 'delete:my_org:memberships']);
      mockCoreClient.getPermissionApiClient = vi.fn().mockReturnValue({
        getPermissions: mockGetPermissions,
      });
      mockUseCoreClient.mockReturnValue({ coreClient: mockCoreClient });

      const { result } = renderPermissions(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.permissions).toEqual([
        'read:my_org:members',
        'delete:my_org:memberships',
      ]);
      expect(mockGetPermissions).toHaveBeenCalledTimes(1);
    });
  });

  describe('when coreClient is null', () => {
    it('sets loading to false with empty permissions', async () => {
      mockUseCoreClient.mockReturnValue({ coreClient: null });

      const { result } = renderPermissions(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.permissions).toEqual([]);
    });
  });

  describe('when isAuthenticated is false', () => {
    it('sets loading to false without fetching', async () => {
      const mockCoreClient = createMockCoreClient();
      const mockGetPermissions = vi.fn().mockResolvedValue(['read:my_org:members']);
      mockCoreClient.getPermissionApiClient = vi.fn().mockReturnValue({
        getPermissions: mockGetPermissions,
      });
      mockUseCoreClient.mockReturnValue({ coreClient: mockCoreClient });

      const { result } = renderPermissions(false);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.permissions).toEqual([]);
      expect(mockGetPermissions).not.toHaveBeenCalled();
    });
  });

  describe('when fetching permissions fails', () => {
    it('logs a warning and returns empty permissions', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockCoreClient = createMockCoreClient();
      const mockGetPermissions = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      mockCoreClient.getPermissionApiClient = vi.fn().mockReturnValue({
        getPermissions: mockGetPermissions,
      });
      mockUseCoreClient.mockReturnValue({ coreClient: mockCoreClient });

      const { result } = renderPermissions(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.permissions).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch permissions:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('when authentication changes', () => {
    it('clears permissions when coreClient becomes null', async () => {
      const mockCoreClient = createMockCoreClient();
      const mockGetPermissions = vi
        .fn()
        .mockResolvedValue(['read:my_org:members', 'delete:my_org:memberships']);
      mockCoreClient.getPermissionApiClient = vi.fn().mockReturnValue({
        getPermissions: mockGetPermissions,
      });
      mockUseCoreClient.mockReturnValue({ coreClient: mockCoreClient });

      const { result, rerender } = renderPermissions(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.permissions).toEqual([
        'read:my_org:members',
        'delete:my_org:memberships',
      ]);

      mockUseCoreClient.mockReturnValue({ coreClient: null });
      rerender();

      await waitFor(() => {
        expect(result.current.permissions).toEqual([]);
      });
    });
  });
});
