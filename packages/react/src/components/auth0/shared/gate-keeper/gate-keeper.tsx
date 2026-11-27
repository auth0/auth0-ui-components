/**
 * What a component shows in place of its content: a spinner while its data loads, or a message
 * with Retry when the request failed on the server's side or an MFA step-up did not finish.
 * @module gate-keeper
 * @internal
 */

import { getComponentStyles, type ComponentStyling } from '@auth0/universal-components-core';
import { RefreshCcw } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { useGateKeeperContext, useLoadFailed } from '@/providers/gate-keeper-context';

interface GateKeeperProps {
  styling?: ComponentStyling<Record<string, string>>;
  isLoading?: boolean;
  children: ReactNode;
}

/**
 * @returns The "we couldn't load this" card. Retry fetches again.
 * @internal
 */
function ErrorFallback() {
  const { t } = useTranslator('gate_keeper');
  const { onRetry } = useGateKeeperContext();
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = async () => {
    setIsRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card className="text-center">
      <CardContent className="flex flex-col items-center gap-2">
        <CardTitle>{t('fallback.title')}</CardTitle>
        <CardDescription>{t('fallback.description')}</CardDescription>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="primary" onClick={retry} disabled={isRetrying}>
          {isRetrying ? (
            <Spinner size="sm" colorScheme="foreground" />
          ) : (
            <RefreshCcw className="size-4" />
          )}
          {t('fallback.retry')}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Shows a spinner while its content loads, and the failure card when the load failed.
 *
 * @param props - Component props.
 * @param props.styling - The block's styling, whose variables apply to its scope.
 * @param props.isLoading - Whether the content is loading.
 * @param props.children - The content, shown once it loaded.
 * @returns The spinner, the failure card or the content.
 * @internal
 */
export function GateKeeper({ styling, isLoading, children }: GateKeeperProps) {
  const { isDarkMode } = useTheme();
  const hasLoadFailed = useLoadFailed();
  const styles = useMemo(() => getComponentStyles(styling, isDarkMode), [styling, isDarkMode]);

  const content = hasLoadFailed ? (
    <ErrorFallback />
  ) : isLoading ? (
    <div className="flex items-center justify-center p-8">
      <Spinner />
    </div>
  ) : (
    children
  );

  return <StyledScope style={styles.variables}>{content}</StyledScope>;
}
