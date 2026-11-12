/**
 * SSO provider test section for the SSO edit tab.
 * @module sso-provider-test-card
 * @internal
 */

import { SsoProviderTestPollingOverlay } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-test/sso-provider-test-polling-overlay';
import { SsoProviderTestResult } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-test/sso-provider-test-result';
import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSsoProviderTest } from '@/hooks/my-organization/use-sso-provider-test';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProviderTestCardProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-test-types';

/**
 * Card with a Test Provider action, a blocking overlay while the test runs,
 * and the inline result.
 * @param props - Component props.
 * @param props.provider - SSO provider to test.
 * @param props.readOnly - Whether the test action is disabled.
 * @param props.permissionDenied - Whether the action is unavailable for lack of a scope.
 * @param props.customMessages - Custom translation messages to override defaults.
 * @param props.notificationMessages - Custom notification messages to override defaults.
 * @param props.styling - Styling configuration.
 * @returns JSX element
 */
export function SsoProviderTestCard({
  provider,
  readOnly = false,
  permissionDenied = false,
  customMessages = {},
  notificationMessages = {},
  styling,
}: SsoProviderTestCardProps) {
  const { t } = useTranslator('idp_management.test_sso_provider', customMessages);
  const { state, user, errorReason, errorMessage, blockedTestUrl, start, retry } =
    useSsoProviderTest(provider.id ?? '', { customMessages: notificationMessages });

  const isRunning = state === 'starting' || state === 'polling';

  return (
    <div className={cn('w-full', styling?.classes?.['SsoProviderTest-root'])}>
      <Card className="p-6">
        <CardContent className="space-y-6 p-0">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-2">
              <h3 className={cn('font-semibold text-left text-subtitle')}>{t('title')}</h3>
              <p className={cn('text-muted-foreground text-left text-paragraph')}>
                {t('description')}
              </p>
            </div>

            <PermissionDeniedTooltip
              customMessages={customMessages}
              enabled={permissionDenied}
              className="shrink-0"
            >
              <Button
                type="button"
                variant="outline"
                onClick={start}
                disabled={readOnly || isRunning}
              >
                {t('test_button_label')}
              </Button>
            </PermissionDeniedTooltip>
          </div>

          {(state === 'success' || state === 'error' || state === 'timeout') && (
            <SsoProviderTestResult
              state={state}
              user={user}
              errorReason={errorReason}
              errorMessage={errorMessage}
              customMessages={customMessages.result}
              styling={styling}
            />
          )}
        </CardContent>
      </Card>

      <SsoProviderTestPollingOverlay
        open={isRunning}
        onRetry={retry}
        blockedTestUrl={blockedTestUrl}
        customMessages={customMessages.overlay}
        styling={styling}
      />
    </div>
  );
}
