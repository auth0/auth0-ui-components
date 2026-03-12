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

export const createMockFetch = (): ReturnType<typeof vi.fn> =>
  vi.fn().mockResolvedValue({ ok: true });

// =============================================================================
// Client Mock Helpers
// =============================================================================

export const getConfigFromMockCalls = (mockClient: Mock, callIndex = 0): MockClientConfig => {
  const calls = mockClient.mock.calls;
  return calls[callIndex]![0] as MockClientConfig;
};

export const getFetcherFromMockCalls = (
  mockClient: Mock,
  callIndex = 0,
): ((url: string, init?: RequestInit) => Promise<Response>) | undefined => {
  const config = getConfigFromMockCalls(mockClient, callIndex);
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
