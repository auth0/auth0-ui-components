/**
 * Internal organization create service hook.
 * Creates an organization for the authenticated user (My Account API).
 * @module use-organization-create-service
 * @internal
 */

import {
  getStatusCode,
  userOrganizationQueryKeys,
  UserOrganizationMappers,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  UseOrganizationCreateServiceOptions,
  UseOrganizationCreateServiceResult,
} from '@/types/my-account/organization-management/organization-create-types';

/**
 * Internal service hook for the create organization mutation.
 * @param options - Service hook options.
 * @param options.createAction - Lifecycle hooks for the create operation
 * @param options.customMessages - Custom translation messages to override defaults
 * @returns Mutation state and the create handler.
 * @internal
 */
export function useOrganizationCreateService({
  createAction,
  customMessages = {},
}: UseOrganizationCreateServiceOptions): UseOrganizationCreateServiceResult {
  const { t } = useTranslator('organization_management.organization_create', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

  const createMutation = useMutation({
    mutationFn: (values: OrganizationPrivate) =>
      coreClient!
        .getMyAccountApiClient()
        .organizations.create(UserOrganizationMappers.createToAPI(values)),
    // Create is not idempotent, and its per-user rate limit is as low as one per minute.
    retry: false,
    onSuccess: async (created, values) => {
      showToast({
        type: 'success',
        message: t('notifications.success', {
          organizationName: created.display_name || created.name,
        }),
      });

      // Refresh every organization list (table pages and the switcher).
      await queryClient.invalidateQueries({ queryKey: userOrganizationQueryKeys.all });

      await createAction?.onAfter?.(values, created);
    },
    onError: (error, values) => {
      if (getStatusCode(error) === 409) {
        showToast({
          type: 'error',
          message: t('notifications.conflict_error', { organizationName: values.name }),
        });
        return;
      }

      handleError(error, { fallbackMessage: t('notifications.general_error') });
    },
  });

  const createOrganization = useCallback(
    async (values: OrganizationPrivate): Promise<boolean> => {
      if (createAction?.onBefore && !createAction.onBefore(values)) {
        return false;
      }

      try {
        await createMutation.mutateAsync(values);
        return true;
      } catch {
        return false;
      }
    },
    [createAction, createMutation],
  );

  return {
    isCreating: isMutationLoading(createMutation),
    createOrganization,
  };
}
