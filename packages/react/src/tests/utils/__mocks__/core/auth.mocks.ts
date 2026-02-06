import type { AuthDetails } from '@auth0/universal-components-core';
import { vi } from 'vitest';

export const createMockAuth = (overrides?: Partial<AuthDetails>): AuthDetails => ({
  domain: 'test-domain.auth0.com',
  authProxyUrl: undefined,
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
    loginWithRedirect: vi.fn(),
    getConfiguration: vi.fn().mockReturnValue({
      domain: 'test-domain.auth0.com',
      clientId: 'test-client-id',
    }),
  },
  ...overrides,
});
