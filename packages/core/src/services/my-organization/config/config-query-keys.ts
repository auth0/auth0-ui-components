/**
 * Config query keys for TanStack Query cache management.
 * @module config-query-keys
 */
import type { IdpStrategy } from '../idp-management/sso-provider/sso-provider-types';

import type { IdpInstructionsLocale } from './config-types';

export const configQueryKeys = {
  all: ['config'] as const,
  details: () => [...configQueryKeys.all, 'details'] as const,
};

export const idpConfigQueryKeys = {
  all: ['idp-config'] as const,
  config: () => [...idpConfigQueryKeys.all, 'config'] as const,
  instructions: (strategy: IdpStrategy, locale: IdpInstructionsLocale) =>
    [...idpConfigQueryKeys.all, 'instructions', strategy, locale] as const,
  provisioningInstructions: (strategy: IdpStrategy, locale: IdpInstructionsLocale) =>
    [...idpConfigQueryKeys.all, 'provisioning-instructions', strategy, locale] as const,
};
