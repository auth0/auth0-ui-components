/**
 * Organization details type definitions.
 * @module organization-details-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';
import type { InternalOrganizationDetailsFormValues as FormValues } from '@core/schemas/my-organization/organization-management/organization-details-schema';

// Get Organization Details
export type GetOrganizationDetailsResponseContent =
  MyOrganization.GetOrganizationDetailsResponseContent;

// Update Organization Details
export type UpdateOrganizationDetailsRequestContent =
  MyOrganization.UpdateOrganizationDetailsRequestContent;
export type UpdateOrganizationDetailsResponseContent =
  MyOrganization.UpdateOrganizationDetailsResponseContent;

/**
 * Hybrid form + API type. The SDK exports `OrgDetails` (with optional id/name),
 * but this extends form values — not a pure API response shape.
 * @internal
 */
export interface OrganizationPrivate extends OrganizationDetailsFormValues {
  id?: string;
  name?: string;
}

/**
 * Organization with required id/name. Extends `OrganizationPrivate`.
 * Not a direct SDK type — uses form values as base.
 * @internal
 */
export interface Organization extends OrganizationPrivate {
  id: string;
  name: string;
}

export type OrganizationDetailsFormValues = FormValues;
