/**
 * Error handling hook with toast error.
 * @module use-error-handler
 */

import {
  isNotifiableError,
  resolveErrorMessage,
  getStatusCode,
  hasApiErrorBody,
  ERROR_CODES,
} from '@auth0/universal-components-core';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useTranslator } from '@/hooks/shared/use-translator';

interface ErrorHandlerCallOptions {
  fallbackMessage?: string;
}

/**
 * Hook for consistent error handling across the app.
 *
 * @returns Error handler function.
 *
 * @example
 * const handleError = useErrorHandler();
 *
 * // With custom message
 * onError: (error) => handleError(error, {
 *   fallbackMessage: t('my_error')
 * });
 *
 * // With defaults
 * onError: handleError;
 */
export function useErrorHandler() {
  const { t } = useTranslator('common');

  return useCallback(
    (error: unknown, options: ErrorHandlerCallOptions = {}): void => {
      if (!isNotifiableError(error)) return;

      const getCustomErrorMessage = (err: unknown): string | undefined => {
        const status = getStatusCode(err);
        switch (status) {
          case 400:
            return t('error.bad_request');
          case 401:
            return t('error.missing_token');
          case 403:
            return hasApiErrorBody(err) && err.body?.type?.includes(ERROR_CODES.INSUFFICIENT_SCOPE)
              ? t('error.insufficient_scope')
              : t('error.forbidden');
          case 404:
            return t('error.not_found');
          case 429:
            return t('error.rate_limit');
          default:
            return undefined;
        }
      };

      showToast({
        type: 'error',
        message:
          getCustomErrorMessage(error) ??
          resolveErrorMessage(error, options.fallbackMessage ?? t('error.generic')),
      });
    },
    [t],
  );
}
