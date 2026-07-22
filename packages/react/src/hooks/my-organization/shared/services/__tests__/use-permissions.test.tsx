import { PERMISSION_MANIFEST } from '@auth0/universal-components-core';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { usePermissions } from '@/hooks/my-organization/shared/services/use-permissions';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-context';

const createWrapper = (value: PermissionContextValue) => {
  return ({ children }: React.PropsWithChildren) => (
    <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
  );
};

describe('usePermissions', () => {
  describe('inside a provider', () => {
    it('exposes the provider permissions and resolves checks against them', () => {
      const refetch = vi.fn();
      const wrapper = createWrapper({
        permissions: ['read:my_org:members', 'delete:my_org:memberships'],
        isLoading: false,
        refetch,
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasProvider).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.permissions).toEqual([
        'read:my_org:members',
        'delete:my_org:memberships',
      ]);
      expect(result.current.hasPermission('delete:my_org:memberships')).toBe(true);
      expect(result.current.hasPermission('update:my_org:domains')).toBe(false);
      expect(
        result.current.hasAnyPermission(['update:my_org:domains', 'read:my_org:members']),
      ).toBe(true);
      expect(
        result.current.hasAllPermissions(['read:my_org:members', 'delete:my_org:memberships']),
      ).toBe(true);
      expect(result.current.getUserTier('memberships')).toBe('admin');
    });

    it('surfaces the loading state and forwards refetch to the context', () => {
      const refetch = vi.fn();
      const wrapper = createWrapper({ permissions: [], isLoading: true, refetch });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      result.current.refetch();
      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('outside a provider (admin fallback)', () => {
    it('falls back to the full manifest so gated components keep working', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasProvider).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.permissions).toEqual([...PERMISSION_MANIFEST]);
      expect(result.current.hasPermission('delete:my_org:memberships')).toBe(true);
      expect(result.current.getUserTier('domains')).toBe('admin');
    });

    it('treats refetch as a no-op without throwing', () => {
      const { result } = renderHook(() => usePermissions());

      expect(() => result.current.refetch()).not.toThrow();
    });
  });
});
