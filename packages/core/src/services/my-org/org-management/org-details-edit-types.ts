import { OrgDeletesCustomMessages } from './org-delete-types';
import { OrgDetailsCustomMessages } from './org-details-types';

/**
 * Interface for Org Edit messages that extends both OrgDetails and OrgDelete messages.
 */
export interface OrgEditCustomMessages {
  header: {
    title: string;
    backButtonText?: string;
  };
  details: OrgDetailsCustomMessages;
  delete: OrgDeletesCustomMessages;
}
