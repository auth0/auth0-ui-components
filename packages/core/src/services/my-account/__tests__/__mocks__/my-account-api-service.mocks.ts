import { vi } from 'vitest';

import type { MyAccountApiClient } from '../../my-account-api-service';

/**
 * Creates a mock MyAccount API client
 */
export const createMockMyAccountClient = (): MyAccountApiClient => {
  const mock = {
    withScopes: vi.fn(),
    factors: {} as MyAccountApiClient['factors'],
    authenticationMethods: {} as MyAccountApiClient['authenticationMethods'],
  };
  mock.withScopes.mockReturnValue(mock);
  return mock as unknown as MyAccountApiClient;
};

// Re-export shared API service mocks
export {
  createMockContextInterface,
  // ClientAuthConfig Mocks
  mockProxyConfig,
  mockProxyConfigTrailingSlash,
  mockProxyConfigWhitespace,
  mockSpaConfigWhitespaceDomain,
  createMockSpaConfig,
  // AuthDetails Mocks (for core-client tests)
  mockAuthWithDomain,
  mockAuthWithProxyUrl,
  mockAuthWithProxyUrlTrailingSlash,
  mockAuthWithBothDomainAndProxy,
  mockAuthWithNeither,
  mockAuthWithEmptyDomain,
  mockAuthWithEmptyProxyUrl,
  mockAuthWithDomainWhitespace,
  mockAuthWithProxyUrlWhitespace,
  // Token Test Data
  mockTokens,
  // Headers Helpers
  extractHeaders,
  expectedProxyHeaders,
  expectedDomainHeaders,
  // Helper Functions
  createMockAuthDetails,
  checkHeaders,
  getExpectedDomainUrl,
  getExpectedProxyBaseUrl as getExpectedProxyBaseUrlWithPath,
} from '../../../../internals/__mocks__/shared/api-service.mocks';

// =============================================================================
// MyAccount-specific Test Data
// =============================================================================

// Expected Proxy URL helper (service-specific path)
export const getExpectedProxyBaseUrl = (proxyUrl: string): string => {
  const cleanUrl = proxyUrl.replace(/\/$/, '');
  return `${cleanUrl}/me`;
};

// Scope Test Data (MyAccount-specific)
export const mockScopes = {
  empty: '',
  mfa: 'read:me:authentication_methods write:me:authentication_methods',
  profile: 'read:me:profile',
  email: 'read:me:email',
  complex: 'read:me:profile write:me:profile read:me:authentication_methods',
};

// Request Init Test Data (MyAccount-specific)
export const mockRequestInits = {
  get: {
    method: 'GET',
  },
  post: {
    method: 'POST',
    body: JSON.stringify({ test: 'data' }),
  },
  postWithHeaders: {
    method: 'POST',
    body: JSON.stringify({ test: 'data' }),
    headers: {
      'X-Custom-Header': 'custom-value',
    },
  },
  withContentType: {
    method: 'POST',
    body: JSON.stringify({ test: 'data' }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  },
};

// Error Messages (MyAccount-specific — thrown by createCoreClient, not the service directly)
export const expectedErrors = {
  missingContextInterface: 'Missing context interface',
  missingDomain: 'Missing domain',
};

// MyAccountClient Mock Methods
export const mockMyAccountClientMethods = {
  listFactors: 'listFactors',
  listAuthenticationMethods: 'listAuthenticationMethods',
  createAuthenticationMethod: 'createAuthenticationMethod',
  deleteAuthenticationMethod: 'deleteAuthenticationMethod',
  verifyAuthenticationMethod: 'verifyAuthenticationMethod',
} as const;
