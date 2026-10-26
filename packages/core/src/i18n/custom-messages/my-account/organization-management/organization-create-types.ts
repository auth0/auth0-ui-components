/**
 * Custom message type definitions for organization create component.
 * @module organization-create-types
 * @internal
 */
import type { OrganizationDetailsMessages } from '../../my-organization/organization-management/organization-details-types';
import type { SharedMessages } from '../../shared/shared-types';

export interface OrganizationCreateMessages extends SharedMessages {
  header?: {
    /** Page title. */
    title?: string;
    /** Back button label. */
    back_button_text?: string;
  };
  /**
   * Messages for the organization form. Create provides its own defaults for
   * `submit_button_label` and the name / display name placeholders.
   */
  details?: OrganizationDetailsMessages;
  notifications?: {
    /** Shown after the organization is created. Supports `${organizationName}`. */
    success?: string;
    /** Shown when the name is already taken (409). Supports `${organizationName}`. */
    conflict_error?: string;
    /** Shown when creation fails for any other reason. */
    general_error?: string;
  };
}
