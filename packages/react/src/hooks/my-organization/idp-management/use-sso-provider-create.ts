import {
  hasApiErrorBody,
  SsoProviderMappers,
  type CreateIdentityProviderRequestContent,
  type CreateIdentityProviderRequestContentPrivate,
  type IdentityProvider,
} from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

import { showToast } from '../../../components/ui/toast';
import { useCoreClient } from '../../../hooks/use-core-client';
import { useTranslator } from '../../../hooks/use-translator';
import type { UseSsoProviderCreateOptions } from '../../../types/my-organization/idp-management/sso-provider/sso-provider-create-types';
import { useErrorHandler } from '../../use-error-handler';

export interface UseSsoProviderCreateReturn {
  createProvider: (data: CreateIdentityProviderRequestContentPrivate) => Promise<void>;
  isCreating: boolean;
}

export function useSsoProviderCreate({
  createAction,
  customMessages = {},
}: UseSsoProviderCreateOptions = {}): UseSsoProviderCreateReturn {
  const { coreClient } = useCoreClient();
  const { handleError } = useErrorHandler();
  const { t } = useTranslator('idp_management.create_sso_provider', customMessages);
  const [isCreating, setIsCreating] = useState(false);

  const createProvider = useCallback(
    async (data: CreateIdentityProviderRequestContentPrivate): Promise<void> => {
      if (!coreClient) {
        return;
      }
      setIsCreating(true);

      try {
        if (createAction?.onBefore) {
          const canProceed = createAction.onBefore(data);
          if (!canProceed) {
            return;
          }
        }

        const { strategy, name, display_name, ...configOptions } = data;

        const formData = {
          strategy,
          name,
          display_name,
          options: configOptions,
        };

        const apiRequestData: CreateIdentityProviderRequestContent =
          SsoProviderMappers.createToAPI(formData);

        const result: IdentityProvider = await coreClient
          .getMyOrganizationApiClient()
          .organization.identityProviders.create(apiRequestData);

        showToast({
          type: 'success',
          message: t('notifications.provider_create_success', { providerName: result.name }),
        });

        createAction?.onAfter?.(data, result);
      } catch (error) {
        if (
          hasApiErrorBody(error) &&
          error.body?.status === 409 &&
          error.body?.type === 'https://auth0.com/api-errors#A0E-409-0001'
        ) {
          handleError(error, {
            errorMessage: t('notifications.provider_create_duplicated_provider_error', {
              providerName: data.name,
            }),
          });
        } else {
          handleError(error, { fallbackMessage: t('notifications.general_error') });
        }
      } finally {
        setIsCreating(false);
      }
    },
    [coreClient, createAction, t],
  );

  return {
    createProvider,
    isCreating,
  };
}
