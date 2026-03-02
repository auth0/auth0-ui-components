/**
 * SSO provider creation hook.
 * @module use-sso-provider-create
 */

import {
  hasApiErrorBody,
  SsoProviderMappers,
  type CreateIdentityProviderRequestContent,
  type CreateIdentityProviderRequestContentPrivate,
  type IdentityProvider,
} from '@auth0/universal-components-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import { ssoProviderQueryKeys } from '@/hooks/my-organization/use-sso-provider-table';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  FormState,
  ProviderConfigureHandle,
  ProviderDetailsFormHandle,
  UseSsoProviderCreateOptions,
  UseSsoProviderCreateReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/**
 * Extracts domain from discovery error detail.
 * @param detail - Error detail string.
 * @returns Domain string or null.
 * @internal
 */
function extractDomainFromDiscoveryError(detail?: string): string | null {
  if (!detail) return null;
  const match = detail.match(/discovery failure:\s*(.+)/i);
  return match?.[1]?.trim() ?? null;
}

/**
 * Hook for creating SSO identity providers.
 * Combines API mutation logic with form state management, config loading,
 * and step navigation.
 * @param options - Hook options.
 * @param options.createAction - Callback after successful creation.
 * @param options.customMessages - Custom translation messages.
 * @param options.onNext - Callback for wizard next step.
 * @param options.onPrevious - Callback for wizard previous step.
 * @returns Hook state and methods
 */
export function useSsoProviderCreate({
  createAction,
  customMessages = {},
  onNext,
  onPrevious,
}: UseSsoProviderCreateOptions = {}): UseSsoProviderCreateReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.create_sso_provider', customMessages);
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

  // Config & IDP config
  const {
    isLoadingConfig,
    filteredStrategies,
    error: configError,
    retry: retryConfig,
  } = useConfig();
  const {
    isLoadingIdpConfig,
    idpConfig,
    error: idpConfigError,
    retry: retryIdpConfig,
  } = useIdpConfig();

  // Form state & refs
  const [formData, setFormData] = useState<FormState>({});
  const { strategy, details, configure } = formData;
  const detailsRef = useRef<ProviderDetailsFormHandle>(null);
  const configureRef = useRef<ProviderConfigureHandle>(null);

  const createProviderMutation = useMutation({
    mutationFn: async (
      data: CreateIdentityProviderRequestContentPrivate,
    ): Promise<IdentityProvider> => {
      const { strategy, name, display_name, ...configOptions } = data;

      const formData = {
        strategy,
        name,
        display_name,
        options: configOptions,
      };

      const apiRequestData: CreateIdentityProviderRequestContent =
        SsoProviderMappers.createToAPI(formData);

      const result: IdentityProvider = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.create(apiRequestData);

      return result;
    },
    onSuccess: (result, data) => {
      showToast({
        type: 'success',
        message: t('notifications.provider_create_success', { providerName: result.name }),
      });

      createAction?.onAfter?.(data, result);

      // Invalidate the providers list to refetch with the new provider
      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
    },
    onError: (error, data) => {
      // Handle specific business errors with custom messages
      if (
        hasApiErrorBody(error) &&
        error.body?.status === 409 &&
        error.body?.type === 'https://auth0.com/api-errors#A0E-409-0001'
      ) {
        showToast({
          type: 'error',
          message: t('notifications.provider_create_duplicated_provider_error', {
            providerName: data.name,
          }),
        });
        return;
      }

      // Handle discovery failure error for domain
      if (hasApiErrorBody(error)) {
        const domainFromError = extractDomainFromDiscoveryError(error.body?.detail);
        if (domainFromError) {
          showToast({
            type: 'error',
            message: t('notifications.provider_create_discovery_failure', {
              domain: domainFromError,
            }),
          });
          return;
        }
      }
      handleError(error);
    },
  });

  const createProvider = useCallback(
    async (data: CreateIdentityProviderRequestContentPrivate): Promise<void> => {
      if (!coreClient) {
        showToast({
          type: 'error',
          message: t('notifications.general_error'),
        });
        return;
      }

      if (createAction?.onBefore) {
        const canProceed = createAction.onBefore(data);
        if (!canProceed) {
          return;
        }
      }

      await createProviderMutation.mutateAsync(data);
    },
    [coreClient, t, createAction, createProviderMutation],
  );

  const error = createProviderMutation.error || configError || idpConfigError;

  const retry = useCallback(async () => {
    if (configError) {
      await retryConfig();
    } else if (idpConfigError) {
      await retryIdpConfig();
    } else if (createProviderMutation.variables) {
      await createProviderMutation.mutateAsync(createProviderMutation.variables);
    } else {
      createProviderMutation.reset();
    }
  }, [configError, idpConfigError, createProviderMutation, retryConfig, retryIdpConfig]);

  const createStepActions = useCallback(
    (
      stepId: 'provider_details' | 'provider_configure',
      ref: React.RefObject<ProviderDetailsFormHandle | ProviderConfigureHandle | null>,
    ) => {
      const dataKey = stepId === 'provider_details' ? 'details' : 'configure';
      const handleAction = async (
        handler: typeof onNext | typeof onPrevious | undefined,
        shouldValidate = false,
      ): Promise<boolean> => {
        if (shouldValidate) {
          const isValid = await ref.current?.validate();
          if (!isValid) return false;
        }
        const currentData = ref.current?.getData() ?? null;
        setFormData((prev: FormState) => ({ ...prev, [dataKey]: currentData }));
        if (!handler) return true;
        const fullPayload = { ...formData, [dataKey]: currentData };
        return handler(stepId, fullPayload);
      };
      return {
        onNextAction: () => handleAction(onNext, true),
        onPreviousAction: () => handleAction(onPrevious, false),
      };
    },
    [formData, onNext, onPrevious],
  );

  const handleCreate = useCallback(async () => {
    const finalConfigureData = configureRef.current?.getData();
    await createProvider({
      strategy: strategy!,
      ...details!,
      ...finalConfigureData,
    });
  }, [strategy, details, configure, createProvider]);

  return {
    createProvider,
    isCreating: createProviderMutation.isPending,
    error,
    retry,
    formData,
    setFormData,
    createStepActions,
    handleCreate,
    detailsRef,
    configureRef,
    isLoadingConfig,
    filteredStrategies,
    isLoadingIdpConfig,
    idpConfig,
  };
}
