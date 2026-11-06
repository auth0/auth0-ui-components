/**
 * Organization switcher hook.
 * Single public hook that consumes the internal service hook.
 * @module use-organization-switcher
 */

import { useCallback, useMemo } from 'react';

import { useOrganizationSwitcherService } from '@/hooks/my-account/shared/services/use-organization-switcher-service';
import { ORGANIZATION_SWITCHER_PAGE_SIZE } from '@/lib/constants/my-account/organization-management/organization-management-constants';
import type {
  UseOrganizationSwitcherOptions,
  UseOrganizationSwitcherResult,
} from '@/types/my-account/organization-management/organization-switcher-types';

/**
 * Hook for switching between the organizations the authenticated user belongs to.
 * @param props - Hook options.
 * @param props.currentOrganizationId - ID of the organization the user is signed in to
 * @param props.currentOrganizationName - Name shown until the current organization is loaded
 * @param props.hasCreateAction - Whether the switcher offers a create item
 * @param props.onSwitchOrganization - Called with the organization to switch to
 * @param props.pageSize - Number of organizations to load
 * @returns Hook state and methods
 */
export function useOrganizationSwitcher({
  currentOrganizationId,
  currentOrganizationName,
  hasCreateAction = false,
  onSwitchOrganization,
  pageSize = ORGANIZATION_SWITCHER_PAGE_SIZE,
}: UseOrganizationSwitcherOptions): UseOrganizationSwitcherResult {
  const service = useOrganizationSwitcherService({ pageSize });
  const { organizations, isLoading, isError, isRetrying } = service;

  const currentOrganization = useMemo(
    () => organizations.find((organization) => organization.id === currentOrganizationId),
    [organizations, currentOrganizationId],
  );

  // The list may not hold the current organization (loading failed, or it is not in the first page).
  const currentName =
    currentOrganization?.display_name || currentOrganization?.name || currentOrganizationName;

  // A retry in flight keeps the error state, so the control doesn't vanish.
  const hasFailed = (isError && organizations.length === 0) || isRetrying;

  // Nothing renders until the first load finishes, nor when there is nothing to switch to or create.
  const isHidden =
    (isLoading && !isRetrying) || (!hasFailed && organizations.length <= 1 && !hasCreateAction);

  const handleSelect = useCallback(
    (organizationId: string) => {
      if (organizationId === currentOrganizationId) return;

      const organization = organizations.find(({ id }) => id === organizationId);
      if (organization) {
        onSwitchOrganization(organization);
      }
    },
    [currentOrganizationId, onSwitchOrganization, organizations],
  );

  return {
    ...service,
    currentName,
    hasFailed,
    isHidden,
    handleSelect,
  };
}
