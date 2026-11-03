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
  /** ID of the organization the user is signed in to (the token's `org_id`). */
  currentOrganizationId?: string;
  /** Name shown on the trigger until the current organization loads, e.g. the token's `org_name`. */
  currentOrganizationName?: string;
  /** Called with the organization to switch to. The host app signs in to it (see the example). */
  onSwitchOrganization: (organization: UserOrganization) => void;
  /** Shows a "Create Organization" item that calls this. */
  onCreateOrganization?: () => void;
  /** Number of organizations to load. Defaults to 10. */
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
  refetch: () => void;
}

export interface UseOrganizationSwitcherOptions {
  currentOrganizationId?: OrganizationSwitcherProps['currentOrganizationId'];
  currentOrganizationName?: OrganizationSwitcherProps['currentOrganizationName'];
  hasCreateAction?: boolean;
  onSwitchOrganization: OrganizationSwitcherProps['onSwitchOrganization'];
  pageSize?: OrganizationSwitcherProps['pageSize'];
}

export interface UseOrganizationSwitcherResult extends UseOrganizationSwitcherServiceResult {
  /** Name for the trigger: the loaded organization's, else the name passed in. */
  currentName: string | undefined;
  /** Whether to show the error state: a failed first load, or a retry in flight. */
  hasFailed: boolean;
  /** Whether the switcher renders nothing: still loading, or nothing to switch to or create. */
  isHidden: boolean;
  /** Switches to the organization with the given ID; ignores the current one. */
  handleSelect: (organizationId: string) => void;
}

export interface OrganizationSwitcherViewProps {
  organizationSwitcher: UseOrganizationSwitcherResult;
  currentOrganizationId?: string;
  styling: ComponentStyling<OrganizationSwitcherClasses>;
  customMessages: OrganizationSwitcherProps['customMessages'];
  readOnly: boolean;
  onCreateOrganization?: OrganizationSwitcherProps['onCreateOrganization'];
}
