import type {
  SharedComponentProps,
  ProvisioningManageTokenMessages,
  SCIMToken,
} from '@auth0-web-ui-components/core';

export interface ProvisioningManageTokenClasses {
  'ProvisioningManageToken-root'?: string;
  'ProvisioningManageToken-header'?: string;
  'ProvisioningManageToken-table'?: string;
  'ProvisioningManageToken-emptyState'?: string;
}

export interface ProvisioningManageTokenProps
  extends SharedComponentProps<ProvisioningManageTokenMessages, ProvisioningManageTokenClasses> {
  scimTokens: SCIMToken[];
  onGenerateToken: () => void;
  onDeleteToken: (tokenId: string) => void;
  className?: string;
  createdToken?: {
    token: string;
    tokenId: string;
  } | null;
  onCloseCreateModal?: () => void;
}
