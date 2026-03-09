/**
 * Shared HTTP client for proxy-mode API calls.
 * @module proxy-http-client
 * @internal
 */

/**
 * A lightweight HTTP client scoped to a base URL.
 * Provides `get` and `post` helpers with standardized error handling.
 */
export interface ProxyHttpClient {
  /** Sends a GET request with optional query parameters. */
  get: <T>(path: string, query?: Record<string, string>) => Promise<T>;
  /** Sends a POST request with a JSON body. */
  post: <T>(path: string, body: unknown) => Promise<T>;
}

/**
 * Creates a proxy HTTP client scoped to the given base URL.
 *
 * @param baseUrl - The base URL for all requests (trailing slash is stripped).
 * @returns A {@link ProxyHttpClient} with `get` and `post` methods.
 */
export function createProxyHttpClient(baseUrl: string): ProxyHttpClient {
  const normalizedBase = baseUrl.replace(/\/$/, '');

  const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw Object.assign(new Error(errorBody.error_description || `HTTP ${response.status}`), {
        status: response.status,
        body: errorBody,
        ...errorBody,
      });
    }
    return response.json();
  };

  const get = async <T>(path: string, query?: Record<string, string>): Promise<T> => {
    const url = new URL(`${normalizedBase}${path}`);
    if (query) {
      Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const response = await fetch(url.toString());
    return handleResponse<T>(response);
  };

  const post = async <T>(path: string, body: unknown): Promise<T> => {
    const response = await fetch(`${normalizedBase}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  };

  return { get, post };
}
