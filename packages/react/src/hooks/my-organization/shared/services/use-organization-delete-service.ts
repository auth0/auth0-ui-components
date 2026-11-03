/**
 * Internal organization delete service hook.
 * Handles the organization fetch, the delete mutation, and cache cleanup.
 * @module use-organization-delete-service
 * @internal
 */

import {
  configQueryKeys,
  ERROR_CODES,
  hasApiErrorBody,
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  organizationDetailsQueryKeys,
} from '@auth0/universal-components-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type { UseOrganizationDeleteServiceOptions } from '@/types/my-organization/organization-management/organization-delete-types';

const EMPTY_ORGANIZATION = OrganizationDetailsFactory.create();

const ORGANIZATION_SCOPED_QUERY_KEYS = [organizationDetailsQueryKeys.all, configQueryKeys.all];

/**
 * Whether the API refused the delete because the organization still has other members
 * (`allow_if_empty` behavior), which it reports with the forbidden error type.
 * @param error - Error thrown by the delete request.
 * @returns Whether the error is the "organization not empty" rejection.
 */
const isOrganizationNotEmptyError = (error: unknown): boolean =>
  hasApiErrorBody(error) && !!error.body?.type?.includes(ERROR_CODES.FORBIDDEN);

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
  const { t } = useTranslator('organization_management.organization_delete', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

  const organizationQuery = useQuery({
    queryKey: organizationDetailsQueryKeys.details(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  const organization = organizationQuery.data ?? EMPTY_ORGANIZATION;
  const organizationName = organization.name;

  const deleteMutation = useMutation({
    mutationFn: () => coreClient!.getMyOrganizationApiClient().organization.delete(),
    // A retry can't help: a refused delete is refused again, and if the first request succeeded but
    // its reply was lost, the retry would report an error for an organization that is already gone.
    retry: false,
    onSuccess: async () => {
      showToast({
        type: 'success',
        message: t('notifications.success', { organizationName }),
      });

      // The token is no longer valid, so nothing may be requested with it. Marking the queries stale
      // (not removing them) keeps hooks that are still mounted from refetching.
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          ORGANIZATION_SCOPED_QUERY_KEYS.some(([root]) => queryKey[0] === root),
        refetchType: 'none',
      });

      try {
        await deleteAction?.onAfter?.(organization);
      } catch (error) {
        // The organization is already deleted, so a failing callback must not turn that into a failure.
        console.error('OrganizationDelete: deleteAction.onAfter failed', error);
      }
    },
    onError: (error) => {
      if (isOrganizationNotEmptyError(error)) {
        showToast({
          type: 'error',
          message: t('notifications.not_empty_error', { organizationName }),
        });
        return;
      }

      handleError(error, { fallbackMessage: t('notifications.general_error') });
    },
  });

  const deleteOrganization = useCallback(async (): Promise<boolean> => {
    if (deleteAction?.onBefore && !deleteAction.onBefore(organization)) {
      return false;
    }

    try {
      await deleteMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [deleteAction, deleteMutation, organization]);

  return {
    organization,
    isLoading: organizationQuery.isLoading,
    isDeleteLoading: isMutationLoading(deleteMutation),
    deleteOrganization,
  };
}
