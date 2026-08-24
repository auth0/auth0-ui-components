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
  isLoading: boolean;
}

export interface PermissionProviderProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

/** Return type for usePermissions hook */
export interface UsePermissionsResult {
  permissions: string[];
  isLoading: boolean;
  createPermissionResolver: <TSpec extends PermissionSpec>(
    resolver: PermissionResolver<TSpec>,
    options?: PermissionOptions,
  ) => ResolvedPermissions<TSpec>;
}
