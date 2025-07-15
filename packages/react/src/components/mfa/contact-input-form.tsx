import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailIcon, PhoneIcon } from 'lucide-react';

import {
  MFAType,
  createEmailContactSchema,
  createSmsContactSchema,
  type EmailContactForm,
  type SmsContactForm,
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
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks';
import { FACTOR_TYPE_EMAIL, EMAIL_PLACEHOLDER, PHONE_NUMBER_PLACEHOLDER } from '@/lib/constants';

type ContactForm = EmailContactForm | SmsContactForm;

type ContactInputFormProps = {
  factorType: MFAType;
  onSubmit: (data: ContactForm) => void;
  loading: boolean;
};

export function ContactInputForm({ factorType, onSubmit, loading }: ContactInputFormProps) {
  const t = useTranslator('mfa');

  const ContactSchema = React.useMemo(() => {
    return factorType === FACTOR_TYPE_EMAIL
      ? createEmailContactSchema(t('errors.invalid_email'))
      : createSmsContactSchema(t('errors.invalid_phone_number'));
  }, [factorType, t]);

  const form = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema),
    mode: 'onChange',
  });

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
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
                    error={Boolean(form.formState.errors.contact)}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-left" />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" disabled={!form.formState.isValid || loading}>
            {loading ? t('enrollment_form.sending') : t('enrollment_form.send_code')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
