/**
 * HTTP header names and values.
 * @module http-constants
 * @internal
 */

/**
 * Standard and custom HTTP header names.
 * Standard headers use Title-Case, custom headers use lowercase.
 */
export enum HeaderName {
  ContentType = 'Content-Type',
  Authorization = 'Authorization',
  Auth0Scope = 'auth0-scope',
  Auth0Client = 'Auth0-Client',
}

/**
 * Content-Type header values.
 */
export enum ContentType {
  JSON = 'application/json',
}
