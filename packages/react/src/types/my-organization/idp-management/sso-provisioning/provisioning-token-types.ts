import type {
  SharedComponentProps,
  ProvisioningCreateTokenModalContentMessages,
  ProvisioningDeleteTokenModalContentMessages,
} from '@auth0/universal-components-core';

export interface ProvisioningTokenClasses {
  'ProvisioningToken-root'?: string;
  'ProvisioningCreateTokenModal-root'?: string;
}

/**
 * Props for the ProvisioningCreateTokenModalContent component
 * This component displays a disabled input with a copy button to show a token
 */
export interface ProvisioningCreateTokenModalContentProps
  extends SharedComponentProps<
    ProvisioningCreateTokenModalContentMessages,
    ProvisioningTokenClasses
  > {
  token: string;
  tokenId: string;
  className?: string;
}

/**
 * Props for the ProvisioningDeleteTokenModalContent component
 * This component displays informational text about deleting a token
 */
export interface ProvisioningDeleteTokenModalContentProps
  extends SharedComponentProps<
    ProvisioningDeleteTokenModalContentMessages,
    ProvisioningTokenClasses
  > {
  className?: string;
  tokenId?: string;
}
