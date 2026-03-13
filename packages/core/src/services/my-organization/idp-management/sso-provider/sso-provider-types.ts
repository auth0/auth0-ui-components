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

export type IdentityProvider = MyOrganization.IdpKnownResponse;

export type CreateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues &
  ProviderDetailsFormValues &
  ProviderConfigureFormValues;

export type UpdateIdentityProviderRequestContentPrivate = ProviderSelectionFormValues &
  Partial<MyOrganization.IdpUpdateBase> &
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

export type IdpUserAttributeMap = MyOrganization.IdpUserAttributeMapItem[];
export type IdpBaseUserAttributeItem = MyOrganization.BaseUserAttributeMapItem;
