/**
 * SAML connection source: metadata URL, or sign-in URL plus signing certificate.
 * @module sso-saml-connection-fields
 * @internal
 */

import { useFormContext } from 'react-hook-form';

import {
  SsoConnectionSourceSelector,
  type ConnectionSourceSelectorVariant,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-connection-source-selector';
import { SsoFileField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-file-field';
import { SsoUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-url-field';
import { ALLOWED_CERT_EXTENSIONS } from '@/lib/constants/my-organization/idp-management/idp-management-constants';

export interface SsoSamlConnectionFieldsProps {
  readOnly?: boolean;
  /** How the source is chosen: a radio group (advanced flow) or tabs (guided setup). */
  sourceSelector?: ConnectionSourceSelectorVariant;
  customMessages?: Partial<Record<string, unknown>>;
}

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
  const { watch } = useFormContext();
  const isManual = watch('meta_data_source') === 'meta_data_file';

  return (
    <>
      <SsoConnectionSourceSelector
        messageKey="fields.samlp.meta_data_source"
        variant={sourceSelector}
        readOnly={readOnly}
        customMessages={customMessages}
      />

      {!isManual && (
        <SsoUrlField
          name="metadataUrl"
          messageKey="fields.samlp.meta_data_url"
          required
          readOnly={readOnly}
          customMessages={customMessages}
        />
      )}

      {isManual && (
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
            readOnly={readOnly}
            customMessages={customMessages}
          />
        </>
      )}
    </>
  );
}
