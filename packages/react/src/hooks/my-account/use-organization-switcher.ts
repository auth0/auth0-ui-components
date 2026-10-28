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
 * @param props.onSwitchOrganization - Called with the organization to switch to
 * @param props.pageSize - Organizations loaded per page
 * @returns Hook state and methods
 */
export function useOrganizationSwitcher({
  currentOrganizationId,
  onSwitchOrganization,
  pageSize = ORGANIZATION_SWITCHER_PAGE_SIZE,
}: UseOrganizationSwitcherOptions): UseOrganizationSwitcherResult {
  const service = useOrganizationSwitcherService({ pageSize });

  const currentOrganization = useMemo(
    () => service.organizations.find((organization) => organization.id === currentOrganizationId),
    [service.organizations, currentOrganizationId],
  );

  const handleSelect = useCallback(
    (organizationId: string) => {
      if (organizationId === currentOrganizationId) return;

      const organization = service.organizations.find(({ id }) => id === organizationId);
      if (organization) {
        onSwitchOrganization(organization);
      }
    },
    [currentOrganizationId, onSwitchOrganization, service.organizations],
  );

  return {
    ...service,
    currentOrganization,
    handleSelect,
  };
}
