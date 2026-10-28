/**
 * Custom message type definitions for organization create component.
 * @module organization-create-types
 * @internal
 */
import type { OrganizationDetailsMessages } from '../../my-organization/organization-management/organization-details-types';
import type { SharedMessages } from '../../shared/shared-types';

export interface OrganizationCreateMessages extends SharedMessages {
  header?: {
    title?: string;
    back_button_text?: string;
  };
  details?: OrganizationDetailsMessages;
  notifications?: {
    success?: string;
    conflict_error?: string;
    general_error?: string;
  };
}
