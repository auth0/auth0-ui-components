/**
 * SAML-P SSO provider configuration form.
 * @module samlp-sso-configure-form
 * @internal
 */

import type {
  SamlpConfigureFormInput,
  SamlpConfigureFormValues,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { SsoCrossAppAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-cross-app-access-section';
import { SsoSamlConnectionFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-connection-fields';
import { SsoSamlRequestSettings } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-request-settings';
import { SsoSamlServiceProviderFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-service-provider-fields';
import { SsoThirdPartyAccessSection } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-third-party-access-section';
import { Form, FormField } from '@/components/ui/form';
import { useServiceProviderValues } from '@/hooks/my-organization/use-service-provider-values';
import {
  parseStrategyConfigureValues,
  useStrategyConfigureForm,
  type StrategyConfigureFormHandle,
} from '@/hooks/my-organization/use-strategy-configure-form';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export type SamlpConfigureFormHandle = StrategyConfigureFormHandle<SamlpConfigureFormValues>;

interface SamlpConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {
  showCrossAppAccess?: boolean;
  isCrossAppAccessReadOnly?: boolean;
}

export const SamlpProviderForm = React.forwardRef<
  SamlpConfigureFormHandle,
  SamlpConfigureFormProps
>(function SamlpProviderForm(
  {
    initialData,
    readOnly = false,
    customMessages = {},
    className,
    onFormDirty,
    idpConfig,
    connectionName: connectionNameProp,
    connectionNamePrefix,
    resolveSamlMetadata,
    showSignRequest = true,
    showThirdPartyAccess = false,
    isThirdPartyAccessReadOnly = false,
    showCrossAppAccess = false,
    isCrossAppAccessReadOnly = false,
    crossAppAccessDefaultValue,
    isOrganizationBlocked = false,
    styling,
  },
  ref,
) {
  const connectionName =
    connectionNamePrefix && connectionNameProp
      ? `${connectionNamePrefix}-${connectionNameProp}`
      : connectionNameProp;

  const spValues = useServiceProviderValues({ connectionName, resolveSamlMetadata });
  const spMetadataUrls = React.useMemo(
    () => ({
      callback_url: spValues.callbackUrl,
      acs_url: spValues.samlSsoUrl,
      sp_metadata_url: spValues.samlMetadataUrl,
    }),
    [spValues],
  );

  const samlpData = initialData as SamlpConfigureFormInput | undefined;
  const hasSignInEndpoint = Boolean(samlpData?.signInEndpoint);
  const defaultMetaDataSource =
    samlpData?.meta_data_source ?? (hasSignInEndpoint ? 'meta_data_file' : 'meta_data_url');

  const form = useStrategyConfigureForm<SamlpConfigureFormValues>(ref, {
    strategy: 'samlp',
    onFormDirty,
    defaultValues: {
      meta_data_source: defaultMetaDataSource,
      metadataUrl: samlpData?.metadataUrl || '',
      signInEndpoint: samlpData?.signInEndpoint || '',
      signingCert: samlpData?.signingCert || '',
      signSAMLRequest: samlpData?.signSAMLRequest || false,
      signatureAlgorithm: samlpData?.signatureAlgorithm || 'rsa-sha256',
      digestAlgorithm: samlpData?.digestAlgorithm || 'sha256',
      bindingMethod: samlpData?.bindingMethod || 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      show_as_button: samlpData?.show_as_button ?? false,
      assign_membership_on_login: samlpData?.assign_membership_on_login ?? false,
      use_for_third_party_client_access: samlpData?.use_for_third_party_client_access ?? false,
      cross_app_access_resource_app:
        samlpData?.cross_app_access_resource_app ??
        (crossAppAccessDefaultValue !== undefined
          ? { status: crossAppAccessDefaultValue }
          : undefined),
      discovery_url: samlpData?.discovery_url ?? '',
      ...spMetadataUrls,
    },
    getData: (samlpForm) => {
      const values = samlpForm.getValues();
      return parseStrategyConfigureValues('samlp', {
        ...values,
        protocolBinding: values.bindingMethod,
      });
    },
    reset: (samlpForm, data) => {
      samlpForm.reset({ ...(data ?? samlpForm.formState.defaultValues), ...spMetadataUrls });
    },
  });

  React.useEffect(() => {
    form.setValue('callback_url', spMetadataUrls.callback_url);
    form.setValue('acs_url', spMetadataUrls.acs_url);
    form.setValue('sp_metadata_url', spMetadataUrls.sp_metadata_url);
  }, [form, spMetadataUrls]);

  const discoveryUrlValue = form.watch('discovery_url') ?? '';

  return (
    <Form {...form}>
      <div className={cn('space-y-6', className)}>
        <SsoSamlConnectionFields readOnly={readOnly} customMessages={customMessages} />

        <SsoSamlRequestSettings
          signRequestCertUrl={spValues.signRequestCertUrl}
          showSignRequest={showSignRequest}
          readOnly={readOnly}
          customMessages={customMessages}
        />

        <SsoSamlServiceProviderFields
          spIssuerUrn={spValues.serviceProviderEntityId}
          customMessages={customMessages}
        />

        <CommonConfigureFields
          idpConfig={idpConfig}
          readOnly={readOnly}
          customMessages={customMessages}
        />

        {showThirdPartyAccess && (
          <FormField
            control={form.control}
            name="use_for_third_party_client_access"
            render={({ field }) => (
              <SsoThirdPartyAccessSection
                checked={field.value ?? false}
                onChange={field.onChange}
                readOnly={readOnly || isThirdPartyAccessReadOnly}
                isOrganizationBlocked={isOrganizationBlocked}
                className={styling?.classes?.['ProviderConfigure-ThirdPartyAccess']}
              />
            )}
          />
        )}

        {showCrossAppAccess && (
          <FormField
            control={form.control}
            name="cross_app_access_resource_app"
            render={({ field }) => (
              <SsoCrossAppAccessSection
                checked={field.value?.status === 'enabled'}
                onChange={(checked) =>
                  field.onChange(checked ? { status: 'enabled' } : { status: 'disabled' })
                }
                readOnly={readOnly || isCrossAppAccessReadOnly}
                strategy="samlp"
                discoveryUrl={discoveryUrlValue}
                onDiscoveryUrlChange={(url) =>
                  form.setValue('discovery_url', url, { shouldDirty: true, shouldValidate: true })
                }
                discoveryUrlError={form.formState.errors.discovery_url?.message}
                className={styling?.classes?.['ProviderConfigure-CrossAppAccess']}
              />
            )}
          />
        )}
      </div>
    </Form>
  );
});
