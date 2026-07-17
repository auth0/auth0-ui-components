/**
 * Member management related constants for the My Organization section.
 * @internal
 */

/**
 * Maximum number of roles that can be assigned to a member in a single
 * assign/remove request.
 */
export const MAX_ROLES_PER_REQUEST = 10;

/**
 * Maximum total number of roles a member can hold.
 */
export const MAX_ROLES_PER_MEMBER = 50;

/**
 * Maximum number of roles that can be available for assignment in the system.
 * This is used to limit the number of roles fetched and displayed in the UI when assigning roles to members.
 */
export const MAX_ROLES_AVAILABLE_FOR_ASSIGNMENT = 100;

/**
 * Default number of roles fetched for the role selector when no search term is
 * active. Typing in the selector triggers a server-side `name` search instead of
 * relying on this initial page.
 */
export const DEFAULT_ROLES_PAGE_SIZE = 10;
