/**
 * Organization create types.
 * @module organization-create-types
 */

import type {
  BlockComponentSharedProps,
  ComponentAction,
  ComponentStyling,
  OrganizationCreateMessages,
  OrganizationDetailsSchemas,
  OrganizationPrivate,
  UserOrganization,
} from '@auth0/universal-components-core';

import type { OrganizationEditBackButton } from '@/types/my-organization/organization-management/organization-details-edit-types';
import type {
  OrganizationDetailsClasses,
  OrganizationDetailsFormActions,
} from '@/types/my-organization/organization-management/organization-details-types';

/** CSS classes for OrganizationCreate. */
export type OrganizationCreateClasses = OrganizationDetailsClasses & {
  'OrganizationCreate-header'?: string;
};

/** Schemas that can be used to override default form validation. */
export type OrganizationCreateSchemas = {
  details?: OrganizationDetailsSchemas;
};

/**
 * Lifecycle hooks for creating an organization.
 * `onBefore` receives the form values; `onAfter` receives the form values and the
 * created organization (e.g. to navigate to the list or switch to the new organization).
 */
export interface OrganizationCreateAction
  extends ComponentAction<OrganizationPrivate, UserOrganization> {}

/** Props for the OrganizationCreate block component. */
export interface OrganizationCreateProps
  extends BlockComponentSharedProps<
    OrganizationCreateMessages,
    OrganizationCreateClasses,
    OrganizationCreateSchemas
  > {
  /** Lifecycle hooks for the create operation. */
  createAction?: OrganizationCreateAction;
  /** Back button configuration; hidden when not provided. */
  backButton?: OrganizationEditBackButton;
}

export interface UseOrganizationCreateOptions {
  createAction?: OrganizationCreateProps['createAction'];
  readOnly?: OrganizationCreateProps['readOnly'];
  customMessages?: OrganizationCreateProps['customMessages'];
}

export type UseOrganizationCreateServiceOptions = Pick<
  UseOrganizationCreateOptions,
  'createAction' | 'customMessages'
>;

export interface UseOrganizationCreateServiceResult {
  isCreating: boolean;
  /** Creates the organization. Resolves to `true` on success, `false` when cancelled or failed. */
  createOrganization: (values: OrganizationPrivate) => Promise<boolean>;
}

export interface UseOrganizationCreateResult extends UseOrganizationCreateServiceResult {
  /** Empty form values for a new organization. */
  organization: OrganizationPrivate;
  formActions: OrganizationDetailsFormActions;
}

export interface OrganizationCreateViewProps {
  organization: OrganizationPrivate;
  schema: OrganizationCreateProps['schema'];
  styling: ComponentStyling<OrganizationCreateClasses>;
  customMessages: OrganizationCreateProps['customMessages'];
  readOnly: boolean;
  hideHeader: boolean;
  backButton?: OrganizationEditBackButton;
  formActions: OrganizationDetailsFormActions;
}
