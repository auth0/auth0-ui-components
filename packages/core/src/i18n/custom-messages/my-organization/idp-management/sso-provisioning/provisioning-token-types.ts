/**
 * Custom message types for Provisioning Token Modal Content components
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
