import React from 'react';
import {
  OrgEditCustomMessages,
  SharedComponentProps,
  OrganizationDetailSchemaValidation,
  OrganizationDetailFormValues,
} from '@auth0-web-ui-components/core';
import { OrgDetailsClasses, OrgDetailsFormActions } from './org-details-types';
import { OrgDeleteClasses } from './org-delete-types';
import { LucideIcon } from 'lucide-react';

export interface OrgEditClasses extends OrgDetailsClasses, OrgDeleteClasses {}

export interface OrgEditSaveAction {
  disable?: boolean;
  onBefore?: (org: OrganizationDetailFormValues & { id: string }) => boolean;
  onAfter?: (org: OrganizationDetailFormValues & { id: string }) => void;
}

export interface OrgEditDeleteAction {
  disable?: boolean;
  onBefore?: (org: OrganizationDetailFormValues & { id: string }) => boolean;
  onAfter?: (org: OrganizationDetailFormValues & { id: string }) => void;
}

export interface OrgEditFormActions extends OrgDetailsFormActions {
  saveAction?: OrgEditSaveAction;
  deleteAction?: OrgEditDeleteAction;
  cancelAction?: {
    label?: string;
    onClick?: (event?: Event) => void;
  };
  showCancel?: boolean;
}

export interface OrgEditBackButton {
  text?: string;
  icon?: LucideIcon;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface OrgDetailsEditProps
  extends SharedComponentProps<
    OrgEditCustomMessages,
    OrgEditClasses,
    OrganizationDetailSchemaValidation
  > {
  isLoading?: boolean;
  formActions: OrgEditFormActions;
  readOnly?: boolean;
  hideHeader?: boolean;
  backButton?: OrgEditBackButton;
}
