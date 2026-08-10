/**
 * Custom message type definitions.
 * @module domain-delete-types
 * @internal
 */

export interface DomainDeleteMessages {
  title?: string;
  description?: {
    pending?: string;
    verified?: string;
  };
  actions?: {
    cancel_button_text?: string;
    delete_button_text?: string;
  };
}
