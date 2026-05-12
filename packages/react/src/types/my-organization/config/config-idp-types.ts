/**
 * IDP configuration types.
 * @module config-idp-types
 */

import type {
  GetIdpConfigurationResponseContent,
  IdpStrategy,
} from '@auth0/universal-components-core';

/** useIdpConfig hook result. */
export interface UseConfigIdpResult {
  idpConfig: GetIdpConfigurationResponseContent | null;
  isLoadingIdpConfig: boolean;
  fetchIdpConfig: () => Promise<void>;
  isProvisioningEnabled: (strategy: IdpStrategy | undefined) => boolean;
  isProvisioningMethodEnabled: (strategy: IdpStrategy | undefined) => boolean;
  isIdpConfigValid: boolean;
}
