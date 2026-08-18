/**
 * Organization details edit hook.
 * Single public hook that consumes the internal service hook.
 * @module use-organization-details-edit
 */

import { getOrganizationManagementPermissions } from '@auth0/universal-components-core';
import { useMemo } from 'react';

import { useOrganizationDetailsEditService } from '@/hooks/my-organization/shared/services/use-organization-details-edit-service';
import { usePermissions } from '@/hooks/my-organization/use-permissions';
import type {
  UseOrganizationDetailsEditOptions,
  UseOrganizationDetailsEditResult,
} from '@/types/my-organization/organization-management/organization-details-edit-types';
import type { OrganizationDetailsFormActions } from '@/types/my-organization/organization-management/organization-details-types';

/**
 * Hook for fetching and updating organization details.
 * Manages UI state and delegates data operations to the internal service hook.
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
  const service = useOrganizationDetailsEditService({ saveAction, customMessages });
  const { createPermissionResolver } = usePermissions();

  const permissions = useMemo(
    () => createPermissionResolver(getOrganizationManagementPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );

  const isReadOnly = !permissions.canUpdateDetails;

  const hasData = !!service.organization.name;
  const isActionDisabled = service.isSaveLoading || service.isInitializing;

  const formActions = useMemo(
    (): OrganizationDetailsFormActions => ({
      isLoading: service.isSaveLoading,
      previousAction: {
        disabled: cancelAction?.disabled || isReadOnly || !hasData || isActionDisabled,
        onClick: () => cancelAction?.onAfter?.(service.organization),
      },
      nextAction: {
        disabled: saveAction?.disabled || isReadOnly || !hasData || isActionDisabled,
        onClick: service.updateOrgDetails,
      },
    }),
    [
      service.updateOrgDetails,
      service.isSaveLoading,
      service.organization,
      isReadOnly,
      cancelAction,
      saveAction?.disabled,
      hasData,
      isActionDisabled,
    ],
  );

  return {
    permissions,
    isReadOnly,
    organization: service.organization,
    isFetchLoading: service.isFetchLoading,
    isSaveLoading: service.isSaveLoading,
    isInitializing: service.isInitializing,
    formActions,
    fetchOrgDetails: service.fetchOrgDetails,
    updateOrgDetails: service.updateOrgDetails,
  };
}
