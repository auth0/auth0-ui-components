import type {
  Organization,
  SharedComponentProps,
  OrgDeleteMessages,
} from '@auth0-web-ui-components/core';

/**
 * Styling that can be used to override default styles.
 */
export interface OrgDeleteClasses {
  OrgDelete_card?: string;
  OrgDelete_button?: string;
  OrgDelete_modal?: string;
}

export interface OrgDeleteProps extends SharedComponentProps<OrgDeleteMessages, OrgDeleteClasses> {
  onDelete: (id: string) => void | Promise<void>;
  isLoading?: boolean;
  organization: Organization;
}

export interface OrgDeleteModalProps
  extends SharedComponentProps<OrgDeleteMessages, OrgDeleteClasses> {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}
