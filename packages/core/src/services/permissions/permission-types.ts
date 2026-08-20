/**
 * Permission type definitions.
 * @module permission-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

/** A permission scope string (e.g. `delete:my_org:memberships`) */
export type OauthScope = MyOrganization.OauthScope;
