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
  SsoProviderAttributeMappingsMessages,
  IdpProvisioningUserAttributeMap,
  IdpUserAttributeMap,
  IdpStrategy,
  AttributeSyncAlertMessages,
} from '@auth0/universal-components-core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

import type {
  SsoDomainsTabEditProps,
  SsoDomainTabClasses,
  SsoProviderEditDomainsTabSchema,
} from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';
import type {
  SsoProviderTabClasses,
  SsoProviderTabEditProps,
  SsoProviderTabSchemas,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';
import type {
  SsoProvisioningTabClasses,
  SsoProvisioningTabEditProps,
  SsoProvisioningTabSchemas,
} from '@/types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';

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
  isSsoAttributesSyncing: boolean;
  isProvisioningAttributesSyncing: boolean;
  hasSsoAttributeSyncWarning: boolean;
  hasProvisioningAttributeSyncWarning: boolean;
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
  syncSsoAttributes: () => Promise<void>;
  syncProvisioningAttributes: () => Promise<void>;
  onDeleteConfirm: () => Promise<void>;
  onRemoveConfirm: () => Promise<void>;
}

export interface SsoProviderAttributeMappingsProps
  extends SharedComponentProps<SsoProviderAttributeMappingsMessages> {
  userAttributeMap: IdpProvisioningUserAttributeMap | IdpUserAttributeMap | null;
  strategy: IdpStrategy | null;
  isProvisioning?: boolean;
  className?: string;
}

export interface SsoProviderAttributeSyncAlertProps {
  translatorKey?: string;
  className?: string;
  onSync?: () => void | Promise<void>;
  isSyncing?: boolean;
  customMessages?: Partial<AttributeSyncAlertMessages>;
}
