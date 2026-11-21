/**
 * Query keys for identity provider instructions.
 * @module instructions-query-keys
 */
import type { IdpStrategy } from '../../idp-management/sso-provider/sso-provider-types';

import type { IdpInstructionsLocale } from './instructions-types';

export const idpInstructionsQueryKeys = {
  all: ['idp-instructions'] as const,
  creation: (strategy: IdpStrategy, locale: IdpInstructionsLocale) =>
    [...idpInstructionsQueryKeys.all, 'creation', strategy, locale] as const,
  provisioning: (strategy: IdpStrategy, locale: IdpInstructionsLocale) =>
    [...idpInstructionsQueryKeys.all, 'provisioning', strategy, locale] as const,
};
