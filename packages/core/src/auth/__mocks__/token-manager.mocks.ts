import { vi } from 'vitest';

import type { createTokenManager } from '../token-manager';

/**
 * Creates a mock token manager service
 */
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
