import {
  getStatusCode,
  isMfaRequiredError,
  type MfaRequiredError,
  type StepUpAuthenticator,
  type EnrollmentFactor,
} from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';
import { RefreshCcw } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';

interface GateKeeperProps {
  isLoading?: boolean;
  error: unknown;
  onRetry: () => Promise<void>;
  children: React.ReactNode;
}

/**
 * Renders error fallback UI with retry button.
 *
 * @param props - Component props.
 * @param props.title - Error title.
 * @param props.description - Error description.
 * @param props.retryText - Retry button label.
 * @param props.onRetry - Retry handler.
 * @param props.isRetrying - Whether a retry is in progress.
 * @returns Error fallback element.
 */
function ErrorFallback({
  title,
  description,
  retryText,
  onRetry,
  isRetrying,
}: {
  title: string;
  description: string;
  retryText: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Button variant="primary" size="default" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? (
            <Spinner size="sm" colorScheme="foreground" />
          ) : (
            <RefreshCcw className="size-4" />
          )}
          {retryText}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * GateKeeper guards children from rendering during loading/error states.
 * Handles:
 * - MFA errors → Shows MFA Step up dialog, then retries on completion
 * - 500+ errors → Shows blocking fallback UI with retry
 *
 * @param props - Component props.
 * @param props.isLoading - Whether content is loading.
 * @param props.error - Error object, if any.
 * @param props.onRetry - Retry handler.
 * @param props.children - Child elements to render on success.
 * @returns GateKeeper element.
 */
export function GateKeeper({ isLoading = false, error, onRetry, children }: GateKeeperProps) {
  const { t } = useTranslator('common');
  const { coreClient } = useCoreClient();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isMfaDialogOpen, setIsMfaDialogOpen] = useState(true);

  const mfaToken = useMemo(() => {
    if (error && isMfaRequiredError(error)) {
      const err = error as MfaRequiredError & { body?: { mfa_token?: string } };
      return err.mfa_token ?? err.body?.mfa_token ?? null;
    }
    return null;
  }, [error]);

  const isProxyMode = coreClient?.isProxyMode() ?? false;

  // Step 1: Check if user needs to enroll MFA factors (SPA mode only)
  const {
    data: enrollmentFactors,
    isLoading: isFetchingEnrollmentFactors,
    error: fetchEnrollmentFactorsError,
  } = useQuery<EnrollmentFactor[]>({
    queryKey: ['mfa-enrollment-factors', mfaToken],
    queryFn: async () => {
      if (!coreClient || !mfaToken) {
        throw new Error('CoreClient or MFA token not available');
      }
      const stepUpService = coreClient.getStepUpApiService();
      return stepUpService.getEnrollmentFactors(mfaToken);
    },
    enabled: Boolean(
      !isProxyMode &&
        error &&
        isMfaRequiredError(error) &&
        mfaToken &&
        coreClient &&
        isMfaDialogOpen,
    ),
    retry: false,
  });

  // Determine if user needs enrollment or has authenticators
  const needsEnrollment = enrollmentFactors && enrollmentFactors.length > 0;

  // Step 2: Fetch authenticators
  const {
    data: authenticators,
    isLoading: isFetchingAuthenticators,
    error: fetchAuthenticatorsError,
  } = useQuery<StepUpAuthenticator[]>({
    queryKey: ['mfa-authenticators', mfaToken],
    queryFn: async () => {
      if (!coreClient || !mfaToken) {
        throw new Error('CoreClient or MFA token not available');
      }
      const stepUpService = coreClient.getStepUpApiService();
      return stepUpService.getAuthenticators(mfaToken);
    },
    enabled: Boolean(
      error &&
        isMfaRequiredError(error) &&
        isMfaDialogOpen &&
        coreClient &&
        mfaToken &&
        (isProxyMode || (!needsEnrollment && enrollmentFactors !== undefined)),
    ),
    retry: false,
  });

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
      setIsMfaDialogOpen(true);
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  const LoadingState = () => (
    <div className="flex items-center justify-center p-8">
      <Spinner />
    </div>
  );

  const ErrorState = () => (
    <div className="text-center text-destructive py-4">{t('error.mfa.fetch_failed')}</div>
  );

  const EmptyState = () => (
    <div className="text-center text-muted-foreground py-4">{t('error.mfa.no_authenticators')}</div>
  );

  const AuthenticatorList = ({ items }: { items: StepUpAuthenticator[] }) => (
    <div className="space-y-2 py-4">
      {items.map((auth) => (
        <div key={auth.id} className="border rounded p-3">
          <div className="font-medium">{auth.name || auth.authenticatorType}</div>
          <div className="text-sm text-muted-foreground">
            Type: {auth.authenticatorType} | Active: {auth.active ? 'Yes' : 'No'}
          </div>
        </div>
      ))}
    </div>
  );

  const EnrollmentList = ({ factors }: { factors: EnrollmentFactor[] }) => (
    <div className="space-y-2 py-4">
      <div className="text-sm text-muted-foreground text-center mb-4">
        {t('error.mfa.enrollment_required')}
      </div>
      {factors.map((factor) => (
        <div key={factor.type} className="border rounded p-3">
          <div className="font-medium">{factor.type}</div>
          <div className="text-sm text-muted-foreground">{t('error.mfa.factor_available')}</div>
        </div>
      ))}
    </div>
  );

  // Determine current MFA state
  const getMfaState = () => {
    // SPA mode: Check enrollment factors first
    if (!isProxyMode) {
      if (isFetchingEnrollmentFactors) return 'LOADING';
      if (fetchEnrollmentFactorsError) return 'ERROR';
      if (needsEnrollment) return 'ENROLLMENT';
    }

    // Both modes: Check authenticators
    if (isFetchingAuthenticators) return 'LOADING';
    if (fetchAuthenticatorsError) return 'ERROR';
    if (authenticators?.length) return 'AUTHENTICATORS';

    return 'EMPTY';
  };

  const stateComponentMap: Record<string, React.ReactNode> = {
    LOADING: <LoadingState />,
    ERROR: <ErrorState />,
    EMPTY: <EmptyState />,
    AUTHENTICATORS: authenticators ? <AuthenticatorList items={authenticators} /> : <EmptyState />,
    ENROLLMENT: enrollmentFactors ? <EnrollmentList factors={enrollmentFactors} /> : <EmptyState />,
  };

  const renderMfaDialogContent = () => {
    const state = getMfaState();
    return stateComponentMap[state] || <EmptyState />;
  };

  // Handle MFA errors - show dialog first, then fallback if closed
  if (error && isMfaRequiredError(error) && isMfaDialogOpen) {
    return (
      <Dialog open={true} onOpenChange={setIsMfaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('error.mfa.title')}</DialogTitle>
          </DialogHeader>
          {renderMfaDialogContent()}
        </DialogContent>
      </Dialog>
    );
  }

  // Handle 500+ errors or MFA errors (when dialog is closed)
  const statusCode = getStatusCode(error);
  const shouldShowErrorFallback =
    error && ((statusCode && statusCode >= 500) || isMfaRequiredError(error));

  if (shouldShowErrorFallback) {
    return (
      <ErrorFallback
        title={t('fallback.title')}
        description={t('fallback.description')}
        retryText={t('fallback.retry')}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  return <>{children}</>;
}
