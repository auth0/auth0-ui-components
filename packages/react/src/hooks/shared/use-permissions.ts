/**
 * Public hook for reading and resolving the current user's permissions.
 * @module use-permissions
 */

import * as React from 'react';

import { PermissionContext } from '@/providers/permission-provider';
import type { UsePermissionsResult } from '@/types/permissions/permissions-types';

/**
 * Reads the current user's permissions and resolves module permission maps.
 * @returns The current permissions, loading state, and a bound resolver.
 */
export function usePermissions(): UsePermissionsResult {
  const context = React.useContext(PermissionContext);

  return React.useMemo<UsePermissionsResult>(() => {
    const permissions = context?.permissions ?? [];

    return {
      permissions,
      isLoading: context?.isLoading ?? false,
      createPermissionResolver: (resolver, options) => resolver(permissions, options),
    };
  }, [context]);
}
