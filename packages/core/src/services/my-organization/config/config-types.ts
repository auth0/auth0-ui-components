/**
 * Organization configuration type definitions.
 * @module config-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

export type GetConfigurationResponseContent = MyOrganization.GetConfigurationResponseContent;

export type GetIdpConfigurationResponseContent = MyOrganization.GetIdpConfigurationResponseContent;
export type IdentityProvidersConfigStrategyBase =
  MyOrganization.IdentityProvidersConfigStrategyBase;
export type CrossAppAccessResourceAppConfig = MyOrganization.CrossAppAccessResourceAppConfig;
export type IdentityProviderConfigOidc = MyOrganization.IdentityProviderConfigOidc;
export type IdentityProviderConfigOkta = MyOrganization.IdentityProviderConfigOkta;
export type IdentityProviderConfigSamlp = MyOrganization.IdentityProviderConfigSamlp;

export type StrategyWithCrossAppAccess =
  | IdentityProviderConfigOidc
  | IdentityProviderConfigOkta
  | IdentityProviderConfigSamlp;
