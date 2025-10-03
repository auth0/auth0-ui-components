import type {
  BlockComponentSharedProps,
  OrgDetailsSchemas,
  ComponentAction,
  BackButton,
  OrganizationPrivate,
} from '@auth0-web-ui-components/core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

// TODO: Enable it when delete is enabled
// import type { OrgDeleteClasses, OrgDeleteMessages } from './org-delete-types';
import type {
  OrgDetailsClasses,
  OrgDetailsMessages,
  OrgDetailsFormActions,
} from './org-details-types';

/* ============ Components ============ */

/**
 * Messages that extends both OrgDetails and OrgDelete messages.
 */
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

/**
 * Styling that can be used to override default styles.
 */
export type OrgEditClasses = OrgDetailsClasses; // TODO: Add OrgDeleteClasses when delete is enabled

/**
 * Schemas that can be used to override default schemas.
 */
export type OrgDetailsEditSchemas = {
  details?: OrgDetailsSchemas;
};

export interface OrgEditSaveAction extends ComponentAction<OrganizationPrivate> {}

export interface OrgEditBackButton extends Omit<BackButton, 'onClick'> {
  icon?: LucideIcon;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface OrgDetailsEditProps
  extends BlockComponentSharedProps<OrgDetailsEditMessages, OrgEditClasses, OrgDetailsEditSchemas> {
  saveAction?: ComponentAction<OrganizationPrivate>;
  cancelAction?: ComponentAction<OrganizationPrivate>;
  hideHeader?: boolean;
  backButton?: OrgEditBackButton;
}

/* ============ Hooks ============ */

export interface UseOrgDetailsEditOptions {
  saveAction?: OrgDetailsEditProps['saveAction'];
  cancelAction?: OrgDetailsEditProps['cancelAction'];
  readOnly?: OrgDetailsEditProps['readOnly'];
  customMessages?: OrgDetailsEditProps['customMessages'];
}

export interface UseOrgDetailsEditResult {
  organization: OrganizationPrivate;
  isFetchLoading: boolean;
  isSaveLoading: boolean;
  isInitializing: boolean;
  formActions: OrgDetailsFormActions;
  fetchOrgDetails: () => Promise<void>;
  updateOrgDetails: (data: OrganizationPrivate) => Promise<boolean>;
}
