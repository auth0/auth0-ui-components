/**
 * Permission context and provider.
 * @module permission-context
 * @internal
 */

'use client';

import * as React from 'react';

import type {
  PermissionContextValue,
  PermissionProviderProps,
} from '@/types/permissions/permissions-types';

/**
 * Current user's permissions; `null` outside a provider.
 * @internal
 */
export const PermissionContext = React.createContext<PermissionContextValue | null>(null);

/**
 * Provides the current user's permissions to descendants.
 *
 * TODO: read the granted permissions from the token claim once SDK support
 * lands; until then they must be supplied via `permissions`.
 * @param props - Provider props.
 * @param props.children - Subtree that can consume the permission context.
 * @param props.permissions - The granted permissions.
 * @returns The context provider element.
 * @internal
 */
export function PermissionProvider({
  children,
  permissions = [],
}: PermissionProviderProps): React.JSX.Element {
  const value = React.useMemo<PermissionContextValue>(() => ({ permissions }), [permissions]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}
