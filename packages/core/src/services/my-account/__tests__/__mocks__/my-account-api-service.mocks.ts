import type { MyAccountClient } from '@auth0/myaccount-js';
import { vi } from 'vitest';

import type { initializeMyAccountClient } from '../../my-account-api-service';

/**
 * Creates a mock MyAccount API client
 */
export const createMockMyAccountClient = (): ReturnType<typeof initializeMyAccountClient> => {
  return {
    client: {} as MyAccountClient,
    setLatestScopes: vi.fn(),
  };
};

// Re-export shared API service mocks
export {
  createMockContextInterface,
  // Auth Details Mocks
  mockAuthWithDomain,
  mockAuthWithProxyUrl,
  mockAuthWithProxyUrlTrailingSlash,
  mockAuthWithBothDomainAndProxy,
  mockAuthWithNeither,
  mockAuthWithEmptyDomain,
  mockAuthWithEmptyProxyUrl,
  mockAuthWithDomainWhitespace,
  mockAuthWithProxyUrlWhitespace,
  // Token Manager Mocks
  createMockTokenManager,
  createMockTokenManagerWithScopes,
  createMockTokenManagerWithError,
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

// Error Messages (MyAccount-specific)
export const expectedErrors = {
  missingDomainOrProxy: 'Missing domain or proxy URL for MyAccountClient',
  tokenManagerError: 'Token retrieval failed',
};

// MyAccountClient Mock Methods
export const mockMyAccountClientMethods = {
  listFactors: 'listFactors',
  listAuthenticationMethods: 'listAuthenticationMethods',
  createAuthenticationMethod: 'createAuthenticationMethod',
  deleteAuthenticationMethod: 'deleteAuthenticationMethod',
  verifyAuthenticationMethod: 'verifyAuthenticationMethod',
} as const;
