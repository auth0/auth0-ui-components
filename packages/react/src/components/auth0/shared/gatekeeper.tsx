import {
  isMfaRequiredError,
  getStatusCode,
  hasApiErrorBody,
} from '@auth0/universal-components-core';
import { RefreshCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import { useMfaErrorHandler } from '@/providers/mfa-error-handler-provider';

interface GateKeeperProps {
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: unknown, retry: () => void) => React.ReactNode;
}

/**
 * Extracts error message from various error types
 */
function getErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
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
}

/**
 * GateKeeper guards children from rendering during loading/error states.
 * Handles all error types:
 * - MFA errors → Opens global MFA modal
 * - 500 errors → Shows blocking alert with retry
 * - Other errors (400, 401, 403) → Shows toast notification, renders children
 */
export function GateKeeper({
  isLoading,
  error,
  onRetry,
  children,
  loadingFallback,
  errorFallback,
}: GateKeeperProps) {
  const { handleMfaError } = useMfaErrorHandler();
  const { t } = useTranslator('common');
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (!error) return;

    if (isMfaRequiredError(error)) {
      handleMfaError(error, onRetry);
      return;
    }

    const statusCode = getStatusCode(error);
    if (statusCode && statusCode >= 500) {
      return;
    }

    const errorMessage = getErrorMessage(error);
    showToast({
      type: 'error',
      message: errorMessage,
    });
  }, [error, handleMfaError, onRetry]);

  if (isLoading) {
    return (
      <>
        {loadingFallback || (
          <div className="flex items-center justify-center p-8">
            <Spinner />
          </div>
        )}
      </>
    );
  }

  if (error && isMfaRequiredError(error)) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  const statusCode = getStatusCode(error);
  if (error && statusCode && statusCode >= 500) {
    return (
      <>
        {errorFallback ? (
          errorFallback(error, handleRetry)
        ) : (
          <div
            className={cn(
              'flex flex-col items-center justify-center gap-4 py-8 w-full rounded-lg border border-border bg-card p-8 text-center',
            )}
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                {getErrorMessage(error, t('fallback.title'))}
              </h3>
              <p className="text-sm font-normal text-muted-foreground">
                {t('fallback.description')}
              </p>
            </div>
            <Button
              variant="primary"
              size="default"
              onClick={handleRetry}
              disabled={isRetrying}
              className="mt-4"
            >
              {isRetrying ? (
                <Spinner size="sm" colorScheme="foreground" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
              {t('fallback.retry')}
            </Button>
          </div>
        )}
      </>
    );
  }
  return <>{children}</>;
}
