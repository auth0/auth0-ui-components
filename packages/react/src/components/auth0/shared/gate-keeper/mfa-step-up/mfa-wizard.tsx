/**
 * MFA wizard orchestrator.
 * @module mfa-wizard
 * @internal
 */
import {
  MFA_STEP,
  type MfaFlowConfig,
  type MfaStepUpError,
} from '@auth0/universal-components-core';
import { useEffect, useRef } from 'react';

import { AuthenticatorsList } from './authenticators-list';
import { ConfirmStep } from './confirm-step';
import { ActionRow } from './elements/action-row';
import {
  MfaButton,
  MfaDialogDescription,
  MfaDialogHeader,
  MfaDialogTitle,
} from './elements/dialog-elements';
import { ContactStep, InstallStep, QrStep, RecoveryStep } from './enrollment-steps';
import { VerifyForm } from './verify-form';

import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useMfaStepUp } from '@/hooks/shared/use-mfa-step-up';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  MfaActionsAlign,
  MfaStepScreen,
  MfaStepScreenProps,
  MfaStepUpClasses,
} from '@/types/mfa-step-up-types';

interface MfaWizardProps {
  error: unknown;
  actionsAlign?: MfaActionsAlign;
  onComplete: () => void;
  onCancel: (failure?: MfaStepUpError) => void;
  flow?: MfaFlowConfig;
  screens?: Partial<Record<string, MfaStepScreen>>;
  classes?: MfaStepUpClasses;
}

/**
 * The first step: the factors the user can enroll, or the authenticators they can use.
 *
 * @param props - Screen props.
 * @param props.snapshot - The flow's snapshot.
 * @param props.machine - The flow's machine.
 * @param props.classes - The integrator's class overrides.
 * @returns The list step element.
 * @internal
 */
function ListStep({ snapshot, machine, classes }: MfaStepScreenProps) {
  const { t } = useTranslator('gate_keeper');
  const isChallenge = snapshot.options[0]?.kind === 'challenge';

  return (
    <>
      <MfaDialogHeader classes={classes}>
        <MfaDialogTitle classes={classes}>
          {isChallenge ? t('mfa.verify_title') : t('mfa.title')}
        </MfaDialogTitle>
        <MfaDialogDescription classes={classes}>
          {isChallenge ? t('mfa.choose_method') : t('mfa.subtitle')}
        </MfaDialogDescription>
      </MfaDialogHeader>
      {!isChallenge && <Separator />}
      <AuthenticatorsList classes={classes} snapshot={snapshot} machine={machine} />
    </>
  );
}

const BUILT_IN_SCREENS: Record<string, MfaStepScreen> = {
  [MFA_STEP.list]: ListStep,
  [MFA_STEP.install]: InstallStep,
  [MFA_STEP.contact]: ContactStep,
  [MFA_STEP.qr]: QrStep,
  [MFA_STEP.verify]: VerifyForm,
  [MFA_STEP.recovery]: RecoveryStep,
  [MFA_STEP.confirm]: ConfirmStep,
  [MFA_STEP.challenge]: VerifyForm,
  [MFA_STEP.newRecoveryCode]: RecoveryStep,
};

/**
 * What the dialog shows when the flow cannot go on, with a way out.
 *
 * @param props - Component props.
 * @param props.message - Why the flow cannot go on.
 * @param props.onCancel - Closes the dialog.
 * @returns Unavailable element.
 * @internal
 */
function Unavailable({
  message,
  onCancel,
  classes,
}: {
  message: string;
  onCancel: () => void;
  classes?: MfaStepUpClasses;
}) {
  const { t } = useTranslator('gate_keeper');

  return (
    <>
      <MfaDialogHeader classes={classes}>
        <MfaDialogTitle classes={classes}>{t('mfa.title')}</MfaDialogTitle>
        <MfaDialogDescription classes={classes}>{t('mfa.subtitle')}</MfaDialogDescription>
      </MfaDialogHeader>
      <p className={cn('text-sm text-muted-foreground', classes?.['MfaStepUp-message'])}>
        {message}
      </p>
      <Separator />
      <ActionRow classes={classes}>
        <MfaButton
          classes={classes}
          variant="outline"
          onClick={onCancel}
          aria-label={t('mfa.cancel')}
        >
          {t('mfa.cancel')}
        </MfaButton>
      </ActionRow>
    </>
  );
}

/**
 * Runs the MFA step-up flow and shows the screen of the current step.
 *
 * @param props - Component props.
 * @param props.error - The MFA required error from the step-up flow.
 * @param props.onComplete - Called once, after the user passed MFA.
 * @param props.onCancel - Called once, when the flow ended without that.
 * @param props.flow - Flow customization: hide steps, add steps.
 * @param props.screens - Screens for added steps, or replacements for built-in ones.
 * @param props.classes - The integrator's class overrides.
 * @returns The screen of the current step.
 * @internal
 */
function MfaWizardContent({ error, onComplete, onCancel, flow, screens, classes }: MfaWizardProps) {
  const { t } = useTranslator('gate_keeper');
  const { machine, snapshot } = useMfaStepUp({ error, flow });

  const callbacks = useRef({ onComplete, onCancel });
  useEffect(() => {
    callbacks.current = { onComplete, onCancel };
  });

  const status = snapshot?.status;
  const reason = snapshot?.reason;
  const failure = snapshot?.failure;
  useEffect(() => {
    if (status === 'done') callbacks.current.onComplete();
    const isCancelled = status === 'cancelled' && reason !== 'disposed';
    if (isCancelled || status === 'blocked') {
      callbacks.current.onCancel(failure);
    }
  }, [status, reason, failure]);

  if (!machine || !snapshot || snapshot.status === 'loading') {
    return (
      <>
        <MfaDialogHeader classes={classes}>
          <MfaDialogTitle classes={classes}>{t('mfa.title')}</MfaDialogTitle>
          <MfaDialogDescription classes={classes}>{t('mfa.subtitle')}</MfaDialogDescription>
        </MfaDialogHeader>
        <div
          className={cn('flex items-center justify-center p-8', classes?.['MfaStepUp-loading'])}
          role="status"
          aria-live="polite"
        >
          <Spinner />
        </div>
      </>
    );
  }

  if (snapshot.status === 'blocked') {
    return (
      <Unavailable
        classes={classes}
        message={
          snapshot.reason === 'no_authenticators'
            ? t('mfa.no_authenticators')
            : t('fallback.description')
        }
        onCancel={() => onCancel(failure)}
      />
    );
  }

  const Screen = snapshot.step
    ? (screens?.[snapshot.step] ?? BUILT_IN_SCREENS[snapshot.step])
    : undefined;
  if (!Screen) {
    console.warn(`MFA step-up: there is no screen for the step "${snapshot.step}"`);
    return (
      <Unavailable
        classes={classes}
        message={t('fallback.description')}
        onCancel={() => machine.cancel()}
      />
    );
  }
  return <Screen snapshot={snapshot} machine={machine} classes={classes} />;
}

/**
 * Runs the MFA step-up flow and shows the screen of the current step.
 *
 * @param props - Component props.
 * @param props.actionsAlign - Where the buttons at the bottom of the built-in screens sit.
 * @returns MFA wizard element.
 * @internal
 */
export function MfaWizard({ actionsAlign = 'right', ...props }: MfaWizardProps) {
  return (
    <div className="group/mfa contents" data-actions-align={actionsAlign}>
      <MfaWizardContent {...props} />
    </div>
  );
}
