/** @internal */
import { mfaStepUpStore, type MfaStepUpError } from '@auth0/universal-components-core';
import { useSyncExternalStore } from 'react';

import { MfaWizard } from './mfa-wizard';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGateKeeperContext } from '@/providers/gate-keeper-context';

const getNoRequest = () => undefined;

/**
 * The one MFA step-up dialog of the app. It shows the step-up that is open, whoever asked for it:
 * a component of this library, or a call wrapped in `withMfaStepUp`.
 *
 * @returns The dialog while a step-up is open, nothing otherwise.
 * @internal
 */
export function MfaStepUpDialog() {
  const request = useSyncExternalStore(
    mfaStepUpStore.subscribe,
    mfaStepUpStore.getSnapshot,
    getNoRequest,
  );
  const { mfaStepUp } = useGateKeeperContext();

  if (!request) return null;

  const cancel = (failure?: MfaStepUpError) =>
    request.cancel(failure?.code === 'cancelled' ? undefined : failure);

  return (
    <Dialog open onOpenChange={(open) => !open && request.cancel()}>
      <DialogContent className={mfaStepUp?.classes?.['MfaStepUp-dialogContent']}>
        <MfaWizard
          error={request.error}
          onComplete={request.complete}
          onCancel={cancel}
          flow={mfaStepUp?.flow}
          screens={mfaStepUp?.screens}
          actionsAlign={mfaStepUp?.actionsAlign}
        />
      </DialogContent>
    </Dialog>
  );
}
