import { ApiError } from './api-error';
import { delay } from './utils/delay';
import type { HttpMethod, RequestOptions } from './types';

/**
 * HTTP status codes mapped to their default messages
 */
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
 * Service for making HTTP requests with retry logic and error handling
 * 
 * @example
 * ```ts
 * const api = new APIService();
 * 
 * // Enable logging for development
 * api.setLogging(process.env.NODE_ENV === 'development');
 * 
 * // Make authenticated request
 * const data = await api.get('/users/me', { 
 *   token: 'jwt_token',
 *   retryCount: 3
 * });
 * ```
 */
export class APIService {
  private enableLogging = false;

  /**
   * Enable or disable request/response logging
   */
  setLogging(enabled: boolean): void {
    this.enableLogging = enabled;
  }

  /**
   * Makes an HTTP request with retry logic and error handling
   * 
   * @param endpoint - API endpoint URL
   * @param method - HTTP method
   * @param options - Request configuration
   * @returns Promise resolving to the response data
   * @throws {ApiError} On network or HTTP errors
   */
  private async request<T>(
    endpoint: string,
    method: HttpMethod,
    { 
      body, 
      headers = {}, 
      retryCount = 2, 
      token 
    }: RequestOptions = {}
  ): Promise<T> {
    // Prepare request configuration
    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    // Log request if enabled
    this.log(`${method} ${endpoint}`, requestInit);

    try {
      const response = await fetch(endpoint, requestInit);
      const data = await this.parseResponse(response);

      if (!response.ok) {
        throw this.createError(response.status, data);
      }

      this.log(`Response from ${endpoint}`, data);
      return data as T;

    } catch (error) {
      if (error instanceof ApiError) throw error;

      // Retry failed requests
      if (retryCount > 0) {
        const delayMs = 2 ** (2 - retryCount) * 1000;
        await delay(delayMs);
        return this.request<T>(endpoint, method, { 
          body, 
          headers, 
          retryCount: retryCount - 1, 
          token 
        });
      }

      throw new ApiError('Network error', 0);
    }
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';
    
    try {
      return contentType.includes('application/json') 
        ? await response.json()
        : await response.text();
    } catch {
      return null;
    }
  }

  /**
   * Create ApiError from response data
   */
  private createError(status: number, data: any): ApiError {
    const message = data?.message || 
                   data?.error || 
                   STATUS_MESSAGES[status] || 
                   'Request failed';
    return new ApiError(message, status, data);
  }

  /**
   * Log messages if logging is enabled
   */
  private log(message: string, data?: unknown): void {
    if (this.enableLogging) {
      console.log(`[APIService] ${message}`, data);
    }
  }

  /**
   * Make GET request
   */
  get<T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.request<T>(endpoint, 'GET', options);
  }

  /**
   * Make POST request
   */
  post<T = unknown>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.request<T>(endpoint, 'POST', { ...options, body });
  }

  /**
   * Make PUT request
   */
  put<T = unknown>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.request<T>(endpoint, 'PUT', { ...options, body });
  }

  /**
   * Make PATCH request
   */
  patch<T = unknown>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', { ...options, body });
  }

  /**
   * Make DELETE request
   */
  delete<T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', options);
  }
}