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

import { StepUpAuthenticatorList } from '@/components/auth0/shared/mfa-step-up/step-up-authenticator-list';
import { StepUpChallengeForm } from '@/components/auth0/shared/mfa-step-up/step-up-challenge-form';
import { StepUpEnrollmentSetupForm } from '@/components/auth0/shared/mfa-step-up/step-up-enrollment-setup-form';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useStepUpChallenge } from '@/hooks/auth0/shared/use-step-up-challenge';
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
      const err = error as MfaRequiredError & { body?: { error?: string; mfa_token?: string } };
      const token = err.mfa_token ?? err.body?.mfa_token ?? null;
      return token;
    }
    return null;
  }, [error]);

  const isProxyMode = coreClient?.isProxyMode() ?? false;

  const {
    data: enrollmentFactors,
    isLoading: isFetchingEnrollmentFactors,
    error: fetchEnrollmentFactorsError,
  } = useQuery<EnrollmentFactor[]>({
    queryKey: ['mfa-enrollment-factors', mfaToken],
    queryFn: async () => {
      const stepUpService = coreClient!.getStepUpApiService();
      return stepUpService.getEnrollmentFactors(mfaToken!);
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

  const needsEnrollment = enrollmentFactors && enrollmentFactors.length > 0;

  const {
    data: authenticators,
    isLoading: isFetchingAuthenticators,
    error: fetchAuthenticatorsError,
  } = useQuery<StepUpAuthenticator[]>({
    queryKey: ['mfa-authenticators', mfaToken],
    queryFn: async () => {
      const stepUpService = coreClient!.getStepUpApiService();
      return stepUpService.getAuthenticators(mfaToken!);
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

  const stepUpService = coreClient?.getStepUpApiService();

  const handleChallengeSuccess = React.useCallback(async () => {
    setIsRetrying(true);
    try {
      await onRetry();
      setIsMfaDialogOpen(false);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

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
    stepUpService: stepUpService!,
    onSuccess: handleChallengeSuccess,
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

  if (error && isMfaRequiredError(error) && isMfaDialogOpen) {
    const getMfaFetchState = ():
      | 'LOADING'
      | 'ERROR'
      | 'ENROLLMENT'
      | 'AUTHENTICATORS'
      | 'EMPTY' => {
      if (!isProxyMode) {
        if (isFetchingEnrollmentFactors) return 'LOADING';
        if (fetchEnrollmentFactorsError) return 'ERROR';
        if (needsEnrollment) return 'ENROLLMENT';
      }
      if (isFetchingAuthenticators) return 'LOADING';
      if (fetchAuthenticatorsError) return 'ERROR';
      if (authenticators?.length) return 'AUTHENTICATORS';
      return 'EMPTY';
    };

    const fetchState = getMfaFetchState();

    const dialogTitle = (() => {
      if (fetchState === 'ENROLLMENT') return t('error.mfa.enroll_title');
      if (challengeState === 'VERIFY') return t('error.mfa.title');
      return t('error.mfa.title');
    })();

    const renderDialogContent = () => {
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
            stepUpService={stepUpService!}
            onSuccess={handleChallengeSuccess}
            onClose={() => setIsMfaDialogOpen(false)}
          />
        );
      }

      if (fetchState === 'AUTHENTICATORS' && challengeState === 'VERIFY' && challengeResponse) {
        return (
          <StepUpChallengeForm
            challengeResponse={challengeResponse}
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
            onCancel={() => setIsMfaDialogOpen(false)}
            isChallenging={isChallenging}
            challengingAuthenticatorId={selectedAuthenticator?.id ?? null}
          />
        );
      }

      return null;
    };

    return (
      <Dialog open={true} onOpenChange={setIsMfaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
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
