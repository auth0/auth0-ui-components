import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { useCallback, useMemo, useState, useEffect } from 'react';

import { showToast } from '../../../components/ui/toast';
import type {
  OrgDetailsFormActions,
  UseOrgDetailsEditOptions,
  UseOrgDetailsEditResult,
} from '../../../types/my-org/org-management';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

/**
 * Custom hook for managing organization details form logic.
 */
export function useOrgDetailsEdit({
  saveAction,
  cancelAction,
  readOnly = false,
  customMessages = {},
}: UseOrgDetailsEditOptions): UseOrgDetailsEditResult {
  const { t } = useTranslator('org_management.org_details_edit', customMessages);
  const { coreClient } = useCoreClient();

  const [organization, setOrganization] = useState<OrganizationPrivate>(
    OrganizationDetailsFactory.create(),
  );
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const isInitializing = !coreClient;

  /**
   * Fetch organization details from the API.
   */
  const fetchOrgDetails = useCallback(async (): Promise<void> => {
    if (!coreClient) {
      return;
    }

    try {
      setIsFetchLoading(true);

      const response = await coreClient.getMyOrganizationApiClient().organizationDetails.get();
      const orgData = OrganizationDetailsMappers.fromAPI(response);
      setOrganization(orgData);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? t('org_changes_error_message', { message: error.message })
          : t('org_changes_error_message_generic');

      showToast({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsFetchLoading(false);
    }
  }, [coreClient, t]);

  /**
   * Update organization details in the API.
   */
  const updateOrgDetails = useCallback(
    async (data: OrganizationPrivate): Promise<boolean> => {
      if (!coreClient) {
        return false;
      }

      try {
        setIsSaveLoading(true);

        if (saveAction?.onBefore) {
          const canProceed = saveAction.onBefore(data);
          if (!canProceed) {
            return false;
          }
        }

        const updateData = OrganizationDetailsMappers.toAPI(data);
        const response = await coreClient
          .getMyOrganizationApiClient()
          .organizationDetails.update(updateData);
        const updatedOrg = OrganizationDetailsMappers.fromAPI(response);
        setOrganization(updatedOrg);

        showToast({
          type: 'success',
          message: t('save_org_changes_message', {
            orgName: data.display_name || data.name,
          }),
        });

        if (saveAction?.onAfter) {
          saveAction.onAfter(data);
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? t('org_changes_error_message', { message: error.message })
            : t('org_changes_error_message_generic');

        showToast({
          type: 'error',
          message: errorMessage,
        });

        return false;
      } finally {
        setIsSaveLoading(false);
      }
    },
    [saveAction, t, coreClient],
  );

  const formActions = useMemo(
    (): OrgDetailsFormActions => ({
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

  // Fetch when page loads
  useEffect(() => {
    fetchOrgDetails();
  }, []);

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
