/**
 * Custom message type definitions for provisioning manage token component.
 * @module provisioning-manage-token-types
 * @internal
 */
export interface ProvisioningManageTokenMessages {
  title?: string;
  description?: string;
  generate_button_label?: string;
  empty_state?: {
    title?: string;
    description?: string;
  };
  table?: {
    token_id_label?: string;
    created_label?: string;
    expires_label?: string;
    actions_label?: string;
  };
  create_modal?: {
    title?: string;
  };
  delete_modal?: {
    title?: string;
    cancel_button_label?: string;
    delete_button_label?: string;
  };
}
