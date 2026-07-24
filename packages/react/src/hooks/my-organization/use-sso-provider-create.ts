/**
 * SSO provider creation hook.
 * Single public hook that consumes the internal service hook.
 * @module use-sso-provider-create
 */

import { useCallback, useRef, useState } from 'react';

import { useConfig } from '@/hooks/my-organization/shared/services/use-config-service';
import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useSsoProviderCreateService } from '@/hooks/my-organization/shared/services/use-sso-provider-create-service';
import type {
  FormState,
  ProviderConfigureHandle,
  ProviderDetailsFormHandle,
  UseSsoProviderCreateHookOptions,
  UseSsoProviderCreateResult,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export type { UseSsoProviderCreateResult };

/**
 * Hook for SSO provider creation. Manages form state, step navigation,
 * and API operations through an internal service hook.
 * @param options - Hook options.
 * @returns Form data, step actions, handlers, and loading states.
 */
export function useSsoProviderCreate({
  createAction,
  customMessages = {},
  onNext,
  onPrevious,
}: UseSsoProviderCreateHookOptions = {}): UseSsoProviderCreateResult {
  const { createProvider, isCreating } = useSsoProviderCreateService({
    createAction,
    customMessages,
  });

  const [formData, setFormData] = useState<FormState>({});
  const { strategy, details, configure } = formData;
  const detailsRef = useRef<ProviderDetailsFormHandle>(null);
  const configureRef = useRef<ProviderConfigureHandle>(null);
  const { isLoadingConfig, filteredStrategies, showThirdPartyAccess } = useConfig();
  const { isLoadingIdpConfig, idpConfig } = useIdpConfig();

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
        setFormData((prev) => ({ ...prev, [dataKey]: currentData }));
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
    formData,
    setFormData,
    createStepActions,
    handleCreate,
    detailsRef,
    configureRef,
    isCreating,
    isLoadingConfig,
    filteredStrategies,
    isLoadingIdpConfig,
    idpConfig,
    showThirdPartyAccess,
  };
}
