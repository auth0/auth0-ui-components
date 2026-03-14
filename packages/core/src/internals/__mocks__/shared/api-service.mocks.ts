import { vi } from 'vitest';

import type {
  AuthDetails,
  BasicAuth0ContextInterface,
  ProxyAuthConfig,
  SpaAuthConfig,
} from '../../../auth/auth-types';

// =============================================================================
// Test Constants
// =============================================================================

export const TEST_DOMAIN = 'test.auth0.com';
export const TEST_CLIENT_ID = 'test-client-id';

// =============================================================================
// Mock Context Interface Helpers
// =============================================================================

export const makeCreateFetcherMock = () =>
  vi.fn().mockReturnValue({
    fetchWithAuth: vi.fn().mockResolvedValue(new Response()),
  });

export const mockMfa = {
  getAuthenticators: vi.fn().mockResolvedValue([]),
  enroll: vi.fn().mockResolvedValue({}),
  challenge: vi.fn().mockResolvedValue({}),
  verify: vi.fn().mockResolvedValue({}),
};

export const createMockContextInterface = (): BasicAuth0ContextInterface => ({
  getConfiguration: vi.fn().mockReturnValue({ domain: TEST_DOMAIN, clientId: TEST_CLIENT_ID }),
  createFetcher: makeCreateFetcherMock(),
  mfa: mockMfa,
});

// =============================================================================
// Auth Details Mocks
// =============================================================================

export const mockAuthWithDomain: AuthDetails = {
  domain: TEST_DOMAIN,
  contextInterface: createMockContextInterface(),
};

export const mockAuthWithProxyUrl: AuthDetails = {
  authProxyUrl: 'https://proxy.example.com',
};

export const mockAuthWithProxyUrlTrailingSlash: AuthDetails = {
  authProxyUrl: 'https://proxy.example.com/',
};

export const mockAuthWithBothDomainAndProxy: AuthDetails = {
  domain: 'test.auth0.com',
  authProxyUrl: 'https://proxy.example.com',
};

export const mockAuthWithNeither: AuthDetails = {};

export const mockAuthWithEmptyDomain: AuthDetails = {
  domain: '',
};

export const mockAuthWithEmptyProxyUrl: AuthDetails = {
  authProxyUrl: '',
};

export const mockAuthWithDomainWhitespace: AuthDetails = {
  domain: '  test.auth0.com  ',
};

export const mockAuthWithProxyUrlWhitespace: AuthDetails = {
  authProxyUrl: '  https://proxy.example.com  ',
};

// =============================================================================
// ClientAuthConfig Mocks (for service tests)
// =============================================================================

export const mockProxyConfig: ProxyAuthConfig = {
  mode: 'proxy',
  proxyUrl: 'https://proxy.example.com',
};

export const mockProxyConfigTrailingSlash: ProxyAuthConfig = {
  mode: 'proxy',
  proxyUrl: 'https://proxy.example.com/',
};

export const mockProxyConfigWhitespace: ProxyAuthConfig = {
  mode: 'proxy',
  proxyUrl: '  https://proxy.example.com  ',
};

export const mockSpaConfigWhitespaceDomain: SpaAuthConfig = {
  mode: 'spa',
  domain: '  test.auth0.com  ',
  contextInterface: createMockContextInterface(),
};

export function createMockSpaConfig(): SpaAuthConfig {
  return {
    mode: 'spa',
    domain: TEST_DOMAIN,
    contextInterface: {
      getConfiguration: vi.fn().mockReturnValue({ domain: TEST_DOMAIN, clientId: TEST_CLIENT_ID }),
      createFetcher: makeCreateFetcherMock(),
      mfa: mockMfa,
    },
  };
}
