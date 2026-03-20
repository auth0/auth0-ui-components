/** @internal */

import { FACTOR_TYPE_RECOVERY_CODE } from '@auth0/universal-components-core';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Link } from '@/components/ui/link';
import { OTPField } from '@/components/ui/otp-field';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';

interface Authenticator {
  authenticatorType?: string;
  name?: string;
}

interface OtpCodeFormProps {
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  authenticator?: Authenticator;
  onResend?: () => Promise<void>;
}

type CodeForm = { code: string };

/**
 * OTP / recovery-code input form for MFA step-up.
 *
 * Renders a 6-digit OTP field or a plain text field for recovery codes, with
 * Cancel and Verify buttons. Owns its own form state and auto-focuses on mount.
 *
 * @param props - Component props.
 * @param props.onSubmit - Called with the entered code on form submission.
 * @param props.onCancel - Called when the user cancels.
 * @param props.isLoading - Whether a verification request is in flight.
 * @returns Code input form element.
 * @internal
 */
export function OtpCodeForm({
  onSubmit,
  onCancel,
  isLoading,
  authenticator,
  onResend,
}: OtpCodeFormProps) {
  const { t } = useTranslator('gate_keeper');

  const [isResending, setIsResending] = useState(false);

  const isRecoveryCode = authenticator?.authenticatorType === FACTOR_TYPE_RECOVERY_CODE;

  const form = useForm<CodeForm>({ mode: 'onChange' });
  const code = form.watch('code');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleResend = async () => {
    setIsResending(true);
    await onResend?.();
    form.reset();
    setIsResending(false);
  };

  const submitLabel = isLoading ? t('mfa.challenge.verifying') : t('mfa.verify_button');

  const description = authenticator?.name
    ? t('mfa.challenge.code_sent_description', { name: authenticator.name })
    : isRecoveryCode
      ? t('mfa.challenge.recovery_code_description')
      : t('mfa.challenge.otp_description');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ code: enteredCode }) => onSubmit(enteredCode))}
        autoComplete="off"
        className="space-y-6"
      >
        <div className="space-y-4">
          {authenticator && (
            <p className="text-sm text-(length:--font-size-paragraph)">{description}</p>
          )}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  {isRecoveryCode ? (
                    <TextField
                      id="step-up-code"
                      {...field}
                      value={field.value || ''}
                      placeholder="XHPOWIHEFSDO23435pwe"
                      autoComplete="off"
                      ref={inputRef}
                    />
                  ) : (
                    <OTPField
                      id="step-up-code"
                      length={6}
                      separator={{ character: '-', afterEvery: 3 }}
                      onChange={field.onChange}
                      inputRef={inputRef}
                      value={field.value || ''}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {onResend && (
            <p className="text-sm text-muted-foreground text-center">
              {t('mfa.challenge.resend_prompt')}
              <Link onClick={handleResend} aria-disabled={isResending} className="text-sm ms-1">
                {t('mfa.challenge.resend')}
              </Link>
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            aria-label={t('mfa.back')}
          >
            {t('mfa.back')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={(isRecoveryCode ? !code : code?.length !== 6) || isLoading}
            aria-label={submitLabel}
          >
            {isLoading && <Spinner size="sm" colorScheme="foreground" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
