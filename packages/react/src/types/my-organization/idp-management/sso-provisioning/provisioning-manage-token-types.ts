/**
 * Provisioning manage token types.
 * @module provisioning-manage-token-types
 */

import type {
  SharedComponentProps,
  ProvisioningManageTokenMessages,
  ListIdpProvisioningScimTokensResponseContent,
  CreateIdpProvisioningScimTokenRequestContent,
  CreateIdpProvisioningScimTokenResponseContent,
  ProvisioningDeleteTokenModalMessages,
  ProvisioningCreateTokenModalMessages,
} from '@auth0/universal-components-core';

/** CSS classes for ProvisioningManageToken. */
export interface ProvisioningManageTokenClasses {
  'ProvisioningManageToken-root'?: string;
  'ProvisioningManageToken-header'?: string;
  'ProvisioningManageToken-table'?: string;
  'ProvisioningManageToken-emptyState'?: string;
}

/** Props for ProvisioningManageToken component. */
export interface ProvisioningManageTokenProps
  extends SharedComponentProps<ProvisioningManageTokenMessages, ProvisioningManageTokenClasses> {
  isScimTokensLoading: boolean;
  isScimTokenCreating: boolean;
  isScimTokenDeleting: boolean;
  onListScimTokens: () => Promise<ListIdpProvisioningScimTokensResponseContent | null>;
  onCreateScimToken: (
    data: CreateIdpProvisioningScimTokenRequestContent,
  ) => Promise<CreateIdpProvisioningScimTokenResponseContent | undefined>;
  onDeleteScimToken: (idpScimTokenId: string) => Promise<void>;
}

/** Props for ProvisioningDeleteTokenModal. */
export interface ProvisioningDeleteTokenModalProps
  extends SharedComponentProps<ProvisioningDeleteTokenModalMessages> {
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId: string | null;
  onConfirm: () => void;
}

/** Props for ProvisioningCreateTokenModal. */
export interface ProvisioningCreateTokenModalProps
  extends SharedComponentProps<ProvisioningCreateTokenModalMessages> {
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  createdToken: CreateIdpProvisioningScimTokenResponseContent | null;
}
