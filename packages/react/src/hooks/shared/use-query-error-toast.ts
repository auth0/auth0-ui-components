/**
 * Shared utility hook for displaying error toasts on query failures.
 * @module use-query-error-toast
 */

import type { UseQueryResult } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useErrorHandler } from '@/hooks/shared/use-error-handler';

/**
 * Shows an error toast when a query enters an error state.
 * Ensures the toast is only shown once per error occurrence.
 * @param query - TanStack Query result object.
 * @param fallbackMessage - Fallback message to show if no specific error message is available.
 */
export function useQueryErrorToast(
  query: Pick<UseQueryResult, 'isError' | 'error'>,
  fallbackMessage: string,
): void {
  const hasShown = useRef(false);
  const handleError = useErrorHandler();

  useEffect(() => {
    if (query.isError && !hasShown.current) {
      handleError(query.error, { fallbackMessage });
      hasShown.current = true;
    }

    if (!query.isError) {
      hasShown.current = false;
    }
  }, [query.isError, query.error, handleError, fallbackMessage]);
}
