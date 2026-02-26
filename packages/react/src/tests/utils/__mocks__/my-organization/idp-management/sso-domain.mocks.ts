import type { Domain, IdentityProvider } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type {
  SsoProviderCreateHandlerProps,
  SsoProviderCreateLogicProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

export const createMockSsoDomain = (overrides?: Partial<Domain>): Domain => ({
  id: 'domain-1',
  org_id: 'organization-1',
  domain: 'example.com',
  status: 'pending',
  verification_txt: 'auth0-domain-verification=test-token',
  verification_host: '_auth0-challenge.example.com',
  ...overrides,
});

export const createMockVerifiedSsoDomain = (overrides?: Partial<Domain>): Domain =>
  createMockSsoDomain({
    status: 'verified',
    ...overrides,
  });

export const createMockSsoProvider = (overrides?: Partial<IdentityProvider>): IdentityProvider =>
  ({
    id: 'provider-1',
    name: 'Test Provider',
    strategy: 'oidc',
    options: {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      issuer: 'https://example.com',
      discovery_url: 'https://example.com/.well-known/openid_configuration',
    },
    ...overrides,
  }) as IdentityProvider;

export function createMockSsoProviderCreateLogic(
  overrides: Partial<SsoProviderCreateLogicProps> = {},
): SsoProviderCreateLogicProps {
  return {
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    backButton: undefined,
    isCreating: false,
    strategy: undefined,
    details: undefined,
    configure: undefined,
    isLoadingConfig: false,
    filteredStrategies: [],
    isLoadingIdpConfig: false,
    idpConfig: undefined,
    formData: {},
    ...overrides,
  };
}

export function createMockSsoProviderCreateHandler(
  overrides: Partial<SsoProviderCreateHandlerProps> = {},
): SsoProviderCreateHandlerProps {
  return {
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    setFormData: vi.fn(),
    detailsRef: { current: null },
    configureRef: { current: null },
    handleCreate: vi.fn(),
    createStepActions: () => ({
      onNextAction: vi.fn(),
      onPreviousAction: vi.fn(),
    }),
    ...overrides,
  };
}
