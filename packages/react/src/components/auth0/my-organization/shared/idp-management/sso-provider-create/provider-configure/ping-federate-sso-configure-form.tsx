/**
 * PingFederate SSO provider configuration form.
 * @module ping-federate-sso-configure-form
 * @internal
 */

import type { PingFederateConfigureFormValues } from '@auth0/universal-components-core';
import * as React from 'react';

import { CommonConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/common-configure-fields';
import { SsoFileField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-file-field';
import { SsoSamlRequestSettings } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-request-settings';
import { SsoUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-url-field';
import { Form } from '@/components/ui/form';
import {
  useStrategyConfigureForm,
  type StrategyConfigureFormHandle,
} from '@/hooks/my-organization/use-strategy-configure-form';
import { ALLOWED_CERT_EXTENSIONS } from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import { cn } from '@/lib/utils';
import type { ProviderConfigureFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

const PING_FEDERATE_HELP_LINKS = {
  sign_request: 'domain/pem?cert=connection',
} as const;

export type PingFederateConfigureFormHandle =
  StrategyConfigureFormHandle<PingFederateConfigureFormValues>;

interface PingFederateConfigureFormProps extends Omit<ProviderConfigureFieldsProps, 'strategy'> {}

export const PingFederateProviderForm = React.forwardRef<
  PingFederateConfigureFormHandle,
  PingFederateConfigureFormProps
>(function PingFederateProviderForm(
  { initialData, readOnly = false, customMessages = {}, className, onFormDirty, idpConfig },
  ref,
) {
  const pingFederateData = initialData as PingFederateConfigureFormValues | undefined;

  const form = useStrategyConfigureForm<PingFederateConfigureFormValues>(ref, {
    strategy: 'pingfederate',
    onFormDirty,
    defaultValues: {
      pingFederateBaseUrl: pingFederateData?.pingFederateBaseUrl || '',
      signingCert: pingFederateData?.signingCert || '',
      signSAMLRequest: pingFederateData?.signSAMLRequest || false,
      signatureAlgorithm: pingFederateData?.signatureAlgorithm || 'rsa-sha256',
      digestAlgorithm: pingFederateData?.digestAlgorithm || 'sha256',
      show_as_button: pingFederateData?.show_as_button ?? false,
      assign_membership_on_login: pingFederateData?.assign_membership_on_login ?? false,
    },
  });

  return (
    <Form {...form}>
      <div className={cn('space-y-6', className)}>
        <SsoUrlField
          name="pingFederateBaseUrl"
          messageKey="fields.ping-federate.ping_federate_baseurl"
          readOnly={readOnly}
          customMessages={customMessages}
        />

        <SsoFileField
          name="signingCert"
          messageKey="fields.ping-federate.sign_cert"
          accept={ALLOWED_CERT_EXTENSIONS.join(',')}
          invalidFileMessageKey="fields.ping-federate.sign_cert.error"
          readOnly={readOnly}
          customMessages={customMessages}
        />

        <SsoSamlRequestSettings
          signRequestCertUrl={PING_FEDERATE_HELP_LINKS.sign_request}
          messageKey="fields.ping-federate.advanced_settings"
          showProtocolBinding={false}
          signRequestHelperText="single"
          readOnly={readOnly}
          customMessages={customMessages}
        />

        <CommonConfigureFields
          idpConfig={idpConfig}
          readOnly={readOnly}
          customMessages={customMessages}
        />
      </div>
    </Form>
  );
});
