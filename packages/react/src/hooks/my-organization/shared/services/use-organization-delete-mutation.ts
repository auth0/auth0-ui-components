/**
 * Internal organization delete mutation, shared by OrganizationDetailsEdit and OrganizationTable.
 * @module use-organization-delete-mutation
 * @internal
 */

import {
  configQueryKeys,
  ERROR_CODES,
  hasApiErrorBody,
  organizationDetailsQueryKeys,
} from '@auth0/universal-components-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  UseOrganizationDeleteMutationOptions,
  UseOrganizationDeleteMutationResult,
} from '@/types/my-organization/organization-management/organization-delete-types';

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
 * Internal delete mutation for the organization the session belongs to.
 * @param options - Mutation options.
 * @param options.item - What `deleteAction` receives; nothing is deleted while it is null
 * @param options.organizationName - Name used in the notifications
 * @param options.deleteAction - Lifecycle hooks for the delete operation
 * @param options.customMessages - Custom translation messages to override defaults
 * @param options.onDeleted - Called after a successful delete, before `deleteAction.onAfter`
 * @param options.componentName - Component name used in console messages
 * @returns The delete handler and its loading state.
 * @internal
 */
export function useOrganizationDeleteMutation<TItem>({
  item,
  organizationName,
  deleteAction,
  customMessages = {},
  onDeleted,
  componentName,
}: UseOrganizationDeleteMutationOptions<TItem>): UseOrganizationDeleteMutationResult {
  const { t } = useTranslator('organization_management.organization_delete', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

  const deleteMutation = useMutation({
    mutationFn: () => coreClient!.getMyOrganizationApiClient().organization.delete(),
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
      onDeleted?.();

      try {
        if (item !== null) await deleteAction?.onAfter?.(item);
      } catch (error) {
        // The organization is already deleted, so a failing callback must not turn that into a failure.
        console.error(`${componentName}: deleteAction.onAfter failed`, error);
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
    if (item === null) return false;
    if (deleteAction?.onBefore && !deleteAction.onBefore(item)) {
      return false;
    }

    try {
      await deleteMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [deleteAction, deleteMutation, item]);

  return {
    deleteOrganization,
    isDeleteLoading: isMutationLoading(deleteMutation),
  };
}
