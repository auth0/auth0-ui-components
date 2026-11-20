/**
 * Custom message type definitions.
 * @module domain-create-types
 * @internal
 */

import type { SharedMessages } from '../../shared/shared-types';

export interface DomainCreateMessages extends SharedMessages {
  title?: string;
  field?: {
    label?: string;
    placeholder?: string;
    error?: string;
  };
  use_for_discovery?: {
    label?: string;
    locked_hint?: string;
  };
  actions?: {
    cancel_button_text?: string;
    create_button_text?: string;
  };
}
