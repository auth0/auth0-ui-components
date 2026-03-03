import type { ChallengeResponse } from '@auth0/universal-components-core';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { OTPField } from '@/components/ui/otp-field';
import { Separator } from '@/components/ui/separator';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';

interface StepUpChallengeFormProps {
  challengeResponse: ChallengeResponse | null;
  authenticatorType: string | null;
  onVerify: (code: string) => Promise<void>;
  onBack: () => void;
  isVerifying: boolean;
  error: string | null;
}

type OtpForm = {
  userOtp: string;
};

/**
 * StepUpChallengeForm
 *
 * Displayed during the VERIFY phase of the step-up challenge flow.
 * A copy of OTPVerificationForm adapted to call verify() on the step-up service
 * rather than confirmEnrollment() on the MFA management service.
 *
 * Handles both OTP (TOTP) and OOB (email/SMS/push) challenge types.
 * @param root0 - Component props.
 * @returns Challenge form element.
 */
export function StepUpChallengeForm({
  challengeResponse,
  authenticatorType,
  onVerify,
  onBack,
  isVerifying,
  error,
}: StepUpChallengeFormProps) {
  const { t } = useTranslator('common');
  const form = useForm<OtpForm>({ mode: 'onChange' });
  const userOtp = form.watch('userOtp');
  const otpInputRef = React.useRef<HTMLInputElement>(null);
  const recoveryCodeInputRef = React.useRef<HTMLInputElement>(null);
  const isRecoveryCode = authenticatorType === 'recovery-code';

  React.useEffect(() => {
    if (isRecoveryCode) {
      recoveryCodeInputRef.current?.focus();
    } else {
      otpInputRef.current?.focus();
    }
  }, [isRecoveryCode]);

  const handleSubmit = async (data: OtpForm) => {
    await onVerify(data.userOtp);
    // Always reset so the user gets a blank field to re-enter on failure.
    // On success the dialog closes, so the reset is a no-op.
    form.reset();
  };

  const isOtp = challengeResponse?.challengeType === 'otp';
  const instruction = isRecoveryCode
    ? t('error.mfa.recovery_code_instruction')
    : isOtp
      ? t('error.mfa.otp_instruction')
      : t('error.mfa.oob_instruction');

  const buttonText = isVerifying ? t('error.mfa.verifying') : t('error.mfa.verify_button');

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          autoComplete="off"
          className="space-y-6"
          aria-describedby="step-up-otp-description"
        >
          <p
            id="step-up-otp-description"
            className={cn('text-sm text-primary font-normal text-center')}
          >
            {instruction}
          </p>

          <FormField
            control={form.control}
            name="userOtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium" htmlFor="step-up-otp-input">
                  {isRecoveryCode
                    ? t('error.mfa.recovery_code_label')
                    : t('error.mfa.enter_code_label')}
                </FormLabel>
                <FormControl>
                  {isRecoveryCode ? (
                    <TextField
                      id="step-up-recovery-code-input"
                      ref={recoveryCodeInputRef}
                      placeholder="ABCDEFGHIJKLMNOPQRSTUVWX"
                      onChange={(e) => field.onChange(e.target.value)}
                      value={field.value || ''}
                      aria-invalid={!!form.formState.errors.userOtp || !!error}
                      autoComplete="off"
                    />
                  ) : (
                    <OTPField
                      id="step-up-otp-input"
                      length={6}
                      separator={{ character: '-', afterEvery: 3 }}
                      onChange={field.onChange}
                      inputRef={otpInputRef}
                      aria-invalid={!!form.formState.errors.userOtp || !!error}
                      value={field.value || ''}
                    />
                  )}
                </FormControl>
                <FormMessage className="text-sm text-left" id="step-up-otp-error" role="alert" />
              </FormItem>
            )}
          />

          {error && (
            <p
              className="text-sm text-destructive-foreground text-left"
              role="alert"
              aria-live="polite"
            >
              {t('error.mfa.verify_error')}
            </p>
          )}

          <div className="flex flex-col gap-4 mt-6">
            <Separator />
            <div className="flex flex-row justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                disabled={isVerifying}
                aria-label={t('error.mfa.back')}
              >
                {t('error.mfa.back')}
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={
                  !userOtp?.trim() || (!isRecoveryCode && userOtp.length !== 6) || isVerifying
                }
                aria-label={buttonText}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
