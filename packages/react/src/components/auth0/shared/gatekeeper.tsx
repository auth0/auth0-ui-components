import type {
  MfaRequiredError,
  StepUpAuthenticator,
  EnrollmentFactor,
} from '@auth0/universal-components-core';
import { getStatusCode, isMfaRequiredError } from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';
import { RefreshCcw } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { StepUpAuthenticatorList } from '@/components/auth0/shared/mfa-step-up/step-up-authenticator-list';
import { StepUpChallengeForm } from '@/components/auth0/shared/mfa-step-up/step-up-challenge-form';
import { StepUpEnrollmentSetupForm } from '@/components/auth0/shared/mfa-step-up/step-up-enrollment-setup-form';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useStepUpChallenge } from '@/hooks/shared/use-step-up-challenge';
import { useTranslator } from '@/hooks/shared/use-translator';

type MfaFetchState = 'LOADING' | 'ERROR' | 'ENROLLMENT' | 'AUTHENTICATORS' | 'EMPTY';

interface GateKeeperProps {
  isLoading?: boolean;
  error: unknown;
  onRetry: () => Promise<void>;
  children: React.ReactNode;
}

/**
 * Extracts the mfa_token from an MFA-required error.
 * @param error - The error to extract the token from.
 * @returns The mfa_token string, or null.
 */
function extractMfaToken(error: unknown): string | null {
  if (!error || !isMfaRequiredError(error)) return null;
  const err = error as MfaRequiredError & { body?: { mfa_token?: string } };
  return err.mfa_token ?? err.body?.mfa_token ?? null;
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
 * MFA step-up dialog. Fetches authenticators/enrollment factors,
 * handles challenge + verify flow, and renders the dialog UI.
 *
 * @param props - Component props.
 * @param props.error - The MFA-required error.
 * @param props.onSuccess - Callback after successful verification.
 * @param props.onClose - Callback when the dialog is dismissed.
 * @returns MFA step-up dialog element.
 */
function MfaStepUpDialog({
  error,
  onSuccess,
  onClose,
}: {
  error: unknown;
  onSuccess: () => Promise<void>;
  onClose: () => void;
}): React.JSX.Element {
  const { t } = useTranslator('common');
  const { coreClient } = useCoreClient();

  const mfaToken = useMemo(() => extractMfaToken(error), [error]);
  const isProxyMode = coreClient?.isProxyMode() ?? false;
  const stepUpService = coreClient?.getStepUpApiService();

  const {
    data: enrollmentFactors,
    isLoading: isFetchingEnrollmentFactors,
    error: fetchEnrollmentFactorsError,
  } = useQuery<EnrollmentFactor[]>({
    queryKey: ['mfa-enrollment-factors', mfaToken],
    queryFn: () => stepUpService!.getEnrollmentFactors(mfaToken!),
    enabled: Boolean(!isProxyMode && mfaToken && stepUpService),
    retry: false,
  });

  const needsEnrollment = enrollmentFactors && enrollmentFactors.length > 0;

  const {
    data: authenticators,
    isLoading: isFetchingAuthenticators,
    error: fetchAuthenticatorsError,
  } = useQuery<StepUpAuthenticator[]>({
    queryKey: ['mfa-authenticators', mfaToken],
    queryFn: () => stepUpService!.getAuthenticators(mfaToken!),
    enabled: Boolean(
      mfaToken &&
        stepUpService &&
        (isProxyMode || (!needsEnrollment && enrollmentFactors !== undefined)),
    ),
    retry: false,
  });

  const {
    state: challengeState,
    selectedAuthenticator,
    challengeResponse,
    isChallenging,
    isVerifying,
    error: challengeError,
    handleSelectAuthenticator,
    handleVerify,
    handleBack: handleChallengeBack,
  } = useStepUpChallenge({
    mfaToken: mfaToken ?? '',
    onSuccess,
  });

  const fetchState: MfaFetchState = useMemo(() => {
    if (!isProxyMode) {
      if (isFetchingEnrollmentFactors) return 'LOADING';
      if (fetchEnrollmentFactorsError) return 'ERROR';
      if (needsEnrollment) return 'ENROLLMENT';
    }
    if (isFetchingAuthenticators) return 'LOADING';
    if (fetchAuthenticatorsError) return 'ERROR';
    if (authenticators?.length) return 'AUTHENTICATORS';
    return 'EMPTY';
  }, [
    isProxyMode,
    isFetchingEnrollmentFactors,
    fetchEnrollmentFactorsError,
    needsEnrollment,
    isFetchingAuthenticators,
    fetchAuthenticatorsError,
    authenticators,
  ]);

  const renderContent = () => {
    if (fetchState === 'LOADING') {
      return (
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      );
    }

    if (fetchState === 'ERROR') {
      return (
        <div className="text-center text-destructive py-4" role="alert">
          {t('error.mfa.fetch_failed')}
        </div>
      );
    }

    if (fetchState === 'EMPTY') {
      return (
        <div className="text-center text-muted-foreground py-4">
          {t('error.mfa.no_authenticators')}
        </div>
      );
    }

    if (fetchState === 'ENROLLMENT' && enrollmentFactors) {
      return (
        <StepUpEnrollmentSetupForm
          mfaToken={mfaToken!}
          enrollmentFactors={enrollmentFactors}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      );
    }

    if (fetchState === 'AUTHENTICATORS' && challengeState === 'VERIFY') {
      return (
        <StepUpChallengeForm
          challengeResponse={challengeResponse}
          authenticatorType={selectedAuthenticator?.authenticatorType ?? null}
          onVerify={handleVerify}
          onBack={handleChallengeBack}
          isVerifying={isVerifying}
          error={challengeError}
        />
      );
    }

    if (fetchState === 'AUTHENTICATORS' && authenticators) {
      return (
        <StepUpAuthenticatorList
          authenticators={authenticators}
          onSelectAuthenticator={handleSelectAuthenticator}
          onCancel={onClose}
          isChallenging={isChallenging}
          challengingAuthenticatorId={selectedAuthenticator?.id ?? null}
        />
      );
    }

    return null;
  };

  const isListScreen = fetchState === 'AUTHENTICATORS' && challengeState !== 'VERIFY';

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('error.mfa.title')}</DialogTitle>
          {isListScreen && <DialogDescription>{t('error.mfa.subtitle')}</DialogDescription>}
        </DialogHeader>
        <Separator />
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

/**
 * GateKeeper guards children from rendering during loading/error states.
 * Handles:
 * - MFA errors → Shows MFA step-up dialog, then retries on completion
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
  const [isRetrying, setIsRetrying] = useState(false);
  const [isMfaDismissed, setIsMfaDismissed] = useState(false);

  const handleMfaSuccess = React.useCallback(async () => {
    setIsRetrying(true);
    try {
      await onRetry();
      setIsMfaDismissed(true);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
      setIsMfaDismissed(false);
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

  if (error && isMfaRequiredError(error) && !isMfaDismissed) {
    return (
      <MfaStepUpDialog
        error={error}
        onSuccess={handleMfaSuccess}
        onClose={() => setIsMfaDismissed(true)}
      />
    );
  }

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
