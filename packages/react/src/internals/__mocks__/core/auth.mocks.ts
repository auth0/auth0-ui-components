import type { AuthDetailsCore } from '@auth0-web-ui-components/core';
import { vi } from 'vitest';

export const createMockAuth = (overrides?: Partial<AuthDetailsCore>): AuthDetailsCore => ({
  domain: 'test-domain.auth0.com',
  clientId: 'test-client-id',
  accessToken: 'test-access-token',
  scopes: 'openid profile email',
  authProxyUrl: undefined,
  servicesConfig: {
    myAccount: {
      enabled: true,
    },
    myOrg: {
      enabled: true,
    },
  },
  contextInterface: {
    isAuthenticated: true,
    user: {
      sub: 'auth0|test-user',
      name: 'Test User',
      email: 'test@example.com',
    },
    getAccessTokenSilently: vi
      .fn()
      .mockImplementation(async (options?: Record<string, unknown>) => {
        if (options?.detailedResponse) {
          return {
            id_token: 'mock-id-token',
            expires_in: 3600,
            access_token: 'mock-access-token',
          };
        }
        return 'mock-access-token';
      }),
    getAccessTokenWithPopup: vi.fn(),
  },
  ...overrides,
});
