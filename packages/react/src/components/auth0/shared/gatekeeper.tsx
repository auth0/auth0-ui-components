import { isMfaRequiredError, getStatusCode } from '@auth0/universal-components-core';
import React, { useEffect } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
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
 * GateKeeper guards children from rendering during loading/error states.
 * Handles all error types:
 * - MFA errors → Opens global MFA modal
 * - 500 errors → Shows blocking alert with retry
 * - Other errors (400, 401, 403) → Shows toast notification, renders children
 *
 * @example
 * ```tsx
 * function OrgDetails() {
 *   const { data, isLoading, error, refetch } = useOrganization();
 *
 *   return (
 *     <GateKeeper isLoading={isLoading} error={error} onRetry={refetch}>
 *       {data && <OrgDetailsForm data={data} />}
 *     </GateKeeper>
 *   );
 * }
 * ```
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

  // Handle errors in useEffect for side effects (modal, toast)
  useEffect(() => {
    if (!error) return;

    // MFA error → delegate to global modal
    if (isMfaRequiredError(error)) {
      handleMfaError(error, onRetry);
      return;
    }

    // Critical errors (500+) → blocking UI (handled in render below)
    const statusCode = getStatusCode(error);
    if (statusCode && statusCode >= 500) {
      return; // Let render show blocking Alert
    }

    // Non-critical errors (400, 401, 403, network, etc.) → show toast
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    showToast({
      type: 'error',
      message: errorMessage,
    });
  }, [error, handleMfaError, onRetry]);

  // Loading state
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

  // MFA required - show loading while global dialog handles it
  if (error && isMfaRequiredError(error)) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  // Critical errors (500+) - blocking alert with retry
  const statusCode = getStatusCode(error);
  if (error && statusCode && statusCode >= 500) {
    return (
      <>
        {errorFallback ? (
          errorFallback(error, onRetry)
        ) : (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="flex-1">
                {error instanceof Error ? error.message : 'A server error occurred'}
              </span>
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </>
    );
  }

  // Non-critical errors - toast shown in useEffect, render children
  // Success - render children
  return <>{children}</>;
}
