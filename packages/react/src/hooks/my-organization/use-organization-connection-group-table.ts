/**
 * Connection group table hook.
 * Single public hook combining data access and UI logic.
 * @module use-organization-connection-group-table
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  connectionGroupQueryKeys,
  useConnectionGroupTableService,
} from '@/hooks/my-organization/shared/services/use-connection-group-table-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  ConnectionGroup,
  ConnectionGroupPermissions,
  UseOrganizationConnectionGroupTableOptions,
  UseOrganizationConnectionGroupTableReturn,
} from '@/types/my-organization/connection-group-management/organization-connection-group-table-types';

export { connectionGroupQueryKeys };

/**
 * Hook for connection group table data and UI logic.
 * Consumes the internal service hook and resolves permissions and row-action
 * handlers.
 * @param options - Hook options including readOnly mode, custom messages, and actions.
 * @param options.readOnly - When true, the remove-from-organization action is disabled.
 * @param options.customMessages - Custom translation messages.
 * @param options.removeFromOrganizationAction - Lifecycle hooks for the remove-from-organization action.
 * @param options.viewDetailsAction - Lifecycle hooks for the view-details action.
 * @returns Combined data, loading state, permissions, and handlers.
 */
export function useOrganizationConnectionGroupTable({
  readOnly = false,
  customMessages = {},
  removeFromOrganizationAction,
  viewDetailsAction,
}: UseOrganizationConnectionGroupTableOptions = {}): UseOrganizationConnectionGroupTableReturn {
  const { t } = useTranslator(
    'connection_group_management.notifications',
    customMessages?.notifications as Record<string, unknown> | undefined,
  );
  const handleError = useErrorHandler();

  // TODO(SDK): resolve from granted scopes (e.g. `read:my_org:groups`) via a core
  // permission resolver once those scopes exist in `MyOrganization.OauthScope`.
  const permissions = useMemo<ConnectionGroupPermissions>(
    () => ({
      canListGroups: true,
      canRemoveFromOrganization: !readOnly,
    }),
    [readOnly],
  );

  const { groups, isLoading, groupsError, refetchGroups } = useConnectionGroupTableService();

  const hasShownGroupsError = useRef(false);

  useEffect(() => {
    if (groupsError && !hasShownGroupsError.current) {
      handleError(groupsError, { fallbackMessage: t('fetch_groups_error') });
      hasShownGroupsError.current = true;
    }

    if (!groupsError) {
      hasShownGroupsError.current = false;
    }
  }, [groupsError, t, handleError]);

  const handleRemoveFromOrganization = useCallback(
    (group: ConnectionGroup) => {
      if (!permissions.canRemoveFromOrganization) return;
      removeFromOrganizationAction?.onAfter?.(group);
    },
    [permissions, removeFromOrganizationAction],
  );

  const handleViewDetails = useCallback(
    (group: ConnectionGroup) => {
      viewDetailsAction?.onAfter?.(group);
    },
    [viewDetailsAction],
  );

  return {
    permissions,
    groups,
    isLoading,
    isViewLoading: isLoading,
    refetchGroups,
    handleRemoveFromOrganization,
    handleViewDetails,
  };
}
