/**
 * IDP configuration types.
 * @module config-idp-types
 */

import type {
  GetIdpConfigurationResponseContent,
  IdpStrategy,
} from '@auth0/universal-components-core';

/** IDP configuration response — directly from the SDK. */
export type IdpConfig = GetIdpConfigurationResponseContent;

/** useIdpConfig hook result. */
export interface UseConfigIdpResult {
  idpConfig: IdpConfig | null;
  isLoadingIdpConfig: boolean;
  fetchIdpConfig: () => Promise<void>;
  isProvisioningEnabled: (strategy: IdpStrategy | undefined) => boolean;
  isProvisioningMethodEnabled: (strategy: IdpStrategy | undefined) => boolean;
  isIdpConfigValid: boolean;
}
