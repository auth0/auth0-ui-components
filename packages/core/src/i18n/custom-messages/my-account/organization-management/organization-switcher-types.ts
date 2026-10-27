/**
 * Custom message type definitions for organization switcher component.
 * @module organization-switcher-types
 * @internal
 */
import type { SharedMessages } from '../../shared/shared-types';

export interface OrganizationSwitcherMessages extends SharedMessages {
  /** Trigger text when the current organization is unknown or not loaded. */
  trigger_placeholder?: string;
  /** Accessible label for the trigger. Supports `${organizationName}`. */
  trigger_label?: string;
  /** Accessible label for the organization menu. */
  menu_label?: string;
  /** Shown when the organizations could not be loaded. */
  error_message?: string;
  /** Menu item that retries loading after an error. */
  retry_button_text?: string;
  /** Menu item that loads the next page of organizations. */
  load_more_button_text?: string;
  /** Menu item shown when `onCreateOrganization` is provided. */
  create_button_text?: string;
}
