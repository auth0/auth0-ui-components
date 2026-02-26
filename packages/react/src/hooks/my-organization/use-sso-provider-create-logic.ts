/**
 * SSO provider create logic hook.
 * @module use-sso-provider-create-logic
 * @internal
 */

import { useCallback, useRef, useState } from 'react';

import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import type {
  FormState,
  ProviderConfigureHandle,
  ProviderDetailsFormHandle,
  UseSsoProviderCreateLogicOptions,
  UseSsoProviderCreateLogicResult,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/**
 * Hook for SSO provider create logic (form state, step actions, create handler).
 * @param params - SsoProviderCreateLogicParams
 * @returns formData, setFormData, createStepActions, handleCreate, detailsRef, configureRef
 */
export function useSsoProviderCreateLogic({
  onNext,
  onPrevious,
  createProvider,
}: UseSsoProviderCreateLogicOptions): UseSsoProviderCreateLogicResult {
  const [formData, setFormData] = useState<FormState>({});
  const { strategy, details, configure } = formData;
  const detailsRef = useRef<ProviderDetailsFormHandle>(null);
  const configureRef = useRef<ProviderConfigureHandle>(null);
  const { isLoadingConfig, filteredStrategies } = useConfig();
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
    isLoadingConfig,
    filteredStrategies,
    isLoadingIdpConfig,
    idpConfig,
  };
}
