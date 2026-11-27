/**
 * MFA step-up verify form.
 * @module step-up-verify-form
 * @internal
 */

import {
  FACTOR_TYPE_PUSH,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
} from '@auth0/universal-components-core';

import {
  MfaDialogDescription,
  MfaDialogHeader,
  MfaDialogTitle,
  MfaLink,
} from './elements/dialog-elements';
import { OtpCodeForm } from './otp-code-form';
import { PushChallenge } from './push-challenge';

import { useTranslator } from '@/hooks/shared/use-translator';
import type { MfaStepScreenProps } from '@/types/mfa-step-up-types';

const TEXTS = {
  guardian: {
    title: 'mfa.challenge.guardian_code_title',
    description: 'mfa.challenge.guardian_code_description',
  },
  recovery: {
    title: 'mfa.challenge.recovery_title',
    description: 'mfa.challenge.recovery_code_description',
  },
  email: {
    title: 'mfa.challenge.email_title',
    description: 'mfa.challenge.code_sent_description',
  },
  phone: {
    title: 'mfa.challenge.phone_title',
    description: 'mfa.challenge.code_sent_description',
  },
  otp: { title: 'mfa.challenge.otp_title', description: 'mfa.challenge.otp_description' },
} as const;

/**
 * Picks the texts of the screen: where the code came from, if it was sent to the user.
 *
 * @param factor - The factor being verified.
 * @param isGuardianCode - Whether the user types a Guardian code instead of approving a push.
 * @param sentTo - Where the code was sent, if known.
 * @returns The key of the texts to show.
 */
function getTextsVariant(
  factor: string | undefined,
  isGuardianCode: boolean,
  sentTo: string | undefined,
): keyof typeof TEXTS {
  if (isGuardianCode) return 'guardian';
  if (factor === FACTOR_TYPE_RECOVERY_CODE) return 'recovery';
  if (!sentTo) return 'otp';
  if (factor === 'email') return 'email';
  return factor === FACTOR_TYPE_SMS || factor === FACTOR_TYPE_VOICE ? 'phone' : 'otp';
}

/**
 * Where the user proves who they are. A push waits for them to approve it on their device, and
 * every other factor asks for a code. It also finishes enrolling a factor, with the code that
 * was sent to the new contact or the one the authenticator app shows.
 *
 * @param props - Component props.
 * @param props.snapshot - The flow's snapshot.
 * @param props.machine - The flow's machine.
 * @param props.classes - The integrator's class overrides.
 * @returns Verify form element.
 * @internal
 */
export function VerifyForm({ snapshot, machine, classes }: MfaStepScreenProps) {
  const { t } = useTranslator('gate_keeper');
  const { selected, facts } = snapshot;
  const isEnrolling = selected?.kind === 'enroll';
  const isGuardianCode = facts.factor === FACTOR_TYPE_PUSH && snapshot.push?.mode === 'code';

  if (facts.factor === FACTOR_TYPE_PUSH && !isGuardianCode) {
    return <PushChallenge classes={classes} snapshot={snapshot} machine={machine} />;
  }

  const isRecoveryCode = facts.factor === FACTOR_TYPE_RECOVERY_CODE;
  const sentTo = isEnrolling ? snapshot.contact : selected?.authenticator?.name;
  const { title, description } = TEXTS[getTextsVariant(facts.factor, isGuardianCode, sentTo)];

  const footer =
    isGuardianCode && snapshot.push?.canApprove ? (
      <p className="text-center">
        <MfaLink classes={classes} onClick={machine.switchToPush} className="text-sm">
          {t('mfa.challenge.use_push_instead')}
        </MfaLink>
      </p>
    ) : undefined;

  return (
    <>
      <MfaDialogHeader classes={classes}>
        <MfaDialogTitle classes={classes}>{t(title)}</MfaDialogTitle>
        <MfaDialogDescription classes={classes}>
          {t(description, { name: sentTo })}
        </MfaDialogDescription>
      </MfaDialogHeader>
      <OtpCodeForm
        classes={classes}
        onSubmit={(code) => machine.next(code)}
        onCancel={isEnrolling ? machine.back : machine.cancel}
        cancelLabel={isEnrolling ? t('mfa.back') : undefined}
        isLoading={snapshot.request.isLoading}
        isRecoveryCode={isRecoveryCode}
        onResend={snapshot.canResend && !isGuardianCode ? machine.resend : undefined}
        footer={footer}
      />
    </>
  );
}
