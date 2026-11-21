/**
 * Renderers for the service provider values an administrator copies into their identity provider.
 * @module instruction-copy-value
 * @internal
 */

import { SsoServiceProviderField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-service-provider-field';
import { useServiceProviderValues } from '@/hooks/my-organization/idp-management/sso-provider-shared/use-service-provider-values';
import { useTranslator } from '@/hooks/shared/use-translator';
import { COPY_VALUE_CONTENT_TYPES } from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import type { InstructionContentProps } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Shows the copy value for the content type, built for the tenant and connection name.
 * @param props - Component props.
 * @param props.content - Instruction content item.
 * @param props.setup - Guided setup state (connection name, SAML metadata resolver).
 * @returns JSX element, or `null` for a type that is not a copy value.
 */
export function InstructionCopyValue({ content, setup }: InstructionContentProps) {
  const { connectionName, resolveSamlMetadata, customMessages } = setup;
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
    />
  );
}
