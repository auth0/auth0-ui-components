import { vi } from 'vitest';

import type { AuthDetails } from '../../../../auth/auth-types';
import type { createTokenManager } from '../../../../auth/token-manager';

/**
 * Mock data for testing my-account-api-service
 */

// Auth Details Mocks
export const mockAuthWithDomain: AuthDetails = {
  domain: 'test.auth0.com',
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

// Token Manager Mocks
export const createMockTokenManager = (
  tokenValue: string | undefined = 'mock-access-token',
): ReturnType<typeof createTokenManager> => ({
  getToken: vi.fn(async () => tokenValue),
});

export const createMockTokenManagerWithScopes = (
  tokenValue: string | undefined = 'mock-access-token',
): ReturnType<typeof createTokenManager> & {
  lastScope?: string;
  lastAudiencePath?: string;
} => {
  const mockManager = {
    lastScope: undefined as string | undefined,
    lastAudiencePath: undefined as string | undefined,
    getToken: vi.fn(async (scope: string, audiencePath: string) => {
      mockManager.lastScope = scope;
      mockManager.lastAudiencePath = audiencePath;
      return tokenValue;
    }),
  };
  return mockManager;
};

export const createMockTokenManagerWithError = (
  error: Error = new Error('Token retrieval failed'),
): ReturnType<typeof createTokenManager> => ({
  getToken: async () => {
    throw error;
  },
});

// MyAccountClient Mock (to be used with vi.fn() in tests)
export const mockMyAccountClientMethods = {
  listFactors: 'listFactors',
  listAuthenticationMethods: 'listAuthenticationMethods',
  createAuthenticationMethod: 'createAuthenticationMethod',
  deleteAuthenticationMethod: 'deleteAuthenticationMethod',
  verifyAuthenticationMethod: 'verifyAuthenticationMethod',
} as const;

// Expected URLs
export const getExpectedProxyBaseUrl = (proxyUrl: string): string => {
  const cleanUrl = proxyUrl.replace(/\/$/, '');
  return `${cleanUrl}/me`;
};

export const getExpectedDomainUrl = (domain: string): string => {
  return domain.trim();
};

// Headers Validation Helpers
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

// Scope Test Data
export const mockScopes = {
  empty: '',
  mfa: 'read:me:authentication_methods write:me:authentication_methods',
  profile: 'read:me:profile',
  email: 'read:me:email',
  complex: 'read:me:profile write:me:profile read:me:authentication_methods',
};

// Token Test Data
export const mockTokens = {
  standard: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
  long: 'a'.repeat(1000),
  withSpecialChars: 'token+with/special=chars',
  empty: '',
};

// Request Init Test Data
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

// Expected Header Sets
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

// Error Messages
export const expectedErrors = {
  missingDomainOrProxy: 'Missing domain or proxy URL for MyAccountClient',
  tokenManagerError: 'Token retrieval failed',
};

/**
 * Helper function to create AuthDetails with specific configurations
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
