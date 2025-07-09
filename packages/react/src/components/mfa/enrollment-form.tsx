import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { OTPField } from '@/components/ui/otp-field';
import { TextField } from '@/components/ui/text-field';
import {
  SHOW_OTP,
  ENTER_OTP,
  ENTER_CONTACT,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_TOPT,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  ENROLL,
  CONFIRM,
  EMAIL_PLACEHOLDER,
  PHONE_NUMBER_PLACEHOLDER,
} from '@/lib/constants';
import QRCode from 'react-qr-code';
import {
  normalizeError,
  type MFAType,
  type EnrollMfaResponse,
} from '@auth0-web-ui-components/core';
import { MailIcon, PhoneIcon } from 'lucide-react';
import { useTranslator } from '@/hooks';

const phoneRegex = /^\+?[0-9\s\-()]{8,}$/;

type EnrollmentFormProps = {
  open: boolean;
  onClose: () => void;
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
  ) => Promise<unknown | null>;
  onSuccess: () => void;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
};

type ContactForm = {
  contact: string;
};

type OtpForm = {
  userOtp: string;
};

type EnrollmentPhase = typeof ENTER_CONTACT | typeof ENTER_OTP | typeof SHOW_OTP | null;

export function EnrollmentForm({
  open,
  onClose,
  factorType,
  enrollMfa,
  confirmEnrollment,
  onSuccess,
  onError,
}: EnrollmentFormProps) {
  const t = useTranslator('mfa');

  // Initialize phase as null, meaning no UI shown by default
  const [phase, setPhase] = React.useState<EnrollmentPhase>(null);
  const [oobCode, setOobCode] = React.useState<string | undefined>(undefined);
  const [otpData, setOtpData] = React.useState<{
    secret: string | null;
    barcodeUri: string | null;
    recoveryCodes: string[];
  }>({
    secret: null,
    barcodeUri: null,
    recoveryCodes: [],
  });
  const [loading, setLoading] = React.useState(false);

  // Create schema for validating contact input based on MFA type
  const ContactSchema = React.useMemo(() => {
    return factorType === FACTOR_TYPE_EMAIL
      ? z.object({ contact: z.string().email({ message: t('errors.invalid_email') }) })
      : z.object({
          contact: z.string().regex(phoneRegex, { message: t('errors.invalid_phone_number') }),
        });
  }, [factorType]);

  const formContact = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema),
    mode: 'onChange',
  });

  const formOtp = useForm<OtpForm>({
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (!open) {
      setPhase(null); // reset phase to null when dialog closes
      setOobCode(undefined);
      setOtpData({ secret: null, barcodeUri: null, recoveryCodes: [] });
      setLoading(false);
      formContact.reset();
      formOtp.reset();
    }
  }, [open, formContact, formOtp]);

  React.useEffect(() => {
    if (open && (factorType === FACTOR_TYPE_EMAIL || factorType === FACTOR_TYPE_SMS)) {
      setPhase(ENTER_CONTACT);
    }
  }, [open, factorType]);

  const onSubmitContact = async (data: ContactForm) => {
    setLoading(true);
    try {
      const options: Record<string, string> =
        factorType === FACTOR_TYPE_EMAIL
          ? { email: data.contact }
          : factorType === FACTOR_TYPE_SMS
            ? { phone_number: data.contact }
            : {};

      const response = await enrollMfa(factorType, options);

      if (response?.oob_code) {
        setOobCode(response.oob_code);
        setPhase(ENTER_OTP);
      }

      if (response?.authenticator_type === FACTOR_TYPE_OTP) {
        setOtpData({
          secret: response.secret ?? null,
          barcodeUri: response.barcode_uri ?? null,
          recoveryCodes: response.recovery_codes || [],
        });
        setPhase(SHOW_OTP);
      }
    } catch (error) {
      const normalizedError = normalizeError(error, {
        resolver: (code) => t(`errors.${code}.${factorType}`),
        fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
      });
      onError(normalizedError, ENROLL);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (data: OtpForm) => {
    setLoading(true);

    try {
      const options = {
        oobCode,
        ...(factorType === FACTOR_TYPE_EMAIL
          ? { userEmailOtpCode: data.userOtp }
          : { userOtpCode: data.userOtp }),
      };

      const response = await confirmEnrollment(factorType, options);
      if (response) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      const normalizedError = normalizeError(err, {
        resolver: (code) => t(`errors.${code}.${factorType}`),
        fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
      });
      onError(normalizedError, CONFIRM);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtpEnrollment = React.useCallback(async () => {
    try {
      const response = await enrollMfa(factorType, {});
      if (response?.authenticator_type === FACTOR_TYPE_OTP) {
        setOtpData({
          secret: response.secret ?? null,
          barcodeUri: response.barcode_uri ?? null,
          recoveryCodes: response.recovery_codes || [],
        });
      }
      setPhase(SHOW_OTP);
    } catch (error) {
      const normalizedError = normalizeError(error, {
        resolver: (code) => t(`errors.${code}.${factorType}`),
        fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
      });
      onError(normalizedError, ENROLL);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [factorType, enrollMfa, onError, onClose, t]);

  // Automatically initiate OTP enrollment when factorType is 'totp' or 'push-notification'
  React.useEffect(() => {
    if (
      [FACTOR_TYPE_TOPT, FACTOR_TYPE_PUSH_NOTIFICATION].includes(factorType) &&
      !otpData.secret &&
      open
    ) {
      setLoading(true);
      fetchOtpEnrollment();
    }
  }, [factorType, fetchOtpEnrollment, otpData.secret, open]);

  // Render the appropriate form based on the current phase and factorType
  const renderForm = () => {
    switch (phase) {
      case ENTER_CONTACT:
        return (
          <div className="w-full max-w-sm mx-auto text-center">
            <Form {...formContact}>
              <form onSubmit={formContact.handleSubmit(onSubmitContact)} className="space-y-6">
                <FormField
                  control={formContact.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {factorType === FACTOR_TYPE_EMAIL
                          ? t('enrollment_form.email_address')
                          : t('enrollment_form.phone_number')}
                      </FormLabel>
                      <FormControl>
                        <TextField
                          type={factorType === FACTOR_TYPE_EMAIL ? 'email' : 'tel'}
                          startAdornment={
                            <div className="p-1.5">
                              {factorType === FACTOR_TYPE_EMAIL ? <MailIcon /> : <PhoneIcon />}
                            </div>
                          }
                          placeholder={
                            factorType === FACTOR_TYPE_EMAIL
                              ? EMAIL_PLACEHOLDER
                              : PHONE_NUMBER_PLACEHOLDER
                          }
                          error={Boolean(formContact.formState.errors.contact)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!formContact.formState.isValid || loading}
                >
                  {loading ? t('enrollment_form.sending') : t('enrollment_form.send_code')}
                </Button>
              </form>
            </Form>
          </div>
        );
      case SHOW_OTP:
        return (
          <div className="text-center">
            <p>{t('enrollment_form.show_otp.title')}</p>
            <div className="flex justify-center items-center mt-6">
              <div className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white inline-block">
                <QRCode
                  size={150}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  value={otpData.barcodeUri || ''}
                  viewBox={`0 0 150 150`}
                />
              </div>
            </div>
            <div className="mt-6">
              {otpData.recoveryCodes.length > 0 && (
                <div className="mb-6">
                  <p>
                    <strong>{t('enrollment_form.show_otp.save_recovery')}</strong>
                  </p>
                  <ul className="list-none inline-block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-2">
                    {otpData.recoveryCodes.map((code, index) => (
                      <li key={index} className="font-mono tracking-widest">
                        {code}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="w-full max-w-sm mx-auto text-center">
                <Form {...formOtp}>
                  <form
                    autoComplete="off"
                    onSubmit={formOtp.handleSubmit(onSubmitOtp)}
                    className="space-y-6 mt-4"
                  >
                    <FormField
                      control={formOtp.control}
                      name="userOtp"
                      key={phase}
                      render={({ field }) => (
                        <FormItem className="text-center">
                          <FormLabel className="block w-full text-sm font-medium text-center">
                            {t('enrollment_form.show_otp.enter_code')}
                          </FormLabel>
                          <FormControl>
                            <div className="flex justify-center">
                              <OTPField length={6} onChange={field.onChange} className="max-w-xs" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-left" />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="sm" disabled={loading}>
                      {loading
                        ? t('enrollment_form.show_otp.verifying')
                        : t('enrollment_form.show_otp.verify_code')}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        );
      case ENTER_OTP:
        return (
          <div className="w-full max-w-sm mx-auto text-center">
            <Form {...formOtp}>
              <form
                onSubmit={formOtp.handleSubmit(onSubmitOtp)}
                autoComplete="off"
                className="space-y-6"
              >
                <FormField
                  control={formOtp.control}
                  key={phase}
                  name="userOtp"
                  render={({ field }) => (
                    <FormItem className="text-center">
                      <FormLabel className="block w-full text-sm font-medium text-center">
                        {t('enrollment_form.show_otp.enter_verify_code')}
                      </FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
                          <OTPField length={6} onChange={field.onChange} className="max-w-xs" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" disabled={loading}>
                  {loading
                    ? t('enrollment_form.show_otp.verifying')
                    : t('enrollment_form.show_otp.verify_code')}
                </Button>
              </form>
            </Form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open && Boolean(phase)} onOpenChange={onClose}>
      <DialogContent aria-describedby={factorType}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {factorType === FACTOR_TYPE_EMAIL
              ? t('enrollment_form.enroll_email')
              : factorType === FACTOR_TYPE_SMS
                ? t('enrollment_form.enroll_sms')
                : t('enroll_otp_mfa')}
          </DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
