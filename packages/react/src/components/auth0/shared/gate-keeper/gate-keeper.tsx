/**
 * GateKeeper component for guarding content during loading, MFA step-up, and 5xx error states.
 * @module gate-keeper
 * @internal
 */

import {
  type ComponentStyling,
  getComponentStyles,
  getStatusCode,
  isMfaRequiredError,
} from '@auth0/universal-components-core';
import { RefreshCcw } from 'lucide-react';
import React, { useCallback, useMemo, useState, useEffect } from 'react';

import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useCoreClient } from '@/hooks/shared/use-core-client';
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
function ErrorFallback({ onRetry, isMfa }: { onRetry: () => void; isMfa?: boolean }) {
  const { t } = useTranslator('gate_keeper');
  const key = isMfa ? 'mfa_error' : 'fallback';

  return (
    <Card className="text-center">
      <CardContent className="flex flex-col items-center gap-2">
        <CardTitle>{t(`${key}.title`)}</CardTitle>
        <CardDescription>{t(`${key}.description`)}</CardDescription>
      </CardContent>
      {!isMfa && (
        <CardFooter className="justify-center">
          <Button variant="primary" size="default" onClick={onRetry}>
            <RefreshCcw className="size-4" />
            {t('fallback.retry')}
          </Button>
        </CardFooter>
      )}
    </Card>
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
  const { coreClient } = useCoreClient();
  const { isDarkMode } = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);

  const styles = useMemo(() => getComponentStyles(styling, isDarkMode), [styling, isDarkMode]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const isMfaStepUp = isMfaRequiredError(error);
  const statusCode = getStatusCode(error);
  const isSystemError = !!error && !!statusCode && statusCode >= 500;

  useEffect(() => {
    if (isMfaStepUp && coreClient && !coreClient.isProxyMode()) {
      console.warn(
        `🚨 [Auth0 Components Warning]: A step-up authentication (MFA) was triggered, but the interactiveErrorHandler is not configured.\n\nTo enable Universal Login redirects for MFA step-up, login required, or consent errors, please update your configuration:\n\n<Auth0Provider\n  ...\n  interactiveErrorHandler="popup"\n>\n\nFor more details, refer to the Auth0 Documentation.`,
      );
    }
  }, [isMfaStepUp, coreClient]);

  if (isLoading || isRetrying) {
    return (
      <StyledScope style={styles.variables}>
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      </StyledScope>
    );
  }

  if (isSystemError || isMfaStepUp) {
    return (
      <StyledScope style={styles.variables}>
        <ErrorFallback onRetry={handleRetry} isMfa={isMfaStepUp} />
      </StyledScope>
    );
  }

  return <StyledScope style={styles.variables}>{children}</StyledScope>;
}
