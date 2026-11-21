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
  type ProviderConfigureFormValues,
  type UpdateIdentityProviderRequestContentPrivate,
} from '@auth0/universal-components-core';

import { CONNECTION_ACCESS_FIELDS } from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import type { ProviderAccess } from '@/types/my-organization/idp-management/sso-provider/sso-provider-access-types';
import type { ConnectionAccessFormValues } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

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
 * @returns The update without the display name, options or third-party settings, and without fields that aren't set
 * @internal
 */
export function pickLimitedUpdateFields(
  data: UpdateIdentityProviderRequestContentPrivate,
): UpdateIdentityProviderRequestContentPrivate {
  const { strategy, show_as_button, assign_membership_on_login, is_enabled } = data;

  return {
    strategy,
    ...(show_as_button !== undefined && { show_as_button }),
    ...(assign_membership_on_login !== undefined && { assign_membership_on_login }),
    ...(is_enabled !== undefined && { is_enabled }),
  };
}

const warnedInstructionTypes = new Set<string>();

/**
 * Warns once per unknown instruction content type; the API tells clients to ignore types they don't know.
 * @param type - Content type without a renderer.
 */
export function warnUnknownInstructionType(type: string): void {
  if (warnedInstructionTypes.has(type)) return;
  warnedInstructionTypes.add(type);
  console.warn(`[SsoGuidedSetup] No renderer for instruction content type "${type}"; skipped.`);
}

/**
 * Attribute mappings of a provider, for strategies whose response carries them.
 * @param provider - Provider, if any.
 * @returns The mappings, or an empty list.
 */
export function getProviderAttributes(provider: IdpKnownResponse | null): unknown[] {
  if (!provider || !('attributes' in provider)) return [];
  return Array.isArray(provider.attributes) ? provider.attributes : [];
}

/**
 * Third-party and Cross App Access values the form holds, which it only does when they're shown.
 * @param data - Configure form values.
 * @returns The access values that are set.
 */
export function pickConnectionAccess(
  data: ProviderConfigureFormValues | null | undefined,
): Partial<Pick<ConnectionAccessFormValues, (typeof CONNECTION_ACCESS_FIELDS)[number]>> {
  if (!data) return {};
  const values = data as Record<string, unknown>;
  return Object.fromEntries(
    CONNECTION_ACCESS_FIELDS.filter((field) => values[field] !== undefined).map((field) => [
      field,
      values[field],
    ]),
  );
}
