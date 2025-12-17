import { vi, type Mock } from 'vitest';

// =============================================================================
// Types
// =============================================================================

export interface MockClientConfig {
  baseUrl?: string;
  domain?: string;
  telemetry?: boolean;
  fetcher?: (url: string, init?: RequestInit) => Promise<Response>;
}

// =============================================================================
// Global Fetch Mock Helpers
// =============================================================================

const originalFetch = global.fetch;

export const saveOriginalFetch = (): void => {
  global.fetch = vi.fn();
};

export const restoreOriginalFetch = (): void => {
  global.fetch = originalFetch;
};

export const createMockFetch = (): ReturnType<typeof vi.fn> =>
  vi.fn().mockResolvedValue({ ok: true });

// =============================================================================
// Client Mock Helpers
// =============================================================================

export const getConfigFromMockCalls = (mockClient: Mock): MockClientConfig => {
  const calls = mockClient.mock.calls;
  return calls[0]![0] as MockClientConfig;
};

export const getFetcherFromMockCalls = (
  mockClient: Mock,
): ((url: string, init?: RequestInit) => Promise<Response>) | undefined => {
  const config = getConfigFromMockCalls(mockClient);
  return config.fetcher;
};

// =============================================================================
// Fetch Call Assertion Helpers
// =============================================================================

export const getHeadersFromFetchCall = (
  mockFetch: Mock,
  callIndex = 0,
): Headers | Record<string, string> => {
  const fetchCall = mockFetch.mock.calls[callIndex]!;
  return fetchCall[1]?.headers as Headers | Record<string, string>;
};
