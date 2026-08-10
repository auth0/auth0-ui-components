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
 * Threshold at or above which member and invitation totals are shown as an approximation (for example `1,000+`) rather than an exact figure.
 * Changing this also requires updating the `member_management.count_capped` translation in each locale file, which spells the value out.
 */
export const MEMBER_COUNT_CAP = 1000;
