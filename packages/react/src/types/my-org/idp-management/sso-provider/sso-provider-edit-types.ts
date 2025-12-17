import type {
  SharedComponentProps,
  BackButton,
  SsoProviderEditMessages,
  IdentityProvider,
  IdpId,
  OrganizationPrivate,
  UpdateIdentityProviderRequestContentPrivate,
  CreateIdpProvisioningScimTokenResponseContent,
  CreateIdpProvisioningScimTokenRequestContent,
  ListIdpProvisioningScimTokensResponseContent,
  GetIdPProvisioningConfigResponseContent,
} from '@auth0/universal-components-core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

import type {
  SsoDomainsTabEditProps,
  SsoDomainTabClasses,
  SsoProviderEditDomainsTabSchema,
} from '../sso-domain/sso-domain-tab-types';
import type {
  SsoProvisioningTabClasses,
  SsoProvisioningTabEditProps,
  SsoProvisioningTabSchemas,
} from '../sso-provisioning/sso-provisioning-tab-types';

import type {
  SsoProviderTabClasses,
  SsoProviderTabEditProps,
  SsoProviderTabSchemas,
} from './sso-provider-tab-types';

/* ============ Components ============ */

export interface SsoProviderEditBackButton extends Omit<BackButton, 'onClick'> {
  icon?: LucideIcon;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface SsoProviderEditClasses
  extends SsoProviderTabClasses,
    SsoProvisioningTabClasses,
    SsoDomainTabClasses {
  'SsoProviderEdit-header'?: string;
  'SsoProviderEdit-tabs'?: string;
}

export interface SsoProviderEditSchema {
  provider: SsoProviderTabSchemas;
  provisioning: SsoProvisioningTabSchemas;
  domains?: SsoProviderEditDomainsTabSchema;
}

export interface SsoProviderEditProps
  extends SharedComponentProps<
    SsoProviderEditMessages,
    SsoProviderEditClasses,
    SsoProviderEditSchema
  > {
  hideHeader?: boolean;
  providerId: IdpId;
  sso?: SsoProviderTabEditProps;
  provisioning?: SsoProvisioningTabEditProps;
  domains?: SsoDomainsTabEditProps;
  backButton?: SsoProviderEditBackButton;
}

/* ============ Subcomponents ============ */

/* ============ Hooks ============ */

export interface UseSsoProviderEditOptions extends SharedComponentProps {
  sso?: SsoProviderTabEditProps;
  provisioning?: SsoProvisioningTabEditProps;
  domains?: SsoDomainsTabEditProps;
}

export interface UseSsoProviderEditReturn {
  provider: IdentityProvider | null;
  organization: OrganizationPrivate | null;
  provisioningConfig: GetIdPProvisioningConfigResponseContent | null;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isRemoving: boolean;
  isProvisioningUpdating: boolean;
  isProvisioningDeleting: boolean;
  isProvisioningLoading: boolean;
  isScimTokensLoading: boolean;
  isScimTokenCreating: boolean;
  isScimTokenDeleting: boolean;
  fetchProvider: () => Promise<IdentityProvider | null>;
  fetchOrganizationDetails: () => Promise<void>;
  fetchProvisioning: () => Promise<GetIdPProvisioningConfigResponseContent | null>;
  updateProvider: (data: UpdateIdentityProviderRequestContentPrivate) => Promise<void>;
  createProvisioning: () => Promise<void>;
  deleteProvisioning: () => Promise<void>;
  listScimTokens: () => Promise<ListIdpProvisioningScimTokensResponseContent | null>;
  createScimToken: (
    data: CreateIdpProvisioningScimTokenRequestContent,
  ) => Promise<CreateIdpProvisioningScimTokenResponseContent | undefined>;
  deleteScimToken: (idpScimTokenId: string) => Promise<void>;
  onDeleteConfirm: () => Promise<void>;
  onRemoveConfirm: () => Promise<void>;
}
