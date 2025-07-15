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
import { useTranslator } from '@/hooks';

type OtpForm = {
  userOtp: string;
};

type OTPVerificationFormProps = {
  onSubmit: (data: OtpForm) => void;
  loading: boolean;
};

export function OTPVerificationForm({ onSubmit, loading }: OTPVerificationFormProps) {
  const t = useTranslator('mfa');

  const form = useForm<OtpForm>({
    mode: 'onChange',
  });

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off" className="space-y-6">
          <FormField
            control={form.control}
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
}
