import {
  getComponentStyles,
  type IdpStrategy,
  type ProviderDetailsFormValues,
  type ProviderConfigureFormValues,
  MY_ORG_SSO_PROVIDER_CREATE_SCOPES,
} from '@auth0/web-ui-components-core';
import React, { useState, useRef, useCallback, useMemo } from 'react';

import ProviderConfigure, {
  type ProviderConfigureHandle,
} from '../../../components/my-org/idp-management/sso-provider-create/provider-configure/provider-configure';
import {
  ProviderDetails,
  type ProviderDetailsFormHandle,
} from '../../../components/my-org/idp-management/sso-provider-create/provider-details';
import { ProviderSelect } from '../../../components/my-org/idp-management/sso-provider-create/provider-select';
import { Header } from '../../../components/ui/header';
import { Wizard } from '../../../components/ui/wizard';
import type { StepProps } from '../../../components/ui/wizard';
import { withMyOrgService } from '../../../hoc/with-services';
import { useConfig } from '../../../hooks/my-org/config/use-config';
import { useIdpConfig } from '../../../hooks/my-org/config/use-idp-config';
import { useSsoProviderCreate } from '../../../hooks/my-org/idp-management/use-sso-provider-create';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import type { SsoProviderCreateProps } from '../../../types/my-org/idp-management/sso-provider/sso-provider-create-types';

type FormState = {
  strategy?: IdpStrategy;
  details?: ProviderDetailsFormValues | null;
  configure?: ProviderConfigureFormValues | null;
};

export function SsoProviderCreateComponent({
  createAction,
  backButton,
  onNext,
  onPrevious,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
}: SsoProviderCreateProps) {
  const { t } = useTranslator('idp_management.create_sso_provider', customMessages);
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState<FormState>({});
  const { strategy, details, configure } = formData;

  const { createProvider, isCreating } = useSsoProviderCreate({
    createAction,
    customMessages,
  });
  const { isLoadingConfig, filteredStrategies } = useConfig();
  const { isLoadingIdpConfig, idpConfig } = useIdpConfig();

  const detailsRef = useRef<ProviderDetailsFormHandle>(null);
  const configureRef = useRef<ProviderConfigureHandle>(null);

  const currentStyles = useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

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

  const wizardSteps = useMemo(
    () => [
      {
        id: 'provider_select',
        title: t('steps.one'),
        content: ({ onNext: navigate }: StepProps) => (
          <ProviderSelect
            isLoading={isLoadingConfig}
            strategyList={filteredStrategies}
            onClickStrategy={(selected) => {
              setFormData((prev) => ({
                strategy: selected,
                details: prev.strategy === selected ? prev.details : null,
                configure: prev.strategy === selected ? prev.configure : null,
              }));

              onNext?.('provider_select', { strategy: selected });
              navigate?.();
            }}
            selectedStrategy={strategy}
            customMessages={customMessages.provider_select}
            className={currentStyles?.classes?.['ProviderSelect-root']}
          />
        ),
        actions: {
          showNext: false,
        },
      },
      {
        id: 'provider_details',
        title: t('steps.two'),
        content: () => (
          <ProviderDetails
            ref={detailsRef}
            initialData={details ?? undefined}
            customMessages={customMessages.provider_details}
            styling={styling}
            className={currentStyles?.classes?.['ProviderDetails-root']}
          />
        ),
        actions: createStepActions('provider_details', detailsRef),
      },
      {
        id: 'provider_configure',
        title: t('steps.three'),
        content: () =>
          strategy ? (
            <ProviderConfigure
              ref={configureRef}
              strategy={strategy}
              isLoading={isLoadingIdpConfig}
              initialData={configure ?? undefined}
              customMessages={customMessages.provider_configure}
              idpConfig={idpConfig}
              className={currentStyles?.classes?.['ProviderConfigure-root']}
            />
          ) : null,
        actions: createStepActions('provider_configure', configureRef),
      },
    ],
    [
      t,
      strategy,
      details,
      configure,
      onNext,
      onPrevious,
      customMessages,
      currentStyles,
      styling,
      createStepActions,
    ],
  );

  return (
    <div style={currentStyles.variables} className="w-full">
      <Header
        title={t('header.title')}
        backButton={
          backButton && {
            ...backButton,
            text: t('header.back_button_text'),
          }
        }
        className={currentStyles?.classes?.['SsoProviderCreate-header']}
      />
      <div className="sso-provider-create__content">
        <Wizard
          isLoading={isCreating}
          hideStepperNumbers
          steps={wizardSteps}
          onComplete={handleCreate}
          formActionLabels={{
            nextButtonLabel: t('nextButtonLabel'),
            previousButtonLabel: t('previousButtonLabel'),
            completeButtonLabel: t('completeButtonLabel'),
          }}
          className={currentStyles?.classes?.['SsoProviderCreate-wizard']}
        />
      </div>
    </div>
  );
}

export const SsoProviderCreate = withMyOrgService(
  SsoProviderCreateComponent,
  MY_ORG_SSO_PROVIDER_CREATE_SCOPES,
);
