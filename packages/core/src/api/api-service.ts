import type { RequestOptions, HttpMethod, ErrorResponse } from './types';
import { createApiError, isApiError } from './api-error';

const STATUS_MESSAGES: Readonly<Record<number, string>> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  408: 'Request Timeout',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
} as const;

/**
 * Builds safe headers for fetch request,
 * ensuring no invalid or empty header values.
 * @param accessToken optional Bearer token
 * @returns headers object safe for fetch
 */
function buildHeaders(accessToken?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof accessToken === 'string' && accessToken.trim()) {
    headers['Authorization'] = `Bearer ${accessToken.trim()}`;
  }

  return headers;
}

/**
 * Performs a typed HTTP request with automatic JSON handling and structured error reporting.
 *
 * @template T - The expected return type of the API response.
 * @param endpoint - Full URL to the API endpoint.
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.).
 * @param options - Request options including body and access token.
 * @param enableLogging - If true, logs request and response for debugging.
 * @returns A promise that resolves with the parsed response data of type `T`.
 * @throws ApiError - If the response is not OK or fetch fails.
 */
async function request<T>(
  endpoint: string,
  method: HttpMethod,
  options: RequestOptions = {},
  enableLogging = false,
): Promise<T> {
  const { body, accessToken } = options;

  // Construct headers with optional Authorization
  const reqHeaders = buildHeaders(accessToken);

  // Assemble request options
  const requestInit: RequestInit = {
    method,
    headers: reqHeaders,
    ...(body && { body: JSON.stringify(body) }),
  };

  if (enableLogging) {
    console.debug(`[APIService] ${method} ${endpoint}`, requestInit);
  }

  try {
    const response = await fetch(endpoint, requestInit);

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        (data as ErrorResponse)?.message || STATUS_MESSAGES[response.status] || 'Request failed';

      throw createApiError(message, response.status, data);
    }

    if (enableLogging) {
      console.debug(`[APIService] Response from ${endpoint}`, data);
    }

    return data as T;
  } catch (err) {
    // Re-throw if already a known API error
    if (isApiError(err)) throw err;

    const message = err instanceof Error ? err.message : 'Unexpected network error';

    throw createApiError(message, 0, undefined, err);
  }
}

export function get<T = unknown>(
  endpoint: string,
  options?: Omit<RequestOptions, 'body'>,
  enableLogging = false,
): Promise<T> {
  return request<T>(endpoint, 'GET', options, enableLogging);
}

export function post<T = unknown>(
  endpoint: string,
  body: unknown,
  options?: Omit<RequestOptions, 'body'>,
  enableLogging = false,
): Promise<T> {
  return request<T>(endpoint, 'POST', { ...options, body }, enableLogging);
}

export function put<T = unknown>(
  endpoint: string,
  body: unknown,
  options?: Omit<RequestOptions, 'body'>,
  enableLogging = false,
): Promise<T> {
  return request<T>(endpoint, 'PUT', { ...options, body }, enableLogging);
}

export function patch<T = unknown>(
  endpoint: string,
  body: unknown,
  options?: Omit<RequestOptions, 'body'>,
  enableLogging = false,
): Promise<T> {
  return request<T>(endpoint, 'PATCH', { ...options, body }, enableLogging);
}

export function del<T = unknown>(
  endpoint: string,
  options?: Omit<RequestOptions, 'body'>,
  enableLogging = false,
): Promise<T> {
  return request<T>(endpoint, 'DELETE', options, enableLogging);
}
