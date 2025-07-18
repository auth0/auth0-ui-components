import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailIcon, SmartphoneIcon } from 'lucide-react';

import {
  MFAType,
  createEmailContactSchema,
  createSmsContactSchema,
  type EmailContactForm,
  type SmsContactForm,
  type EnrollMfaResponse,
} from '@auth0-web-ui-components/core';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '../ui/label';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks';
import { useContactEnrollment } from '@/hooks/mfa';
import { FACTOR_TYPE_EMAIL, ENROLL } from '@/lib/constants';

type ContactForm = EmailContactForm | SmsContactForm;

type ContactInputFormProps = {
  factorType: MFAType;
  enrollMfa: (factor: MFAType, options: Record<string, string>) => Promise<EnrollMfaResponse>;
  onError: (error: Error, stage: typeof ENROLL) => void;
  onContactSuccess: (oobCode?: string, contact?: string) => void;
  onOtpSuccess: (otpData: {
    secret: string | null;
    barcodeUri: string | null;
    recoveryCodes: string[];
  }) => void;
  onClose?: () => void;
};

export function ContactInputForm({
  factorType,
  enrollMfa,
  onError,
  onContactSuccess,
  onOtpSuccess,
  onClose,
}: ContactInputFormProps) {
  const t = useTranslator('mfa');

  const { onSubmitContact, loading } = useContactEnrollment({
    factorType,
    enrollMfa,
    onError,
    onContactSuccess,
    onOtpSuccess,
  });

  const ContactSchema = React.useMemo(() => {
    return factorType === FACTOR_TYPE_EMAIL
      ? createEmailContactSchema(t('errors.invalid_email'))
      : createSmsContactSchema(t('errors.invalid_phone_number'));
  }, [factorType, t]);

  const form = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema),
    mode: 'onChange',
  });

  const handleCancel = () => {
    form.reset();
    onClose?.();
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        <Label className="text-center text-base font-medium">
          {factorType === FACTOR_TYPE_EMAIL
            ? t('enrollment_form.enroll_email_description')
            : t('enrollment_form.enroll_sms_description')}
        </Label>

        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitContact)} className="space-y-6">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      {factorType === FACTOR_TYPE_EMAIL
                        ? t('enrollment_form.email_address')
                        : t('enrollment_form.phone_number')}
                    </FormLabel>
                    <FormControl>
                      <TextField
                        type={factorType === FACTOR_TYPE_EMAIL ? 'email' : 'tel'}
                        startAdornment={
                          <div className="p-1.5">
                            {factorType === FACTOR_TYPE_EMAIL ? <MailIcon /> : <SmartphoneIcon />}
                          </div>
                        }
                        placeholder={
                          factorType === FACTOR_TYPE_EMAIL
                            ? t('enrollment_form.enroll_email_placeholder')
                            : t('enrollment_form.enroll_sms_placeholder')
                        }
                        error={Boolean(form.formState.errors.contact)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 justify-center">
                <Button type="submit" size="lg" disabled={!form.formState.isValid || loading}>
                  {loading ? t('enrollment_form.sending') : t('submit')}
                </Button>
                <Button type="button" variant="ghost" size="lg" onClick={handleCancel}>
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
