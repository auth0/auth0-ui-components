/**
 * IDP configuration types.
 * @module config-idp-types
 */

import type {
  GetIdpConfigurationResponseContent,
  IdpStrategy,
  IdpScimTokenConfig,
} from '@auth0/universal-components-core';

/** useIdpConfig hook result. */
export interface UseConfigIdpResult {
  idpConfig: GetIdpConfigurationResponseContent | null;
  isLoadingIdpConfig: boolean;
  fetchIdpConfig: () => Promise<void>;
  isProvisioningEnabled: (strategy: IdpStrategy | undefined) => boolean;
  isProvisioningMethodEnabled: (strategy: IdpStrategy | undefined) => boolean;
  getScimTokenConfig: (strategy: IdpStrategy | undefined) => IdpScimTokenConfig | undefined;
  isIdpConfigValid: boolean;
  showCrossAppAccess: (strategy: IdpStrategy | undefined) => boolean;
  isCrossAppAccessReadOnly: (strategy: IdpStrategy | undefined) => boolean;
  getCrossAppAccessDefaultValue: (
    strategy: IdpStrategy | undefined,
  ) => 'enabled' | 'disabled' | undefined;
}
