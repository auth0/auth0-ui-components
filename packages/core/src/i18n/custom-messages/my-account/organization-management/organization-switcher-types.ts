/**
 * Custom message type definitions for organization switcher component.
 * @module organization-switcher-types
 * @internal
 */
import type { SharedMessages } from '../../shared/shared-types';

export interface OrganizationSwitcherMessages extends SharedMessages {
  trigger_placeholder?: string;
  trigger_label?: string;
  menu_label?: string;
  error_message?: string;
  retry_button_text?: string;
  load_more_button_text?: string;
  create_button_text?: string;
}
