/**
 * Provisioning token modal content types.
 * @module provisioning-token-types
 */

import type {
  SharedComponentProps,
  ProvisioningCreateTokenFormMessages,
  ProvisioningCreateTokenModalContentMessages,
  ProvisioningDeleteTokenModalContentMessages,
  ProvisioningCreateTokenFormValues,
  ProvisioningCreateTokenFormRules,
} from '@auth0/universal-components-core';
import type { UseFormReturn } from 'react-hook-form';

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

/** Props for ProvisioningCreateTokenForm. */
export interface ProvisioningCreateTokenFormProps {
  form: UseFormReturn<ProvisioningCreateTokenFormValues>;
  rules: ProvisioningCreateTokenFormRules;
  customMessages?: Partial<ProvisioningCreateTokenFormMessages>;
}
