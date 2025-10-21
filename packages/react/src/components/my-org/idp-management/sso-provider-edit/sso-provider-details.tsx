import { getComponentStyles } from '@auth0-web-ui-components/core';
import React from 'react';

import { FormActions } from '../../../../components/ui/form-actions';
import { useTheme, useTranslator } from '../../../../hooks';
import { cn } from '../../../../lib';
import type { SsoProviderDetailsProps } from '../../../../types/my-org/idp-management/sso-provider-edit-types';
import {
  ProviderConfigureFields,
  type ProviderConfigureFormHandle,
} from '../sso-provider-create/provider-configure/provider-configure-fields';
import {
  ProviderDetails,
  type ProviderDetailsFormHandle,
} from '../sso-provider-create/provider-details';

/**
 * SsoProviderDetails Component
 * Combines ProviderDetails and ProviderConfigureFields for editing SSO provider
 */
export function SsoProviderDetails({
  provider,
  readOnly = false,
  formActions,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
}: SsoProviderDetailsProps) {
  const { t } = useTranslator('idp_management.sso_provider_details', customMessages);
  const { isDarkMode } = useTheme();
  const providerDetailsRef = React.useRef<ProviderDetailsFormHandle>(null);
  const providerConfigureRef = React.useRef<ProviderConfigureFormHandle>(null);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const providerDetailsData = React.useMemo(() => {
    if (!provider) return undefined;

    return {
      name: provider.name ?? undefined,
      display_name: provider.display_name ?? undefined,
    };
  }, [provider]);

  const handleSave = async () => {
    if (!formActions?.nextAction?.onClick || !provider?.strategy) return;

    const isDetailsValid = await providerDetailsRef.current?.validate();
    const isConfigureValid = await providerConfigureRef.current?.validate();

    if (!isDetailsValid || !isConfigureValid) {
      return;
    }

    const detailsData = providerDetailsRef.current?.getData();
    const configureData = providerConfigureRef.current?.getData();
    const updateData = {
      strategy: provider.strategy,
      ...detailsData,
      ...configureData,
    };

    await formActions.nextAction.onClick(updateData);
  };

  if (!provider) {
    return null;
  }

  return (
    <div style={currentStyles.variables} className={cn('space-y-8')}>
      <div className="space-y-4">
        <ProviderDetails
          ref={providerDetailsRef}
          initialData={providerDetailsData}
          readOnly={readOnly}
          customMessages={customMessages.provider_details}
          className={currentStyles.classes?.['ProviderDetails-root']}
          hideHeader
        />
      </div>

      <div className="space-y-4">
        <ProviderConfigureFields
          ref={providerConfigureRef}
          strategy={provider.strategy}
          initialData={provider.options}
          readOnly={readOnly}
          customMessages={customMessages.provider_configure}
          className={currentStyles.classes?.['ProviderConfigure-root']}
        />
      </div>

      {formActions && (
        <FormActions
          isLoading={formActions.isLoading}
          nextAction={{
            label: t('submit_button_label'),
            disabled: formActions?.nextAction?.disabled || formActions.isLoading || readOnly,
            type: 'button',
            onClick: handleSave,
          }}
          showPrevious={false}
          align={formActions?.align}
          className={currentStyles.classes?.['SsoProviderDetails-FormActions']}
        />
      )}
    </div>
  );
}
