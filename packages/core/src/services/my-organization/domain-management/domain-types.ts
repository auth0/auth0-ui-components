/**
 * Domain management type definitions.
 * @module domain-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';
import type { InternalDomainCreateFormValues } from '@core/schemas';

export type Domain = MyOrganization.OrgDomain;
export type CreateOrganizationDomainRequestContent =
  MyOrganization.CreateOrganizationDomainRequestContent;
export type CreateDomainRequestContentPrivate = InternalDomainCreateFormValues;
