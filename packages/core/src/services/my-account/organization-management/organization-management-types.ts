/**
 * My Account organization type definitions.
 * @module organization-management-types
 */

import type { MyAccount } from '@auth0/myaccount-js';

/** An organization the authenticated user belongs to. */
export type UserOrganization = MyAccount.Organization;

export type ListOrganizationsRequestParameters = MyAccount.ListOrganizationsRequestParameters;

export type ListOrganizationsResponseContent = MyAccount.ListOrganizationsResponseContent;
