import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { MFAType, normalizeError } from '@auth0-web-ui-components/core';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/hooks';
import { EnrollMfaResponse } from '@auth0-web-ui-components/core';
import QRCode from 'react-qr-code';

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
  onError: (error: Error, stage: 'enroll' | 'confirm') => void;
};

type ContactForm = {
  contact: string;
};

type OtpForm = {
  userOtp: string;
};

export function EnrollmentForm({
  open,
  onClose,
  factorType,
  enrollMfa,
  confirmEnrollment,
  onSuccess,
  onError,
}: EnrollmentFormProps) {
  const t = useI18n('mfa');

  // Initialize phase as null, meaning no UI shown by default
  const [phase, setPhase] = React.useState<'enterContact' | 'enterOtp' | 'showOtp' | null>(null);
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
    return factorType === 'email'
      ? z.object({ contact: z.string().email({ message: 'Invalid email address' }) })
      : z.object({ contact: z.string().regex(phoneRegex, { message: 'Invalid phone number' }) });
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
    if (open && (factorType === 'email' || factorType === 'sms')) {
      setPhase('enterContact');
    }
  }, [open, factorType]);

  const onSubmitContact = async (data: ContactForm) => {
    setLoading(true);
    try {
      const options: Record<string, string> =
        factorType === 'email'
          ? { email: data.contact }
          : factorType === 'sms'
            ? { phone_number: data.contact }
            : {};

      const response = await enrollMfa(factorType, options);

      if (response?.oob_code) {
        setOobCode(response.oob_code);
        setPhase('enterOtp');
      }

      if (response?.authenticator_type === 'otp') {
        setOtpData({
          secret: response.secret ?? null,
          barcodeUri: response.barcode_uri ?? null,
          recoveryCodes: response.recovery_codes || [],
        });
        setPhase('showOtp');
      }
    } catch (error) {
      const normalizedError = normalizeError(error, {
        resolver: (code) => t(`errors.${code}.${factorType}`),
        fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
      });
      onError(normalizedError, 'enroll');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (data: OtpForm) => {
    setLoading(true);

    try {
      const options = {
        oobCode,
        ...(factorType === 'email'
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
      onError(normalizedError, 'confirm');
    } finally {
      setLoading(false);
    }
  };

  // Automatically initiate OTP enrollment when factorType is 'totp' or 'push-notification'
  React.useEffect(() => {
    if (['totp', 'push-notification'].includes(factorType) && !otpData.secret && open) {
      setLoading(true);
      const fetchOtpEnrollment = async () => {
        try {
          const response = await enrollMfa(factorType, {});
          if (response?.authenticator_type === 'otp') {
            setOtpData({
              secret: response.secret ?? null,
              barcodeUri: response.barcode_uri ?? null,
              recoveryCodes: response.recovery_codes || [],
            });
          }
          setPhase('showOtp');
        } catch (error) {
          const normalizedError = normalizeError(error, {
            resolver: (code) => t(`errors.${code}.${factorType}`),
            fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
          });
          onError(normalizedError, 'enroll');
          onClose();
        } finally {
          setLoading(false);
        }
      };

      fetchOtpEnrollment();
    }
  }, [factorType, enrollMfa, onError, otpData.secret, open]);

  // Render the appropriate form based on the current phase and factorType
  const renderForm = () => {
    switch (phase) {
      case 'enterContact':
        return (
          <Form {...formContact}>
            <form onSubmit={formContact.handleSubmit(onSubmitContact)} className="space-y-6">
              <FormField
                control={formContact.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {factorType === 'email' ? 'Email Address' : 'Phone Number (SMS)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={factorType === 'email' ? 'your@email.com' : '+1234567890'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!formContact.formState.isValid || loading}>
                {loading ? 'Sending...' : 'Send Code'}
              </Button>
            </form>
          </Form>
        );
      case 'showOtp':
        return (
          <div>
            <p>Scan the barcode with your authenticator app</p>
            <div className="flex justify-center items-center mt-6">
              <div className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white">
                <QRCode
                  size={150}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  value={otpData.barcodeUri || ''}
                  viewBox={`0 0 150 150`}
                />
              </div>
            </div>
            <div className="mt-6">
              <p>
                <strong>Recovery Codes:</strong>
              </p>
              <ul>
                {otpData.recoveryCodes.map((code, index) => (
                  <li key={index}>{code}</li>
                ))}
              </ul>
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
                      <FormItem>
                        <FormLabel>
                          Enter the verification code from your authenticator app
                        </FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field} autoComplete="one-time-code">
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        );
      case 'enterOtp':
        return (
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
                  <FormItem>
                    <FormLabel>Enter the verification code</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field} autoComplete="one-time-code">
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open && Boolean(phase)} onOpenChange={onClose}>
      <DialogContent aria-describedby={factorType}>
        <DialogHeader>
          <DialogTitle>
            {factorType === 'email'
              ? 'Enroll Email MFA'
              : factorType === 'sms'
                ? 'Enroll SMS MFA'
                : t('enroll_otp_mfa')}
          </DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
