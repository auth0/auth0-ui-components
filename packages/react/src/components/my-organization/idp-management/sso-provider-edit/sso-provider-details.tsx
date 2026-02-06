import { getComponentStyles } from '@auth0/universal-components-core';
import React from 'react';

import { FormActions } from '../../../../components/ui/form-actions';
import { Separator } from '../../../../components/ui/separator';
import { useTheme } from '../../../../hooks/use-theme';
import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import type { SsoProviderDetailsProps } from '../../../../types/my-organization/idp-management/sso-provider/sso-provider-tab-types';
import {
  ProviderConfigureFields,
  type ProviderConfigureFormHandle,
} from '../sso-provider-create/provider-configure/provider-configure-fields';
import {
  ProviderDetails,
  type ProviderDetailsFormHandle,
} from '../sso-provider-create/provider-details';

import { SsoProviderAttributeMappings } from './sso-provider-attribute-mappings';

/**
 * SsoProviderDetails Component
 * Combines ProviderDetails and ProviderConfigureFields for editing SSO provider
 */
export function SsoProviderDetails({
  provider,
  readOnly = false,
  idpConfig,
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
  const [isDetailsDirty, setIsDetailsDirty] = React.useState(false);
  const [isConfigureDirty, setIsConfigureDirty] = React.useState(false);

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

  const attributes = React.useMemo(() => {
    if (!provider) return null;
    return 'attributes' in provider ? (provider.attributes ?? null) : null;
  }, [provider]);

  const hasUnsavedChanges = isDetailsDirty || isConfigureDirty;
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

    // Reset forms to mark current values as the new baseline
    providerDetailsRef.current?.reset(detailsData);
    providerConfigureRef.current?.reset(configureData as never);

    setIsDetailsDirty(false);
    setIsConfigureDirty(false);
  };

  if (!provider) {
    return null;
  }

  return (
    <div style={currentStyles.variables} className={cn('space-y-8')}>
      <div className="space-y-4">
        <ProviderDetails
          mode="edit"
          ref={providerDetailsRef}
          initialData={providerDetailsData}
          readOnly={readOnly}
          customMessages={customMessages.details_fields}
          className={currentStyles.classes?.['ProviderDetails-root']}
          hideHeader
          onFormDirty={setIsDetailsDirty}
        />
      </div>

      <div className="space-y-4">
        <ProviderConfigureFields
          ref={providerConfigureRef}
          strategy={provider.strategy}
          initialData={provider.options}
          readOnly={readOnly}
          idpConfig={idpConfig}
          mode="edit"
          customMessages={customMessages.configure_fields}
          className={currentStyles.classes?.['ProviderConfigure-root']}
          onFormDirty={setIsConfigureDirty}
        />
      </div>

      <Separator />
      <div className="space-y-4">
        <SsoProviderAttributeMappings
          strategy={provider?.strategy || null}
          userAttributeMap={attributes}
          customMessages={customMessages.mappings}
          className={currentStyles.classes?.['SsoProvider-attributeMapping']}
        />
      </div>

      {formActions && (
        <FormActions
          hasUnsavedChanges={hasUnsavedChanges}
          showUnsavedChanges
          isLoading={formActions.isLoading}
          nextAction={{
            label: t('submit_button_label'),
            disabled:
              !hasUnsavedChanges ||
              formActions?.nextAction?.disabled ||
              formActions.isLoading ||
              readOnly,
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
