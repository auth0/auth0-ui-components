import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  type MFAType,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_TOPT,
} from '@auth0-web-ui-components/core';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { OTPField } from '@/components/ui/otp-field';

import { useTranslator } from '@/hooks';
import { useOtpConfirmation } from '@/hooks/mfa';
import { CONFIRM } from '@/lib/mfa-constants';
import { cn } from '@/lib/theme-utils';

type OtpForm = {
  userOtp: string;
};

type OTPVerificationFormProps = {
  factorType: MFAType;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
  oobCode?: string;
  contact?: string;
  onBack?: () => void;
  currentStyles?: Record<string, string>;
};

/**
 * Masks sensitive contact information for display purposes.
 *
 * For email addresses:
 * - Shows the first 2 characters of the local part
 * - Masks the remaining characters with asterisks
 * - Preserves the @ symbol and domain unchanged
 *
 * For phone numbers:
 * - Shows the first 3 and last 3 characters
 * - Masks the middle characters with asterisks
 *
 * @param {string} contact - The contact information to mask (email or phone number)
 * @param {MFAType} factorType - The type of MFA factor to determine masking strategy
 * @returns {string} The masked contact information
 *
 * @example
 * // Email masking
 * maskContact('john.doe@example.com', 'email') // Returns 'jo******@example.com'
 *
 * @example
 * // Phone number masking
 * maskContact('1234567890', 'sms') // Returns '123****890'
 */
const maskContact = (contact: string, factorType: MFAType): string => {
  if (!contact) return '';

  if (factorType === FACTOR_TYPE_EMAIL) {
    const atIndex = contact.indexOf('@');
    if (atIndex === -1) return contact;

    const localPart = contact.substring(0, atIndex);
    const domain = contact.substring(atIndex);

    return localPart.length > 2
      ? `${localPart.slice(0, 2)}${'*'.repeat(localPart.length - 2)}${domain}`
      : contact;
  }

  return contact.length > 6
    ? `${contact.slice(0, 3)}${'*'.repeat(contact.length - 6)}${contact.slice(-3)}`
    : contact;
};

export function OTPVerificationForm({
  factorType,
  confirmEnrollment,
  onError,
  onSuccess,
  onClose,
  oobCode,
  contact,
  onBack,
  currentStyles = {},
}: OTPVerificationFormProps) {
  const { t } = useTranslator('mfa');

  const { onSubmitOtp, loading } = useOtpConfirmation({
    factorType,
    confirmEnrollment,
    onError,
    onSuccess,
    onClose,
  });

  const form = useForm<OtpForm>({
    mode: 'onChange',
  });

  const userOtp = form.watch('userOtp');
  const isOtpValid = userOtp && userOtp.length === 6;
  const otpInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  const handleSubmit = React.useCallback(
    async (data: OtpForm) => {
      await onSubmitOtp(data, oobCode);
    },
    [onSubmitOtp, oobCode],
  );

  const maskedContact = React.useMemo(
    () => (contact ? maskContact(contact, factorType) : ''),
    [contact, factorType],
  );

  return (
    <div style={currentStyles} className="w-full max-w-sm mx-auto text-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          autoComplete="off"
          className="space-y-6"
          aria-describedby="otp-description"
        >
          <p
            id="otp-description"
            className={cn(
              'font-normal text-center block mx-auto text-sm text-(length:--font-size-paragraph)',
            )}
          >
            {[FACTOR_TYPE_PUSH_NOTIFICATION, FACTOR_TYPE_TOPT, FACTOR_TYPE_OTP].includes(factorType)
              ? t('enrollment_form.show_otp.enter_opt_code')
              : t('enrollment_form.show_otp.enter_verify_code', { verifier: maskedContact })}
          </p>
          <FormField
            control={form.control}
            name="userOtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className="text-sm text-(length:--font-size-label) font-normal"
                  htmlFor="otp-input"
                >
                  {t('enrollment_form.show_otp.one_time_passcode')}
                </FormLabel>
                <FormControl>
                  <OTPField
                    id="otp-input"
                    length={6}
                    separator={{ character: '-', afterEvery: 3 }}
                    onChange={field.onChange}
                    inputRef={otpInputRef}
                    aria-invalid={Boolean(form.formState.errors.userOtp)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage
                  className="text-sm text-(length:--font-size-paragraph) text-left"
                  id="otp-error"
                  role="alert"
                />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-3 justify-center">
            <Button
              type="submit"
              className="text-sm"
              size="lg"
              disabled={loading || !isOtpValid}
              aria-label={loading ? t('enrollment_form.show_otp.verifying') : t('submit')}
            >
              {loading ? t('enrollment_form.show_otp.verifying') : t('submit')}
            </Button>
            <Button
              type="button"
              className="text-sm"
              variant="ghost"
              size="lg"
              onClick={onBack}
              aria-label={t('back')}
            >
              {t('back')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
