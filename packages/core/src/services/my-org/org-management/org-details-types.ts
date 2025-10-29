import type { InternalOrganizationDetailsFormValues as FormValues } from '@core/schemas';
import type { Auth0MyOrg } from 'auth0-myorg-sdk';

// Get Organization Details
export type GetOrganizationDetailsResponseContent =
  Auth0MyOrg.GetOrganizationDetailsResponseContent;

// Update Organization Details
export type UpdateOrganizationDetailsRequestContent =
  Auth0MyOrg.UpdateOrganizationDetailsRequestContent;
export type UpdateOrganizationDetailsResponseContent =
  Auth0MyOrg.UpdateOrganizationDetailsResponseContent;

export interface OrganizationPrivate extends OrganizationDetailsFormValues {
  id?: string;
  name?: string;
}

export interface Organization extends OrganizationPrivate {
  id: string;
  name: string;
}

export type OrganizationDetailsFormValues = FormValues;
