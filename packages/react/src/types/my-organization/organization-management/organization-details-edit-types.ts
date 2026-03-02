/**
 * Organization details edit types.
 * @module organization-details-edit-types
 */

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
} from '@/types/my-organization/organization-management/organization-details-types';

/** Type alias for organization edit CSS class overrides. */
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
  error: unknown;
  retry: () => Promise<void>;
  isLoading: boolean;
  isFetchLoading: boolean;
  isSaveLoading: boolean;
  formActions: OrganizationDetailsFormActions;
  updateOrgDetails: (data: OrganizationPrivate) => Promise<boolean>;
}

export interface OrganizationDetailsEditViewProps {
  organization: OrganizationPrivate;
  isLoading: boolean;
  isFetchLoading: boolean;
  isSaveLoading: boolean;
  formActions: OrganizationDetailsFormActions;
  updateOrgDetails: (data: OrganizationPrivate) => Promise<boolean>;
  schema?: OrganizationDetailsEditProps['schema'];
  customMessages: OrganizationDetailsEditProps['customMessages'];
  styling: OrganizationDetailsEditProps['styling'];
  readOnly: OrganizationDetailsEditProps['readOnly'];
  hideHeader: boolean;
  backButton?: OrganizationDetailsEditProps['backButton'];
}
