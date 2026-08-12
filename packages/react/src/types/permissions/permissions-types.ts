/**
 * Permissions types
 * @module permissions-types
 */

import type {
  PermissionOptions,
  PermissionResolver,
  PermissionSpec,
  ResolvedPermissions,
} from '@auth0/universal-components-core';

export interface PermissionContextValue {
  permissions: string[];
}

export interface PermissionProviderProps {
  children: React.ReactNode;
  permissions?: string[];
}

/** Return type for usePermissions hook */
export interface UsePermissionsResult {
  permissions: string[];
  createPermissionResolver: <TSpec extends PermissionSpec>(
    resolver: PermissionResolver<TSpec>,
    options?: PermissionOptions,
  ) => ResolvedPermissions<TSpec>;
}
