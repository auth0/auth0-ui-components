/**
 * Shared utilities for action cancellation via onBefore hooks.
 * @module action-cancelled
 */

export const ACTION_CANCELLED_ERROR = 'ACTION_CANCELLED';

/**
 * Checks whether an error was thrown due to an action being cancelled by an onBefore hook.
 * @param error - The error to check.
 * @returns True if the error represents a cancelled action.
 */
export const isActionCancelledError = (error: unknown): boolean => {
  return error instanceof Error && error.message === ACTION_CANCELLED_ERROR;
};
