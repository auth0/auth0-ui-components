/**
 * OTP verification input form.
 * @module otp-verification-form
 * @internal
 */

import {
  type MFAType,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  getComponentStyles,
} from '@auth0/universal-components-core';
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
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import type { OTPVerificationFormProps } from '@/types/my-account/mfa/mfa-types';

type OtpForm = {
  userOtp: string;
};

const maskContact = (contact: string, factorType: MFAType): string => {
  if (!contact) return '';

  if (factorType === FACTOR_TYPE_EMAIL) {
    const [local, domain] = contact.split('@');
    if (!domain || !local || local.length <= 2) return contact;
    return `${local.slice(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`;
  }

  return contact.length > 6
    ? `${contact.slice(0, 3)}${'*'.repeat(contact.length - 6)}${contact.slice(-3)}`
    : contact;
};

/**
 * OTP verification form for MFA enrollment confirmation.
 * @param props - Component props.
 * @param props.factorType - The MFA factor type
 * @param props.contact - Contact information (email/phone)
 * @param props.isConfirming - Whether confirmation is in progress
 * @param props.onConfirmOtp - Called with the 6-digit OTP code on submit
 * @param props.onBack - Callback fired when back navigation is triggered
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function OTPVerificationForm({
  factorType,
  contact,
  isConfirming,
  onConfirmOtp,
  onBack,
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  customMessages = {},
}: OTPVerificationFormProps) {
  const { t } = useTranslator('mfa', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const form = useForm<OtpForm>({ mode: FORM_VALIDATION_MODE });
  const userOtp = form.watch('userOtp');

  const otpInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  const maskedContact = contact ? maskContact(contact, factorType) : '';

  return (
    <div style={currentStyles.variables} className="w-full max-w-sm mx-auto text-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => onConfirmOtp(data.userOtp))}
          autoComplete="off"
          className="space-y-6"
          aria-describedby="otp-description"
        >
          <p
            id="otp-description"
            className="text-sm text-primary font-normal text-center text-(length:--font-size-paragraph)"
          >
            {[FACTOR_TYPE_PUSH_NOTIFICATION, FACTOR_TYPE_TOTP].includes(factorType)
              ? t('enrollment_form.show_otp.enter_opt_code')
              : t('enrollment_form.show_otp.enter_verify_code', { verifier: maskedContact })}
          </p>

          <FormField
            control={form.control}
            name="userOtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className="text-sm font-medium text-(length:--font-size-label)"
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

          <div className="flex flex-row justify-end gap-3 mt-6 mb-6">
            <Button
              type="button"
              className="text-sm"
              variant="outline"
              size="default"
              onClick={onBack}
              aria-label={t('back')}
            >
              {t('back')}
            </Button>

            <Button
              type="submit"
              className="text-sm"
              size="default"
              disabled={userOtp?.length !== 6 || isConfirming}
              aria-label={isConfirming ? t('enrollment_form.show_otp.verifying') : t('submit')}
            >
              {isConfirming ? t('enrollment_form.show_otp.verifying') : t('submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
