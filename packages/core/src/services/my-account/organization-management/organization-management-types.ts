/**
 * My Account organization type definitions.
 * @module organization-management-types
 */

import type { MyAccount } from '@auth0/myaccount-js';

/** An organization the authenticated user belongs to. */
export type UserOrganization = MyAccount.Organization;

export type ListUserOrganizationsRequest = MyAccount.ListOrganizationsRequestParameters;

export type ListUserOrganizationsResponse = MyAccount.ListOrganizationsResponseContent;

export type CreateUserOrganizationRequest = MyAccount.CreateOrganizationRequestContent;

export type CreateUserOrganizationResponse = MyAccount.CreateOrganizationResponseContent;
