/**
 * Renderers for the provisioning-only content types: SCIM endpoint, bearer token and the Okta
 * schema URN.
 * @module instruction-provisioning-components
 * @internal
 */

import { buildScimEndpointUrl } from '@auth0/universal-components-core';

import { SCIM_NAMESPACE } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-attribute-mappings';
import { SsoServiceProviderField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-service-provider-field';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  InstructionContentProps,
  InstructionRenderers,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * The SCIM endpoint of the provider, to copy into the identity provider.
 * @param props - Component props.
 * @param props.content - Instruction content item.
 * @param props.setup - Guided setup state; carries the provider.
 * @returns JSX element, or `null` without a provider.
 */
export function InstructionScimEndpoint({ content, setup }: InstructionContentProps) {
  const { provider, customMessages } = setup;
  const { t } = useTranslator('idp_management.sso_guided_setup', customMessages);
  const { t: tCommon } = useTranslator('common');
  const { coreClient } = useCoreClient();

  if (!provider?.id) return null;

  return (
    <SsoServiceProviderField
      id={content.key}
      value={buildScimEndpointUrl(
        coreClient?.getDomain() || tCommon('your_domain_placeholder'),
        provider.id,
      )}
      label={t('copy_values.scim_endpoint_url.label')}
    />
  );
}

/**
 * Shows the bearer token manager the hosting page provides.
 * @param props - Component props.
 * @param props.setup - Guided setup state; carries the slots.
 * @returns The slot content, or `null`.
 */
export function InstructionBearerToken({ setup }: InstructionContentProps) {
  return <>{setup.slots?.bearerToken ?? null}</>;
}

/**
 * The SCIM schema namespace Okta asks for as the External namespace.
 * @param props - Component props.
 * @param props.content - Instruction content item.
 * @param props.setup - Guided setup state.
 * @returns JSX element
 */
export function InstructionOktaSchemaUrn({ content, setup }: InstructionContentProps) {
  const { customMessages } = setup;
  const { t } = useTranslator('idp_management.sso_guided_setup', customMessages);

  return (
    <SsoServiceProviderField
      id={content.key}
      value={SCIM_NAMESPACE}
      label={t('copy_values.external_namespace.label')}
    />
  );
}

/** Renderers for the provisioning instruction content types. */
export const PROVISIONING_INSTRUCTION_RENDERERS: InstructionRenderers = {
  scim_endpoint_url_component: InstructionScimEndpoint,
  bearer_token_component: InstructionBearerToken,
  okta_schema_urn_component: InstructionOktaSchemaUrn,
};
