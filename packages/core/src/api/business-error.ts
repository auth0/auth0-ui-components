/**
 * Business error types and utilities for domain-specific error handling.
 * @module business-error
 * @internal
 */

/**
 * Data structure for business error information.
 * @internal
 */
export interface BusinessErrorData {
  message: string;
}

/**
 * Custom error class for business logic errors.
 * @internal
 */
export class BusinessError extends Error {
  public readonly type = 'BusinessError';

  constructor(data: BusinessErrorData) {
    super(data.message);
    this.name = 'BusinessError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessError);
    }
  }
}

/**
 * Type guard to check if an error is a BusinessError.
 * @internal
 *
 * @param error - The unknown value to test
 * @returns `true` if the error is a BusinessError instance or has `type: 'BusinessError'`, `false` otherwise
 */
export function isBusinessError(error: unknown): error is BusinessError {
  return (
    error instanceof BusinessError ||
    (typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      (error as { type: unknown }).type === 'BusinessError')
  );
}
