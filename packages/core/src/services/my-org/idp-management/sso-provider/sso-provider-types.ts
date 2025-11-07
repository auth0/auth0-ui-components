import type {
  ProviderDetailsFormValues,
  ProviderConfigureFormValues,
  ProviderSelectionFormValues,
} from '@core/schemas';
import type { Auth0MyOrg } from 'auth0-myorg-sdk';

export type ListIdentityProvidersResponseContent = Auth0MyOrg.ListIdentityProvidersResponseContent;
export type IdentityProvider = Auth0MyOrg.IdpKnown;
export type DetachIdpProviderResponseContent = Auth0MyOrg.DetachIdpProviderResponseContent;
export type CreateIdentityProviderRequestContent = Auth0MyOrg.CreateIdentityProviderRequestContent;
export type CreateIdentityProviderResponseContent =
  Auth0MyOrg.CreateIdentityProviderResponseContent;
export type GetIdentityProviderResponseContent = Auth0MyOrg.GetIdentityProviderResponseContent;
export type IdpId = Auth0MyOrg.IdpId;
export type UpdateIdentityProviderRequestContent = Auth0MyOrg.UpdateIdentityProviderRequestContent;
export type UpdateIdentityProviderResponseContent =
  Auth0MyOrg.UpdateIdentityProviderResponseContent;

export type CreateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues &
  ProviderDetailsFormValues &
  ProviderConfigureFormValues;
export type IdpUpdateBase = Auth0MyOrg.IdpUpdateBase;

export type UpdateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues &
  Partial<IdpUpdateBase> &
  Partial<ProviderDetailsFormValues> &
  Partial<ProviderConfigureFormValues>;

export type CreateIdpDomainRequestContent = Auth0MyOrg.CreateIdpDomainRequestContent;
export type CreateIdpDomainResponseContent = Auth0MyOrg.CreateIdpDomainResponseContent;

export type IdpStrategy =
  | 'adfs'
  | 'google-apps'
  | 'oidc'
  | 'okta'
  | 'pingfederate'
  | 'samlp'
  | 'waad';

export type IdentityProviderCreate = Omit<IdentityProvider, 'id'>;

export type IdentityProviderAssociatedWithDomain = IdentityProvider & {
  is_associated: boolean;
};

export type ProvisioningMethod = 'scim' | 'google-sync';

export interface ProvisioningField {
  provisioning_field: string;
  user_attribute: string;
  description: string;
  label: string;
}

export interface Provisioning {
  identity_provider_id: string;
  identity_provider_name: string;
  strategy: IdpStrategy;
  method: ProvisioningMethod;
  fields: ProvisioningField[];
  updated_on: string;
  created_at: string;
  user_id_attribute: string;
}

export interface SCIMTokenCreate {
  token_lifetime?: number;
}

export interface SCIMToken {
  token_id: string;
  token: string;
  created_at: string;
  valid_until?: string;
}
