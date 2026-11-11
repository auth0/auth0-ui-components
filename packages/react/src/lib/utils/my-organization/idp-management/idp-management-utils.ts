/**
 * Identity provider management utility functions.
 * @module idp-management-utils
 * @internal
 */

import {
  DEFAULT_IDP_ACCESS_LEVEL,
  IDP_ACCESS_LEVELS,
  type IdpAccessLevel,
  type IdpKnownResponse,
  type UpdateIdentityProviderRequestContentPrivate,
} from '@auth0/universal-components-core';

import type { ProviderAccess } from '@/types/my-organization/idp-management/sso-provider/sso-provider-access-types';

/**
 * Reads the organization's access level for a provider.
 * @param provider - Identity provider
 * @returns The access level, `full` when the API doesn't report one
 * @internal
 */
export function getProviderAccessLevel(
  provider: Pick<IdpKnownResponse, 'access_level'> | null | undefined,
): IdpAccessLevel {
  return provider?.access_level ?? DEFAULT_IDP_ACCESS_LEVEL;
}

/**
 * Resolves what the organization may do with a provider at its access level.
 * Scopes are checked separately.
 * @param provider - Identity provider
 * @returns The allowed actions
 * @internal
 */
export function getProviderAccess(
  provider: Pick<IdpKnownResponse, 'access_level'> | null | undefined,
): ProviderAccess {
  const accessLevel = getProviderAccessLevel(provider);
  const hasFullAccess = accessLevel === IDP_ACCESS_LEVELS.FULL;
  const hasAtLeastLimitedAccess = hasFullAccess || accessLevel === IDP_ACCESS_LEVELS.LIMITED;

  return {
    accessLevel,
    canEditDetails: hasFullAccess,
    canEditLoginSettings: hasAtLeastLimitedAccess,
    canToggle: hasAtLeastLimitedAccess,
    canDetach: hasAtLeastLimitedAccess,
    canDelete: hasFullAccess,
    canManageDomains: hasFullAccess,
    canSyncAttributes: hasAtLeastLimitedAccess,
  };
}

/**
 * Keeps only the fields `limited` access may update.
 * @param data - Provider update
 * @returns The update without the display name, options or third-party settings
 * @internal
 */
export function pickLimitedUpdateFields(
  data: UpdateIdentityProviderRequestContentPrivate,
): UpdateIdentityProviderRequestContentPrivate {
  const { strategy, show_as_button, assign_membership_on_login, is_enabled } = data;
  return { strategy, show_as_button, assign_membership_on_login, is_enabled };
}
