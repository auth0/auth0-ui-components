/** @internal */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { ActionRow } from './elements/action-row';
import { MfaButton, MfaLink } from './elements/dialog-elements';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { OTPField } from '@/components/ui/otp-field';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import { FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import type { MfaStepUpClasses } from '@/types/mfa-step-up-types';

interface OtpCodeFormProps {
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
  cancelLabel?: string;
  isLoading: boolean;
  isRecoveryCode?: boolean;
  onResend?: () => Promise<void>;
  footer?: ReactNode;
  classes?: MfaStepUpClasses;
}

type CodeForm = { code: string };

/**
 * OTP / recovery-code input form for MFA step-up.
 *
 * Renders a 6-digit OTP field or a plain text field for recovery codes, with
 * Verify and Cancel buttons. Owns its own form state and auto-focuses on mount.
 *
 * @param props - Component props.
 * @param props.onSubmit - Called with the entered code on form submission.
 * @param props.onCancel - Called when the user cancels.
 * @param props.cancelLabel - The cancel button's text. Defaults to Cancel.
 * @param props.isLoading - Whether a verification request is in flight.
 * @param props.isRecoveryCode - Whether the code is a recovery code, entered as text.
 * @param props.onResend - Asks for a new code. Without it there is no resend link.
 * @param props.footer - Shown under the field, for example a link to another method.
 * @returns Code input form element.
 * @internal
 */
export function OtpCodeForm({
  onSubmit,
  onCancel,
  cancelLabel,
  isLoading,
  isRecoveryCode = false,
  onResend,
  footer,
  classes,
}: OtpCodeFormProps) {
  const { t } = useTranslator('gate_keeper');

  const [isResending, setIsResending] = useState(false);

  const form = useForm<CodeForm>({ mode: FORM_VALIDATION_MODE });
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ code: enteredCode }) => onSubmit(enteredCode))}
        autoComplete="off"
        className="space-y-6"
      >
        <div className="space-y-4">
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
                      className={classes?.['MfaStepUp-field']}
                      placeholder="XHPOWIHEFSDO23435pwe"
                      autoComplete="off"
                      ref={inputRef}
                    />
                  ) : (
                    <OTPField
                      id="step-up-code"
                      className={classes?.['MfaStepUp-field']}
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
              <MfaLink
                classes={classes}
                onClick={handleResend}
                aria-disabled={isResending}
                className="text-sm ms-1"
              >
                {t('mfa.challenge.resend')}
              </MfaLink>
            </p>
          )}
          {footer}
        </div>

        <ActionRow classes={classes}>
          <MfaButton
            classes={classes}
            type="submit"
            variant="primary"
            disabled={(isRecoveryCode ? !code : code?.length !== 6) || isLoading}
            aria-label={submitLabel}
          >
            {isLoading && <Spinner size="sm" colorScheme="foreground" />}
            {submitLabel}
          </MfaButton>
          <MfaButton
            classes={classes}
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            aria-label={cancelLabel ?? t('mfa.cancel')}
          >
            {cancelLabel ?? t('mfa.cancel')}
          </MfaButton>
        </ActionRow>
      </form>
    </Form>
  );
}
