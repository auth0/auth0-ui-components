/**
 * Internal organization details edit service hook.
 * Handles data fetching, mutations, and cache management.
 * @module use-organization-details-edit-service
 * @internal
 */

import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  organizationDetailsQueryKeys,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useQueryErrorToast } from '@/hooks/shared/use-query-error-toast';
import { useTranslator } from '@/hooks/shared/use-translator';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type { UseOrganizationDetailsEditServiceOptions } from '@/types/my-organization/organization-management/organization-details-edit-types';

const EMPTY_ORGANIZATION = OrganizationDetailsFactory.create();

/**
 * Internal service hook for organization details edit API operations.
 * @param options - Service hook options.
 * @returns Service state and methods.
 * @internal
 */
export function useOrganizationDetailsEditService({
  saveAction,
  customMessages = {},
}: UseOrganizationDetailsEditServiceOptions) {
  const { t } = useTranslator('organization_management.organization_details_edit', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const isInitializing = !coreClient;
  const handleError = useErrorHandler();

  const organizationQuery = useQuery({
    queryKey: organizationDetailsQueryKeys.details(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  useQueryErrorToast(organizationQuery, t('organization_changes_error_message_generic'));

  const organization = organizationQuery.data ?? EMPTY_ORGANIZATION;

  const updateMutation = useMutation({
    mutationFn: async (data: OrganizationPrivate) => {
      const updateData = OrganizationDetailsMappers.toAPI(data);
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organizationDetails.update(updateData);

      return OrganizationDetailsMappers.fromAPI(response);
    },
    onSuccess: (updatedOrg, variables) => {
      queryClient.setQueryData(organizationDetailsQueryKeys.details(), updatedOrg);

      showToast({
        type: 'success',
        message: t('save_organization_changes_message', {
          organizationName: variables.display_name || variables.name,
        }),
      });

      saveAction?.onAfter?.(variables);
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('organization_changes_error_message_generic') });
    },
  });

  const fetchOrgDetails = useCallback(async (): Promise<void> => {
    await queryClient.getQueryData(organizationDetailsQueryKeys.details());
  }, [queryClient]);

  const updateOrgDetails = useCallback(
    async (data: OrganizationPrivate): Promise<boolean> => {
      if (saveAction?.onBefore && !saveAction.onBefore(data)) {
        return false;
      }

      try {
        await updateMutation.mutateAsync(data);
        return true;
      } catch {
        return false;
      }
    },
    [updateMutation, saveAction],
  );

  return {
    organization,
    isFetchLoading: organizationQuery.isLoading,
    isSaveLoading: isMutationLoading(updateMutation),
    isInitializing,
    fetchOrgDetails,
    updateOrgDetails,
  };
}
