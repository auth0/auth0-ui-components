/**
 * Custom message type definitions.
 * @module domain-configure-types
 * @internal
 */

import type { SharedMessages } from '../../shared/shared-types';

export interface DomainConfigureMessages extends SharedMessages {
  title?: string;
  description?: string;
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
  };
}
