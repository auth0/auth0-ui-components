/**
 * GateKeeper component for guarding content during loading, MFA step-up, and 5xx error states.
 * @module gate-keeper
 * @internal
 */

import {
  type ComponentStyling,
  type MfaRequiredError,
  getComponentStyles,
  getStatusCode,
  isMfaRequiredError,
  normalizeMfaRequiredError,
} from '@auth0/universal-components-core';
import { RefreshCcw } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { MfaWizard } from '@/components/auth0/shared/gate-keeper/mfa-step-up/mfa-wizard';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { useGateKeeperContext } from '@/providers/gate-keeper-context';

interface GateKeeperProps {
  styling?: ComponentStyling<Record<string, string>>;
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Blocking error fallback with retry button.
 * Shown for 5xx errors and dismissed MFA errors.
 *
 * @param props - Component props.
 * @param props.onRetry - Retry handler.
 * @returns Error fallback element.
 * @internal
 */
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslator('gate_keeper');

  return (
    <Card className="text-center">
      <CardContent className="flex flex-col items-center gap-2">
        <CardTitle>{t('fallback.title')}</CardTitle>
        <CardDescription>{t('fallback.description')}</CardDescription>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="primary" size="default" onClick={onRetry}>
          <RefreshCcw className="size-4" />
          {t('fallback.retry')}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * MFA step-up dialog.
 *
 * @param props - Component props.
 * @param props.error - MFA error containing the token and challenge details.
 * @param props.onComplete - Callback when MFA is completed successfully; triggers a retry.
 * @param props.onClose - Callback when the dialog is dismissed without completing.
 * @returns MFA dialog element.
 * @internal
 */
function MfaDialog({
  error,
  onComplete,
  onClose,
}: {
  error: MfaRequiredError;
  onComplete: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <MfaWizard error={error} onComplete={onComplete} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Guards children from rendering during loading/error states. MFA step-up overlays
 * children without unmounting them, preserving any in-progress form state.
 * - Loading → spinner (blocks children)
 * - MFA required error → MFA step-up dialog overlaid on children
 * - 5xx error or dismissed MFA → blocking error fallback with retry
 * - No error → children
 *
 * @param props - Component props.
 * @param props.styling - Styling configuration forwarded to the styled scope.
 * @param props.isLoading - Whether content is loading.
 * @param props.children - Child elements to render on success.
 * @returns GateKeeper element.
 */
export function GateKeeper({ styling, isLoading, children }: GateKeeperProps) {
  const { error, onRetry } = useGateKeeperContext();
  const { isDarkMode } = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissedMfaToken, setDismissedMfaToken] = useState<string | null>(null);

  const styles = useMemo(() => getComponentStyles(styling, isDarkMode), [styling, isDarkMode]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setDismissedMfaToken(null);
    try {
      await onRetry?.();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const isMfaStepUp = isMfaRequiredError(error);
  const mfaError = isMfaStepUp ? normalizeMfaRequiredError(error) : null;
  const isMfaDismissed = dismissedMfaToken === mfaError?.mfa_token;
  const statusCode = getStatusCode(error);
  const isSystemError = !!error && !!statusCode && statusCode >= 500;

  if (isLoading || isRetrying) {
    return (
      <StyledScope style={styles.variables}>
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      </StyledScope>
    );
  }

  if (isSystemError || (isMfaStepUp && isMfaDismissed)) {
    return (
      <StyledScope style={styles.variables}>
        <ErrorFallback onRetry={handleRetry} />
      </StyledScope>
    );
  }

  return (
    <StyledScope style={styles.variables}>
      {children}
      {mfaError && !isMfaDismissed && (
        <MfaDialog
          error={mfaError}
          onComplete={handleRetry}
          onClose={() => setDismissedMfaToken(mfaError.mfa_token)}
        />
      )}
    </StyledScope>
  );
}
