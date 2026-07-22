/**
 * Public hook for reading and checking the current user's MyOrganization permissions.
 * Consumes the internal service hook.
 * @module use-permissions
 */

import { usePermissionsService } from '@/hooks/my-organization/shared/services/use-permissions-service';
import type { UsePermissionsResult } from '@/types/my-organization/permissions/permissions-types';

/**
 * Reads the current user's permissions and exposes type-safe check helpers.
 * @returns Permission state and check helpers.
 */
export function usePermissions(): UsePermissionsResult {
  return usePermissionsService();
}
