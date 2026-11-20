/**
 * Domain management utility functions.
 * @module domain-management-utils
 * @internal
 */

import {
  DEFAULT_DOMAIN_VERIFICATION_MODE,
  DOMAIN_VERIFICATION_MODES,
  type GetIdpConfigurationResponseContent,
  type IdpDomainVerificationMode,
  type IdpKnownResponse,
  type OrganizationDiscoveryConfig,
} from '@auth0/universal-components-core';

import {
  ASSOCIATION_BLOCK_REASONS,
  type AssociationBlockReason,
} from '@/lib/constants/my-organization/domain-management/domain-management-constants';
import type { Domain } from '@/types/my-organization/domain-management/domain-table-types';

type ProviderDomains = Pick<IdpKnownResponse, 'is_enabled' | 'domains'> | null | undefined;

/**
 * Returns badge variant for domain status.
 * @param status - Current status
 * @returns The badge variant
 * @internal
 */
export function getStatusBadgeVariant(
  status: Domain['status'],
): 'success' | 'warning' | 'destructive' | 'outline' {
  switch (status) {
    case 'verified':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Reads how identity providers use verified domains.
 * @param idpConfig - Identity provider configuration
 * @returns The domain verification mode
 * @internal
 */
export function getDomainVerificationMode(
  idpConfig: GetIdpConfigurationResponseContent | null | undefined,
): IdpDomainVerificationMode {
  return idpConfig?.domain_aliases_config?.domain_verification ?? DEFAULT_DOMAIN_VERIFICATION_MODE;
}

/**
 * Whether domains can't be associated with identity providers at all.
 * @param mode - Domain verification mode
 * @returns True in `none` mode
 * @internal
 */
export function isDomainAssociationUnavailable(mode: IdpDomainVerificationMode): boolean {
  return mode === DOMAIN_VERIFICATION_MODES.NONE;
}

/**
 * Whether `required` mode is still waiting for the provider's first verified domain.
 * @param mode - Domain verification mode
 * @param provider - The identity provider
 * @returns True when a domain is required but none is associated
 * @internal
 */
export function isRequiredDomainMissing(
  mode: IdpDomainVerificationMode,
  provider: ProviderDomains,
): boolean {
  const isRequired = mode === DOMAIN_VERIFICATION_MODES.REQUIRED;
  const hasNoDomains = !provider?.domains?.length;

  return isRequired && hasNoDomains;
}

/**
 * Whether a disabled provider can't be enabled yet.
 * @param mode - Domain verification mode
 * @param provider - The identity provider
 * @returns True when enabling must be blocked
 * @internal
 */
export function isProviderEnableBlockedByDomains(
  mode: IdpDomainVerificationMode,
  provider: ProviderDomains,
): boolean {
  const isDisabled = !!provider && !provider.is_enabled;

  return isDisabled && isRequiredDomainMissing(mode, provider);
}

/**
 * Whether the provider's last domain must stay: an enabled provider can't lose it in `required` mode.
 * @param mode - Domain verification mode
 * @param provider - The identity provider
 * @returns True when the last domain is locked
 * @internal
 */
export function isLastRequiredDomainLocked(
  mode: IdpDomainVerificationMode,
  provider: ProviderDomains,
): boolean {
  const isRequired = mode === DOMAIN_VERIFICATION_MODES.REQUIRED;
  const isEnabled = !!provider?.is_enabled;
  const hasOneDomainAtMost = (provider?.domains?.length ?? 0) <= 1;

  return isRequired && isEnabled && hasOneDomainAtMost;
}

/**
 * Why an association switch can't be used, checked in priority order; `null` when it can.
 * @param state - What the switch depends on
 * @param state.hasPermission - The user may associate (or dissociate) the domain
 * @param state.isProviderAccessRestricted - The organization's access level doesn't allow changing the provider's domains
 * @param state.isAssociationUnavailable - The mode doesn't allow association at all
 * @param state.isLastDomainLocked - The domain is an enabled provider's last one in `required` mode
 * @returns The blocking reason, or `null`
 * @internal
 */
export function getAssociationBlockReason({
  hasPermission,
  isProviderAccessRestricted = false,
  isAssociationUnavailable,
  isLastDomainLocked,
}: {
  hasPermission: boolean;
  isProviderAccessRestricted?: boolean;
  isAssociationUnavailable: boolean;
  isLastDomainLocked: boolean;
}): AssociationBlockReason | null {
  if (!hasPermission) return ASSOCIATION_BLOCK_REASONS.FORBIDDEN;
  if (isProviderAccessRestricted) return ASSOCIATION_BLOCK_REASONS.ACCESS_RESTRICTED;
  if (isAssociationUnavailable) return ASSOCIATION_BLOCK_REASONS.ASSOCIATION_UNAVAILABLE;
  if (isLastDomainLocked) return ASSOCIATION_BLOCK_REASONS.LAST_DOMAIN;
  return null;
}

/**
 * Resolves what the organization discovery policy means for the UI.
 * @param policy - `use_for_organization_discovery` from the organization configuration
 * @returns Whether discovery is shown, whether it is locked, and the value to start from
 * @internal
 */
export function getDiscoveryState(policy: OrganizationDiscoveryConfig | null | undefined): {
  isAvailable: boolean;
  isReadOnly: boolean;
  defaultValue: boolean;
} {
  if (!policy) return { isAvailable: false, isReadOnly: true, defaultValue: false };

  const isReadOnly = (policy.allowed_values?.length ?? 0) <= 1;
  const onlyAllowedValue = policy.allowed_values?.[0] ?? false;
  const defaultValue = isReadOnly ? onlyAllowedValue : policy.default_value;

  return { isAvailable: true, isReadOnly, defaultValue };
}

/**
 * Whether a domain is used for discovery. An omitted value takes the policy default.
 * @param domain - The domain
 * @param policy - Discovery policy
 * @returns True when discovery is on for the domain
 * @internal
 */
export function isDomainUsedForDiscovery(
  domain: Pick<Domain, 'use_for_organization_discovery'>,
  policy: OrganizationDiscoveryConfig | null | undefined,
): boolean {
  return domain.use_for_organization_discovery ?? policy?.default_value ?? false;
}
