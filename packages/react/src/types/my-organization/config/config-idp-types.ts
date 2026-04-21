/**
 * IDP configuration types.
 * @module config-idp-types
 */

import type { IdpConfig, IdpStrategy } from '@auth0/universal-components-core';

/** useIdpConfig hook result. */
export interface UseConfigIdpResult {
  idpConfig: IdpConfig | null;
  isLoadingIdpConfig: boolean;
  fetchIdpConfig: () => Promise<void>;
  isProvisioningEnabled: (strategy: IdpStrategy | undefined) => boolean;
  isProvisioningMethodEnabled: (strategy: IdpStrategy | undefined) => boolean;
  isIdpConfigValid: boolean;
}
