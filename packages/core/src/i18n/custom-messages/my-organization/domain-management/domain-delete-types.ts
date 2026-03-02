/**
 * Custom message type definitions.
 * @module domain-delete-types
 * @internal
 */

export interface DomainDeleteMessages {
  modal?: {
    title?: string;
    description?: {
      pending?: string;
      verified?: string;
    };
    actions?: {
      cancel_button_text?: string;
      create_button_text?: string;
    };
  };
}
