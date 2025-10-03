import type { MyOrgClient } from 'auth0-myorg-sdk';

import type { OrganizationPrivate } from '../../../services';

import { OrgDetailsMappers } from './org-details-mappers';

export interface OrganizationDetailsControllerInterface {
  get(): Promise<OrganizationPrivate>;
  update(data: OrganizationPrivate): Promise<OrganizationPrivate>;
}

const OrganizationDetailsUtils = {
  /**
   * Fetches organization details.
   */
  async get(myOrgClient: MyOrgClient): Promise<OrganizationPrivate> {
    const response = await myOrgClient.organizationDetails.get();
    return OrgDetailsMappers.fromAPI(response);
  },

  /**
   * Updates organization details.
   */
  async update(
    myOrgClient: MyOrgClient,
    formData: OrganizationPrivate,
  ): Promise<OrganizationPrivate> {
    const updateData = OrgDetailsMappers.toAPI(formData);
    const response = await myOrgClient.organizationDetails.update(updateData);
    return OrgDetailsMappers.fromAPI(response);
  },
};

/**
 * Creates an organization controller instance.
 */
export function createOrganizationDetailsController(
  myOrgClient: MyOrgClient,
): OrganizationDetailsControllerInterface {
  return {
    get: () => OrganizationDetailsUtils.get(myOrgClient),
    update: (data) => OrganizationDetailsUtils.update(myOrgClient, data),
  };
}
