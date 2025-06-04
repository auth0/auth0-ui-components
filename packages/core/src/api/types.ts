export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  accessToken?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  retryCount?: number;
  token?: string; // auth token to be sent in Authorization header
}

export interface HttpRequest {
  url: string;
  method?: HttpMethod;
  options?: RequestOptions;
}

/**
 * Type for structured API error data
 */
export interface ApiErrorData {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ErrorResponse {
  message?: string;
}
