/**
 * SSO provider constants including strategies and display names.
 * @module sso-provider-constants
 * @internal
 */
import type { GetIdpConfigurationResponseContent } from '../../config/config-types';

import type { IdpStrategy } from './sso-provider-types';

export const STRATEGIES = {
  ADFS: 'adfs',
  GOOGLE_APPS: 'google-apps',
  OIDC: 'oidc',
  OKTA: 'okta',
  PINGFEDERATE: 'pingfederate',
  SAMLP: 'samlp',
  WAAD: 'waad',
} as const;

export const AVAILABLE_STRATEGY_LIST: IdpStrategy[] = Object.values(STRATEGIES);

export const STRATEGY_DISPLAY_NAMES: Record<IdpStrategy, string> = {
  [STRATEGIES.ADFS]: 'ADFS',
  [STRATEGIES.GOOGLE_APPS]: 'Google Workspace',
  [STRATEGIES.OIDC]: 'Custom OIDC',
  [STRATEGIES.OKTA]: 'Okta',
  [STRATEGIES.PINGFEDERATE]: 'PingFederate',
  [STRATEGIES.SAMLP]: 'Custom SAML',
  [STRATEGIES.WAAD]: 'Entra ID',
} as const;

export const DISCOVERY_URL_SUFFIX = '/.well-known/openid-configuration';

/** Key of a strategy in the `strategies` object of `GET /config/identity-providers`. */
export type IdpConfigStrategyKey = keyof NonNullable<
  GetIdpConfigurationResponseContent['strategies']
>;

/** Maps each IdP strategy to its key in the identity provider configuration. */
export const STRATEGY_TO_CONFIG_KEY: Record<IdpStrategy, IdpConfigStrategyKey> = {
  [STRATEGIES.ADFS]: 'adfs',
  [STRATEGIES.GOOGLE_APPS]: 'googleapps',
  [STRATEGIES.OIDC]: 'oidc',
  [STRATEGIES.OKTA]: 'okta',
  [STRATEGIES.PINGFEDERATE]: 'pingfederate',
  [STRATEGIES.SAMLP]: 'samlp',
  [STRATEGIES.WAAD]: 'waad',
};
