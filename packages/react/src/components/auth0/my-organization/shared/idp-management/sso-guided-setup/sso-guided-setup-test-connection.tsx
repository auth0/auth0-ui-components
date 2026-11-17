/**
 * Test connection for the guided setup's test page.
 * @module sso-guided-setup-test-connection
 * @internal
 */

import type { IdpKnownResponse, SsoProviderTestMessages } from '@auth0/universal-components-core';

import { SsoProviderTestPollingOverlay } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-test/sso-provider-test-polling-overlay';
import { SsoProviderTestResult } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-test/sso-provider-test-result';
import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Button } from '@/components/ui/button';
import { useSsoProviderTest } from '@/hooks/my-organization/use-sso-provider-test';
import { useTranslator } from '@/hooks/shared/use-translator';

export interface SsoGuidedSetupTestConnectionProps {
  provider: IdpKnownResponse;
  canTest: boolean;
  customMessages?: Partial<SsoProviderTestMessages>;
}

/**
 * Test Provider button, result and polling overlay for the guided test page.
 * @param props - {@link SsoGuidedSetupTestConnectionProps}
 * @param props.provider - Provider to test.
 * @param props.canTest - Whether the user may start a test.
 * @param props.customMessages - Custom test messages.
 * @returns JSX element
 */
export function SsoGuidedSetupTestConnection({
  provider,
  canTest,
  customMessages = {},
}: SsoGuidedSetupTestConnectionProps) {
  const { t } = useTranslator('idp_management.test_sso_provider', customMessages);
  const { state, user, errorReason, errorMessage, blockedTestUrl, start, retry } =
    useSsoProviderTest(provider.id ?? '');

  const isRunning = state === 'starting' || state === 'polling';

  return (
    <div className="space-y-6" data-slot="sso-guided-setup-test-connection">
      <PermissionDeniedTooltip customMessages={customMessages} enabled={!canTest}>
        <Button type="button" variant="outline" onClick={start} disabled={!canTest || isRunning}>
          {t('test_button_label')}
        </Button>
      </PermissionDeniedTooltip>

      {(state === 'success' || state === 'error' || state === 'timeout') && (
        <SsoProviderTestResult
          state={state}
          user={user}
          errorReason={errorReason}
          errorMessage={errorMessage}
          customMessages={customMessages.result}
        />
      )}

      <SsoProviderTestPollingOverlay
        open={isRunning}
        onRetry={retry}
        blockedTestUrl={blockedTestUrl}
        customMessages={customMessages.overlay}
      />
    </div>
  );
}
