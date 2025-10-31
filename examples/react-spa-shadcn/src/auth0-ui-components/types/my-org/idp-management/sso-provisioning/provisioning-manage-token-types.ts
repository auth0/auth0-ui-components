import type {
  SharedComponentProps,
  ProvisioningManageTokenMessages,
  ListIdpProvisioningScimTokensResponseContent,
  CreateIdpProvisioningScimTokenRequestContent,
  CreateIdpProvisioningScimTokenResponseContent,
  ProvisioningDeleteTokenModalMessages,
  ProvisioningCreateTokenModalMessages,
} from '@auth0/web-ui-components-core';

export interface ProvisioningManageTokenClasses {
  'ProvisioningManageToken-root'?: string;
  'ProvisioningManageToken-header'?: string;
  'ProvisioningManageToken-table'?: string;
  'ProvisioningManageToken-emptyState'?: string;
}

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

export interface ProvisioningDeleteTokenModalProps
  extends SharedComponentProps<ProvisioningDeleteTokenModalMessages> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId: string | null;
  onConfirm: () => void;
}
export interface ProvisioningCreateTokenModalProps
  extends SharedComponentProps<ProvisioningCreateTokenModalMessages> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdToken: CreateIdpProvisioningScimTokenResponseContent | null;
}
