/**
 * Organization configuration type definitions.
 * @module config-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

export type GetConfigurationResponseContent = MyOrganization.GetConfigurationResponseContent;

export type IdpConfig = MyOrganization.GetIdpConfigurationResponseContent;
export type IdpConfigStrategyBase = MyOrganization.IdentityProvidersConfigStrategyBase;
