/**
 * Renderers for the service provider values an administrator copies into their identity provider.
 * @module instruction-copy-value
 * @internal
 */

import type { ServiceProviderValues } from '@auth0/universal-components-core';

import { useSsoGuidedSetupContext } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup-context';
import { SsoServiceProviderField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-service-provider-field';
import { useServiceProviderValues } from '@/hooks/my-organization/use-service-provider-values';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { InstructionContentProps } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

interface CopyValueDefinition {
  value: keyof ServiceProviderValues;
  messageKey: string;
  hasHelperText?: boolean;
}

/** Copy-value content types and the value each one shows. */
export const COPY_VALUE_CONTENT_TYPES: Record<string, CopyValueDefinition> = {
  callback_url_component: { value: 'callbackUrl', messageKey: 'callback_url', hasHelperText: true },
  sso_url_component: { value: 'samlSsoUrl', messageKey: 'sso_url', hasHelperText: true },
  service_provider_entity_id_component: {
    value: 'serviceProviderEntityId',
    messageKey: 'service_provider_entity_id',
    hasHelperText: true,
  },
  adfs_relying_party_ws_federation_passive_protocol_url_component: {
    value: 'adfsWsFederationUrl',
    messageKey: 'adfs_ws_federation_url',
  },
  adfs_relying_party_trust_identifier_component: {
    value: 'adfsRelyingPartyIdentifier',
    messageKey: 'adfs_relying_party_identifier',
  },
  google_apps_authorized_javascript_origins_component: {
    value: 'googleJavascriptOrigin',
    messageKey: 'google_javascript_origin',
  },
  google_apps_authorized_redirect_uri_component: {
    value: 'googleRedirectUri',
    messageKey: 'google_redirect_uri',
  },
  pingfederate_partners_entity_id_component: {
    value: 'pingFederatePartnerEntityId',
    messageKey: 'pingfederate_partner_entity_id',
  },
  pingfederate_endpoint_url_component: {
    value: 'pingFederateEndpointUrl',
    messageKey: 'pingfederate_endpoint_url',
  },
};

/**
 * Shows the copy value for the content type, built for the tenant and connection name.
 * @param props - Component props.
 * @param props.content - Instruction content item.
 * @returns JSX element, or `null` for a type that is not a copy value.
 */
export function InstructionCopyValue({ content }: InstructionContentProps) {
  const { connectionName, resolveSamlMetadata, customMessages } = useSsoGuidedSetupContext();
  const { t } = useTranslator('idp_management.sso_guided_setup', customMessages);
  const values = useServiceProviderValues({ connectionName, resolveSamlMetadata });

  const definition = COPY_VALUE_CONTENT_TYPES[content.type];
  if (!definition) {
    return null;
  }

  return (
    <SsoServiceProviderField
      id={content.key}
      value={values[definition.value]}
      label={t(`copy_values.${definition.messageKey}.label`)}
      helperText={
        definition.hasHelperText ? t(`copy_values.${definition.messageKey}.helper_text`) : undefined
      }
    />
  );
}
