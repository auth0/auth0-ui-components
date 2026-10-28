/**
 * My Account organization constants.
 * @module organization-management-constants
 */

/**
 * Valid name for a new organization: lowercase letters, digits, hyphens, and underscores;
 * must start and end with a letter or digit; must not start with `org_` (reserved for IDs).
 */
export const ORGANIZATION_CREATE_NAME_REGEX = /^(?!org_)[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

export const ORGANIZATION_CREATE_NAME_MAX_LENGTH = 50;

export const ORGANIZATION_CREATE_DISPLAY_NAME_MAX_LENGTH = 255;

/** A new organization's logo must be an `https` URL of at most 1024 characters (My Account API). */
export const ORGANIZATION_CREATE_LOGO_URL_REGEX = /^(?=.{1,1024}$)https:\/\/\S+$/;
