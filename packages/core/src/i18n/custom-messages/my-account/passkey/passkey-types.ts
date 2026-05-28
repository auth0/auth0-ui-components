/**
 * Custom message type definitions.
 * @module passkey-types
 * @internal
 */

/**
 * Interface for passkey messages that can be used in the UI.
 */
export interface PasskeyRenameModalMessages {
  title?: string;
  label?: string;
  placeholder?: string;
  cancel?: string;
  update?: string;
}

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
  last_used?: string;
  no_passkeys?: string;
  add_passkey?: string;
  actions?: {
    rename?: string;
    revoke?: string;
  };
  success?: {
    add?: string;
    rename?: string;
    revoke?: string;
  };
  modals?: {
    rename?: PasskeyRenameModalMessages;
    revoke?: PasskeyRevokeModalMessages;
  };
}
