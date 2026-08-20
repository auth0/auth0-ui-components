/**
 * Permission checks for UI gating.
 * @module permission-utils
 * @internal
 */
import type { OauthScope } from './permission-types';

/**
 * Whether the user holds at least one of `required`.
 * @param userPermissions - Granted permissions.
 * @param required - Candidate permissions.
 * @returns `true` if any match, or `required` is empty.
 * @internal
 */
export function hasAnyPermission(
  userPermissions: readonly string[],
  required: readonly OauthScope[],
): boolean {
  if (required.length === 0) {
    return true;
  }
  const granted = new Set(userPermissions);
  return required.some((permission) => granted.has(permission));
}

/**
 * Whether the user holds every one of `required`.
 * @param userPermissions - Granted permissions.
 * @param required - Required permissions.
 * @returns `true` if all match, or `required` is empty.
 * @internal
 */
export function hasAllPermissions(
  userPermissions: readonly string[],
  required: readonly OauthScope[],
): boolean {
  if (required.length === 0) {
    return true;
  }
  const granted = new Set(userPermissions);
  return required.every((permission) => granted.has(permission));
}
