import {
  type MFAType,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  getComponentStyles,
} from '@auth0-web-ui-components/core';
import * as React from 'react';
import { useForm } from 'react-hook-form';

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
import { useTheme, useTranslator, useOtpConfirmation } from '@/hooks';
import { cn } from '@/lib/theme-utils';
import type { OTPVerificationFormProps } from '@/types';

import { ShowRecoveryCode } from './show-recovery-code';

type OtpForm = {
  userOtp: string;
};

// Mask contact info (email or phone)
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
    const [local, domain] = contact.split('@');
    if (!domain || local.length <= 2) return contact;
    return `${local.slice(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`;
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
  recoveryCodes = [],
  onBack,
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
}: OTPVerificationFormProps) {
  const { t } = useTranslator('mfa');
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const [showRecoveryCode, setShowRecoveryCode] = React.useState(false);

  const { onSubmitOtp, loading } = useOtpConfirmation({
    factorType,
    confirmEnrollment,
    onError,
    onSuccess,
    onClose,
  });

  const form = useForm<OtpForm>({ mode: 'onChange' });
  const userOtp = form.watch('userOtp');

  const otpInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  const handleSubmit = async (data: OtpForm) => {
    // If recovery codes exist, switch to continue flow, otherwise submit
    if (recoveryCodes.length > 0) {
      setShowRecoveryCode(true);
    } else {
      await onSubmitOtp(data, oobCode);
    }
  };

  const maskedContact = React.useMemo(
    () => (contact ? maskContact(contact, factorType) : ''),
    [contact, factorType],
  );

  const showRecovery = showRecoveryCode && recoveryCodes.length > 0;
  const shouldUseContinueFlow = recoveryCodes.length > 0;

  const buttonText = loading
    ? t('enrollment_form.show_otp.verifying')
    : shouldUseContinueFlow
      ? t('continue')
      : t('submit');

  if (showRecovery) {
    return (
      <ShowRecoveryCode
        factorType={factorType}
        confirmEnrollment={confirmEnrollment}
        onError={onError}
        onSuccess={onSuccess}
        onClose={onClose}
        oobCode={oobCode}
        userOtp={userOtp}
        recoveryCodes={recoveryCodes}
        onBack={() => setShowRecoveryCode(false)}
        styling={styling}
      />
    );
  }

  return (
    <div style={currentStyles.variables} className="w-full max-w-sm mx-auto text-center">
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
              'text-sm text-primary font-normal text-center',
              'text-(length:--font-size-paragraph)',
            )}
          >
            {[FACTOR_TYPE_PUSH_NOTIFICATION, FACTOR_TYPE_OTP].includes(factorType)
              ? t('enrollment_form.show_otp.enter_opt_code')
              : t('enrollment_form.show_otp.enter_verify_code', { verifier: maskedContact })}
          </p>

          <FormField
            control={form.control}
            name="userOtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className="text-sm font-normal text-(length:--font-size-label)"
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
                    aria-invalid={!!form.formState.errors.userOtp}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage
                  className="text-sm text-left text-(length:--font-size-paragraph)"
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
              disabled={userOtp?.length !== 6 || loading}
              aria-label={buttonText}
            >
              {buttonText}
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
