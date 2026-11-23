/**
 * Runs one MFA step-up flow for an `mfa_required` error and exposes its snapshot.
 * @module use-mfa-step-up
 */

import {
  getMfaToken,
  type MfaFlowConfig,
  type MfaStepUpMachine,
  type MfaStepUpSnapshot,
} from '@auth0/universal-components-core';
import { useEffect, useState } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';

export interface UseMfaStepUpOptions {
  error: unknown;
  flow?: MfaFlowConfig;
}

interface ActiveMachine {
  token: string;
  machine: MfaStepUpMachine;
  snapshot: MfaStepUpSnapshot;
}

export interface UseMfaStepUpResult {
  machine?: MfaStepUpMachine;
  snapshot?: MfaStepUpSnapshot;
}

/**
 * Creates the machine for one `mfa_token` and starts it. A new token starts a new flow, and the
 * old one is disposed.
 *
 * @param options - The `mfa_required` error and the flow customization.
 * @param options.error - The error a request failed with. Without an `mfa_required` error there is no flow. Only its `mfa_token` restarts the flow.
 * @param options.flow - Flow customization, read once when the flow is created.
 * @returns The machine and its snapshot.
 */
export function useMfaStepUp({ error, flow }: UseMfaStepUpOptions): UseMfaStepUpResult {
  const { coreClient } = useCoreClient();
  const handleError = useErrorHandler();

  const [active, setActive] = useState<ActiveMachine>();
  const token = getMfaToken(error);

  useEffect(() => {
    if (!coreClient || !token) {
      setActive(undefined);
      return;
    }
    const machine = coreClient.createMfaStepUpMachine({
      error,
      flow,
      onError: handleError,
    });
    const unsubscribe = machine.subscribe(() =>
      setActive({ token, machine, snapshot: machine.getSnapshot() }),
    );
    setActive({ token, machine, snapshot: machine.getSnapshot() });
    machine.start();

    return () => {
      unsubscribe();
      machine.dispose();
    };
  }, [coreClient, token]);

  const current = active?.token === token ? active : undefined;
  const machine = current?.machine;
  const snapshot = current?.snapshot;

  return { machine, snapshot };
}
