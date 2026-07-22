/**
 * Permission type definitions.
 * @module permission-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

/** Response body of `GET /my-org/user-permissions` — the granted subset of requested permissions. */
export type GetUserPermissionsResponseContent = MyOrganization.GetUserPermissionsResponseContent;

/** Request parameters for `GET /my-org/user-permissions` (comma-separated permission list). */
export type GetUserPermissionsRequestParameters =
  MyOrganization.GetUserPermissionsRequestParameters;

/** Behavior tier a user falls into for a given resource, derived from their permissions. */
export type PermissionTier = 'admin' | 'editor' | 'viewer';

/** A MyOrganization permission scope string (e.g. `delete:my_org:members`), sourced from the SDK. */
export type OauthScope = MyOrganization.OauthScope;

/** The resource segment of a scope (e.g. `members`, `domains`), inferred from {@link OauthScope}. */
export type MyOrgResource = OauthScope extends `${string}:${string}:${infer Resource}`
  ? Resource
  : never;
