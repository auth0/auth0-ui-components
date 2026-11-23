/**
 * Per-strategy attribute mappings from the identity provider configuration.
 * @module sso-provider-user-attributes
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

import type { GetIdpConfigurationResponseContent } from '../../config/config-types';
import type { IdpProvisioningUserAttributeMapItem } from '../sso-provisioning/sso-provisioning-types';

import { STRATEGY_TO_CONFIG_KEY } from './sso-provider-constants';
import type { IdpStrategy, IdpUserAttributeMapItem } from './sso-provider-types';

/** One entry of `strategies.<strategy>.user_attributes` in `GET /config/identity-providers`. */
export type IdpConfigUserAttribute = MyOrganization.IdentityProvidersConfigUserAttribute;

/** `user_attributes` of a strategy, keyed by user attribute profile id. */
export type IdpConfigUserAttributes = MyOrganization.IdentityProvidersConfigUserAttributes;

/**
 * The attribute mappings the configuration advertises for a strategy.
 * @param idpConfig - Identity provider configuration.
 * @param strategy - Strategy.
 * @returns The strategy's `user_attributes`, or `undefined` when the response has none (no user
 * attribute profile, or an older API).
 */
export function getStrategyUserAttributes(
  idpConfig: GetIdpConfigurationResponseContent | null | undefined,
  strategy: IdpStrategy | undefined,
): IdpConfigUserAttributes | undefined {
  if (!idpConfig?.strategies || !strategy) return undefined;
  return idpConfig.strategies[STRATEGY_TO_CONFIG_KEY[strategy]]?.user_attributes;
}

/**
 * Single sign-on mappings in the shape the mapping table shows: required first, then by label.
 * Attributes without an SSO field, and malformed entries, are left out.
 * @param userAttributes - The strategy's `user_attributes`.
 * @returns Mapping items.
 */
export function toSsoAttributeMappings(
  userAttributes: IdpConfigUserAttributes,
): IdpUserAttributeMapItem[] {
  return sortAttributes(
    getAttributeEntries(userAttributes).flatMap(([id, attribute]) => {
      const ssoField = toFieldList(attribute.sso_field);
      if (ssoField.length === 0) return [];
      return [{ ...toBaseItem(id, attribute), sso_field: ssoField }];
    }),
  );
}

/**
 * Provisioning mappings in the shape the mapping table shows: required first, then by label.
 * Attributes without a provisioning field, and malformed entries, are left out.
 * @param userAttributes - The strategy's `user_attributes`.
 * @returns Mapping items.
 */
export function toProvisioningAttributeMappings(
  userAttributes: IdpConfigUserAttributes,
): IdpProvisioningUserAttributeMapItem[] {
  return sortAttributes(
    getAttributeEntries(userAttributes).flatMap(([id, attribute]) => {
      if (!attribute.provisioning_field) return [];
      return [{ ...toBaseItem(id, attribute), provisioning_field: attribute.provisioning_field }];
    }),
  );
}

/**
 * The entries of `user_attributes` that are objects; the API data isn't trusted to be well formed.
 * @param userAttributes - The strategy's `user_attributes`.
 * @returns Pairs of profile id and configuration entry.
 */
function getAttributeEntries(
  userAttributes: IdpConfigUserAttributes,
): [string, IdpConfigUserAttribute][] {
  return Object.entries(userAttributes ?? {}).filter(
    (entry): entry is [string, IdpConfigUserAttribute] =>
      typeof entry[1] === 'object' && entry[1] !== null,
  );
}

/**
 * Common fields of a mapping item.
 * @param id - User attribute profile id.
 * @param attribute - Configuration entry.
 * @returns Base mapping item.
 */
function toBaseItem(id: string, attribute: IdpConfigUserAttribute) {
  return {
    user_attribute: id,
    label: attribute.label || id,
    description: attribute.description,
    is_required: Boolean(attribute.is_required),
    is_extra: false,
    is_missing: false,
  };
}

/**
 * SSO field names without empty entries; anything but a list gives none.
 * @param value - Field names, or nothing.
 * @returns Field names.
 */
function toFieldList(value: string[] | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((name) => typeof name === 'string' && name.length > 0);
}

/**
 * Key order isn't guaranteed, so sort: required first, then by label, then by id.
 * @param items - Mapping items.
 * @returns Sorted copy.
 */
function sortAttributes<
  T extends { is_required: boolean; label?: string; user_attribute?: string },
>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      Number(b.is_required) - Number(a.is_required) ||
      (a.label ?? '').localeCompare(b.label ?? '') ||
      (a.user_attribute ?? '').localeCompare(b.user_attribute ?? ''),
  );
}
