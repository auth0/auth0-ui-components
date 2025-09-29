export interface OktaOptions {}
export interface AdfsOptions {}
export interface GoogleAppsOptions {}
export interface OidcOptions {}
export interface PingFederateOptions {}
export interface SamlpOptions {}
export interface WaadOptions {}

type IdpOptions =
  | OktaOptions
  | AdfsOptions
  | GoogleAppsOptions
  | OidcOptions
  | PingFederateOptions
  | SamlpOptions
  | WaadOptions;

type IdpStrategy = 'adfs' | 'google-apps' | 'oidc' | 'okta' | 'ping-federate' | 'samlp' | 'waad';

export interface IdentityProvider {
  id: string;
  name: string;
  display_name: string;
  access_level: string;
  assign_membership_on_login: boolean;
  show_as_button: boolean;
  domains: string[];
  is_enabled: boolean;
  strategy: IdpStrategy;
  options: IdpOptions;
}

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
