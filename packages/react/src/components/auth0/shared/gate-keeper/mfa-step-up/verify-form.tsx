/**
 * MFA step-up verify form.
 * @module step-up-verify-form
 * @internal
 */

import {
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  type MfaRequiredError,
} from '@auth0/universal-components-core';
import { useEffect, useState } from 'react';

import { OtpCodeForm } from './otp-code-form';

import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useMfaStepUp } from '@/hooks/shared/use-mfa-step-up';
import { useTranslator } from '@/hooks/shared/use-translator';

interface VerifyAuthenticator {
  id?: string;
  authenticatorType: 'otp' | 'oob' | 'recovery-code';
  oobCode?: string;
  type?: string;
  name?: string;
}

interface VerifyFormProps {
  error: MfaRequiredError;
  authenticator: VerifyAuthenticator;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * Verify form for MFA step-up. Handles OTP, OOB (SMS, email, push, voice), and recovery-code authenticators.
 *
 * @param props - Component props.
 * @returns Verify form element.
 * @internal
 */
export function VerifyForm({ error, authenticator, onComplete, onCancel }: VerifyFormProps) {
  const { t } = useTranslator('gate_keeper');
  const { challenge, verify, isLoading } = useMfaStepUp({ error, onComplete });
  const mfaToken = error.mfa_token;

  const isOob = authenticator.authenticatorType === 'oob';
  const isRecoveryCode = authenticator.authenticatorType === FACTOR_TYPE_RECOVERY_CODE;
  const isPush = authenticator.type === FACTOR_TYPE_PUSH_NOTIFICATION;

  const [challenged, setChallenged] = useState(!isOob || !!authenticator.oobCode);
  const [oobCode, setOobCode] = useState<string | undefined>(authenticator.oobCode);

  const handleVerify = async (code: string) => {
    if (isOob) await verify({ mfaToken, oobCode, bindingCode: code });
    else if (isRecoveryCode) await verify({ mfaToken, recoveryCode: code });
    else await verify({ mfaToken, otp: code });
  };

  const handleResend = async () => {
    const response = await challenge(authenticator);
    if (response?.oobCode) setOobCode(response.oobCode);
  };

  useEffect(() => {
    if (!isOob || authenticator.oobCode) return;

    const initializeChallenge = async () => {
      const response = await challenge(authenticator);
      if (response?.oobCode) {
        setOobCode(response.oobCode);
        setChallenged(true);
      }
    };

    initializeChallenge();
  }, [isOob, challenge, authenticator.id, authenticator.oobCode]);

  if (!challenged) {
    return (
      <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
        <Spinner />
      </div>
    );
  }

  if (isPush) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t('mfa.challenge.push_title')}</DialogTitle>
          <DialogDescription>{t('mfa.challenge.push_description')}</DialogDescription>
        </DialogHeader>

        <p className="text-center text-sm text-(length:--font-size-paragraph) font-normal my-4">
          {t('mfa.challenge.push_waiting')}
        </p>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} aria-label={t('mfa.cancel')}>
            {t('mfa.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onComplete}
            aria-label={t('mfa.continue')}
          >
            {t('mfa.continue')}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('mfa.title')}</DialogTitle>
      </DialogHeader>
      <Separator />
      <OtpCodeForm
        onSubmit={handleVerify}
        onCancel={onCancel}
        isLoading={isLoading}
        authenticator={authenticator}
        onResend={isOob && !isPush ? handleResend : undefined}
      />
    </>
  );
}
