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
import { Label } from '@/components/ui/label';
import { useTranslator } from '@/hooks';
import { useOtpConfirmation } from '@/hooks/mfa';
import { type MFAType } from '@auth0-web-ui-components/core';
import { CONFIRM, FACTOR_TYPE_EMAIL } from '@/lib/constants';

type OtpForm = {
  userOtp: string;
};

type OTPVerificationFormProps = {
  factorType: MFAType;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
  oobCode?: string;
  contact?: string;
  onBack?: () => void;
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

  // Mask phone number
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
}: OTPVerificationFormProps) {
  const t = useTranslator('mfa');

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

  const handleSubmit = React.useCallback(
    (data: OtpForm) => {
      onSubmitOtp(data, oobCode);
    },
    [onSubmitOtp, oobCode],
  );

  const maskedContact = React.useMemo(
    () => (contact ? maskContact(contact, factorType) : ''),
    [contact, factorType],
  );

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} autoComplete="off" className="space-y-6">
          <Label htmlFor="description" className="font-medium text-center block mx-auto text-base">
            {t('enrollment_form.show_otp.enter_verify_code', { verifier: maskedContact })}
          </Label>
          <FormField
            control={form.control}
            name="userOtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">
                  {t('enrollment_form.show_otp.one_time_passcode')}
                </FormLabel>
                <FormControl>
                  <OTPField
                    length={6}
                    separator={{ character: '-', afterEvery: 3 }}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="text-left" />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-3 justify-center">
            <Button type="submit" size="lg" disabled={loading || !isOtpValid}>
              {loading ? t('enrollment_form.show_otp.verifying') : t('submit')}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={onBack}>
              {t('back')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
