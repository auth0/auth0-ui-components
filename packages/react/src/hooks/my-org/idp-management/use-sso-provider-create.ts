import {
  SsoProviderMappers,
  type CreateIdentityProviderRequestContent,
  type CreateIdentityProviderRequestContentPrivate,
  type IdentityProvider,
} from '@auth0-web-ui-components/core';
import { useCallback, useState } from 'react';

import { showToast } from '../../../components/ui/toast';
import { useCoreClient } from '../../../hooks/use-core-client';
import { useTranslator } from '../../../hooks/use-translator';
import type { UseSsoProviderCreateOptions } from '../../../types';

export interface UseSsoProviderCreateReturn {
  createProvider: (data: CreateIdentityProviderRequestContentPrivate) => Promise<void>;
  isCreating: boolean;
}

export function useSsoProviderCreate({
  create,
  customMessages = {},
}: UseSsoProviderCreateOptions = {}): UseSsoProviderCreateReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.create_sso_provider', customMessages);
  const [isCreating, setIsCreating] = useState(false);

  const createProvider = useCallback(
    async (data: CreateIdentityProviderRequestContentPrivate): Promise<void> => {
      if (!coreClient) {
        return;
      }
      setIsCreating(true);

      try {
        if (create?.onBefore) {
          const canProceed = create.onBefore(data);
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
          .getMyOrgApiClient()
          .organization.identityProviders.create(apiRequestData);

        showToast({
          type: 'success',
          message: t('notifications.provider_create_success', { providerName: result.name }),
        });

        create?.onAfter?.(data, result);
      } catch (err) {
        showToast({
          type: 'error',
          message: t('notifications.general_error'),
        });

        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [coreClient, create, t],
  );

  return {
    createProvider,
    isCreating,
  };
}
