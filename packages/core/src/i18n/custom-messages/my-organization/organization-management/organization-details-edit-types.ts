import type { OrganizationDetailsMessages } from './organization-details-types';

export interface OrganizationDetailsEditMessages {
  header?: {
    title?: string;
    back_button_text?: string;
  };
  details?: OrganizationDetailsMessages;
  // delete?: OrganizationDeleteMessages; // TODO: Enable it when delete is enabled
  save_org_changes_message?: string;
  organization_changes_error_message?: string;
  organization_changes_error_message_generic?: string;
}
