/**
 * SAML service provider values: callback, ACS and metadata URLs, and the SP issuer URN.
 * @module sso-saml-service-provider-fields
 * @internal
 */

import type { SamlpConfigureFormValues } from '@auth0/universal-components-core';

import { SsoServiceProviderField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-service-provider-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoSamlServiceProviderFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Renders the SAML service provider values. The URLs are read from the form fields
 * `callback_url`, `acs_url` and `sp_metadata_url`; the issuer URN is passed in.
 * @param props - Component props.
 * @param props.spIssuerUrn - SP issuer URN.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoSamlServiceProviderFields({
  spIssuerUrn,
  customMessages = {},
}: SsoSamlServiceProviderFieldsProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );

  return (
    <>
      <SsoServiceProviderField<SamlpConfigureFormValues>
        name="callback_url"
        label={t('fields.samlp.callback_url.label')}
        helperText={t('fields.samlp.callback_url.helper_text')}
      />
      <SsoServiceProviderField<SamlpConfigureFormValues>
        name="acs_url"
        label={t('fields.samlp.acs_url.label')}
        helperText={t('fields.samlp.acs_url.helper_text')}
      />
      <SsoServiceProviderField<SamlpConfigureFormValues>
        name="sp_metadata_url"
        label={t('fields.samlp.sp_metadata_url.label')}
        helperText={t('fields.samlp.sp_metadata_url.helper_text')}
      />
      <SsoServiceProviderField
        id="sp_issuer_urn"
        value={spIssuerUrn}
        label={t('fields.samlp.sp_issuer_urn.label')}
        helperText={t('fields.samlp.sp_issuer_urn.helper_text')}
      />
    </>
  );
}
