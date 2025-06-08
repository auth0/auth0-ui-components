import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { MFAType, normalizeError } from '@auth0-web-ui-components/core';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/ui/input-otp';
import { Input } from '@/ui/input';
import { useI18n } from '@/hooks';
import { EnrollMfaResponse } from '@auth0-web-ui-components/core';

const phoneRegex = /^\+?[0-9\s\-()]{8,}$/;

type EnrollmentFormProps = {
  open: boolean;
  onClose: () => void;
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode: string; userOtpCode?: string; userEmailOtpCode?: string },
  ) => Promise<unknown | null>;
  onSuccess: () => void;
  onError: (error: Error, stage: 'enroll' | 'confirm') => void;
};

type ContactForm = {
  contact: string;
};

type OtpForm = {
  otp: string;
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

  // UI flow state management
  const [phase, setPhase] = React.useState<'enterContact' | 'enterOtp' | 'showOtp'>('enterContact');
  const [oobCode, setOobCode] = React.useState<string | null>(null);
  const [otpData, setOtpData] = React.useState<{
    secret: string | undefined;
    barcodeUri: string | undefined;
    recoveryCodes: string[] | null;
  }>({
    secret: undefined,
    barcodeUri: undefined,
    recoveryCodes: [],
  });
  const [loading, setLoading] = React.useState(false);

  // OTP state
  const [otpValue, setOtpValue] = React.useState<string>('');

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

  // Reset the state when the dialog is closed
  React.useEffect(() => {
    if (!open) {
      setPhase('enterContact');
      setOobCode(null);
      setOtpData({ secret: undefined, barcodeUri: undefined, recoveryCodes: [] });
      setLoading(false);
      formContact.reset();
      formOtp.reset();
      setOtpValue('');
    }
  }, [open, formContact, formOtp]);

  // Handle contact form submission (Email/SMS)
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
          secret: response.secret,
          barcodeUri: response.barcode_uri,
          recoveryCodes: response.recovery_codes || [],
        });
        setPhase('showOtp');
      }
    } catch (error) {
      const normalizedError = normalizeError(error, {
        resolver: (code) =>
          code === 'unsupported_challenge_type' ? t(`errors.${code}.${factorType}`) : null,
        fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
      });
      onError(normalizedError, 'enroll');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification when user submits the OTP code after scanning the barcode
  const onSubmitOtp = async (data: OtpForm) => {
    if (!oobCode) {
      onError(new Error('Missing enrollment code'), 'confirm');
      return;
    }

    setLoading(true);

    try {
      const options = {
        oobCode,
        ...(factorType === 'email' ? { userEmailOtpCode: data.otp } : { userOtpCode: data.otp }),
      };

      const response = await confirmEnrollment(factorType, options);
      if (response) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      onError(err as Error, 'confirm');
    } finally {
      setLoading(false);
    }
  };

  // Automatically initiate OTP enrollment when factorType is 'totp'
  React.useEffect(() => {
    setPhase('showOtp');
    if (factorType === 'totp' && !otpData.secret) {
      setLoading(true);
      const fetchOtpEnrollment = async () => {
        try {
          const response = await enrollMfa(factorType, {});
          if (response?.authenticator_type === 'otp') {
            setOtpData({
              secret: response.secret,
              barcodeUri: response.barcode_uri,
              recoveryCodes: response.recovery_codes || [],
            });
          }
        } catch (error) {
          const normalizedError = normalizeError(error, {
            resolver: (code) =>
              code === 'unsupported_challenge_type' ? t(`errors.${code}.${factorType}`) : null,
            fallbackMessage: 'An unexpected error occurred during MFA enrollment.',
          });
          onError(normalizedError, 'enroll');
        } finally {
          setLoading(false);
        }
      };

      fetchOtpEnrollment();
    }
  }, [factorType, enrollMfa, onError, otpData.secret]);

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
          <div className="space-y-6">
            <p>Scan the barcode with your authenticator app or enter the secret manually:</p>
            <div>
              <img src={otpData.barcodeUri || ''} alt="OTP Barcode" />
              <p>Secret: {otpData.secret}</p>
            </div>
            <Button onClick={() => setPhase('enterOtp')}>I have scanned the barcode</Button>
            <div className="mt-6">
              <p>
                <strong>Recovery Codes:</strong>
              </p>
              <ul>{otpData.recoveryCodes?.map((code, index) => <li key={index}>{code}</li>)}</ul>
              <Form {...formOtp}>
                <form onSubmit={formOtp.handleSubmit(onSubmitOtp)} className="space-y-6">
                  <FormField
                    control={formOtp.control}
                    name="otp"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Enter the verification code from your authenticator app
                        </FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            value={otpValue}
                            onChange={(value) => setOtpValue(value)}
                          >
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
            <form onSubmit={formOtp.handleSubmit(onSubmitOtp)} className="space-y-6">
              <FormField
                control={formOtp.control}
                name="otp"
                render={() => (
                  <FormItem>
                    <FormLabel>Enter the verification code from your authenticator app</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={(value) => setOtpValue(value)}
                      >
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={factorType}>
        <DialogHeader>
          <DialogTitle>
            {factorType === 'email'
              ? 'Enroll Email MFA'
              : factorType === 'sms'
                ? 'Enroll SMS MFA'
                : 'Enroll OTP MFA'}
          </DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
