/**
 * Organization create hook.
 * Single public hook that consumes the internal service hook.
 * @module use-organization-create
 */

import {
  OrganizationDetailsFactory,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { useCallback, useMemo } from 'react';

import { useOrganizationCreateService } from '@/hooks/my-account/shared/services/use-organization-create-service';
import type {
  UseOrganizationCreateOptions,
  UseOrganizationCreateResult,
} from '@/types/my-account/organization-management/organization-create-types';

const EMPTY_ORGANIZATION = OrganizationDetailsFactory.create();

/**
 * Hook for creating an organization the authenticated user will belong to.
 * Builds the form actions and delegates the API call to the internal service hook.
 * @param props - Hook options.
 * @param props.createAction - Lifecycle hooks for the create operation
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns Hook state and methods
 */
export function useOrganizationCreate({
  createAction,
  readOnly = false,
  customMessages = {},
}: UseOrganizationCreateOptions = {}): UseOrganizationCreateResult {
  const service = useOrganizationCreateService({ createAction, customMessages });

  const createOrganization = useCallback(
    async (values: OrganizationPrivate) =>
      readOnly || createAction?.disabled ? false : service.createOrganization(values),
    [readOnly, createAction?.disabled, service.createOrganization],
  );

  const formActions = useMemo(
    () => ({
      isLoading: service.isCreating,
      showPrevious: false,
      showNext: !readOnly,
      showUnsavedChanges: false,
      nextAction: {
        disabled: !!createAction?.disabled || service.isCreating,
        onClick: createOrganization,
      },
    }),
    [service.isCreating, readOnly, createAction?.disabled, createOrganization],
  );

  return {
    organization: EMPTY_ORGANIZATION,
    isCreating: service.isCreating,
    createOrganization,
    formActions,
  };
}
