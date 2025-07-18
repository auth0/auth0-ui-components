import * as React from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';
import { Copy } from 'lucide-react';

import { type MFAType } from '@auth0-web-ui-components/core';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { OTPField } from '@/components/ui/otp-field';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

import { useTranslator } from '@/hooks';
import { useOtpConfirmation } from '@/hooks/mfa';

import {
  CONFIRM,
  QR_PHASE_ENTER_OTP,
  QR_PHASE_INSTALLATION,
  QR_PHASE_SCAN,
  FACTOR_TYPE_PUSH_NOTIFICATION,
} from '@/lib/constants';

type OtpForm = {
  userOtp: string;
};

type QRCodeEnrollmentFormProps = {
  factorType: MFAType;
  barcodeUri: string;
  recoveryCodes: string[];
  secret: string;
  confirmEnrollment: (
    factor: MFAType,
    options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
  ) => Promise<unknown | null>;
  onError: (error: Error, stage: typeof CONFIRM) => void;
  onSuccess: () => void;
  onClose: () => void;
  oobCode?: string;
};

const PHASES = {
  INSTALLATION: QR_PHASE_INSTALLATION,
  SCAN: QR_PHASE_SCAN,
  ENTER_OTP: QR_PHASE_ENTER_OTP,
} as const;

type Phase = (typeof PHASES)[keyof typeof PHASES];

export function QRCodeEnrollmentForm(props: QRCodeEnrollmentFormProps) {
  const {
    factorType,
    barcodeUri,
    secret,
    confirmEnrollment,
    onError,
    onSuccess,
    onClose,
    oobCode,
  } = props;

  const t = useTranslator('mfa');
  const [phase, setPhase] = React.useState<Phase>(
    factorType === FACTOR_TYPE_PUSH_NOTIFICATION ? QR_PHASE_INSTALLATION : QR_PHASE_SCAN,
  );

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

  const userOtp = form.watch('userOtp');
  const isOtpValid = userOtp?.length === 6;

  const handleSubmit = React.useCallback(
    (data: OtpForm) => {
      onSubmitOtp(data, oobCode);
    },
    [onSubmitOtp, oobCode],
  );

  const handleContinue = React.useCallback(() => {
    setPhase(QR_PHASE_ENTER_OTP);
  }, []);

  const handleBack = React.useCallback(() => {
    setPhase(QR_PHASE_SCAN);
  }, []);

  const handleCopySecret = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(secret);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = secret;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, [secret]);

  const handleContinueFromInstallation = React.useCallback(() => {
    setPhase(QR_PHASE_SCAN);
  }, []);

  const renderQRCode = () => (
    <div className="flex justify-center items-center mb-6">
      <QRCode
        size={150}
        style={{ height: '150px', maxWidth: '100%', width: '100%' }}
        value={barcodeUri || ''}
        viewBox="0 0 150 150"
      />
    </div>
  );

  const renderScanPhase = () => (
    <div className="w-full max-w-sm mx-auto text-center">
      <div className="mb-6">
        {renderQRCode()}
        <Label className="font-medium text-center block text-base">
          {t('enrollment_form.show_otp.title')}
        </Label>
      </div>
      <div className="flex flex-col space-y-3">
        <Button type="button" variant="outline" size="lg" onClick={handleCopySecret}>
          <Copy className="h-4 w-4" />
          {t('enrollment_form.show_otp.copy_as_code')}
        </Button>
        <div className="mt-3" />
        <Button type="button" size="lg" onClick={handleContinue}>
          {t('continue')}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose}>
          {t('cancel')}
        </Button>
      </div>
    </div>
  );

  const renderOtpPhase = () => (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        <Label className="text-center text-base font-medium">
          {t('enrollment_form.show_otp.enter_code')}
        </Label>

        <div className="w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              autoComplete="off"
              className="space-y-10"
            >
              <FormField
                control={form.control}
                name="userOtp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      {t('enrollment_form.show_otp.one_time_passcode')}
                    </FormLabel>
                    <FormControl>
                      <OTPField
                        length={6}
                        separator={{ character: '-', afterEvery: 3 }}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" disabled={loading || !isOtpValid}>
                  {loading ? t('enrollment_form.show_otp.verifying') : t('submit')}
                </Button>
                <Button type="button" variant="ghost" size="lg" onClick={handleBack}>
                  {t('back')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );

  const renderInstallationPhase = () => (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center flex-1 space-y-10">
        <Label className="text-center text-base font-medium">
          {t('enrollment_form.show_otp.install_guardian_description')}
        </Label>

        <div className="flex gap-4 w-full">
          <Card className="flex flex-col items-center gap-1 flex-1 min-w-24 p-6">
            <img
              src="https://cdn.auth0.com/marketplace/catalog/content/assets/creators/apple/apple-avatar.png"
              alt="Apple"
              className="w-8 h-8"
            />
            <span className="text-sm text-center">App Store</span>
          </Card>
          <Card className="flex flex-col items-center gap-1 flex-1 min-w-24 p-6">
            <img
              src="https://cdn.auth0.com/marketplace/catalog/content/assets/creators/google/google-avatar.png"
              alt="Google"
              className="w-8 h-8"
            />
            <span className="text-sm text-center">Google Play</span>
          </Card>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button type="button" size="lg" onClick={handleContinueFromInstallation}>
            {t('continue')}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={onClose}>
            {t('cancel')}
          </Button>
        </div>
      </div>
    </div>
  );

  if (phase === QR_PHASE_INSTALLATION) {
    return renderInstallationPhase();
  }

  return phase === QR_PHASE_SCAN ? renderScanPhase() : renderOtpPhase();
}
