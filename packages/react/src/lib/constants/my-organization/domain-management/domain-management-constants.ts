/**
 * Constants for domain management components.
 * @module domain-management-constants
 * @internal
 */

export const ASSOCIATION_BLOCK_REASONS = {
  FORBIDDEN: 'forbidden',
  ACCESS_RESTRICTED: 'access_restricted',
  ASSOCIATION_UNAVAILABLE: 'association_unavailable',
  LAST_DOMAIN: 'last_domain',
} as const;

export type AssociationBlockReason =
  (typeof ASSOCIATION_BLOCK_REASONS)[keyof typeof ASSOCIATION_BLOCK_REASONS];
