/**
 * Custom message type definitions.
 * @module domain-configure-types
 * @internal
 */

import type { SharedMessages } from '../../shared/shared-types';

export interface DomainConfigureMessages extends SharedMessages {
  title?: string;
  description?: string;
  field?: {
    label?: string;
    placeholder?: string;
    helper_text?: string;
  };
  assigned_helper_text?: string;
  legacy_warning?: string;
  table?: {
    empty_message?: string;
    columns?: {
      name?: string;
      provider?: string;
    };
    actions?: {
      add_provider_button_text?: string;
      view_provider_button_text?: string;
      enable_provider_tooltip?: string;
      disable_provider_tooltip?: string;
    };
  };
  actions?: {
    close_button_text?: string;
    cancel_button_text?: string;
    save_button_text?: string;
    remove_button_text?: string;
    remove_button_aria_label?: string;
  };
}
