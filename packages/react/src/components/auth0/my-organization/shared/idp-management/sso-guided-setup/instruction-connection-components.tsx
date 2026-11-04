/**
 * Renderers for the interactive content types: configure connection, attribute mapping and the
 * slots other features fill in.
 * @module instruction-connection-components
 * @internal
 */

import { useSsoGuidedSetupContext } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup-context';
import { ProviderConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/provider-configure-fields';
import { SsoProviderAttributeMappings } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-attribute-mappings';
import { useTranslator } from '@/hooks/shared/use-translator';

/**
 * Renders the strategy's connection form (Automatic / Manual tabs for SAML and ADFS). The form
 * and its ref come from the guided setup context.
 * @returns JSX element, or `null` without a configure form in context.
 */
export function InstructionConfigureConnection() {
  const { strategy, configure } = useSsoGuidedSetupContext();

  if (!configure) {
    return null;
  }

  return (
    <ProviderConfigureFields
      ref={configure.ref}
      strategy={strategy}
      connectionSourceSelector="tabs"
      {...configure.props}
    />
  );
}

/**
 * Lists the attribute mappings: the given ones, or the provider's for creation instructions.
 * Before the provider exists (ADFS, PingFederate), shows a short note instead.
 * @returns JSX element
 */
export function InstructionAttributeMapping() {
  const { kind, strategy, provider, attributeMappings, customMessages } =
    useSsoGuidedSetupContext();
  const { t } = useTranslator('idp_management.sso_guided_setup', customMessages);

  const providerAttributes = provider && 'attributes' in provider ? provider.attributes : undefined;
  const mappings = attributeMappings ?? (kind === 'creation' ? providerAttributes : undefined);

  if (!mappings) {
    return (
      <p className="text-sm text-muted-foreground" data-slot="attribute-mapping-pending">
        {t('attribute_mapping_pending')}
      </p>
    );
  }

  return (
    <SsoProviderAttributeMappings
      userAttributeMap={mappings}
      strategy={strategy}
      isProvisioning={kind === 'provisioning'}
    />
  );
}

/**
 * Shows the test connection component when one is provided.
 * @returns The slot content, or `null`.
 */
export function InstructionTestConnection() {
  const { slots } = useSsoGuidedSetupContext();
  return <>{slots?.testConnection ?? null}</>;
}

/**
 * Shows the Google Workspace setup component when one is provided.
 * @returns The slot content, or `null`.
 */
export function InstructionGoogleWorkspaceSetup() {
  const { slots } = useSsoGuidedSetupContext();
  return <>{slots?.googleWorkspaceSetup ?? null}</>;
}
