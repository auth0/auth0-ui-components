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

import { OTPVerificationForm } from './otp-verification-form';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { FORM_REVALIDATE_MODE, FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import {
  ENTER_CONTACT,
  ENTER_OTP,
} from '@/lib/constants/my-account/user-mfa-management/user-mfa-constants';
import type { ContactInputFormProps } from '@/types/my-account/user-mfa-management/factor-enrollment-types';

type ContactForm = EmailContactForm | SmsContactForm;

/**
 * Contact input form for email/SMS MFA enrollment.
 * @param props - Component props.
 * @param props.factorType - The MFA factor type
 * @param props.contact - Current contact value (email or phone) from hook state
 * @param props.phase - Current contact enrollment phase (enterContact or enterOtp)
 * @param props.isEnrolling - Whether enrollment is in progress
 * @param props.isConfirming - Whether OTP confirmation is in progress
 * @param props.onSubmitContact - Called with contact options; returns true on success
 * @param props.onResendCode - Called to resend the OTP code
 * @param props.onConfirmOtp - Called with the 6-digit OTP code
 * @param props.onClose - Callback fired when the component should close
 * @param props.onPhaseChange - Callback to advance or rewind the contact phase
 * @param props.schema - Zod validation schema
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function ContactInputForm({
  factorType,
  contact,
  phase,
  isEnrolling,
  isConfirming,
  onSubmitContact,
  onResendCode,
  onConfirmOtp,
  onClose,
  onPhaseChange,
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
  const { t } = useTranslator('user_mfa_management', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const ContactSchema = React.useMemo(() => {
    return factorType === FACTOR_TYPE_EMAIL
      ? createEmailContactSchema(t('enrollment.email.invalid'), schema?.email)
      : createSmsContactSchema(t('enrollment.phone.invalid'), schema?.phone);
  }, [factorType, t, schema]);

  const form = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema),
    mode: FORM_VALIDATION_MODE,
    reValidateMode: FORM_REVALIDATE_MODE,
    defaultValues: { contact: contact || '' },
  });

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const handleBack = () => onPhaseChange(ENTER_CONTACT);

  const handleSubmit = async (data: ContactForm) => {
    const options: Record<string, string> =
      factorType === FACTOR_TYPE_EMAIL ? { email: data.contact } : { phone_number: data.contact };
    const success = await onSubmitContact(options);
    if (success) onPhaseChange(ENTER_OTP);
  };

  if (phase !== ENTER_CONTACT) {
    return (
      <OTPVerificationForm
        factorType={factorType}
        contact={contact}
        isConfirming={isConfirming}
        isEnrolling={isEnrolling}
        onConfirmOtp={onConfirmOtp}
        onBack={handleBack}
        onResend={onResendCode}
        styling={styling}
        customMessages={customMessages}
      />
    );
  }

  return (
    <div style={currentStyles.variables} className="w-full">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        {isEnrolling ? (
          <div className="flex items-center justify-center w-full" role="status" aria-live="polite">
            <Spinner aria-label={t('loading_text')} />
          </div>
        ) : (
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
                          ? t('enrollment.email.label')
                          : t('enrollment.phone.label')}
                      </FormLabel>
                      <FormControl>
                        <TextField
                          id="contact-input"
                          type={factorType === FACTOR_TYPE_EMAIL ? 'email' : 'tel'}
                          autoComplete={factorType === FACTOR_TYPE_EMAIL ? 'email' : 'tel'}
                          startAdornment={
                            <div className="p-1.5" aria-hidden="true">
                              {factorType === FACTOR_TYPE_EMAIL ? <MailIcon /> : <SmartphoneIcon />}
                            </div>
                          }
                          placeholder={
                            factorType === FACTOR_TYPE_EMAIL
                              ? t('enrollment.email.placeholder')
                              : t('enrollment.phone.placeholder')
                          }
                          error={Boolean(form.formState.errors.contact)}
                          aria-invalid={Boolean(form.formState.errors.contact)}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-(length:--font-size-paragraph) font-normal text-left">
                        {factorType === FACTOR_TYPE_EMAIL
                          ? t('enrollment.email.description')
                          : t('enrollment.phone.description')}
                      </FormDescription>
                      <FormMessage
                        className="text-left text-sm text-(length:--font-size-paragraph)"
                        id="contact-error"
                        role="alert"
                      />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    className="text-sm"
                    variant="outline"
                    size="default"
                    onClick={handleCancel}
                  >
                    {t('actions.cancel_button_label')}
                  </Button>
                  <Button
                    type="submit"
                    size="default"
                    className="text-sm"
                    disabled={!form.formState.isValid || isEnrolling}
                  >
                    {t('actions.submit_button_label')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
