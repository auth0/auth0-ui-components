import type {
  SharedComponentProps,
  SsoProvisioningTabMessages,
  IdentityProvider,
  CreateIdpProvisioningScimTokenRequestContent,
  ListIdpProvisioningScimTokensResponseContent,
  CreateIdpProvisioningScimTokenResponseContent,
  SsoProvisioningDetailsMessages,
  GetIdPProvisioningConfigResponseContent,
  SsoProvisioningDeleteMessages,
  ComponentAction,
  CreateIdPProvisioningConfigResponseContent,
} from '@auth0/universal-components-core';

import type { ProvisioningManageTokenClasses } from './provisioning-manage-token-types';

export interface SsoProvisioningTabEditProps {
  createAction?: ComponentAction<IdentityProvider, CreateIdPProvisioningConfigResponseContent>;
  deleteAction?: ComponentAction<IdentityProvider, void>;
  createScimTokenAction?: ComponentAction<
    IdentityProvider,
    CreateIdpProvisioningScimTokenResponseContent
  >;
  deleteScimTokenAction?: ComponentAction<IdentityProvider, void>;
}
export interface SsoProvisioningTabClasses {
  'SsoProvisioningTab-root'?: string;
  'SsoProvisioningDetails-root'?: string;
  'SsoProvisioningDetails-provisioningMapping'?: string;
  'SsoProvisioningDetails-provisioningOptional'?: string;
  'SsoProvisioningDetails-formActions'?: string;
}

export interface SsoProvisioningTabProps
  extends SharedComponentProps<SsoProvisioningTabMessages, SsoProvisioningTabClasses> {
  provider: IdentityProvider;
  isProvisioningUpdating: boolean;
  isProvisioningDeleting: boolean;
  isScimTokensLoading: boolean;
  isScimTokenCreating: boolean;
  isScimTokenDeleting: boolean;
  onCreateProvisioning: () => Promise<void>;
  onDeleteProvisioning: () => Promise<void>;
  onListScimTokens: () => Promise<ListIdpProvisioningScimTokensResponseContent | null>;
  onCreateScimToken: (
    data: CreateIdpProvisioningScimTokenRequestContent,
  ) => Promise<CreateIdpProvisioningScimTokenResponseContent | undefined>;
  onDeleteScimToken: (idpScimTokenId: string) => Promise<void>;
}

export interface SsoProvisioningTabSchemas {}

export interface SsoProvisioningDetailsClasses extends ProvisioningManageTokenClasses {
  'SsoProvisioningDetails-root'?: string;
  'SsoProvisioningDetails-formActions'?: string;
  'SsoProvisioningDetails-provisioningMapping'?: string;
}

export interface SsoProvisioningDeleteModalProps
  extends SharedComponentProps<SsoProvisioningDeleteMessages> {
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export interface SsoProvisioningDetailsProps
  extends SharedComponentProps<
    SsoProvisioningDetailsMessages,
    SsoProvisioningDetailsClasses,
    SsoProvisioningTabSchemas
  > {
  provider: IdentityProvider;
  provisioningConfig: GetIdPProvisioningConfigResponseContent | null;
  isScimTokensLoading: boolean;
  isScimTokenCreating: boolean;
  isScimTokenDeleting: boolean;
  onListScimTokens: () => Promise<ListIdpProvisioningScimTokensResponseContent | null>;
  onCreateScimToken: (
    data: CreateIdpProvisioningScimTokenRequestContent,
  ) => Promise<CreateIdpProvisioningScimTokenResponseContent | undefined>;
  onDeleteScimToken: (idpScimTokenId: string) => Promise<void>;
}
