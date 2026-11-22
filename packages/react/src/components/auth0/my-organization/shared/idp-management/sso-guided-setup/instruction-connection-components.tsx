/**
 * Renderers for the interactive content types: configure connection, attribute mapping and the
 * slots other features fill in.
 * @module instruction-connection-components
 * @internal
 */

import { ProviderConfigureFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/provider-configure-fields';
import { SsoProviderAttributeMappings } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-attribute-mappings';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { InstructionContentProps } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Renders the strategy's connection form (Automatic / Manual tabs for SAML and ADFS).
 * @param props - Component props.
 * @param props.setup - Guided setup state; carries the form and its ref.
 * @returns JSX element, or `null` without a configure form.
 */
export function InstructionConfigureConnection({ setup }: InstructionContentProps) {
  const { strategy, configure } = setup;

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
 * Without either, shows a short note; when the mappings can't be loaded, an error.
 * @param props - Component props.
 * @param props.setup - Guided setup state; carries the mappings and the created provider.
 * @returns JSX element
 */
export function InstructionAttributeMapping({ setup }: InstructionContentProps) {
  const {
    kind,
    strategy,
    provider,
    attributeMappings,
    attributeMappingsError,
    onRetryAttributeMappings,
    customMessages,
  } = setup;
  const { t } = useTranslator('idp_management.sso_guided_setup', customMessages);

  if (attributeMappingsError === 'unavailable') {
    return (
      <p
        className="text-sm text-destructive-foreground"
        role="alert"
        data-slot="attribute-mapping-error"
      >
        {t('attribute_mapping_unavailable')}
      </p>
    );
  }

  if (attributeMappingsError === 'load_failed') {
    return (
      <div className="space-y-3" role="alert" data-slot="attribute-mapping-error">
        <p className="text-sm text-destructive-foreground">{t('attribute_mapping_load_failed')}</p>
        {onRetryAttributeMappings && (
          <Button type="button" variant="outline" size="sm" onClick={onRetryAttributeMappings}>
            {t('attribute_mapping_retry')}
          </Button>
        )}
      </div>
    );
  }

  const providerAttributes = provider && 'attributes' in provider ? provider.attributes : undefined;
  const mappings = attributeMappings ?? (kind === 'creation' ? providerAttributes : undefined);

  if (!mappings) {
    const isPending = kind === 'creation' && !provider;
    return (
      <p className="text-sm text-muted-foreground" data-slot="attribute-mapping-pending">
        {t(isPending ? 'attribute_mapping_pending' : 'attribute_mapping_unavailable')}
      </p>
    );
  }

  return (
    <SsoProviderAttributeMappings
      userAttributeMap={mappings}
      strategy={strategy}
      isProvisioning={kind === 'provisioning'}
      hideExternalNamespace={kind === 'provisioning' && strategy === 'okta'}
    />
  );
}

/**
 * Shows the test connection component when one is provided.
 * @param props - Component props.
 * @param props.setup - Guided setup state; carries the slots.
 * @returns The slot content, or `null`.
 */
export function InstructionTestConnection({ setup }: InstructionContentProps) {
  return <>{setup.slots?.testConnection ?? null}</>;
}
