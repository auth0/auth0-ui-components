/**
 * Internal service hook for reading and checking MyOrganization permissions.
 * @module use-permissions-service
 * @internal
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
 * Reads the current user's permissions from context and exposes check helpers.
 * Falls back to admin-level access when used outside a provider.
 * @returns Permission state and check helpers.
 * @internal
 */
export function usePermissionsService(): UsePermissionsResult {
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
