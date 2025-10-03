import type { Organization, SharedComponentProps } from '@auth0-web-ui-components/core';

/* ============ Components ============ */

/**
 * Messages that can be used in the UI.
 */
export interface OrgDeleteMessages {
  title?: string;
  description?: string;
  delete_button_label?: string;
  modal_title?: string;
  modal_description?: string;
  org_name_field_placeholder?: string;
  org_name_field_label?: string;
}

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
