/**
 * MFA step-up verify form.
 * @module step-up-verify-form
 * @internal
 */

import { FACTOR_TYPE_PUSH, FACTOR_TYPE_RECOVERY_CODE } from '@auth0/universal-components-core';

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

  const sentTo = isEnrolling ? snapshot.contact : selected?.authenticator?.name;
  const isRecoveryCode = facts.factor === FACTOR_TYPE_RECOVERY_CODE;

  let title = t('mfa.challenge.otp_title');
  let description = t('mfa.challenge.otp_description');
  if (isGuardianCode) {
    title = t('mfa.challenge.guardian_code_title');
    description = t('mfa.challenge.guardian_code_description');
  } else if (isRecoveryCode) {
    title = t('mfa.challenge.recovery_title');
    description = t('mfa.challenge.recovery_code_description');
  } else if (sentTo) {
    title =
      facts.factor === 'email' ? t('mfa.challenge.email_title') : t('mfa.challenge.phone_title');
    description = t('mfa.challenge.code_sent_description', { name: sentTo });
  }

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
        <MfaDialogTitle classes={classes}>{title}</MfaDialogTitle>
        <MfaDialogDescription classes={classes}>{description}</MfaDialogDescription>
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
