import {
  BusinessError,
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { showToast } from '../../../components/ui/toast';
import type {
  OrganizationDetailsFormActions,
  UseOrganizationDetailsEditOptions,
  UseOrganizationDetailsEditResult,
} from '../../../types/my-organization/organization-management';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

const CACHE_CONFIG = {
  ORGANIZATION_DETAILS_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  ORGANIZATION_DETAILS_GC_TIME: 10 * 60 * 1000, // 10 minutes
} as const;

export const organizationDetailsQueryKeys = {
  all: ['organization-details'] as const,
  details: () => [...organizationDetailsQueryKeys.all, 'details'] as const,
};

/**
 * Custom hook for managing organization details form logic.
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

  // ============================================
  // QUERY - Organization data managed by TanStack Query
  // ============================================

  const organizationQuery = useQuery({
    queryKey: organizationDetailsQueryKeys.details(),
    queryFn: async () => {
      try {
        const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
        return OrganizationDetailsMappers.fromAPI(response);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? t('organization_changes_error_message', { message: error.message })
            : t('organization_changes_error_message_generic');

        showToast({
          type: 'error',
          message: errorMessage,
        });

        // Return factory default instead of throwing to match original behavior
        return OrganizationDetailsFactory.create();
      }
    },
    staleTime: CACHE_CONFIG.ORGANIZATION_DETAILS_STALE_TIME,
    gcTime: CACHE_CONFIG.ORGANIZATION_DETAILS_GC_TIME,
    enabled: !!coreClient,
  });

  const organization = organizationQuery.data ?? OrganizationDetailsFactory.create();
  const isFetchLoading = organizationQuery.isLoading;

  // ============================================
  // MUTATION - Update organization
  // ============================================

  const updateMutation = useMutation({
    mutationFn: async (data: OrganizationPrivate): Promise<OrganizationPrivate> => {
      // Execute onBefore callback - throw if cancelled
      if (saveAction?.onBefore) {
        const canProceed = saveAction.onBefore(data);
        if (!canProceed) {
          throw new BusinessError({ message: 'Save cancelled by onBefore callback' });
        }
      }

      const updateData = OrganizationDetailsMappers.toAPI(data);
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organizationDetails.update(updateData);

      return OrganizationDetailsMappers.fromAPI(response);
    },

    onSuccess: (updatedOrg, originalData) => {
      // Update cache immediately
      queryClient.setQueryData(organizationDetailsQueryKeys.details(), updatedOrg);

      // Show success toast
      showToast({
        type: 'success',
        message: t('save_organization_changes_message', {
          organizationName: originalData.display_name || originalData.name,
        }),
      });

      // Execute onAfter callback
      if (saveAction?.onAfter) {
        saveAction.onAfter(originalData);
      }
    },

    onError: (error) => {
      // Don't show toast for BusinessError (onBefore cancellation)
      if (error instanceof BusinessError) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? t('organization_changes_error_message', { message: error.message })
          : t('organization_changes_error_message_generic');

      showToast({
        type: 'error',
        message: errorMessage,
      });
    },
  });

  const isSaveLoading = updateMutation.isPending;

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Fetch organization details from the API.
   */
  const fetchOrgDetails = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: organizationDetailsQueryKeys.details() });
  }, [queryClient]);

  /**
   * Update organization details in the API.
   */
  const updateOrgDetails = useCallback(
    async (data: OrganizationPrivate): Promise<boolean> => {
      if (!coreClient) {
        return false;
      }

      try {
        await updateMutation.mutateAsync(data);
        return true;
      } catch (error) {
        return false;
      }
    },
    [updateMutation, coreClient],
  );

  const formActions = useMemo(
    (): OrganizationDetailsFormActions => ({
      isLoading: isSaveLoading,
      previousAction: {
        disabled:
          cancelAction?.disabled || readOnly || !organization || isSaveLoading || isInitializing,
        onClick: () => (organization ? cancelAction?.onAfter?.(organization) : undefined),
      },
      nextAction: {
        disabled:
          saveAction?.disabled || readOnly || !organization || isSaveLoading || isInitializing,
        onClick: updateOrgDetails,
      },
    }),
    [
      updateOrgDetails,
      readOnly,
      cancelAction,
      saveAction?.disabled,
      organization,
      isSaveLoading,
      isInitializing,
    ],
  );

  return {
    organization,
    isFetchLoading,
    isSaveLoading,
    isInitializing,
    formActions,
    fetchOrgDetails,
    updateOrgDetails,
  };
}
