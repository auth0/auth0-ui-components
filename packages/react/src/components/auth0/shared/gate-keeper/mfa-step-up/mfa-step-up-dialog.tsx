/** @internal */
import { mfaStepUpStore, type MfaStepUpError } from '@auth0/universal-components-core';
import { useSyncExternalStore } from 'react';

import { MfaWizard } from './mfa-wizard';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { MfaStepUpSettings } from '@/types/mfa-step-up-types';

const getNoRequest = () => undefined;

/**
 * The one MFA step-up dialog of the app. It shows the step-up that is open, whoever asked for it:
 * a component of this library, or a call wrapped in `withMfaStepUp`.
 *
 * @param props - Component props.
 * @param props.settings - The integrator's customization of the dialog.
 * @returns The dialog while a step-up is open, nothing otherwise.
 * @internal
 */
export function MfaStepUpDialog({ settings }: { settings?: MfaStepUpSettings }) {
  const request = useSyncExternalStore(
    mfaStepUpStore.subscribe,
    mfaStepUpStore.getSnapshot,
    getNoRequest,
  );

  if (!request) return null;

  const cancel = (failure?: MfaStepUpError) =>
    request.cancel(failure?.code === 'cancelled' ? undefined : failure);

  return (
    <Dialog open onOpenChange={(open) => !open && request.cancel()}>
      <DialogContent className={settings?.classes?.['MfaStepUp-dialogContent']}>
        <MfaWizard
          error={request.error}
          onComplete={request.complete}
          onCancel={cancel}
          flow={settings?.flow}
          screens={settings?.screens}
          actionsAlign={settings?.actionsAlign}
          classes={settings?.classes}
        />
      </DialogContent>
    </Dialog>
  );
}
