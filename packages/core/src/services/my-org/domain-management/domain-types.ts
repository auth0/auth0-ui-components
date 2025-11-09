import type { MyOrganization } from '@auth0/myorganization-js';
import type { InternalDomainCreateFormValues } from '@core/schemas';

export type GetOrganizationDomainResponseContent =
  MyOrganization.GetOrganizationDomainResponseContent;
export type CreateOrganizationDomainResponseContent =
  MyOrganization.CreateOrganizationDomainResponseContent;
export type CreateOrganizationDomainRequestContent =
  MyOrganization.CreateOrganizationDomainRequestContent;

export type CreateDomainRequestContentPrivate = InternalDomainCreateFormValues;

type DomainStatus = 'pending' | 'failed' | 'verified';

export interface DomainCreate {
  domain: string;
}

export interface Domain {
  id: string;
  org_id: string;
  domain: string;
  status: DomainStatus;
  verification_txt: string;
  verification_host: string;
}
