/**
 * Organization details edit hook.
 * @module use-organization-details-edit
 */

import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  UseOrganizationDetailsEditOptions,
  UseOrganizationDetailsEditResult,
} from '@/types/my-organization/organization-management/organization-details-edit-types';
import type { OrganizationDetailsFormActions } from '@/types/my-organization/organization-management/organization-details-types';

const organizationDetailsQueryKeys = {
  all: ['organization-details'] as const,
  details: () => [...organizationDetailsQueryKeys.all, 'details'] as const,
};

const EMPTY_ORGANIZATION = OrganizationDetailsFactory.create();

/**
 * Hook for fetching and updating organization details.
 * @param props - Component props.
 * @param props.saveAction - Configuration for the save action
 * @param props.cancelAction - Configuration for the cancel action
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns Hook state and methods
 */
export function useOrganizationDetailsEdit({
  saveAction,
  cancelAction,
  readOnly = false,
  customMessages = {},
}: UseOrganizationDetailsEditOptions): UseOrganizationDetailsEditResult {
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

  useEffect(() => {
    if (organizationQuery.error) {
      handleError(organizationQuery.error, {
        fallbackMessage: t('organization_changes_error_message_generic'),
      });
    }
  }, [organizationQuery.error, t, handleError]);

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

  const hasData = !!organizationQuery.data;
  const isActionDisabled = updateMutation.isPending || isInitializing;

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

  const formActions = useMemo(
    (): OrganizationDetailsFormActions => ({
      isLoading: updateMutation.isPending,
      previousAction: {
        disabled: cancelAction?.disabled || readOnly || !hasData || isActionDisabled,
        onClick: () => cancelAction?.onAfter?.(organization),
      },
      nextAction: {
        disabled: saveAction?.disabled || readOnly || !hasData || isActionDisabled,
        onClick: updateOrgDetails,
      },
    }),
    [
      updateOrgDetails,
      readOnly,
      cancelAction,
      saveAction?.disabled,
      hasData,
      isActionDisabled,
      organization,
    ],
  );

  return {
    organization,
    isFetchLoading: organizationQuery.isFetching,
    isSaveLoading: updateMutation.isPending,
    isInitializing,
    formActions,
    fetchOrgDetails,
    updateOrgDetails,
  };
}
