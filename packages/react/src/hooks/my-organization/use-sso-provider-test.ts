/**
 * SSO provider test hook.
 * Runs an identity provider test: opens the test window, polls the result,
 * and exposes a state machine any layout can render.
 * @module use-sso-provider-test
 */

import { getStatusCode, type IdpId, type IdpTestId } from '@auth0/universal-components-core';
import { useCallback, useRef, useState } from 'react';

import { useSsoProviderTestService } from '@/hooks/my-organization/shared/services/use-sso-provider-test-service';
import type {
  SsoProviderTestErrorReason,
  SsoProviderTestState,
  UseSsoProviderTestOptions,
  UseSsoProviderTestReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-test-types';

type Phase = 'idle' | 'starting' | 'polling';

const errorReasonForStatus = (status: number | undefined): SsoProviderTestErrorReason =>
  status === 403 ? 'forbidden' : 'expired';

/**
 * Runs identity provider tests for one provider.
 * `start` and `retry` must be called from a click: the test window is opened
 * synchronously so browsers do not block it.
 * @param idpId - Identity provider to test.
 * @param options - {@link UseSsoProviderTestOptions}
 * @returns The test state, its result, and `start` / `retry` / `cancel` handlers.
 */
export function useSsoProviderTest(
  idpId: IdpId,
  { customMessages = {} }: UseSsoProviderTestOptions = {},
): UseSsoProviderTestReturn {
  const [phase, setPhase] = useState<Phase>('idle');
  const [testId, setTestId] = useState<IdpTestId | null>(null);
  const [blockedTestUrl, setBlockedTestUrl] = useState<string | null>(null);
  const testWindowRef = useRef<Window | null>(null);

  const { startTest, poll } = useSsoProviderTestService(
    idpId,
    phase === 'polling' ? testId : null,
    { customMessages },
  );

  const closeTestWindow = useCallback(() => {
    const testWindow = testWindowRef.current;
    if (testWindow && !testWindow.closed) testWindow.close();
    testWindowRef.current = null;
  }, []);

  const start = useCallback(async () => {
    // Opened before any await so the click still counts as a user gesture.
    const testWindow = window.open('', '_blank');
    testWindowRef.current = testWindow;
    setPhase('starting');
    setTestId(null);
    setBlockedTestUrl(null);

    const created = await startTest();
    if (!created) {
      closeTestWindow();
      setPhase('idle');
      return;
    }

    if (testWindow) {
      testWindow.opener = null;
      testWindow.location.href = created.test_url;
    } else {
      setBlockedTestUrl(created.test_url);
    }
    setTestId(created.id);
    setPhase('polling');
  }, [startTest, closeTestWindow]);

  const retry = useCallback(async () => {
    closeTestWindow();
    await start();
  }, [closeTestWindow, start]);

  const cancel = useCallback(() => {
    closeTestWindow();
    setPhase('idle');
    setTestId(null);
    setBlockedTestUrl(null);
  }, [closeTestWindow]);

  let state: SsoProviderTestState = phase;
  let errorReason: SsoProviderTestErrorReason | null = null;
  let errorMessage: string | null = null;
  let user: UseSsoProviderTestReturn['user'] = null;

  if (phase === 'polling') {
    if (poll.data?.status === 'success') {
      state = 'success';
      user = poll.data.user;
    } else if (poll.data?.status === 'error') {
      state = 'error';
      errorReason = 'provider';
      errorMessage = poll.data.error.message;
    } else if (poll.timedOut) {
      state = 'timeout';
    } else if (!poll.isPolling && poll.error) {
      state = 'error';
      errorReason = errorReasonForStatus(getStatusCode(poll.error));
    }
  }

  return {
    state,
    user,
    errorReason,
    errorMessage,
    blockedTestUrl: state === 'polling' ? blockedTestUrl : null,
    start,
    retry,
    cancel,
  };
}
