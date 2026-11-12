/**
 * SSO provider access level types.
 * @module sso-provider-access-types
 */

import type { IdpAccessLevel } from '@auth0/universal-components-core';

/** What the organization may do with a provider at its access level. */
export interface ProviderAccess {
  accessLevel: IdpAccessLevel;
  /** Display name, connection options and third-party settings (`full`). */
  canEditDetails: boolean;
  /** Login button and auto-membership (`limited`+). */
  canEditLoginSettings: boolean;
  canToggle: boolean;
  canDetach: boolean;
  canDelete: boolean;
  canManageDomains: boolean;
  canSyncAttributes: boolean;
}
