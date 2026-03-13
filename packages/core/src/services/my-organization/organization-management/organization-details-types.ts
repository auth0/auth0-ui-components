/**
 * Organization details type definitions.
 * @module organization-details-types
 * @internal
 */
import type { InternalOrganizationDetailsFormValues as FormValues } from '@core/schemas';

export interface OrganizationPrivate extends OrganizationDetailsFormValues {
  id?: string;
  name?: string;
}

export interface Organization extends OrganizationPrivate {
  id: string;
  name: string;
}

export type OrganizationDetailsFormValues = FormValues;
