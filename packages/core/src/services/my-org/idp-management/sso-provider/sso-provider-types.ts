import type { MyOrganization } from '@auth0/myorganization-js';
import type {
  ProviderDetailsFormValues,
  ProviderConfigureFormValues,
  ProviderSelectionFormValues,
} from '@core/schemas';

export type ListIdentityProvidersResponseContent =
  MyOrganization.ListIdentityProvidersResponseContent;
export type IdentityProvider = MyOrganization.IdpKnownResponse;
export type DetachIdpProviderResponseContent = MyOrganization.DetachIdpProviderResponseContent;
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
