/**
 * SAML connection source: metadata URL, or sign-in URL plus signing certificate.
 * @module sso-saml-connection-fields
 * @internal
 */

import type { SamlpConfigureFormValues } from '@auth0/universal-components-core';

import { SsoConnectionSourceSelector } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-connection-source-selector';
import { SsoFileField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-file-field';
import { SsoUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-url-field';
import { useFileContentField } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-file-content-field';
import { ALLOWED_CERT_EXTENSIONS } from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import type { SsoSamlConnectionFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Lets the administrator connect the SAML identity provider either by metadata URL or manually
 * (sign-in URL and signing certificate). Reads and writes `meta_data_source`, `metadataUrl`,
 * `signInEndpoint` and `signingCert` in the surrounding form.
 * @param props - Component props.
 * @param props.readOnly - Disable editing.
 * @param props.sourceSelector - `radio` (default) or `tabs` (Automatic / Manual).
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoSamlConnectionFields({
  readOnly = false,
  sourceSelector = 'radio',
  customMessages = {},
}: SsoSamlConnectionFieldsProps) {
  const certificate = useFileContentField<SamlpConfigureFormValues>('signingCert');

  return (
    <SsoConnectionSourceSelector
      messageKey="fields.samlp.meta_data_source"
      variant={sourceSelector}
      readOnly={readOnly}
      customMessages={customMessages}
      panels={{
        meta_data_url: (
          <SsoUrlField
            name="metadataUrl"
            messageKey="fields.samlp.meta_data_url"
            required
            readOnly={readOnly}
            customMessages={customMessages}
          />
        ),
        meta_data_file: (
          <>
            <SsoUrlField
              name="signInEndpoint"
              messageKey="fields.samlp.single_sign_on_login_url"
              required
              readOnly={readOnly}
              customMessages={customMessages}
            />
            <SsoFileField
              name="signingCert"
              messageKey="fields.samlp.cert"
              accept={ALLOWED_CERT_EXTENSIONS.join(',')}
              files={certificate.files}
              onFilesChange={certificate.onFilesChange}
              readOnly={readOnly}
              customMessages={customMessages}
            />
          </>
        ),
      }}
    />
  );
}
