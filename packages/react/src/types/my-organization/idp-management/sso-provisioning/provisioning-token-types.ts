/**
 * Provisioning token modal content types.
 * @module provisioning-token-types
 */

import type {
  SharedComponentProps,
  ProvisioningCreateTokenModalContentMessages,
  ProvisioningDeleteTokenModalContentMessages,
} from '@auth0/universal-components-core';

/** CSS classes for provisioning token components. */
export interface ProvisioningTokenClasses {
  'ProvisioningToken-root'?: string;
  'ProvisioningCreateTokenModal-root'?: string;
}

/** Props for ProvisioningCreateTokenModalContent. */
export interface ProvisioningCreateTokenModalContentProps
  extends SharedComponentProps<
    ProvisioningCreateTokenModalContentMessages,
    ProvisioningTokenClasses
  > {
  token: string;
  tokenId: string;
  className?: string;
}

/** Props for ProvisioningDeleteTokenModalContent. */
export interface ProvisioningDeleteTokenModalContentProps
  extends SharedComponentProps<
    ProvisioningDeleteTokenModalContentMessages,
    ProvisioningTokenClasses
  > {
  className?: string;
  tokenId?: string;
}
