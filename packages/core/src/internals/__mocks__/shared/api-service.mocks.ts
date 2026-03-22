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

export const createMockContextInterface = (): BasicAuth0ContextInterface => ({
  getConfiguration: vi.fn().mockReturnValue({ domain: TEST_DOMAIN, clientId: TEST_CLIENT_ID }),
  mfa: {
    getAuthenticators: vi.fn().mockResolvedValue([]),
    enroll: vi.fn().mockResolvedValue({}),
    challenge: vi.fn().mockResolvedValue({}),
    verify: vi.fn().mockResolvedValue({}),
  },
  createFetcher: vi.fn().mockReturnValue({
    fetchWithAuth: vi.fn().mockResolvedValue(new Response()),
  }),
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

// =============================================================================
// Token Test Data
// =============================================================================

export const mockTokens = {
  standard: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
  long: 'a'.repeat(1000),
  withSpecialChars: 'token+with/special=chars',
  empty: '',
};

export function createMockSpaConfig(): SpaAuthConfig {
  return {
    mode: 'spa',
    domain: TEST_DOMAIN,
    contextInterface: {
      getConfiguration: vi.fn().mockReturnValue({ domain: TEST_DOMAIN, clientId: TEST_CLIENT_ID }),
      mfa: {
        getAuthenticators: vi.fn().mockResolvedValue([]),
        enroll: vi.fn().mockResolvedValue({}),
        challenge: vi.fn().mockResolvedValue({}),
        verify: vi.fn().mockResolvedValue({}),
      },
      createFetcher: vi.fn().mockReturnValue({
        fetchWithAuth: vi.fn().mockResolvedValue(new Response()),
      }),
    },
  };
}

// =============================================================================
// Headers Validation Helpers
// =============================================================================

export const extractHeaders = (init?: RequestInit): Record<string, string> => {
  if (!init?.headers) return {};

  if (init.headers instanceof Headers) {
    const headerObj: Record<string, string> = {};
    init.headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    return headerObj;
  }

  if (Array.isArray(init.headers)) {
    const headerObj: Record<string, string> = {};
    init.headers.forEach(([key, value]) => {
      headerObj[key] = value;
    });
    return headerObj;
  }

  return init.headers as Record<string, string>;
};

// =============================================================================
// Expected Header Sets
// =============================================================================

export const expectedProxyHeaders = {
  withScope: (scope: string) => ({
    'Content-Type': 'application/json',
    'auth0-scope': scope,
  }),
  withoutScope: {
    'Content-Type': 'application/json',
  },
  getRequest: {},
};

export const expectedDomainHeaders = {
  withToken: (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }),
  withoutToken: {
    'Content-Type': 'application/json',
  },
  withCustomContentType: (token: string, contentType: string) => ({
    'Content-Type': contentType,
    Authorization: `Bearer ${token}`,
  }),
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Helper function to create AuthDetails with specific configurations.
 */
export function createMockAuthDetails(options: {
  domain?: string;
  authProxyUrl?: string;
}): AuthDetails {
  return {
    ...(options.domain && { domain: options.domain }),
    ...(options.authProxyUrl && { authProxyUrl: options.authProxyUrl }),
  };
}

/**
 * Helper to check if headers match expected values
 */
export function checkHeaders(
  init: RequestInit | undefined,
  expectedHeaders: Record<string, string>,
): boolean {
  const actualHeaders = extractHeaders(init);
  return Object.entries(expectedHeaders).every(([key, value]) => actualHeaders[key] === value);
}

/**
 * Helper to get expected proxy base URL for a given service path
 */
export function getExpectedProxyBaseUrl(proxyUrl: string, servicePath: string): string {
  const cleanUrl = proxyUrl.replace(/\/$/, '');
  return `${cleanUrl}/${servicePath}`;
}

/**
 * Helper to get expected domain URL
 */
export function getExpectedDomainUrl(domain: string): string {
  return domain.trim();
}
