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

export type CreateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues &
  ProviderDetailsFormValues &
  ProviderConfigureFormValues;
export type UpdateIdentityProviderRequestContent = Auth0MyOrg.UpdateIdentityProviderRequestContent;
export type UpdateIdentityProviderResponseContent =
  Auth0MyOrg.UpdateIdentityProviderResponseContent;
export type IdpUpdateBase = Auth0MyOrg.IdpUpdateBase;

export type UpdateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues &
  Partial<IdpUpdateBase> &
  Partial<ProviderDetailsFormValues> &
  Partial<ProviderConfigureFormValues>;

export type IdpStrategy =
  | 'adfs'
  | 'google-apps'
  | 'oidc'
  | 'okta'
  | 'pingfederate'
  | 'samlp'
  | 'waad';

export type IdentityProviderCreate = Omit<IdentityProvider, 'id'>;

type Method = 'scim' | 'google-sync';

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
  method: Method;
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

type DomainStatus = 'pending' | 'failed' | 'verified';

export interface DomainCreate {
  domain: string;
}

export interface Domain {
  id: string;
  org_id: string;
  domain: string;
  status: DomainStatus;
  verification_txt: string;
  verification_host: string;
}
