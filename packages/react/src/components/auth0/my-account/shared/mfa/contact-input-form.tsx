/**
 * MFA contact input form for email/SMS enrollment.
 * @module contact-input-form
 * @internal
 */

import {
  FACTOR_TYPE_EMAIL,
  createEmailContactSchema,
  createSmsContactSchema,
  type EmailContactForm,
  type SmsContactForm,
  getComponentStyles,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailIcon, SmartphoneIcon } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { OTPVerificationForm } from '@/components/auth0/my-account/shared/mfa/otp-verification-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { FORM_REVALIDATE_MODE, FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import { ENTER_CONTACT, ENTER_OTP } from '@/lib/constants/my-account/mfa/mfa-constants';
import type { ContactInputFormProps } from '@/types/my-account/mfa/mfa-types';

type ContactForm = EmailContactForm | SmsContactForm;

type Phase = typeof ENTER_CONTACT | typeof ENTER_OTP;

/**
 *
 * @param props - Component props.
 * @param props.factorType - The MFA factor type
 * @param props.contact - Current contact value (email or phone) from hook state
 * @param props.isEnrolling - Whether enrollment is in progress
 * @param props.isConfirming - Whether OTP confirmation is in progress
 * @param props.onSubmitContact - Called with contact options; returns true on success
 * @param props.onConfirmOtp - Called with the 6-digit OTP code
 * @param props.onClose - Callback fired when the component should close
 * @param props.schema - Zod validation schema
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function ContactInputForm({
  factorType,
  contact,
  isEnrolling,
  isConfirming,
  onSubmitContact,
  onConfirmOtp,
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

  const ContactSchema = React.useMemo(() => {
    return factorType === FACTOR_TYPE_EMAIL
      ? createEmailContactSchema(t('errors.invalid_email'), schema?.email)
      : createSmsContactSchema(t('errors.invalid_phone_number'), schema?.phone);
  }, [factorType, t, schema]);

  const form = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema),
    mode: FORM_VALIDATION_MODE,
    reValidateMode: FORM_REVALIDATE_MODE,
    defaultValues: { contact: contact || '' },
  });

  const handleCancel = () => {
    form.reset();
    onClose?.();
  };

  const handleBack = () => setPhase(ENTER_CONTACT);

  const handleSubmit = async (data: ContactForm) => {
    const options: Record<string, string> =
      factorType === FACTOR_TYPE_EMAIL ? { email: data.contact } : { phone_number: data.contact };
    const success = await onSubmitContact(options);
    if (success) setPhase(ENTER_OTP);
  };

  const renderContactScreen = () => (
    <div style={currentStyles.variables} className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        {isEnrolling ? (
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
              className="text-center text-primary text-sm text-(length:--font-size-paragraph) font-normal"
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
                      disabled={!form.formState.isValid || isEnrolling}
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
      contact={contact}
      isConfirming={isConfirming}
      onConfirmOtp={onConfirmOtp}
      onBack={handleBack}
      styling={styling}
      customMessages={customMessages}
    />
  );

  return phase === ENTER_CONTACT ? renderContactScreen() : renderOtpScreen();
}
