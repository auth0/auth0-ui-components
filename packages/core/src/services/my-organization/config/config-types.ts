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
