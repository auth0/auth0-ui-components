/**
 * Organization details edit hook.
 * Single public hook that consumes the internal service hook.
 * @module use-organization-details-edit
 */

import { useMemo } from 'react';

import { useOrganizationDetailsEditService } from '@/hooks/my-organization/shared/services/use-organization-details-edit-service';
import type {
  UseOrganizationDetailsEditOptions,
  UseOrganizationDetailsEditResult,
} from '@/types/my-organization/organization-management/organization-details-edit-types';
import type { OrganizationDetailsFormActions } from '@/types/my-organization/organization-management/organization-details-types';

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
  const {
    organization,
    isFetchLoading,
    isSaveLoading,
    isInitializing,
    hasData,
    fetchOrgDetails,
    updateOrgDetails,
  } = useOrganizationDetailsEditService({
    saveAction,
    customMessages,
  });

  const isActionDisabled = isSaveLoading || isInitializing;

  const formActions = useMemo(
    (): OrganizationDetailsFormActions => ({
      isLoading: isSaveLoading,
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
      isSaveLoading,
      organization,
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
