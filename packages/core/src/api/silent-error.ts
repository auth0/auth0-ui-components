export interface SilentErrorData {
  message: string;
}

export class SilentError extends Error {
  public readonly type = 'SilentError';

  constructor(data: SilentErrorData) {
    super(data.message);
    this.name = 'SilentError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SilentError);
    }
  }
}

export function isSilentError(error: unknown): error is SilentError {
  return (
    error instanceof SilentError ||
    (typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      (error as { type: unknown }).type === 'SilentError')
  );
}
