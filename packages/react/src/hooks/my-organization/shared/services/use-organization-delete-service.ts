/**
 * Internal organization delete service hook.
 * Handles the organization fetch and the delete mutation.
 * @module use-organization-delete-service
 * @internal
 */

import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  organizationDetailsQueryKeys,
} from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';

import { useOrganizationDeleteMutation } from '@/hooks/my-organization/shared/services/use-organization-delete-mutation';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import type { UseOrganizationDeleteServiceOptions } from '@/types/my-organization/organization-management/organization-delete-types';

const EMPTY_ORGANIZATION = OrganizationDetailsFactory.create();

/**
 * Internal service hook for organization delete API operations.
 * @param options - Service hook options.
 * @returns Service state and methods.
 * @internal
 */
export function useOrganizationDeleteService({
  deleteAction,
  customMessages = {},
}: UseOrganizationDeleteServiceOptions) {
  const { coreClient } = useCoreClient();

  const organizationQuery = useQuery({
    queryKey: organizationDetailsQueryKeys.details(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  const organization = organizationQuery.data ?? EMPTY_ORGANIZATION;

  const { deleteOrganization, isDeleteLoading } = useOrganizationDeleteMutation({
    item: organization,
    organizationName: organization.name ?? '',
    deleteAction,
    customMessages,
    componentName: 'OrganizationDelete',
  });

  return {
    organization,
    isLoading: organizationQuery.isLoading,
    isDeleteLoading,
    deleteOrganization,
  };
}
