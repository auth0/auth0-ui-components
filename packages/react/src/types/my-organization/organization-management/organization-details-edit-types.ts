import type {
  BlockComponentSharedProps,
  OrganizationDetailsSchemas,
  ComponentAction,
  BackButton,
  OrganizationPrivate,
  OrganizationDetailsEditMessages,
} from '@auth0/universal-components-core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

import type {
  OrganizationDetailsClasses,
  OrganizationDetailsFormActions,
} from './organization-details-types';

// Re-export imported types for convenience
export type {
  OrganizationDetailsClasses,
  OrganizationDetailsFormActions,
} from './organization-details-types';

export type OrganizationEditClasses = OrganizationDetailsClasses;

/**
 * Schemas that can be used to override default schemas.
 */
export type OrganizationDetailsEditSchemas = {
  details?: OrganizationDetailsSchemas;
};

export interface OrganizationEditSaveAction extends ComponentAction<OrganizationPrivate> {}

export interface OrganizationEditBackButton extends Omit<BackButton, 'onClick'> {
  icon?: LucideIcon;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface OrganizationDetailsEditProps
  extends BlockComponentSharedProps<
    OrganizationDetailsEditMessages,
    OrganizationEditClasses,
    OrganizationDetailsEditSchemas
  > {
  saveAction?: ComponentAction<OrganizationPrivate>;
  cancelAction?: Omit<ComponentAction<OrganizationPrivate>, 'onBefore'>;
  hideHeader?: boolean;
  backButton?: OrganizationEditBackButton;
}
export interface UseOrganizationDetailsEditOptions {
  saveAction?: OrganizationDetailsEditProps['saveAction'];
  cancelAction?: OrganizationDetailsEditProps['cancelAction'];
  readOnly?: OrganizationDetailsEditProps['readOnly'];
  customMessages?: OrganizationDetailsEditProps['customMessages'];
}

export interface UseOrganizationDetailsEditResult {
  organization: OrganizationPrivate;
  isFetchLoading: boolean;
  isSaveLoading: boolean;
  isInitializing: boolean;
  formActions: OrganizationDetailsFormActions;
  fetchOrgDetails: () => Promise<void>;
  updateOrgDetails: (data: OrganizationPrivate) => Promise<boolean>;
}
