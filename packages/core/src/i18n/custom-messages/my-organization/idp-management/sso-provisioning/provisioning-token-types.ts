/**
 * Custom message type definitions for provisioning token component.
 * @module provisioning-token-types
 * @internal
 */
export interface ProvisioningCreateTokenModalContentMessages {
  description?: string;
  field?: {
    label?: string;
  };
}

export interface ProvisioningCreateTokenModalMessages {
  title?: string;
  content?: ProvisioningCreateTokenModalContentMessages;
}

export interface ProvisioningDeleteTokenModalContentMessages {
  confirmation?: string;
  description?: string;
}

export interface ProvisioningDeleteTokenModalMessages {
  title?: string;
  content?: ProvisioningDeleteTokenModalContentMessages;
}
