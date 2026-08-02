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
 * Default page size for the role selector when no search term is active.
 */
export const DEFAULT_ROLES_PAGE_SIZE = 10;

/**
 * Min roles count to pre-fetch full roles before opening assign roles modal.
 */
export const ROLES_PREFETCH_THRESHOLD = 10;
