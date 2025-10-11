import type { OrgDetailsMessages } from './org-details-types';

export interface OrgDetailsEditMessages {
  header?: {
    title?: string;
    back_button_text?: string;
  };
  details?: OrgDetailsMessages;
  // delete?: OrgDeleteMessages; // TODO: Enable it when delete is enabled
  save_org_changes_message?: string;
  org_changes_error_message?: string;
  org_changes_error_message_generic?: string;
}
