import { hasApiErrorBody, isBusinessError, isSilentError } from '@auth0/universal-components-core';
import { useCallback } from 'react';

import { showToast } from '../components/ui/toast';

import { useTranslator } from './use-translator';

interface ErrorHandlerOptions {
  errorMessage?: string;
  fallbackMessage?: string;
  showToastNotification?: boolean;
}

/**
 * Hook for handling errors with optional toast notifications
 */
export const useErrorHandler = () => {
  const { t } = useTranslator('common.error.notifications');

  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const {
      errorMessage,
      fallbackMessage = 'An error occurred',
      showToastNotification = true,
    } = options;

    // Extract error message from various error types
    let message: string;
    if (isSilentError(error)) {
      console.warn('SilentError:', error);
      return null;
    }

    if (errorMessage) {
      message = errorMessage;
    } else if (isBusinessError(error)) {
      message = error.message;
    } else if (hasApiErrorBody(error) && error.body?.status) {
      switch (error.body.status) {
        case 400:
          message = t('bad_request');
          break;
        case 401:
          message = t('missing_token');
          break;
        case 403:
          message = error.body.type?.includes('A0E-403-0002')
            ? t('insufficient_scope')
            : t('forbidden');
          break;
        case 404:
          message = t('not_found');
          break;
        case 429:
          message = t('rate_limit');
          break;
        default:
          message = fallbackMessage;
      }
    } else {
      message = fallbackMessage;
    }

    if (showToastNotification) {
      showToast({
        type: 'error',
        message,
      });
    }

    return message;
  }, []);

  return { handleError };
};
