import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { usePermissions } from '@/hooks/my-organization/use-permissions';
import { PermissionProvider } from '@/providers/permission-context';

const renderPermissions = (permissions?: string[]) => {
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <PermissionProvider permissions={permissions}>{children}</PermissionProvider>
  );
  return renderHook(() => usePermissions(), { wrapper });
};

describe('PermissionProvider', () => {
  describe('when permissions are provided', () => {
    it('exposes them to descendants', () => {
      const { result } = renderPermissions(['read:my_org:members', 'delete:my_org:memberships']);

      expect(result.current.permissions).toEqual([
        'read:my_org:members',
        'delete:my_org:memberships',
      ]);
    });
  });

  describe('when no permissions are provided', () => {
    it('grants nothing, unlike the no-provider case', () => {
      const { result } = renderPermissions();

      expect(result.current.permissions).toEqual([]);
    });
  });
});
