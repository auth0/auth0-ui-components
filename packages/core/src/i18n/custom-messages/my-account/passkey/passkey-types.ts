/**
 * Custom message type definitions.
 * @module passkey-types
 * @internal
 */

export interface PasskeyRevokeModalMessages {
  title?: string;
  consent?: string;
  cancel?: string;
  confirm?: string;
}

export interface PasskeyMessages {
  header?: {
    title?: string;
    description?: string;
  };
  section_title?: string;
  enabled?: string;
  created_at?: string;
  no_passkeys?: string;
  add_passkey?: string;
  actions?: {
    revoke?: string;
  };
  success?: {
    add?: string;
    revoke?: string;
  };
  component_error_title?: string;
  component_error_description?: string;
  modals?: {
    revoke?: PasskeyRevokeModalMessages;
  };
}
