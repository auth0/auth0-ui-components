/**
 * SSO provider edit types.
 * @module sso-provider-edit-types
 */

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

import type { IdpConfig } from '@/types/my-organization/config/config-idp-types';
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

/** Back button for SSO provider edit. */
export interface SsoProviderEditBackButton extends Omit<BackButton, 'onClick'> {
  icon?: LucideIcon;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/** CSS classes for SsoProviderEdit. */
export interface SsoProviderEditClasses
  extends SsoProviderTabClasses,
    SsoProvisioningTabClasses,
    SsoDomainTabClasses {
  'SsoProviderEdit-header'?: string;
  'SsoProviderEdit-tabs'?: string;
}

/** SSO provider edit schemas. */
export interface SsoProviderEditSchema {
  provider: SsoProviderTabSchemas;
  provisioning: SsoProvisioningTabSchemas;
  domains?: SsoProviderEditDomainsTabSchema;
}

/** Props for SsoProviderEdit component. */
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

/** useSsoProviderEdit options. */
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
  shouldAllowDeletion: boolean;
  isLoadingConfig: boolean;
  idpConfig: IdpConfig | null;
  isLoadingIdpConfig: boolean;
  showProvisioningTab: boolean;
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
  handleToggleProvider: (enabled: boolean) => Promise<void>;
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

export interface SsoProviderEditViewProps extends UseSsoProviderEditReturn, SsoProviderEditProps {}
