/**
 * SAML-P SSO provider configuration form.
 * @module samlp-sso-configure-form
 * @internal
 */

import {
  createProviderConfigureSchema,
  STRATEGIES,
  type SamlpConfigureFormInput,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { getConnectionAccessDefaults } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-defaults';
import { SsoSamlConnectionFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-connection-fields';
import { SsoSamlRequestSettings } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-request-settings';
import { SsoSamlServiceProviderFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-service-provider-fields';
import { Form } from '@/components/ui/form';
import { useServiceProviderValues } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-service-provider-values';
import {
  parseStrategyConfigureValues,
  useStrategyConfigureForm,
} from '@/hooks/my-organization/idp-management/sso-provider-shared/use-strategy-configure-form';
import { cn } from '@/lib/utils';
import type {
  SamlpConfigureFormHandle,
  SamlpConfigureFormProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export const SamlpProviderForm = React.forwardRef<
  SamlpConfigureFormHandle,
  SamlpConfigureFormProps
>(function SamlpProviderForm(
  {
    initialData,
    readOnly = false,
    isLoginSettingsReadOnly = readOnly,
    customMessages = {},
    className,
    onFormDirty,
    idpConfig,
    mode = 'create',
    connectionName: connectionNameProp,
    connectionNamePrefix,
    resolveSamlMetadata,
    showSignRequest = true,
    connectionSourceSelector = 'radio',
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

  const schema = createProviderConfigureSchema('samlp');
  const form = useStrategyConfigureForm(ref, {
    schema,
    readOnly,
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
      discovery_url: samlpData?.discovery_url ?? '',
      ...spMetadataUrls,
      ...getConnectionAccessDefaults(
        samlpData,
        crossAppAccessDefaultValue,
        mode,
        showCrossAppAccess,
        showThirdPartyAccess,
      ),
    },
    getData: (samlpForm) => {
      const values = samlpForm.getValues();
      return parseStrategyConfigureValues(schema, {
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

  return (
    <Form {...form}>
      <div className={cn('space-y-6', className)}>
        <SsoSamlConnectionFields
          readOnly={readOnly}
          sourceSelector={connectionSourceSelector}
          customMessages={customMessages}
        />

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
          readOnly={isLoginSettingsReadOnly}
          customMessages={customMessages}
          strategy={STRATEGIES.SAMLP}
          showThirdPartyAccess={showThirdPartyAccess}
          isThirdPartyAccessReadOnly={isThirdPartyAccessReadOnly}
          isOrganizationBlocked={isOrganizationBlocked}
          showCrossAppAccess={showCrossAppAccess}
          isCrossAppAccessReadOnly={isCrossAppAccessReadOnly}
          classes={styling?.classes}
        />
      </div>
    </Form>
  );
});
