import type {
  GetIdpConfigurationResponseContent,
  OrganizationDiscoveryConfig,
} from '@auth0/universal-components-core';
import { describe, it, expect } from 'vitest';

import {
  getAssociationBlockReason,
  getDiscoveryState,
  getDomainVerificationMode,
  getStatusBadgeVariant,
  isDomainAssociationUnavailable,
  isDomainUsedForDiscovery,
  isLastRequiredDomainLocked,
  isProviderEnableBlockedByDomains,
  isRequiredDomainMissing,
} from '../domain-management-utils';

import { ASSOCIATION_BLOCK_REASONS } from '@/lib/constants/my-organization/domain-management/domain-management-constants';

const policy = (
  overrides: Partial<OrganizationDiscoveryConfig> = {},
): OrganizationDiscoveryConfig => ({
  default_value: false,
  allowed_values: [true, false],
  ...overrides,
});

describe('domain-management-utils', () => {
  describe('getStatusBadgeVariant', () => {
    it.each([
      ['verified', 'success'],
      ['pending', 'warning'],
      ['failed', 'destructive'],
    ] as const)('maps %s to %s', (status, variant) => {
      expect(getStatusBadgeVariant(status)).toBe(variant);
    });
  });

  describe('getDomainVerificationMode', () => {
    it.each(['none', 'optional', 'required'] as const)('returns the configured %s mode', (mode) => {
      const config = {
        domain_aliases_config: { domain_verification: mode },
      } as GetIdpConfigurationResponseContent;

      expect(getDomainVerificationMode(config)).toBe(mode);
    });

    it('defaults to optional when the configuration is missing', () => {
      expect(getDomainVerificationMode(null)).toBe('optional');
      expect(getDomainVerificationMode(undefined)).toBe('optional');
    });

    it('defaults to optional when domain_aliases_config is not reported', () => {
      expect(getDomainVerificationMode({} as GetIdpConfigurationResponseContent)).toBe('optional');
    });
  });

  describe('getAssociationBlockReason', () => {
    const allowed = {
      hasPermission: true,
      isAssociationUnavailable: false,
      isLastDomainLocked: false,
    };

    it('returns null when nothing blocks the switch', () => {
      expect(getAssociationBlockReason(allowed)).toBeNull();
    });

    it.each([
      ['forbidden', { hasPermission: false }],
      ['association_unavailable', { isAssociationUnavailable: true }],
      ['last_domain', { isLastDomainLocked: true }],
    ] as const)('returns %s on its own', (reason, overrides) => {
      expect(getAssociationBlockReason({ ...allowed, ...overrides })).toBe(reason);
    });

    it('reports a missing permission before anything else', () => {
      expect(
        getAssociationBlockReason({
          hasPermission: false,
          isAssociationUnavailable: true,
          isLastDomainLocked: true,
        }),
      ).toBe(ASSOCIATION_BLOCK_REASONS.FORBIDDEN);
    });

    it('reports the mode before the last-domain lock', () => {
      expect(
        getAssociationBlockReason({
          hasPermission: true,
          isAssociationUnavailable: true,
          isLastDomainLocked: true,
        }),
      ).toBe(ASSOCIATION_BLOCK_REASONS.ASSOCIATION_UNAVAILABLE);
    });
  });

  describe('isDomainAssociationUnavailable', () => {
    it('is true only in none mode', () => {
      expect(isDomainAssociationUnavailable('none')).toBe(true);
      expect(isDomainAssociationUnavailable('optional')).toBe(false);
      expect(isDomainAssociationUnavailable('required')).toBe(false);
    });
  });

  describe('isRequiredDomainMissing', () => {
    it('is true in required mode when the provider has no domain', () => {
      expect(isRequiredDomainMissing('required', { is_enabled: false, domains: [] })).toBe(true);
      expect(isRequiredDomainMissing('required', { is_enabled: true })).toBe(true);
    });

    it('is true in required mode while the provider is still loading', () => {
      expect(isRequiredDomainMissing('required', null)).toBe(true);
    });

    it('is false once the provider has a domain', () => {
      expect(isRequiredDomainMissing('required', { is_enabled: false, domains: ['a.com'] })).toBe(
        false,
      );
    });

    it.each(['none', 'optional'] as const)('is false in %s mode', (mode) => {
      expect(isRequiredDomainMissing(mode, { is_enabled: false, domains: [] })).toBe(false);
    });
  });

  describe('isProviderEnableBlockedByDomains', () => {
    it('blocks enabling a disabled provider without domains in required mode', () => {
      expect(isProviderEnableBlockedByDomains('required', { is_enabled: false, domains: [] })).toBe(
        true,
      );
      expect(isProviderEnableBlockedByDomains('required', { is_enabled: false })).toBe(true);
    });

    it('allows enabling once the provider has a domain', () => {
      expect(
        isProviderEnableBlockedByDomains('required', { is_enabled: false, domains: ['a.com'] }),
      ).toBe(false);
    });

    it('never blocks an already enabled provider', () => {
      expect(isProviderEnableBlockedByDomains('required', { is_enabled: true, domains: [] })).toBe(
        false,
      );
    });

    it.each(['none', 'optional'] as const)('does not block in %s mode', (mode) => {
      expect(isProviderEnableBlockedByDomains(mode, { is_enabled: false, domains: [] })).toBe(
        false,
      );
    });

    it('does not block while the provider is still loading', () => {
      expect(isProviderEnableBlockedByDomains('required', null)).toBe(false);
    });
  });

  describe('isLastRequiredDomainLocked', () => {
    it('locks the only domain of an enabled provider in required mode', () => {
      expect(isLastRequiredDomainLocked('required', { is_enabled: true, domains: ['a.com'] })).toBe(
        true,
      );
    });

    it('releases the lock when more than one domain remains', () => {
      expect(
        isLastRequiredDomainLocked('required', { is_enabled: true, domains: ['a.com', 'b.com'] }),
      ).toBe(false);
    });

    it('does not lock a disabled provider', () => {
      expect(
        isLastRequiredDomainLocked('required', { is_enabled: false, domains: ['a.com'] }),
      ).toBe(false);
    });

    it.each(['none', 'optional'] as const)('does not lock in %s mode', (mode) => {
      expect(isLastRequiredDomainLocked(mode, { is_enabled: true, domains: ['a.com'] })).toBe(
        false,
      );
    });
  });

  describe('getDiscoveryState', () => {
    it('is unavailable and locked without a policy', () => {
      expect(getDiscoveryState(null)).toEqual({
        isAvailable: false,
        isReadOnly: true,
        defaultValue: false,
      });
      expect(getDiscoveryState(undefined).isAvailable).toBe(false);
    });

    it('is editable and uses default_value when several values are allowed', () => {
      expect(getDiscoveryState(policy({ default_value: true }))).toEqual({
        isAvailable: true,
        isReadOnly: false,
        defaultValue: true,
      });
    });

    it('is locked to the only allowed value', () => {
      expect(getDiscoveryState(policy({ default_value: false, allowed_values: [true] }))).toEqual({
        isAvailable: true,
        isReadOnly: true,
        defaultValue: true,
      });
    });

    it('is locked and off when no value is allowed', () => {
      expect(getDiscoveryState(policy({ allowed_values: [] }))).toEqual({
        isAvailable: true,
        isReadOnly: true,
        defaultValue: false,
      });
    });
  });

  describe('isDomainUsedForDiscovery', () => {
    it('uses the value on the domain', () => {
      expect(isDomainUsedForDiscovery({ use_for_organization_discovery: true }, policy())).toBe(
        true,
      );
      expect(
        isDomainUsedForDiscovery(
          { use_for_organization_discovery: false },
          policy({ default_value: true }),
        ),
      ).toBe(false);
    });

    it('falls back to the policy default when the domain omits it', () => {
      expect(isDomainUsedForDiscovery({}, policy({ default_value: true }))).toBe(true);
    });

    it('is off when neither the domain nor a policy says otherwise', () => {
      expect(isDomainUsedForDiscovery({}, null)).toBe(false);
    });
  });
});
