/**
 * Permission checks for MyOrganization UI gating.
 * @module permission-utils
 * @internal
 */
import type { OauthScope } from './permission-manifest';
import type { PermissionTier } from './permission-types';

/**
 * Whether the user holds `required`.
 * @param userPermissions - Granted permissions.
 * @param required - Permission to check.
 * @returns `true` if present.
 * @internal
 */
export function hasPermission(userPermissions: readonly string[], required: OauthScope): boolean {
  return userPermissions.includes(required);
}

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

/**
 * Verbs held for `resource`, matched exactly against `<verb>:my_org:<resource>`.
 * @param userPermissions - Granted permissions.
 * @param resource - Resource segment (e.g. `members`, `domains`).
 * @returns The distinct verbs for that resource.
 */
function getResourceVerbs(userPermissions: readonly string[], resource: string): Set<string> {
  const verbs = new Set<string>();
  for (const permission of userPermissions) {
    const [verb, , resourceSegment] = permission.split(':');
    if (verb && resourceSegment === resource) {
      verbs.add(verb);
    }
  }
  return verbs;
}

/**
 * Behavior tier for `resource`: delete → admin, create/update → editor, else viewer.
 * @param userPermissions - Granted permissions.
 * @param resource - Resource segment to evaluate.
 * @returns The {@link PermissionTier}.
 * @internal
 */
export function getUserTier(userPermissions: readonly string[], resource: string): PermissionTier {
  const verbs = getResourceVerbs(userPermissions, resource);

  if (verbs.has('delete')) {
    return 'admin';
  }
  if (verbs.has('create') || verbs.has('update')) {
    return 'editor';
  }
  return 'viewer';
}
