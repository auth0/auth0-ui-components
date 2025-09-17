import type {
  OrgEditCustomMessages,
  BlockComponentSharedProps,
  OrganizationDetailSchemaValidation,
  Organization,
  ComponentAction,
  BackButton,
} from '@auth0-web-ui-components/core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

import type { OrgDetailsClasses } from './org-details-types';

export interface OrgEditClasses extends OrgDetailsClasses {}

export interface OrgEditSaveAction extends ComponentAction<Organization> {}

export interface OrgEditBackButton extends Omit<BackButton, 'onClick'> {
  icon?: LucideIcon;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface OrgDetailsEditProps
  extends BlockComponentSharedProps<
    OrgEditCustomMessages,
    OrgEditClasses,
    OrganizationDetailSchemaValidation
  > {
  organizationId: string;
  saveAction?: OrgEditSaveAction;
  cancelAction?: {
    onClick?: (event?: Event) => void;
  };
  hideHeader?: boolean;
  backButton?: OrgEditBackButton;
}
