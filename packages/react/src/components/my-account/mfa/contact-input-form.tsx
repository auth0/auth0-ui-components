import {
  FACTOR_TYPE_EMAIL,
  createEmailContactSchema,
  createSmsContactSchema,
  type EmailContactForm,
  type SmsContactForm,
  getComponentStyles,
} from '@auth0/web-ui-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailIcon, SmartphoneIcon } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useContactEnrollment } from '../../../hooks/my-account/mfa/use-contact-enrollment';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import { ENTER_CONTACT, ENTER_OTP } from '../../../lib/mfa-constants';
import { cn } from '../../../lib/theme-utils';
import type { ContactInputFormProps } from '../../../types/my-account/mfa/mfa-types';
import { Button } from '../../ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../ui/form';
import { Spinner } from '../../ui/spinner';
import { TextField } from '../../ui/text-field';

import { OTPVerificationForm } from './otp-verification-form';

type ContactForm = EmailContactForm | SmsContactForm;

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
  schema,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  customMessages = {},
}: ContactInputFormProps) {
  const [phase, setPhase] = React.useState<Phase>(ENTER_CONTACT);
  const { t } = useTranslator('mfa', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const { onSubmitContact, loading, contactData, setContactData } = useContactEnrollment({
    factorType,
    enrollMfa,
    onError,
  });

  const ContactSchema = React.useMemo(() => {
    return factorType === FACTOR_TYPE_EMAIL
      ? createEmailContactSchema(t('errors.invalid_email'), schema?.email)
      : createSmsContactSchema(t('errors.invalid_phone_number'), schema?.phone);
  }, [factorType, t, schema]);

  const form = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { contact: contactData.contact || '' },
  });

  const handleCancel = () => {
    form.reset();
    setContactData({
      contact: '',
      authSession: '',
      authenticationMethodId: '',
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
    <div style={currentStyles?.variables} className="w-full max-w-sm mx-auto">
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
            <p
              className={cn(
                'text-center text-primary text-sm text-(length:--font-size-paragraph) font-normal',
              )}
              id="contact-description"
            >
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
                        <FormLabel
                          className="text-left text-sm text-(length:--font-size-paragraph) font-medium"
                          htmlFor="contact-input"
                        >
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
                        <FormMessage
                          className="text-left text-sm text-(length:--font-size-paragraph)"
                          id="contact-error"
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
                      onClick={handleCancel}
                      aria-label={t('cancel')}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      size="default"
                      className="text-sm"
                      disabled={!form.formState.isValid || loading}
                      aria-label={t('submit')}
                    >
                      {t('submit')}
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
      contact={contactData.contact}
      authSession={contactData.authSession}
      authenticationMethodId={contactData.authenticationMethodId}
      onBack={handleBack}
      styling={styling}
      customMessages={customMessages}
    />
  );

  return phase === ENTER_CONTACT ? renderContactScreen() : renderOtpScreen();
}
