/**
 * Organization switcher types.
 * @module organization-switcher-types
 */

import type {
  ComponentStyling,
  OrganizationSwitcherMessages,
  SharedComponentProps,
  UserOrganization,
} from '@auth0/universal-components-core';

/** CSS classes for OrganizationSwitcher. */
export interface OrganizationSwitcherClasses {
  'OrganizationSwitcher-trigger'?: string;
  'OrganizationSwitcher-content'?: string;
}

/** Props for the OrganizationSwitcher block component. */
export interface OrganizationSwitcherProps
  extends SharedComponentProps<OrganizationSwitcherMessages, OrganizationSwitcherClasses> {
  /**
   * ID of the organization the user is currently signed in to (the token's `org_id`).
   * It is shown on the trigger and marked as selected in the list.
   */
  currentOrganizationId?: string;
  /**
   * Name to show on the trigger while the current organization is not in a loaded page of
   * the list (for example when loading fails), e.g. the token's `org_name`. Once the
   * organization is loaded, its display name is shown instead.
   */
  currentOrganizationName?: string;
  /**
   * Called when the user selects a different organization. Switching requires a new
   * organization-scoped token, so the host app performs it, e.g.
   * `loginWithRedirect({ authorizationParams: { organization: org.id } })`.
   * Clear the SDK's cached tokens first (with the Auth0 React SDK, `logout({ openUrl: false })`):
   * it caches by audience and scope, not by organization, so otherwise the previous
   * organization's tokens are reused and the new organization's data does not load.
   */
  onSwitchOrganization: (organization: UserOrganization) => void;
  /**
   * Shows a "Create Organization" item at the bottom of the menu that calls this,
   * e.g. to open OrganizationCreate or navigate to a create page. Hidden when not provided.
   * It also keeps the switcher visible when the user belongs to only one organization.
   */
  onCreateOrganization?: () => void;
  /** Number of organizations loaded per page. Defaults to 10. */
  pageSize?: number;
}

export interface UseOrganizationSwitcherServiceOptions {
  pageSize: number;
}

export interface UseOrganizationSwitcherServiceResult {
  organizations: UserOrganization[];
  isLoading: boolean;
  isError: boolean;
  /** Whether a retry is in flight after the first load failed. */
  isRetrying: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export interface UseOrganizationSwitcherOptions {
  currentOrganizationId?: OrganizationSwitcherProps['currentOrganizationId'];
  onSwitchOrganization: OrganizationSwitcherProps['onSwitchOrganization'];
  pageSize?: OrganizationSwitcherProps['pageSize'];
}

export interface UseOrganizationSwitcherResult extends UseOrganizationSwitcherServiceResult {
  /** The current organization, once it appears in a loaded page. */
  currentOrganization: UserOrganization | undefined;
  /** Switches to the organization with the given ID; ignores the current one. */
  handleSelect: (organizationId: string) => void;
}

export interface OrganizationSwitcherViewProps {
  organizationSwitcher: UseOrganizationSwitcherResult;
  currentOrganizationId?: string;
  currentOrganizationName?: string;
  styling: ComponentStyling<OrganizationSwitcherClasses>;
  customMessages: OrganizationSwitcherProps['customMessages'];
  readOnly: boolean;
  onCreateOrganization?: OrganizationSwitcherProps['onCreateOrganization'];
}
