/**
 * Public hook for reading and resolving the current user's permissions.
 * Consumes the internal service hook.
 * @module use-permissions
 */

import { usePermissionsService } from '@/hooks/my-organization/shared/services/use-permissions-service';
import type { UsePermissionsResult } from '@/types/permissions/permissions-types';

/**
 * Reads the current user's permissions and resolves module permission maps.
 * @returns The current permissions and a bound resolver.
 */
export function usePermissions(): UsePermissionsResult {
  return usePermissionsService();
}
