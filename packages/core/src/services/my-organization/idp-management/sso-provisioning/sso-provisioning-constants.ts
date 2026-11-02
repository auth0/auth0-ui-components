/**
 * SSO provisioning constants for SCIM token management.
 * @module sso-provisioning-constants
 * @internal
 */
import type { IdpScimTokenScope } from './sso-provisioning-types';

/** Minimum token lifetime the API accepts, in seconds. */
export const SCIM_TOKEN_MIN_LIFETIME_SECONDS = 900;

/** All SCIM token scopes. Used when the Connection Profile sets no scope list. */
export const ALL_SCIM_TOKEN_SCOPES: IdpScimTokenScope[] = [
  'get:users',
  'post:users',
  'put:users',
  'patch:users',
  'delete:users',
];
