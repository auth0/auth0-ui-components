import { createPermissionResolver } from '@auth0/universal-components-core';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { usePermissionsService } from '@/hooks/my-organization/shared/services/use-permissions-service';
import { PermissionContext } from '@/providers/permission-provider';
import type { PermissionContextValue } from '@/types/permissions/permissions-types';

const resolver = createPermissionResolver({
  canRemove: ['delete:my_org:memberships'],
  canInvite: ['create:my_org:member_invitations'],
} as const);

const createWrapper = (value: PermissionContextValue) => {
  return ({ children }: React.PropsWithChildren) => (
    <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
  );
};

describe('usePermissionsService', () => {
  describe('inside a provider', () => {
    it('exposes the provider permissions', () => {
      const wrapper = createWrapper({
        permissions: ['read:my_org:members', 'delete:my_org:memberships'],
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissionsService(), { wrapper });

      expect(result.current.permissions).toEqual([
        'read:my_org:members',
        'delete:my_org:memberships',
      ]);
      expect(result.current.isLoading).toBe(false);
    });

    it('resolves a module map against those permissions', () => {
      const wrapper = createWrapper({
        permissions: ['delete:my_org:memberships'],
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissionsService(), { wrapper });

      expect(result.current.createPermissionResolver(resolver)).toEqual({
        canRemove: true,
        canInvite: false,
      });
    });

    it('forwards options to the resolver', () => {
      const wrapper = createWrapper({
        permissions: ['delete:my_org:memberships'],
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissionsService(), { wrapper });

      expect(result.current.createPermissionResolver(resolver, { readOnly: true })).toEqual({
        canRemove: false,
        canInvite: false,
      });
    });
  });

  describe('outside a provider', () => {
    it('grants everything so ungated consumers keep working', () => {
      const { result } = renderHook(() => usePermissionsService());

      expect(result.current.permissions).toEqual([]);
      expect(result.current.createPermissionResolver(resolver)).toEqual({
        canRemove: true,
        canInvite: true,
      });
    });

    it('still honours readOnly', () => {
      const { result } = renderHook(() => usePermissionsService());

      expect(result.current.createPermissionResolver(resolver, { readOnly: true })).toEqual({
        canRemove: false,
        canInvite: false,
      });
    });
  });
});
