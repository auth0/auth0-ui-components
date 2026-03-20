/**
 * Organization configuration type definitions.
 * @module config-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

export type GetConfigurationResponseContent = MyOrganization.GetConfigurationResponseContent;

export type GetIdpConfigurationResponseContent = MyOrganization.GetIdpConfigurationResponseContent;
export type IdpConfigEnabledFeatures = MyOrganization.IdentityProvidersConfigEnabledFeaturesEnum;
export type IdpConfigProvisioningMethods =
  MyOrganization.IdentityProvidersConfigProvisioningMethodsEnum;
export type IdpConfigStrategyBase = MyOrganization.IdentityProvidersConfigStrategyBase;
