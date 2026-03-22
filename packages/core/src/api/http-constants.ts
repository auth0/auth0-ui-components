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
}

/**
 * Content-Type header values.
 */
export enum ContentType {
  JSON = 'application/json',
}
