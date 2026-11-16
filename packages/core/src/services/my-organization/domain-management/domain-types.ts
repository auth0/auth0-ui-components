/**
 * Domain management type definitions.
 * @module domain-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';
import type { InternalDomainCreateFormValues } from '@core/schemas/my-organization/domain-management/domain-create-schema';

export type GetOrganizationDomainResponseContent =
  MyOrganization.GetOrganizationDomainResponseContent;
export type CreateOrganizationDomainResponseContent =
  MyOrganization.CreateOrganizationDomainResponseContent;
export type CreateOrganizationDomainRequestContent =
  MyOrganization.CreateOrganizationDomainRequestContent;

export type CreateDomainRequestContentPrivate = InternalDomainCreateFormValues;

export type DomainStatus = MyOrganization.OrgDomainStatusEnum;

export type DomainCreate = MyOrganization.CreateOrganizationDomainRequestContent;

export type Domain = MyOrganization.OrgDomain;
