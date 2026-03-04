import {
  getStatusCode,
  hasApiErrorBody,
  isMfaRequiredError,
} from '@auth0/universal-components-core';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useTranslator } from '@/hooks/shared/use-translator';

interface ErrorHandlerCallOptions {
  getErrorMessage?: (error: unknown) => string;
  showToast?: boolean;
}

// Skips MFA and 500+ errors (handled by GateKeeper)
const shouldHandleError = (error: unknown): boolean => {
  if (!error) return false;

  if (isMfaRequiredError(error)) return false;

  const statusCode = getStatusCode(error);
  return !(statusCode && statusCode >= 500);
};

// Extracts message from API errors, Error instances, or strings
const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (hasApiErrorBody(error) && error.body?.detail) {
    return error.body.detail;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
};

/**
 * Hook for consistent error handling across the app.
 * Skips MFA/500+ errors (GateKeeper handles), shows toast for others.
 *
 * @returns Error handler function.
 *
 * @example
 * const handleError = useErrorHandler();
 *
 * // With custom message
 * onError: (error) => handleError(error, {
 *   getErrorMessage: (err) => t('my_error', { message: err.message })
 * });
 *
 * // With defaults
 * onError: handleError;
 */
export function useErrorHandler() {
  const { t } = useTranslator('common');

  return useCallback(
    (error: unknown, options: ErrorHandlerCallOptions = {}): void => {
      if (!shouldHandleError(error)) return;

      const { getErrorMessage, showToast: shouldShowToast = true } = options;

      const errorMessage =
        getErrorMessage?.(error) ?? extractErrorMessage(error, t('error.generic'));

      if (shouldShowToast) {
        showToast({
          type: 'error',
          message: errorMessage,
        });
      }
    },
    [t],
  );
}
