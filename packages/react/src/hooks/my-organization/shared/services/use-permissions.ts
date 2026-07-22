/**
 * Hook for reading and checking the current user's MyOrganization permissions.
 * @module use-permissions
 */

import {
  getUserTier,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  PERMISSION_MANIFEST,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { PermissionContext } from '@/providers/permission-context';
import type { UsePermissionsResult } from '@/types/my-organization/permissions/permissions-types';

const ADMIN_FALLBACK_PERMISSIONS: string[] = [...PERMISSION_MANIFEST];

/**
 * Reads the current user's permissions
 * @returns Permission state and check helpers
 */
export function usePermissions(): UsePermissionsResult {
  const context = React.useContext(PermissionContext);

  const permissions = context?.permissions ?? ADMIN_FALLBACK_PERMISSIONS;
  const hasProvider = context !== null;

  return React.useMemo<UsePermissionsResult>(
    () => ({
      permissions,
      isLoading: context?.isLoading ?? false,
      hasProvider,
      hasPermission: (required) => hasPermission(permissions, required),
      hasAnyPermission: (required) => hasAnyPermission(permissions, required),
      hasAllPermissions: (required) => hasAllPermissions(permissions, required),
      getUserTier: (resource) => getUserTier(permissions, resource),
      refetch: () => context?.refetch(),
    }),
    [permissions, hasProvider, context],
  );
}
