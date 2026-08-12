/**
 * Internal service hook for reading and resolving permissions.
 * @module use-permissions-service
 * @internal
 */

import * as React from 'react';

import { PermissionContext } from '@/providers/permission-context';
import type { UsePermissionsResult } from '@/types/permissions/permissions-types';

/**
 * Reads the current user's permissions from context and resolves module maps
 * against them.
 * @returns The current permissions and a bound resolver.
 * @internal
 */
export function usePermissionsService(): UsePermissionsResult {
  const context = React.useContext(PermissionContext);

  return React.useMemo<UsePermissionsResult>(() => {
    const allowAll = context === null;
    const permissions = context?.permissions ?? [];

    return {
      permissions,
      createPermissionResolver: (resolver, options) =>
        resolver(permissions, { allowAll, ...options }),
    };
  }, [context]);
}
