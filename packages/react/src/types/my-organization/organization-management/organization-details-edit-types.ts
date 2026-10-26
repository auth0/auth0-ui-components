/**
 * Organization details edit types.
 * @module organization-details-edit-types
 */

import type {
  BlockComponentSharedProps,
  OrganizationDetailsSchemas,
  OrganizationDetailsPermissions,
  ComponentAction,
  BackButton,
  OrganizationPrivate,
  OrganizationDetailsEditMessages,
  ComponentStyling,
} from '@auth0/universal-components-core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

import type {
  OrganizationDeleteAction,
  OrganizationDeleteClasses,
  OrganizationDeleteSectionProps,
} from '@/types/my-organization/organization-management/organization-delete-types';
import type {
  OrganizationDetailsClasses,
  OrganizationDetailsFormActions,
} from '@/types/my-organization/organization-management/organization-details-types';

/** Type alias for organization edit CSS class overrides. */
export type OrganizationEditClasses = OrganizationDetailsClasses & OrganizationDeleteClasses;

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
  /**
   * Lifecycle hooks for deleting the organization. When provided, a delete section is
   * rendered below the details form. Deletion invalidates the organization-scoped token,
   * so use `onAfter` to redirect the user.
   */
  deleteAction?: OrganizationDeleteAction;
}
export interface UseOrganizationDetailsEditOptions {
  saveAction?: OrganizationDetailsEditProps['saveAction'];
  cancelAction?: OrganizationDetailsEditProps['cancelAction'];
  readOnly?: OrganizationDetailsEditProps['readOnly'];
  customMessages?: OrganizationDetailsEditProps['customMessages'];
}

export type UseOrganizationDetailsEditServiceOptions = Pick<
  UseOrganizationDetailsEditOptions,
  'saveAction' | 'customMessages'
>;

export interface UseOrganizationDetailsEditResult {
  permissions: OrganizationDetailsPermissions;
  canEdit: boolean;
  organization: OrganizationPrivate;
  isFetchLoading: boolean;
  isSaveLoading: boolean;
  isInitializing: boolean;
  isLoadingConfig: boolean;
  formActions: OrganizationDetailsFormActions;
  fetchOrgDetails: () => Promise<void>;
  updateOrgDetails: (data: OrganizationPrivate) => Promise<boolean>;
  showThirdPartyAccess: boolean;
  isThirdPartyAccessReadOnly: boolean;
  thirdPartyAccessDefaultValue: 'allow' | 'block' | undefined;
}

export interface OrganizationDetailsEditViewProps {
  organization: OrganizationPrivate;
  schema: Partial<OrganizationDetailsEditSchemas> | undefined;
  styling: ComponentStyling<OrganizationDetailsClasses>;
  customMessages: OrganizationDetailsEditProps['customMessages'];
  canEdit: boolean;
  hideHeader: boolean;
  backButton?: OrganizationEditBackButton;
  formActions: OrganizationDetailsFormActions;
  showThirdPartyAccess: boolean;
  isThirdPartyAccessReadOnly: boolean;
  thirdPartyAccessDefaultValue: 'allow' | 'block' | undefined;
  /** Delete section props; the section is hidden when undefined. */
  deleteSection?: Omit<OrganizationDeleteSectionProps, 'styling'>;
}
