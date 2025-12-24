import type { MyOrganization } from '@auth0/myorganization-js';
import type { InternalOrganizationDetailsFormValues as FormValues } from '@core/schemas';

// Get Organization Details
export type GetOrganizationDetailsResponseContent =
  MyOrganization.GetOrganizationDetailsResponseContent;

// Update Organization Details
export type UpdateOrganizationDetailsRequestContent =
  MyOrganization.UpdateOrganizationDetailsRequestContent;
export type UpdateOrganizationDetailsResponseContent =
  MyOrganization.UpdateOrganizationDetailsResponseContent;

export interface OrganizationPrivate extends OrganizationDetailsFormValues {
  id?: string;
  name?: string;
}

export interface Organization extends OrganizationPrivate {
  id: string;
  name: string;
}

export type OrganizationDetailsFormValues = FormValues;
