import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailIcon, SmartphoneIcon } from 'lucide-react';

import {
  MFAType,
  FACTOR_TYPE_EMAIL,
  createEmailContactSchema,
  createSmsContactSchema,
  type EmailContactForm,
  type SmsContactForm,
  type EnrollMfaResponse,
} from '@auth0-web-ui-components/core';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks';
import { useContactEnrollment } from '@/hooks/mfa';
import { ENTER_CONTACT, ENROLL, CONFIRM, ENTER_OTP } from '@/lib/mfa-constants';

import { OTPVerificationForm } from './otp-verification-form';

type ContactForm = EmailContactForm | SmsContactForm;

type ContactInputFormProps = {
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof ENROLL | typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
  schemaValidation?: { email?: RegExp; phone?: RegExp };
};

const PHASES = {
  ENTER_CONTACT: ENTER_CONTACT,
  ENTER_OTP: ENTER_OTP,
} as const;

type Phase = (typeof PHASES)[keyof typeof PHASES];

export function ContactInputForm({
  factorType,
  enrollMfa,
  onError,
  confirmEnrollment,
  onSuccess,
  onClose,
  schemaValidation,
}: ContactInputFormProps) {
  const [phase, setPhase] = React.useState<Phase>(ENTER_CONTACT);
  const { t } = useTranslator('mfa');

  const { onSubmitContact, loading, contactData, setContactData } = useContactEnrollment({
    factorType,
    enrollMfa,
    onError,
  });

  const ContactSchema = React.useMemo(() => {
    return factorType === FACTOR_TYPE_EMAIL
      ? createEmailContactSchema(t('errors.invalid_email'), schemaValidation?.email)
      : createSmsContactSchema(t('errors.invalid_phone_number'), schemaValidation?.phone);
  }, [factorType, t, schemaValidation]);

  const form = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { contact: contactData.contact || '' },
  });

  const handleCancel = () => {
    form.reset();
    setContactData({
      contact: null,
      oobCode: null,
    });
    onClose?.();
  };

  const handleBack = React.useCallback(() => {
    setPhase(ENTER_CONTACT);
  }, [phase]);

  const handleSubmit = React.useCallback(
    async (data: ContactForm) => {
      await onSubmitContact(data);
      setPhase(ENTER_OTP);
    },
    [onSubmitContact],
  );

  const renderContactScreen = () => (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        {loading ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <Spinner aria-label={t('loading')} />
          </div>
        ) : (
          <>
            <p className="text-center text-sm font-normal" id="contact-description">
              {factorType === FACTOR_TYPE_EMAIL
                ? t('enrollment_form.enroll_email_description')
                : t('enrollment_form.enroll_sms_description')}
            </p>

            <div className="w-full">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                  aria-describedby="contact-description"
                >
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal" htmlFor="contact-input">
                          {factorType === FACTOR_TYPE_EMAIL
                            ? t('enrollment_form.email_address')
                            : t('enrollment_form.phone_number')}
                        </FormLabel>
                        <FormControl>
                          <TextField
                            id="contact-input"
                            type={factorType === FACTOR_TYPE_EMAIL ? 'email' : 'tel'}
                            autoComplete={factorType === FACTOR_TYPE_EMAIL ? 'email' : 'tel'}
                            startAdornment={
                              <div className="p-1.5" aria-hidden="true">
                                {factorType === FACTOR_TYPE_EMAIL ? (
                                  <MailIcon />
                                ) : (
                                  <SmartphoneIcon />
                                )}
                              </div>
                            }
                            placeholder={
                              factorType === FACTOR_TYPE_EMAIL
                                ? t('enrollment_form.enroll_email_placeholder')
                                : t('enrollment_form.enroll_sms_placeholder')
                            }
                            error={Boolean(form.formState.errors.contact)}
                            aria-invalid={Boolean(form.formState.errors.contact)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-left" id="contact-error" role="alert" />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col gap-3 justify-center">
                    <Button
                      type="submit"
                      size="lg"
                      className="text-sm"
                      disabled={!form.formState.isValid || loading}
                      aria-label={t('submit')}
                    >
                      {t('submit')}
                    </Button>
                    <Button
                      type="button"
                      className="text-sm"
                      variant="ghost"
                      size="lg"
                      onClick={handleCancel}
                      aria-label={t('cancel')}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderOtpScreen = () => (
    <OTPVerificationForm
      factorType={factorType}
      confirmEnrollment={confirmEnrollment}
      onError={onError}
      onSuccess={onSuccess}
      onClose={onClose}
      oobCode={contactData.oobCode || ''}
      contact={contactData.contact || ''}
      onBack={handleBack}
    />
  );

  return phase === ENTER_CONTACT ? renderContactScreen() : renderOtpScreen();
}
