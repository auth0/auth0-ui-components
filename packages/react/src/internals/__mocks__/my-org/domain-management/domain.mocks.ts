import type {
  ComponentAction,
  Domain,
  IdentityProvider,
  IdentityProviderAssociatedWithDomain,
} from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type { DomainTableProps } from '../../../../types/my-org/domain-management/domain-table-types';

export const createMockDomain = (overrides?: Partial<Domain>): Domain => ({
  id: 'domain_abc123xyz456',
  org_id: 'org_abc123xyz456',
  domain: 'example.auth0.com',
  status: 'pending',
  verification_txt: 'auth0-domain-verification=abc123xyz456def789',
  verification_host: '_auth0-challenge.example.auth0.com',
  ...overrides,
});

export const createMockVerifiedDomain = (): Domain =>
  createMockDomain({
    status: 'verified',
  });

export const createMockFailedDomain = (): Domain =>
  createMockDomain({
    status: 'failed',
  });

export const createMockIdentityProvider = (
  overrides: Partial<IdentityProvider> = {},
): IdentityProvider => {
  const baseProvider = {
    id: 'con_abc123xyz456',
    name: 'mock-provider',
    display_name: 'Mock Provider',
    strategy: 'samlp' as const,
  };

  return {
    ...baseProvider,
    ...overrides,
  } as IdentityProvider;
};

export const createMockIdentityProviderAssociatedWithDomain = (
  overrides: Partial<IdentityProviderAssociatedWithDomain> = {},
): IdentityProviderAssociatedWithDomain => {
  const baseProvider = {
    id: 'con_test123',
    display_name: 'Test Provider',
    strategy: 'samlp',
    name: 'test-provider',
    is_associated: false,
  } as const;

  return {
    ...baseProvider,
    ...overrides,
  } as IdentityProviderAssociatedWithDomain;
};

export const createMockIdentityProviderWithoutProvisioning = (
  overrides: Partial<IdentityProvider> = {},
): IdentityProvider => {
  // Use a strategy that doesn't have provisioning enabled by default
  const baseProvider = {
    id: 'con_abc123xyz456',
    name: 'mock-provider-no-provisioning',
    display_name: 'Mock Provider Without Provisioning',
    strategy: 'oidc' as const,
  };

  return {
    ...baseProvider,
    ...overrides,
  } as IdentityProvider;
};

export const createMockDomainTableProps = (
  overrides?: Partial<DomainTableProps>,
): DomainTableProps => ({
  schema: undefined,
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  hideHeader: false,
  readOnly: false,
  createAction: undefined,
  verifyAction: undefined,
  deleteAction: undefined,
  associateToProviderAction: undefined,
  deleteFromProviderAction: undefined,
  ...overrides,
});

export const createMockCreateAction = (): ComponentAction<Domain> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

export const createMockVerifyAction = (): ComponentAction<Domain> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

export const createMockDeleteAction = (): ComponentAction<Domain> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});
