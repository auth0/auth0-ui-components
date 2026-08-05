/**
 * SSO provider type guards for narrowing identity provider list items.
 * @module sso-provider-guards
 * @internal
 */
import type { IdpKnownResponse, IdpListItemResponse } from './sso-provider-types';

/**
 * Type guard to determine if an identity provider list item is fully configurable.
 * @internal
 *
 * List responses may include minimal entries for connections the Organization
 * Administrator cannot configure (`access_level: 'none'`). Those omit `strategy`,
 * `options`, and `domains`, so they cannot take part in configuration flows such
 * as domain association.
 *
 * @param provider - The identity provider list item to test.
 * @returns `true` if the provider carries the full configurable shape; otherwise, `false`.
 */
export function isIdpKnownResponse(provider: IdpListItemResponse): provider is IdpKnownResponse {
  return 'strategy' in provider;
}
