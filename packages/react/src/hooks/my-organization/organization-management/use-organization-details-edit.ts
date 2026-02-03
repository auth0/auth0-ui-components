import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { showToast } from '../../../components/ui/toast';
import type {
  OrganizationDetailsFormActions,
  UseOrganizationDetailsEditOptions,
  UseOrganizationDetailsEditResult,
} from '../../../types/my-organization/organization-management';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

const organizationDetailsQueryKeys = {
  all: ['organization-details'] as const,
  details: () => [...organizationDetailsQueryKeys.all, 'details'] as const,
};

const EMPTY_ORGANIZATION = OrganizationDetailsFactory.create();

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

  const getErrorMessage = useCallback(
    (error: unknown): string =>
      error instanceof Error
        ? t('organization_changes_error_message', { message: error.message })
        : t('organization_changes_error_message_generic'),
    [t],
  );

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
      showToast({
        type: 'error',
        message: getErrorMessage(organizationQuery.error),
      });
    }
  }, [organizationQuery.error, getErrorMessage]);

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
      showToast({
        type: 'error',
        message: getErrorMessage(error),
      });
    },
  });

  const hasData = !!organizationQuery.data;
  const isActionDisabled = updateMutation.isPending || isInitializing;

  const fetchOrgDetails = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: organizationDetailsQueryKeys.details() });
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
