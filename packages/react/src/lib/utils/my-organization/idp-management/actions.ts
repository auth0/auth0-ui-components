export const ACTION_CANCELLED_ERROR = 'ACTION_CANCELLED';

export const isActionCancelledError = (error: unknown): boolean =>
  error instanceof Error && error.message === ACTION_CANCELLED_ERROR;
