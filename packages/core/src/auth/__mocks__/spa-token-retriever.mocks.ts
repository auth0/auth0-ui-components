import { vi } from 'vitest';

import type { createSpaTokenRetriever } from '../spa-token-retriever';

/**
 * Creates a mock SPA token retriever service
 */
export const createMockSpaTokenRetriever = (
  tokenValue: string | undefined = 'mock-access-token',
): ReturnType<typeof createSpaTokenRetriever> => ({
  getToken: vi.fn(async () => tokenValue),
});

export const createMockSpaTokenRetrieverWithScopes = (
  tokenValue: string | undefined = 'mock-access-token',
): ReturnType<typeof createSpaTokenRetriever> & {
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

export const createMockSpaTokenRetrieverWithError = (
  error: Error = new Error('Token retrieval failed'),
): ReturnType<typeof createSpaTokenRetriever> => ({
  getToken: async () => {
    throw error;
  },
});
