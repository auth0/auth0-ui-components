/**
 * Organization delete hook.
 * Single public hook that consumes the internal service hook.
 * @module use-organization-delete
 */

import { getOrganizationDetailsPermissions } from '@auth0/universal-components-core';
import { useCallback, useMemo } from 'react';

import { useOrganizationDeleteService } from '@/hooks/my-organization/shared/services/use-organization-delete-service';
import { usePermissions } from '@/hooks/shared/use-permissions';
import type {
  UseOrganizationDeleteOptions,
  UseOrganizationDeleteResult,
} from '@/types/my-organization/organization-management/organization-delete-types';

/**
 * Hook for deleting the current organization.
 * Resolves the delete permission and guards the delete operation.
 * @param props - Hook options.
 * @param props.deleteAction - Lifecycle hooks for the delete operation
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns Hook state and methods
 */
export function useOrganizationDelete({
  deleteAction,
  readOnly = false,
  customMessages = {},
}: UseOrganizationDeleteOptions = {}): UseOrganizationDeleteResult {
  const service = useOrganizationDeleteService({ deleteAction, customMessages });
  const { createPermissionResolver } = usePermissions();

  const permissions = useMemo(
    () => createPermissionResolver(getOrganizationDetailsPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );

  const canDelete = permissions.canDeleteOrganization && !deleteAction?.disabled;
  const permissionDenied = !readOnly && !permissions.canDeleteOrganization;

  const deleteOrganization = useCallback(
    async () => (canDelete ? service.deleteOrganization() : false),
    [canDelete, service.deleteOrganization],
  );

  return {
    organization: service.organization,
    canDelete,
    permissionDenied,
    isFetchLoading: service.isFetchLoading,
    isDeleteLoading: service.isDeleteLoading,
    deleteOrganization,
  };
}
