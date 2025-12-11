import { hasApiErrorBody, isBusinessError } from '@auth0/universal-components-core';
import { useCallback } from 'react';

import { showToast } from '../components/ui/toast';

interface ErrorHandlerOptions {
  fallbackMessage?: string;
  showToastNotification?: boolean;
}

/**
 * Hook for handling errors with optional toast notifications
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const { fallbackMessage = 'An error occurred', showToastNotification = true } = options;

    // Extract error message from various error types
    let errorMessage: string;

    if (isBusinessError(error)) {
      errorMessage = error.message;
    } else if (hasApiErrorBody(error) && error.body?.detail) {
      errorMessage = error.body.detail;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = fallbackMessage;
    }

    if (showToastNotification) {
      showToast({
        type: 'error',
        message: errorMessage,
      });
    }

    return errorMessage;
  }, []);

  return { handleError };
};
