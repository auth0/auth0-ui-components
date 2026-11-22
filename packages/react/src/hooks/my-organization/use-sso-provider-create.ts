/**
 * SSO provider creation hook.
 * Single public hook that consumes the internal service hook.
 * @module use-sso-provider-create
 */

import {
  getIdpManagementPermissions,
  type CreateIdentityProviderRequestContentPrivate,
  type IdpKnownResponse,
  type ProviderConfigureFormValues,
} from '@auth0/universal-components-core';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { ProviderConfigureFormHandle } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/provider-configure-fields';
import { useConfig } from '@/hooks/my-organization/shared/services/use-config-service';
import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useSsoProviderCreateService } from '@/hooks/my-organization/shared/services/use-sso-provider-create-service';
import { usePermissions } from '@/hooks/shared/use-permissions';
import { pickConnectionAccess } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
import type {
  FormState,
  ProviderConfigureHandle,
  ProviderDetailsFormHandle,
  SsoProviderCreateGuidedSetupState,
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
  readOnly = false,
  onNext,
  onPrevious,
  guidedSetup: guidedSetupOptions,
}: UseSsoProviderCreateHookOptions = {}): UseSsoProviderCreateResult {
  const [isGuidedSetup, setGuidedSetup] = useState(false);
  const [guidedProvider, setGuidedProvider] = useState<IdpKnownResponse | null>(null);
  const isGuidedSetupRef = useRef(false);
  const pendingOnAfterRef = useRef<{
    data: CreateIdentityProviderRequestContentPrivate;
    result: IdpKnownResponse;
  } | null>(null);

  const serviceCreateAction = useMemo(
    () =>
      createAction && {
        ...createAction,
        onAfter: (data: CreateIdentityProviderRequestContentPrivate, result?: IdpKnownResponse) => {
          if (isGuidedSetupRef.current && result) {
            pendingOnAfterRef.current = { data, result };
            return;
          }
          return createAction.onAfter?.(data, result);
        },
      },
    [createAction],
  );

  const {
    createProvider,
    isCreating,
    isOrganizationBlocked,
    organizationDisplayName,
    notifyCreated,
  } = useSsoProviderCreateService({
    createAction: serviceCreateAction,
    customMessages,
    shouldDeferSuccessToast: () => isGuidedSetupRef.current,
  });

  const [formData, setFormData] = useState<FormState>({});
  const { strategy, details } = formData;
  const detailsRef = useRef<ProviderDetailsFormHandle>(null);
  const configureRef = useRef<ProviderConfigureHandle>(null);
  const guidedConfigureRef = useRef<ProviderConfigureFormHandle>(null);
  const advancedConnectionAccessRef = useRef<ReturnType<typeof pickConnectionAccess>>({});
  const guidedConfigureDataRef = useRef<ProviderConfigureFormValues | null>(null);
  const { createPermissionResolver } = usePermissions();

  const permissions = useMemo(
    () => createPermissionResolver(getIdpManagementPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );
  const {
    isLoadingConfig,
    filteredStrategies,
    showThirdPartyAccess,
    isThirdPartyAccessReadOnly,
    thirdPartyAccessDefaultValue,
  } = useConfig();
  const {
    isLoadingIdpConfig,
    isIdpConfigError,
    refetchIdpConfig,
    idpConfig,
    showCrossAppAccess,
    isCrossAppAccessReadOnly,
    getCrossAppAccessDefaultValue,
  } = useIdpConfig();

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
    if (!permissions.canCreateProvider) return;
    const finalConfigureData = configureRef.current?.getData();
    await createProvider({
      strategy: strategy!,
      ...details!,
      ...finalConfigureData,
    });
  }, [permissions, strategy, details, createProvider]);

  const guidedSetupEnabled =
    Boolean(guidedSetupOptions?.enabled) &&
    permissions.canReadConfiguration &&
    permissions.canCreateProvider;

  const saveGuidedConfigure = useCallback(() => {
    const form = guidedConfigureRef.current;
    if (!form) return;
    guidedConfigureDataRef.current = form.getData();
    setFormData((prev) => ({ ...prev, configure: form.getValues() }));
  }, []);

  const guidedSetup = useMemo<SsoProviderCreateGuidedSetupState>(
    () => ({
      isAvailable: guidedSetupEnabled,
      isActive: isGuidedSetup,
      provider: guidedProvider,
      organizationDisplayName,
      hideLifecycleWarnings: guidedSetupOptions?.hideLifecycleWarnings,
      configureRef: guidedConfigureRef,
      start: () => {
        const form = configureRef.current;
        const data = form?.getData();
        advancedConnectionAccessRef.current = pickConnectionAccess(data);
        guidedConfigureDataRef.current = data ?? null;
        if (form) setFormData((prev) => ({ ...prev, configure: form.getValues() }));
        isGuidedSetupRef.current = true;
        setGuidedSetup(true);
      },
      saveConfigure: saveGuidedConfigure,
      validate: async () => {
        const isValid = (await guidedConfigureRef.current?.validate()) ?? false;
        if (isValid) saveGuidedConfigure();
        return isValid;
      },
      create: async () => {
        if (!permissions.canCreateProvider || !strategy || !details) return false;
        const configureData =
          guidedConfigureRef.current?.getData() ?? guidedConfigureDataRef.current;
        try {
          const created = await createProvider({
            strategy,
            ...details,
            ...advancedConnectionAccessRef.current,
            ...configureData,
          });
          if (!created) return false;
          setGuidedProvider(created);
          return true;
        } catch {
          return false;
        }
      },
      complete: () => {
        const pending = pendingOnAfterRef.current;
        if (!pending) return;
        pendingOnAfterRef.current = null;
        notifyCreated(pending.result.name);
        if (guidedSetupOptions?.onComplete) {
          guidedSetupOptions.onComplete(pending.result);
          return;
        }
        createAction?.onAfter?.(pending.data, pending.result);
      },
    }),
    [
      guidedSetupEnabled,
      permissions.canCreateProvider,
      isGuidedSetup,
      guidedProvider,
      organizationDisplayName,
      guidedSetupOptions?.hideLifecycleWarnings,
      saveGuidedConfigure,
      strategy,
      details,
      createProvider,
      createAction,
      guidedSetupOptions?.onComplete,
      notifyCreated,
    ],
  );

  return {
    permissions,
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
    isIdpConfigError,
    refetchIdpConfig,
    idpConfig,
    showThirdPartyAccess,
    isThirdPartyAccessReadOnly,
    thirdPartyAccessDefaultValue,
    showCrossAppAccess: showCrossAppAccess(strategy),
    isCrossAppAccessReadOnly: isCrossAppAccessReadOnly(strategy),
    getCrossAppAccessDefaultValue: () => getCrossAppAccessDefaultValue(strategy),
    isOrganizationBlocked,
    guidedSetup,
  };
}
