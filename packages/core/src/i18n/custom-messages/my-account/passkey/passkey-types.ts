/**
 * Custom message type definitions.
 * @module passkey-types
 * @internal
 */

/**
 * Interface for passkey rename dialog messages.
 */
export interface PasskeyRenameDialogMessages {
  title?: string;
  label?: string;
  placeholder?: string;
  cancel?: string;
  update?: string;
}

/**
 * Interface for passkey revoke dialog messages.
 */
export interface PasskeyRevokeDialogMessages {
  title?: string;
  consent?: string;
  cancel?: string;
  confirm?: string;
}

/**
 * Interface for passkey messages that can be used in the UI.
 */
export interface PasskeyMessages {
  title?: string;
  description?: string;
  section_title?: string;
  enabled?: string;
  add_passkey?: string;
  created_at?: string;
  no_passkeys?: string;
  actions?: string;
  rename?: string;
  revoke?: string;
  add_success?: string;
  rename_success?: string;
  revoke_success?: string;
  component_error_title?: string;
  component_error_description?: string;
  rename_dialog?: PasskeyRenameDialogMessages;
  revoke_dialog?: PasskeyRevokeDialogMessages;
}
