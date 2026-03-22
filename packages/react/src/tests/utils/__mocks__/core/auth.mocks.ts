import type { AuthDetails } from '@auth0/universal-components-core';
import { vi } from 'vitest';

export const createMockAuth = (overrides?: Partial<AuthDetails>): AuthDetails => ({
  domain: 'test-domain.auth0.com',
  authProxyUrl: undefined,
  contextInterface: {
    getConfiguration: vi.fn().mockReturnValue({
      domain: 'test-domain.auth0.com',
      clientId: 'test-client-id',
    }),
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
  ...overrides,
});
