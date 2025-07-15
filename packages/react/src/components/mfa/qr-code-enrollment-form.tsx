import * as React from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';

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
import { useOtpConfirmation } from '@/hooks/mfa';
import { type MFAType } from '@auth0-web-ui-components/core';
import { CONFIRM } from '@/lib/constants';

type OtpForm = {
  userOtp: string;
};

type QRCodeEnrollmentFormProps = {
  factorType: MFAType;
  barcodeUri: string;
  recoveryCodes: string[];
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
  oobCode?: string;
};

export function QRCodeEnrollmentForm({
  factorType,
  barcodeUri,
  recoveryCodes,
  confirmEnrollment,
  onError,
  onSuccess,
  onClose,
  oobCode,
}: QRCodeEnrollmentFormProps) {
  const t = useTranslator('mfa');

  const { onSubmitOtp, loading } = useOtpConfirmation({
    factorType,
    confirmEnrollment,
    onError,
    onSuccess,
    onClose,
  });

  const form = useForm<OtpForm>({
    mode: 'onChange',
  });

  const handleSubmit = React.useCallback(
    (data: OtpForm) => {
      onSubmitOtp(data, oobCode);
    },
    [onSubmitOtp, oobCode],
  );

  return (
    <div className="text-center">
      <p>{t('enrollment_form.show_otp.title')}</p>
      <div className="flex justify-center items-center mt-6">
        <div className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white inline-block">
          <QRCode
            size={150}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={barcodeUri || ''}
            viewBox={`0 0 150 150`}
          />
        </div>
      </div>
      <div className="mt-6">
        {recoveryCodes.length > 0 && (
          <div className="mb-6">
            <p>
              <strong>{t('enrollment_form.show_otp.save_recovery')}</strong>
            </p>
            <ul className="list-none inline-block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-2">
              {recoveryCodes.map((code, index) => (
                <li key={index} className="font-mono tracking-widest">
                  {code}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="w-full max-w-sm mx-auto text-center">
          <Form {...form}>
            <form
              autoComplete="off"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 mt-4"
            >
              <FormField
                control={form.control}
                name="userOtp"
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
}
