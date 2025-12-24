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
