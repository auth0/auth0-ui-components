/**
 * Per-strategy attribute mappings from the identity provider configuration.
 * @module sso-provider-user-attributes
 * @internal
 */
import type { GetIdpConfigurationResponseContent } from '../../config/config-types';
import type { IdpProvisioningUserAttributeMapItem } from '../sso-provisioning/sso-provisioning-types';

import { STRATEGY_TO_CONFIG_KEY } from './sso-provider-constants';
import type { IdpStrategy, IdpUserAttributeMapItem } from './sso-provider-types';

/**
 * One entry of `strategies.<strategy>.user_attributes` in `GET /config/identity-providers`.
 */
export interface IdpConfigUserAttribute {
  label?: string;
  description?: string;
  profile_required?: boolean;
  sso_field_name?: string | string[];
  provisioning_field_name?: string;
}

/** `user_attributes` of a strategy, keyed by user attribute profile id. */
export type IdpConfigUserAttributes = Record<string, IdpConfigUserAttribute>;

/**
 * The attribute mappings the configuration advertises for a strategy.
 * @param idpConfig - Identity provider configuration.
 * @param strategy - Strategy.
 * @returns The strategy's `user_attributes`, or `undefined` when the response has none (older API).
 */
export function getStrategyUserAttributes(
  idpConfig: GetIdpConfigurationResponseContent | null | undefined,
  strategy: IdpStrategy | undefined,
): IdpConfigUserAttributes | undefined {
  if (!idpConfig?.strategies || !strategy) return undefined;
  const strategyConfig = idpConfig.strategies[STRATEGY_TO_CONFIG_KEY[strategy]] as
    | { user_attributes?: unknown }
    | undefined;
  const userAttributes = strategyConfig?.user_attributes;
  if (!userAttributes || typeof userAttributes !== 'object' || Array.isArray(userAttributes)) {
    return undefined;
  }
  return userAttributes as IdpConfigUserAttributes;
}

/**
 * Single sign-on mappings in the shape the mapping table shows: required first, then by label.
 * Attributes without an SSO field are left out.
 * @param userAttributes - The strategy's `user_attributes`.
 * @returns Mapping items.
 */
export function toSsoAttributeMappings(
  userAttributes: IdpConfigUserAttributes,
): IdpUserAttributeMapItem[] {
  return sortAttributes(
    Object.entries(userAttributes).flatMap(([id, attribute]) => {
      const ssoField = toFieldList(attribute.sso_field_name);
      if (ssoField.length === 0) return [];
      return [{ ...toBaseItem(id, attribute), sso_field: ssoField }];
    }),
  );
}

/**
 * Provisioning mappings in the shape the mapping table shows: required first, then by label.
 * Attributes without a provisioning field are left out.
 * @param userAttributes - The strategy's `user_attributes`.
 * @returns Mapping items.
 */
export function toProvisioningAttributeMappings(
  userAttributes: IdpConfigUserAttributes,
): IdpProvisioningUserAttributeMapItem[] {
  return sortAttributes(
    Object.entries(userAttributes).flatMap(([id, attribute]) => {
      if (!attribute.provisioning_field_name) return [];
      return [
        { ...toBaseItem(id, attribute), provisioning_field: attribute.provisioning_field_name },
      ];
    }),
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
    is_required: Boolean(attribute.profile_required),
    is_extra: false,
    is_missing: false,
  };
}

/**
 * Normalises an SSO field to a list without empty names.
 * @param value - String, list or nothing.
 * @returns Field names.
 */
function toFieldList(value: string | string[] | undefined): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.filter((name) => typeof name === 'string' && name.length > 0);
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
