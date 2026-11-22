/**
 * Guided provisioning setup shown by `SsoProviderEdit` from the Provisioning tab.
 * @module sso-provisioning-guided-setup
 * @internal
 */

import {
  getStrategyUserAttributes,
  toProvisioningAttributeMappings,
  type GetIdpConfigurationResponseContent,
  type IdpKnownResponse,
  type IdpProvisioningConfig,
  type IdpStrategy,
  type SsoGuidedSetupMessages,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { PROVISIONING_INSTRUCTION_RENDERERS } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instruction-provisioning-components';
import { SsoGuidedSetup } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup';
import { ProvisioningManageToken } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/provisioning-manage-token';
import type { ProvisioningManageTokenProps } from '@/types/my-organization/idp-management/sso-provisioning/provisioning-manage-token-types';

export interface SsoProvisioningGuidedSetupProps
  extends Omit<ProvisioningManageTokenProps, 'customMessages'> {
  provider: IdpKnownResponse;
  provisioningConfig: IdpProvisioningConfig | null;
  idpConfig?: GetIdpConfigurationResponseContent | null;
  organizationDisplayName?: string;
  hideLifecycleWarnings?: boolean;
  onComplete: () => void;
  customMessages?: Partial<SsoGuidedSetupMessages>;
  manageTokenMessages?: ProvisioningManageTokenProps['customMessages'];
  className?: string;
}

/**
 * The strategy's provisioning instructions with the SCIM endpoint, the bearer token manager and
 * the attribute mappings.
 * @param props - {@link SsoProvisioningGuidedSetupProps}
 * @returns JSX element
 */
export function SsoProvisioningGuidedSetup({
  provider,
  provisioningConfig,
  idpConfig,
  organizationDisplayName,
  hideLifecycleWarnings,
  onComplete,
  customMessages,
  manageTokenMessages,
  className,
  isScimTokensLoading,
  isScimTokenCreating,
  isScimTokenDeleting,
  onListScimTokens,
  onCreateScimToken,
  onDeleteScimToken,
  permissions,
  readOnly,
  styling,
}: SsoProvisioningGuidedSetupProps) {
  const strategy = provider.strategy as IdpStrategy;

  // Mapping instructions from the IdP configuration; without any, the provider's mappings.
  const attributeMappings = React.useMemo(() => {
    const userAttributes = getStrategyUserAttributes(idpConfig, strategy);
    const configured = userAttributes ? toProvisioningAttributeMappings(userAttributes) : [];
    return configured.length > 0 ? configured : (provisioningConfig?.attributes ?? null);
  }, [idpConfig, strategy, provisioningConfig?.attributes]);

  const slots = React.useMemo(
    () => ({
      bearerToken: (
        <ProvisioningManageToken
          isScimTokensLoading={isScimTokensLoading}
          isScimTokenCreating={isScimTokenCreating}
          isScimTokenDeleting={isScimTokenDeleting}
          onListScimTokens={onListScimTokens}
          onCreateScimToken={onCreateScimToken}
          onDeleteScimToken={onDeleteScimToken}
          permissions={permissions}
          readOnly={readOnly}
          customMessages={manageTokenMessages}
          styling={styling}
        />
      ),
    }),
    [
      isScimTokensLoading,
      isScimTokenCreating,
      isScimTokenDeleting,
      onListScimTokens,
      onCreateScimToken,
      onDeleteScimToken,
      permissions,
      readOnly,
      manageTokenMessages,
      styling,
    ],
  );

  return (
    <SsoGuidedSetup
      strategy={strategy}
      kind="provisioning"
      connectionName={provider.name ?? undefined}
      organizationDisplayName={organizationDisplayName}
      hideLifecycleWarnings={hideLifecycleWarnings}
      provider={provider}
      attributeMappings={attributeMappings}
      entryContext={{ groupProvisioningEnabled: false }}
      slots={slots}
      renderers={PROVISIONING_INSTRUCTION_RENDERERS}
      enabled={permissions.canReadConfiguration}
      onComplete={onComplete}
      customMessages={customMessages}
      className={className}
    />
  );
}
