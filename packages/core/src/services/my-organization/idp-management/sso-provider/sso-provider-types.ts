/**
 * SSO provider type definitions for identity provider management.
 * @module sso-provider-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';
import type {
  ProviderDetailsFormValues,
  ProviderConfigureFormValues,
  ProviderSelectionFormValues,
} from '@core/schemas';

export type ListIdentityProvidersResponseContent =
  MyOrganization.ListIdentityProvidersResponseContent;
export type IdentityProvider = MyOrganization.IdpKnownResponse;
export type CreateIdentityProviderRequestContent =
  MyOrganization.CreateIdentityProviderRequestContent;
export type CreateIdentityProviderResponseContent =
  MyOrganization.CreateIdentityProviderResponseContent;
export type GetIdentityProviderResponseContent = MyOrganization.GetIdentityProviderResponseContent;
export type IdpId = MyOrganization.IdpId;
export type UpdateIdentityProviderRequestContent =
  MyOrganization.UpdateIdentityProviderRequestContent;
export type UpdateIdentityProviderResponseContent =
  MyOrganization.UpdateIdentityProviderResponseContent;

export type CreateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues &
  ProviderDetailsFormValues &
  ProviderConfigureFormValues;
export type IdpUpdateBase = MyOrganization.IdpUpdateBase;

export type UpdateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues &
  Partial<IdpUpdateBase> &
  Partial<ProviderDetailsFormValues> &
  Partial<ProviderConfigureFormValues>;

export type CreateIdpDomainRequestContent = MyOrganization.CreateIdpDomainRequestContent;
export type CreateIdpDomainResponseContent = MyOrganization.CreateIdpDomainResponseContent;

export type IdpStrategy = MyOrganization.IdpStrategyEnum;

export type IdentityProviderCreate = Omit<IdentityProvider, 'id'>;

export type IdentityProviderAssociatedWithDomain = IdentityProvider & {
  is_associated: boolean;
};

export type ProvisioningMethod = MyOrganization.IdpProvisioningMethodEnum;

export type Provisioning = MyOrganization.IdpProvisioningConfig & {
  updated_on: string;
  created_at: string;
};

export type SCIMTokenCreate = MyOrganization.CreateIdpProvisioningScimTokenRequestContent;

export type SCIMToken = MyOrganization.IdpScimTokenCreate;

export type IdpUserAttributeMap = MyOrganization.IdpUserAttributeMapItem[];
export type IdpBaseUserAttributeItem = MyOrganization.BaseUserAttributeMapItem;
